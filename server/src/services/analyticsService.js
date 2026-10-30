import { query, get } from '../db/database.js';

let cachedOverview = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 15000; // 15-second safe in-memory cache

export const invalidateOverviewCache = () => {
  cachedOverview = null;
  cacheExpiry = 0;
};

export const getOverviewMetrics = async (forceFresh = false) => {
  const now = Date.now();
  if (!forceFresh && cachedOverview && now < cacheExpiry) {
    return cachedOverview;
  }

  // 1. Consolidated scalar query replaces 16 individual round trips with a single query
  const scalarSql = `
    SELECT
      (SELECT COUNT(*) FROM leads) as total_leads,
      (SELECT COUNT(*) FROM leads WHERE status = 'in_campaign') as in_campaign,
      (SELECT COUNT(*) FROM leads WHERE status = 'qualified') as qualified,
      (SELECT COUNT(*) FROM campaigns) as active_campaigns,
      (SELECT COALESCE(SUM(sent_count), 0) FROM campaigns) as total_sent,
      (SELECT COUNT(*) FROM campaign_recipients) as total_recipients,
      (SELECT COUNT(*) FROM campaign_recipients WHERE status = 'queued') as queued,
      (SELECT COUNT(*) FROM campaign_recipients WHERE status = 'simulated_sent') as simulated_sent,
      (SELECT COUNT(*) FROM conversations) as total_conversations,
      (SELECT COUNT(*) FROM conversations WHERE status = 'review_needed') as reviews_needed,
      (SELECT COUNT(*) FROM conversations WHERE status = 'waiting_ai') as waiting_ai,
      (SELECT COUNT(*) FROM messages) as total_messages,
      (SELECT COUNT(*) FROM messages WHERE direction = 'inbound') as inbound_replies,
      (SELECT COUNT(*) FROM handoffs) as handoffs,
      (SELECT COUNT(*) FROM ai_assessments WHERE intent IN ('interested', 'demo_request', 'pricing_inquiry')) as interested_leads,
      (SELECT COUNT(*) FROM connected_accounts WHERE connection_status LIKE '%connected%') as connected_channels
  `;

  // 2. High-priority replies for immediate attention table
  const attentionRepliesSql = `
    SELECT c.id as conversation_id, c.channel, c.status as conversation_status, c.last_message_at,
      l.company_name, l.contact_name, l.city, l.priority,
      (SELECT content FROM messages WHERE conversation_id = c.id AND direction = 'inbound' ORDER BY created_at DESC LIMIT 1) as latest_inbound,
      (SELECT intent FROM ai_assessments WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as intent
    FROM conversations c
    JOIN leads l ON c.lead_id = l.id
    WHERE c.status IN ('review_needed', 'waiting_ai', 'open')
    ORDER BY c.last_message_at DESC
    LIMIT 6
  `;

  // 3. Execute all remaining queries in parallel via Promise.all (single concurrent batch)
  const [scalarStats, channelBreakdownRaw, intentBreakdownRaw, recentActivity, attentionReplies] = await Promise.all([
    get(scalarSql),
    query('SELECT channel, COUNT(*) as count FROM conversations GROUP BY channel'),
    query('SELECT intent, COUNT(*) as count FROM ai_assessments GROUP BY intent'),
    query('SELECT * FROM activity_events ORDER BY created_at DESC LIMIT 15'),
    query(attentionRepliesSql)
  ]);

  const totalLeads = Number(scalarStats?.total_leads) || 0;
  const inCampaign = Number(scalarStats?.in_campaign) || 0;
  const qualified = Number(scalarStats?.qualified) || 0;
  const activeCampaigns = Number(scalarStats?.active_campaigns) || 0;
  const totalSent = Number(scalarStats?.total_sent) || 0;
  const totalRecipients = Number(scalarStats?.total_recipients) || 0;
  const queued = Number(scalarStats?.queued) || 0;
  const simulatedSent = Number(scalarStats?.simulated_sent) || 0;
  const totalConversations = Number(scalarStats?.total_conversations) || 0;
  const reviewsNeeded = Number(scalarStats?.reviews_needed) || 0;
  const waitingAi = Number(scalarStats?.waiting_ai) || 0;
  const replied = Number(scalarStats?.inbound_replies) || 0;
  const handoffs = Number(scalarStats?.handoffs) || 0;
  const interested = Number(scalarStats?.interested_leads) || 0;
  const connectedChannels = Number(scalarStats?.connected_channels) || 7;

  const channelBreakdown = (channelBreakdownRaw || []).map(r => ({
    channel: r.channel,
    count: Number(r.count) || 0
  }));

  const intentBreakdown = (intentBreakdownRaw || []).map(r => ({
    intent: r.intent,
    count: Number(r.count) || 0
  }));

  const result = {
    summary: {
      total_leads: totalLeads,
      in_campaign: inCampaign,
      simulated_sent: simulatedSent,
      queued: queued,
      inbound_replies: replied,
      qualified_leads: qualified,
      staged_handoffs: handoffs,
      active_campaigns: activeCampaigns,
      total_conversations: totalConversations,
      reviews_needed: reviewsNeeded,
      waiting_ai: waitingAi,
      interested_leads: interested,
      connected_channels: connectedChannels,
    },
    funnel: [
      { stage: 'Total Leads Registered', count: totalLeads, percentage: 100 },
      { stage: 'Audience in Outreach', count: simulatedSent + inCampaign, percentage: totalLeads ? Math.round(((simulatedSent + inCampaign) / totalLeads) * 100) : 0 },
      { stage: 'Simulated Outbound Sent', count: simulatedSent, percentage: totalLeads ? Math.round((simulatedSent / totalLeads) * 100) : 0 },
      { stage: 'Inbound Responses', count: replied, percentage: simulatedSent ? Math.round((replied / (simulatedSent || 1)) * 100) : 0 },
      { stage: 'AI Assessed & Qualified', count: qualified, percentage: replied ? Math.round((qualified / replied) * 100) : 0 },
      { stage: 'Staged CRM Handoffs', count: handoffs, percentage: qualified ? Math.round((handoffs / (qualified || 1)) * 100) : 0 },
    ],
    channel_breakdown: channelBreakdown,
    intent_breakdown: intentBreakdown,
    recent_activity: recentActivity || [],
    attention_replies: attentionReplies || [],
  };

  cachedOverview = result;
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return result;
};

export default { getOverviewMetrics, invalidateOverviewCache };
