import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';

export const getQualifiedLeads = async () => {
  return await query(`
    SELECT l.*, 
      h.id as handoff_id,
      h.requested_service,
      h.qualification_summary,
      h.assigned_owner,
      h.next_action,
      h.crm_target,
      h.crm_sync_status,
      h.sync_details,
      h.created_at as handoff_created_at
    FROM leads l
    LEFT JOIN handoffs h ON l.id = h.lead_id
    WHERE l.status = 'qualified' OR h.id IS NOT NULL
    ORDER BY l.updated_at DESC
  `);
};

export const qualifyLead = async ({ leadId, requested_service, qualification_summary, assigned_owner, next_action }) => {
  const lead = await get('SELECT * FROM leads WHERE id = ?', [leadId]);
  if (!lead) throw new Error('Lead not found');

  const now = new Date().toISOString();
  await run(`UPDATE leads SET status = 'qualified', updated_at = ? WHERE id = ?`, [now, leadId]);

  // Check if handoff record exists
  const existingHandoff = await get('SELECT id FROM handoffs WHERE lead_id = ?', [leadId]);
  let handoffId = existingHandoff?.id;

  const bitrixPayloadPreview = JSON.stringify({
    method: 'crm.lead.add',
    params: {
      fields: {
        TITLE: `Qualified Lead: ${lead.company_name} - ${requested_service || 'Advisory'}`,
        NAME: lead.contact_name || 'Managing Director',
        COMPANY_TITLE: lead.company_name,
        EMAIL: [{ VALUE: lead.email, VALUE_TYPE: 'WORK' }],
        PHONE: [{ VALUE: lead.phone, VALUE_TYPE: 'WORK' }],
        COMMENTS: qualification_summary,
        ASSIGNED_BY_ID: assigned_owner,
        SOURCE_ID: 'SENVO_OUTREACH_AI',
        STATUS_ID: 'IN_PROCESS'
      }
    }
  }, null, 2);

  if (handoffId) {
    await run(
      `UPDATE handoffs 
       SET requested_service = ?, qualification_summary = ?, assigned_owner = ?, next_action = ?, sync_details = ? 
       WHERE id = ?`,
      [
        requested_service || 'Corporate Services',
        qualification_summary,
        assigned_owner || 'Corporate Advisory Partner',
        next_action || 'Discovery consultation',
        `Prepared Bitrix24 REST payload:\n${bitrixPayloadPreview}\n[SIMULATION BOUNDARY: Live CRM sync disabled for demo safety]`,
        handoffId
      ]
    );
  } else {
    handoffId = uuidv4();
    await run(
      `INSERT INTO handoffs (id, lead_id, requested_service, qualification_summary, assigned_owner, next_action, crm_target, crm_sync_status, sync_details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Bitrix24', 'prepared_pending_sync', ?, ?)`,
      [
        handoffId,
        leadId,
        requested_service || 'Corporate Services',
        qualification_summary,
        assigned_owner || 'Corporate Advisory Partner',
        next_action || 'Discovery consultation',
        `Prepared Bitrix24 REST payload:\n${bitrixPayloadPreview}\n[SIMULATION BOUNDARY: Live CRM sync disabled for demo safety]`,
        now
      ]
    );
  }

  await run(
    `INSERT INTO activity_events (id, actor, action, entity_type, entity_id, details, created_at)
     VALUES (?, 'Sales Team', 'LEAD_QUALIFIED', 'handoff', ?, ?, ?)`,
    [uuidv4(), handoffId, `Lead ${lead.company_name} qualified and staged for Bitrix24 handoff`, now]
  );

  return await get('SELECT * FROM handoffs WHERE id = ?', [handoffId]);
};

export default { getQualifiedLeads, qualifyLead };
