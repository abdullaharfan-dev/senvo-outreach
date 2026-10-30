import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';
import { assessIncomingMessage } from './aiService.js';
import { qualifyLead } from './qualificationService.js';
import { invalidateOverviewCache } from './analyticsService.js';

export const getConversations = async ({ channel = '', status = '', search = '' } = {}) => {
  let sql = `
    SELECT c.*, 
      l.company_name, l.contact_name, l.email, l.phone, l.city, l.industry, l.priority, l.score,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT direction FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_direction,
      (SELECT intent FROM ai_assessments WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_intent,
      (SELECT confidence FROM ai_assessments WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_confidence,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
    FROM conversations c
    JOIN leads l ON c.lead_id = l.id
    WHERE 1=1
  `;
  const params = [];

  if (channel && channel !== 'all') {
    sql += ' AND c.channel = ?';
    params.push(channel);
  }

  if (status && status !== 'all') {
    sql += ' AND c.status = ?';
    params.push(status);
  }

  if (search) {
    sql += ' AND (l.company_name LIKE ? OR l.contact_name LIKE ? OR l.email LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  sql += ' ORDER BY c.last_message_at DESC';

  return await query(sql, params);
};

export const getConversationDetails = async (id) => {
  const conversation = await get(`
    SELECT c.*, l.company_name, l.contact_name, l.email, l.phone, l.city, l.industry, l.priority, l.score, l.status as lead_status, l.owner
    FROM conversations c
    JOIN leads l ON c.lead_id = l.id
    WHERE c.id = ?
  `, [id]);

  if (!conversation) return null;

  const messages = await query(`
    SELECT * FROM messages 
    WHERE conversation_id = ? 
    ORDER BY created_at ASC
  `, [id]);

  const assessments = await query(`
    SELECT * FROM ai_assessments 
    WHERE conversation_id = ? 
    ORDER BY created_at DESC
  `, [id]);

  return { ...conversation, messages, assessments };
};

/**
 * Send an outbound message (Simulated Delivery Mode)
 */
export const sendMessage = async (conversationId, { content, is_ai_generated = false, sender_name = 'SENVO Team' }) => {
  const conv = await get('SELECT * FROM conversations WHERE id = ?', [conversationId]);
  if (!conv) throw new Error('Conversation not found');

  const msgId = uuidv4();
  const now = new Date().toISOString();

  await run(
    `INSERT INTO messages (id, conversation_id, direction, sender_name, content, delivery_mode, status, is_ai_generated, created_at)
     VALUES (?, ?, 'outbound', ?, ?, 'simulated', 'delivered', ?, ?)`,
    [msgId, conversationId, sender_name, content, is_ai_generated ? 1 : 0, now]
  );

  await run(
    `UPDATE conversations 
     SET last_message_at = ?, status = 'open', updated_at = ? 
     WHERE id = ?`,
    [now, now, conversationId]
  );

  await run(
    `INSERT INTO activity_events (id, actor, action, entity_type, entity_id, details, created_at)
     VALUES (?, ?, 'MESSAGE_SENT', 'message', ?, ?, ?)`,
    [uuidv4(), is_ai_generated ? 'AI SDR' : 'User', msgId, `Simulated send via ${conv.channel} to conversation ${conversationId}`, now]
  );

  invalidateOverviewCache();
  return await getConversationDetails(conversationId);
};

/**
 * Controllable simulation of incoming reply from a prospect
 * Triggers the Gemini AI assessment pipeline and autonomous response workflow
 */
export const simulateIncomingReply = async ({ conversationId, leadId, channel, content, senderName, auto_respond = true }) => {
  const now = new Date().toISOString();
  let convId = conversationId;

  // If no conversationId provided, find or create one for leadId + channel
  if (!convId) {
    if (!leadId) throw new Error('leadId or conversationId required');
    const existing = await get('SELECT id FROM conversations WHERE lead_id = ? AND channel = ?', [leadId, channel || 'email']);
    if (existing) {
      convId = existing.id;
    } else {
      convId = uuidv4();
      await run(
        `INSERT INTO conversations (id, lead_id, channel, status, assigned_owner, last_message_at, created_at, updated_at)
         VALUES (?, ?, ?, 'open', 'AI SDR', ?, ?, ?)`,
        [convId, leadId, channel || 'email', now, now, now]
      );
    }
  }

  const conv = await get('SELECT c.*, l.company_name, l.industry, l.city FROM conversations c JOIN leads l ON c.lead_id = l.id WHERE c.id = ?', [convId]);
  if (!conv) throw new Error('Conversation or lead not found');

  const sender = senderName || conv.company_name;
  const msgId = uuidv4();

  // 1. Persist incoming message
  await run(
    `INSERT INTO messages (id, conversation_id, direction, sender_name, content, delivery_mode, status, is_ai_generated, created_at)
     VALUES (?, ?, 'inbound', ?, ?, 'simulated', 'delivered', 0, ?)`,
    [msgId, convId, sender, content, now]
  );

  // Update lead status to replied
  await run(`UPDATE leads SET status = 'replied', updated_at = ? WHERE id = ?`, [now, conv.lead_id]);

  // Update conversation status to waiting_ai
  await run(`UPDATE conversations SET last_message_at = ?, status = 'waiting_ai', updated_at = ? WHERE id = ?`, [now, now, convId]);

  // 2. Fetch recent conversation messages for context
  const recentMessages = await query('SELECT direction, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 10', [convId]);

  // 3. Call genuine Gemini AI service
  const aiResult = await assessIncomingMessage({
    lead: { company_name: conv.company_name, industry: conv.industry, city: conv.city },
    recentMessages,
    incomingMessage: content,
  });

  let assessmentId = null;
  let autoReplyMessage = null;
  let autoQualified = false;

  if (aiResult.success) {
    assessmentId = uuidv4();
    const assessment = aiResult.data;

    await run(
      `INSERT INTO ai_assessments (id, conversation_id, message_id, lead_id, intent, requested_service, summary, confidence, suggested_reply, suggested_next_action, human_review_required, review_status, raw_response, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?)`,
      [
        assessmentId,
        convId,
        msgId,
        conv.lead_id,
        assessment.intent,
        assessment.requested_service,
        assessment.summary,
        assessment.confidence,
        assessment.suggested_reply,
        assessment.suggested_next_action,
        assessment.human_review_required ? 1 : 0,
        assessment.raw_response,
        now,
      ]
    );

    // Autonomous Mode: Automatically dispatch response in simulated environment
    if (auto_respond && assessment.suggested_reply) {
      const autoMsgId = uuidv4();
      const autoTime = new Date().toISOString();

      await run(
        `INSERT INTO messages (id, conversation_id, direction, sender_name, content, delivery_mode, status, is_ai_generated, created_at)
         VALUES (?, ?, 'outbound', 'SENVO AI Client Advisory', ?, 'simulated', 'delivered', 1, ?)`,
        [autoMsgId, convId, assessment.suggested_reply, autoTime]
      );

      autoReplyMessage = {
        id: autoMsgId,
        conversation_id: convId,
        direction: 'outbound',
        sender_name: 'SENVO AI Client Advisory',
        content: assessment.suggested_reply,
        delivery_mode: 'simulated',
        status: 'delivered',
        is_ai_generated: 1,
        created_at: autoTime,
      };

      // Check if prospect showed meeting/consultation interest -> Auto-Qualify
      const isMeetingInterest =
        assessment.intent === 'demo_request' ||
        assessment.intent === 'interested' ||
        /meeting|consultation|call|demo|schedule|zoom|introductory|times/i.test(content);

      if (isMeetingInterest) {
        await qualifyLead({
          leadId: conv.lead_id,
          requested_service: assessment.requested_service || 'Statutory Compliance & Advisory',
          qualification_summary: assessment.summary || 'Inbound prospect demonstrated meeting/consultation interest.',
          assigned_owner: 'Senior Client Partner (Dublin Practice)',
          next_action: assessment.suggested_next_action || 'Schedule discovery consultation call',
        });
        autoQualified = true;
        await run(`UPDATE conversations SET status = 'handed_off', updated_at = ? WHERE id = ?`, [autoTime, convId]);
      } else {
        await run(`UPDATE conversations SET status = 'open', updated_at = ? WHERE id = ?`, [autoTime, convId]);
      }

      await run(
        `INSERT INTO activity_events (id, actor, action, entity_type, entity_id, details, created_at)
         VALUES (?, 'AI SDR', 'AUTONOMOUS_REPLY_DISPATCHED', 'message', ?, ?, ?)`,
        [uuidv4(), autoMsgId, `Autonomous AI SDR auto-responded to ${conv.company_name} on ${conv.channel} (simulated)`, autoTime]
      );
    } else {
      // In review/copilot mode
      const newStatus = assessment.human_review_required ? 'review_needed' : 'open';
      await run(`UPDATE conversations SET status = ?, updated_at = ? WHERE id = ?`, [newStatus, now, convId]);
    }

    await run(
      `INSERT INTO activity_events (id, actor, action, entity_type, entity_id, details, created_at)
       VALUES (?, 'Gemini AI', 'INCOMING_REPLY_ASSESSED', 'ai_assessment', ?, ?, ?)`,
      [uuidv4(), assessmentId, `Assessed intent '${assessment.intent}' with ${(assessment.confidence * 100).toFixed(0)}% confidence for ${conv.company_name}`, now]
    );
  } else {
    // Honest AI error handling (e.g. Gemini 429 quota exhausted)
    await run(`UPDATE conversations SET status = 'review_needed', updated_at = ? WHERE id = ?`, [now, convId]);
    await run(
      `INSERT INTO activity_events (id, actor, action, entity_type, entity_id, details, created_at)
       VALUES (?, 'System', 'AI_ASSESSMENT_ERROR', 'conversation', ?, ?, ?)`,
      [uuidv4(), convId, `AI evaluation error: ${aiResult.error}`, now]
    );
  }

  invalidateOverviewCache();

  return {
    conversation: await getConversationDetails(convId),
    ai_result: aiResult,
    auto_responded: Boolean(autoReplyMessage),
    auto_reply_message: autoReplyMessage,
    auto_qualified: autoQualified,
  };
};

export const reassessConversation = async (convId) => {
  const conv = await get(
    'SELECT c.*, l.company_name, l.industry, l.city FROM conversations c JOIN leads l ON c.lead_id = l.id WHERE c.id = ?',
    [convId]
  );
  if (!conv) throw new Error('Conversation or lead not found');

  const latestInbound = await get(
    "SELECT * FROM messages WHERE conversation_id = ? AND direction = 'inbound' ORDER BY created_at DESC LIMIT 1",
    [convId]
  );
  if (!latestInbound) {
    throw new Error('No inbound message found to assess');
  }

  const recentMessages = await query(
    'SELECT direction, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 10',
    [convId]
  );

  const aiResult = await assessIncomingMessage({
    lead: { company_name: conv.company_name, industry: conv.industry, city: conv.city },
    recentMessages,
    incomingMessage: latestInbound.content,
  });

  if (aiResult.success) {
    const assessmentId = uuidv4();
    const assessment = aiResult.data;
    const now = new Date().toISOString();

    await run(
      `INSERT INTO ai_assessments (id, conversation_id, message_id, lead_id, intent, requested_service, summary, confidence, suggested_reply, suggested_next_action, human_review_required, review_status, raw_response, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending', ?, ?)`,
      [
        assessmentId,
        convId,
        latestInbound.id,
        conv.lead_id,
        assessment.intent,
        assessment.requested_service,
        assessment.summary,
        assessment.confidence,
        assessment.suggested_reply,
        assessment.suggested_next_action,
        assessment.raw_response,
        now,
      ]
    );

    const updatedConv = await getConversationDetails(convId);
    return { success: true, assessment, conversation: updatedConv };
  } else {
    return { success: false, error: aiResult.error };
  }
};

export default { getConversations, getConversationDetails, sendMessage, simulateIncomingReply, reassessConversation };
