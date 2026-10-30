import { query, get } from '../db/database.js';

export const getOverviewMetrics = async () => {
  // Aggregate directly from SQLite
  const totalLeadsRow = await get('SELECT COUNT(*) as count FROM leads');
  const statusCounts = await query('SELECT status, COUNT(*) as count FROM leads GROUP BY status');
  const priorityCounts = await query('SELECT priority, COUNT(*) as count FROM leads GROUP BY priority');

  const campaignsRow = await get('SELECT COUNT(*) as count, SUM(sent_count) as total_sent FROM campaigns');
  const totalRecipientsRow = await get('SELECT COUNT(*) as count FROM campaign_recipients');
  const queuedRecipientsRow = await get("SELECT COUNT(*) as count FROM campaign_recipients WHERE status = 'queued'");
  const sentRecipientsRow = await get("SELECT COUNT(*) as count FROM campaign_recipients WHERE status = 'simulated_sent'");

  const convosRow = await get('SELECT COUNT(*) as count FROM conversations');
  const messagesRow = await get('SELECT COUNT(*) as count FROM messages');
  const repliesRow = await get("SELECT COUNT(*) as count FROM messages WHERE direction = 'inbound'");

  const qualifiedRow = await get("SELECT COUNT(*) as count FROM leads WHERE status = 'qualified'");
  const handoffsRow = await get('SELECT COUNT(*) as count FROM handoffs');

  // Polish metrics: actionable attention metrics
  const reviewsNeededRow = await get("SELECT COUNT(*) as count FROM conversations WHERE status = 'review_needed'");
  const waitingAiRow = await get("SELECT COUNT(*) as count FROM conversations WHERE status = 'waiting_ai'");
  const interestedRow = await get("SELECT COUNT(*) as count FROM ai_assessments WHERE intent IN ('interested', 'demo_request', 'pricing_inquiry')");
  const connectedAccountsRow = await get("SELECT COUNT(*) as count FROM connected_accounts WHERE connection_status LIKE '%connected%'");

  const channelBreakdown = await query(`
    SELECT channel, COUNT(*) as count 
    FROM conversations 
    GROUP BY channel
  `);

  const intentBreakdown = await query(`
    SELECT intent, COUNT(*) as count 
    FROM ai_assessments 
    GROUP BY intent
  `);

  const recentActivity = await query(`
    SELECT * FROM activity_events 
    ORDER BY created_at DESC 
    LIMIT 15
  `);

  // Recent high-priority replies for immediate attention table
  const attentionReplies = await query(`
    SELECT c.id as conversation_id, c.channel, c.status as conversation_status, c.last_message_at,
      l.company_name, l.contact_name, l.city, l.priority,
      (SELECT content FROM messages WHERE conversation_id = c.id AND direction = 'inbound' ORDER BY created_at DESC LIMIT 1) as latest_inbound,
      (SELECT intent FROM ai_assessments WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as intent
    FROM conversations c
    JOIN leads l ON c.lead_id = l.id
    WHERE c.status IN ('review_needed', 'waiting_ai', 'open')
    ORDER BY c.last_message_at DESC
    LIMIT 6
  `);

  const leadStatusMap = {};
  statusCounts.forEach(r => { leadStatusMap[r.status] = r.count; });

  const totalLeads = totalLeadsRow.count || 0;
  const inCampaign = leadStatusMap['in_campaign'] || 0;
  const replied = repliesRow.count || 0;
  const qualified = qualifiedRow.count || 0;
  const handoffs = handoffsRow.count || 0;

  return {
    summary: {
      total_leads: totalLeads,
      in_campaign: inCampaign,
      simulated_sent: sentRecipientsRow.count || 0,
      queued: queuedRecipientsRow.count || 0,
      inbound_replies: replied,
      qualified_leads: qualified,
      staged_handoffs: handoffs,
      active_campaigns: campaignsRow.count || 0,
      total_conversations: convosRow.count || 0,
      reviews_needed: reviewsNeededRow?.count || 0,
      waiting_ai: waitingAiRow?.count || 0,
      interested_leads: interestedRow?.count || 0,
      connected_channels: connectedAccountsRow?.count || 7,
    },
    funnel: [
      { stage: 'Total Leads Registered', count: totalLeads, percentage: 100 },
      { stage: 'Audience in Outreach', count: (sentRecipientsRow.count || 0) + inCampaign, percentage: totalLeads ? Math.round((((sentRecipientsRow.count || 0) + inCampaign) / totalLeads) * 100) : 0 },
      { stage: 'Simulated Outbound Sent', count: sentRecipientsRow.count || 0, percentage: totalLeads ? Math.round(((sentRecipientsRow.count || 0) / totalLeads) * 100) : 0 },
      { stage: 'Inbound Responses', count: replied, percentage: (sentRecipientsRow.count || 0) ? Math.round((replied / (sentRecipientsRow.count || 1)) * 100) : 0 },
      { stage: 'AI Assessed & Qualified', count: qualified, percentage: replied ? Math.round((qualified / replied) * 100) : 0 },
      { stage: 'Staged CRM Handoffs', count: handoffs, percentage: qualified ? Math.round((handoffs / (qualified || 1)) * 100) : 0 },
    ],
    channel_breakdown: channelBreakdown,
    intent_breakdown: intentBreakdown,
    recent_activity: recentActivity,
    attention_replies: attentionReplies,
  };
};

export default { getOverviewMetrics };
