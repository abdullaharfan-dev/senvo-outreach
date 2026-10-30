import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';
import { invalidateOverviewCache } from './analyticsService.js';

// Active in-memory jobs tracking background simulation tasks
const activeJobs = new Map();

export const getCampaigns = async () => {
  return await query(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = c.id AND status = 'queued') as queued_count,
      (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = c.id AND status = 'simulated_sent') as sent_count_live,
      (SELECT COUNT(*) FROM campaign_recipients WHERE campaign_id = c.id AND status = 'failed') as failed_count_live
    FROM campaigns c
    ORDER BY c.created_at DESC
  `);
};

export const getCampaignById = async (id) => {
  const campaign = await get('SELECT * FROM campaigns WHERE id = ?', [id]);
  if (!campaign) return null;

  const recipients = await query(`
    SELECT cr.*, l.company_name, l.contact_name, l.email, l.phone, l.city, l.industry
    FROM campaign_recipients cr
    JOIN leads l ON cr.lead_id = l.id
    WHERE cr.campaign_id = ?
    ORDER BY cr.created_at ASC
  `, [id]);

  return { ...campaign, recipients };
};

export const createCampaign = async ({ name, channel, template_id, template_body, target_audience, lead_ids = [] }) => {
  const campaignId = uuidv4();
  const now = new Date().toISOString();

  // If no lead_ids specified, default to all uncontacted / eligible leads
  let eligibleLeads = [];
  if (lead_ids && lead_ids.length > 0) {
    const placeholders = lead_ids.map(() => '?').join(',');
    eligibleLeads = await query(`SELECT * FROM leads WHERE id IN (${placeholders})`, lead_ids);
  } else {
    eligibleLeads = await query(`SELECT * FROM leads WHERE status IN ('uncontacted', 'in_campaign') LIMIT 50`);
  }

  await run(
    `INSERT INTO campaigns (id, name, channel, template_id, template_body, status, target_audience, total_recipients, sent_count, failed_count, skipped_count, replied_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, 0, 0, 0, 0, ?, ?)`,
    [campaignId, name, channel, template_id || 'CUSTOM', template_body, target_audience || 'Target Corporate Segment', eligibleLeads.length, now, now]
  );

  // Create recipient records
  for (const lead of eligibleLeads) {
    const recipientId = uuidv4();
    const personalized = template_body
      .replace(/{BUSINESS_NAME}/g, lead.company_name)
      .replace(/{CONTACT_NAME}/g, lead.contact_name || 'Director')
      .replace(/{CITY}/g, lead.city || 'Ireland')
      .replace(/{INDUSTRY}/g, lead.industry || 'Business');

    await run(
      `INSERT INTO campaign_recipients (id, campaign_id, lead_id, personalized_content, status, created_at)
       VALUES (?, ?, ?, ?, 'queued', ?)`,
      [recipientId, campaignId, lead.id, personalized, now]
    );

    // Update lead status
    await run(`UPDATE leads SET status = 'in_campaign' WHERE id = ? AND status = 'uncontacted'`, [lead.id]);
  }

  await run(
    `INSERT INTO activity_events (id, actor, action, entity_type, entity_id, details, created_at)
     VALUES (?, 'Sales Team', 'CAMPAIGN_CREATED', 'campaign', ?, ?, ?)`,
    [uuidv4(), campaignId, `Created campaign '${name}' for channel: ${channel} with ${eligibleLeads.length} recipients`, now]
  );

  invalidateOverviewCache();
  return await getCampaignById(campaignId);
};

/**
 * Start simulated campaign execution with real asynchronous processing in SQLite
 * Updates recipient records step-by-step to demonstrate live progress in UI
 */
export const startCampaign = async (id) => {
  const campaign = await get('SELECT * FROM campaigns WHERE id = ?', [id]);
  if (!campaign) throw new Error('Campaign not found');

  if (activeJobs.has(id)) {
    return { status: 'already_running', campaign: await getCampaignById(id) };
  }

  const now = new Date().toISOString();
  await run(`UPDATE campaigns SET status = 'running', updated_at = ? WHERE id = ?`, [now, id]);

  await run(
    `INSERT INTO activity_events (id, actor, action, entity_type, entity_id, details, created_at)
     VALUES (?, 'System', 'CAMPAIGN_STARTED', 'campaign', ?, 'Simulated campaign execution started', ?)`,
    [uuidv4(), id, now]
  );

  // Background processor: processes queued recipients one by one with realistic pacing
  const processNextRecipient = async () => {
    // Check if campaign is still running
    const current = await get('SELECT status FROM campaigns WHERE id = ?', [id]);
    if (!current || current.status !== 'running') {
      activeJobs.delete(id);
      return;
    }

    // Fetch next queued recipient
    const recipient = await get(`
      SELECT cr.*, l.company_name, l.phone, l.email
      FROM campaign_recipients cr
      JOIN leads l ON cr.lead_id = l.id
      WHERE cr.campaign_id = ? AND cr.status = 'queued'
      LIMIT 1
    `, [id]);

    if (!recipient) {
      // Completed all recipients
      const completedTime = new Date().toISOString();
      await run(`UPDATE campaigns SET status = 'completed', updated_at = ? WHERE id = ?`, [completedTime, id]);
      await run(
        `INSERT INTO activity_events (id, actor, action, entity_type, entity_id, details, created_at)
         VALUES (?, 'System', 'CAMPAIGN_COMPLETED', 'campaign', ?, 'All recipients processed in simulated delivery mode', ?)`,
        [uuidv4(), id, completedTime]
      );
      activeJobs.delete(id);
      return;
    }

    const sentTime = new Date().toISOString();
    
    // Simulate send by updating SQLite database record (delivery_mode: simulated)
    await run(
      `UPDATE campaign_recipients 
       SET status = 'simulated_sent', sent_at = ? 
       WHERE id = ?`,
      [sentTime, recipient.id]
    );

    // Update campaign counter
    await run(
      `UPDATE campaigns 
       SET sent_count = sent_count + 1, updated_at = ? 
       WHERE id = ?`,
      [sentTime, id]
    );

    // Create or append to conversation in Unified Inbox
    let conv = await get('SELECT id FROM conversations WHERE lead_id = ? AND channel = ?', [recipient.lead_id, campaign.channel]);
    let convId = conv?.id;

    if (!convId) {
      convId = uuidv4();
      await run(
        `INSERT INTO conversations (id, lead_id, channel, status, assigned_owner, last_message_at, created_at, updated_at)
         VALUES (?, ?, ?, 'open', 'AI SDR', ?, ?, ?)`,
        [convId, recipient.lead_id, campaign.channel, sentTime, sentTime, sentTime]
      );
    } else {
      await run(`UPDATE conversations SET last_message_at = ?, updated_at = ? WHERE id = ?`, [sentTime, sentTime, convId]);
    }

    // Insert simulated outbound message
    await run(
      `INSERT INTO messages (id, conversation_id, direction, sender_name, content, delivery_mode, status, is_ai_generated, created_at)
       VALUES (?, ?, 'outbound', 'SENVO Corporate Outreach', ?, 'simulated', 'delivered', 0, ?)`,
      [uuidv4(), convId, recipient.personalized_content, sentTime]
    );

    // Schedule next dispatch step (800ms pacing for visible real-time progress)
    const timer = setTimeout(processNextRecipient, 800);
    activeJobs.set(id, timer);
  };

  // Start immediately
  const initialTimer = setTimeout(processNextRecipient, 300);
  activeJobs.set(id, initialTimer);

  return { status: 'running', campaign: await getCampaignById(id) };
};

export const pauseCampaign = async (id) => {
  if (activeJobs.has(id)) {
    clearTimeout(activeJobs.get(id));
    activeJobs.delete(id);
  }

  const now = new Date().toISOString();
  await run(`UPDATE campaigns SET status = 'paused', updated_at = ? WHERE id = ?`, [now, id]);

  await run(
    `INSERT INTO activity_events (id, actor, action, entity_type, entity_id, details, created_at)
     VALUES (?, 'User', 'CAMPAIGN_PAUSED', 'campaign', ?, 'Campaign execution paused by user', ?)`,
    [uuidv4(), id, now]
  );

  invalidateOverviewCache();
  return await getCampaignById(id);
};

export default { getCampaigns, getCampaignById, createCampaign, startCampaign, pauseCampaign };
