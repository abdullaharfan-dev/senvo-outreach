import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';
import { invalidateOverviewCache } from './analyticsService.js';

export const getLeads = async ({ search = '', industry = '', priority = '', status = '', page = 1, limit = 50 } = {}) => {
  let sql = 'SELECT * FROM leads WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (company_name LIKE ? OR contact_name LIKE ? OR email LIKE ? OR city LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  if (industry) {
    sql += ' AND industry = ?';
    params.push(industry);
  }

  if (priority) {
    sql += ' AND priority = ?';
    params.push(priority);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, (page - 1) * limit);

  const leads = await query(sql, params);
  const countRow = await get('SELECT COUNT(*) as total FROM leads');

  return { leads, total: countRow.total, page, limit };
};

export const getLeadById = async (id) => {
  return await get('SELECT * FROM leads WHERE id = ?', [id]);
};

export const createLead = async (data) => {
  const id = uuidv4();
  const now = new Date().toISOString();

  await run(
    `INSERT INTO leads (id, company_name, contact_name, email, phone, industry, city, source, priority, score, owner, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.company_name,
      data.contact_name || '',
      data.email || '',
      data.phone || '',
      data.industry || 'Corporate',
      data.city || 'Ireland',
      data.source || 'Manual Entry',
      data.priority || 'medium',
      data.score || 50,
      data.owner || 'Corporate Advisory Team',
      data.status || 'uncontacted',
      now,
      now
    ]
  );

  await run(
    `INSERT INTO activity_events (id, actor, action, entity_type, entity_id, details, created_at)
     VALUES (?, 'User', 'LEAD_CREATED', 'lead', ?, ?, ?)`,
    [uuidv4(), id, `Created lead ${data.company_name}`, now]
  );

  invalidateOverviewCache();
  return await getLeadById(id);
};

export const updateLead = async (id, data) => {
  const now = new Date().toISOString();
  const fields = [];
  const params = [];

  const updatable = ['company_name', 'contact_name', 'email', 'phone', 'industry', 'city', 'priority', 'score', 'owner', 'status'];
  for (const key of updatable) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) return await getLeadById(id);

  fields.push('updated_at = ?');
  params.push(now);
  params.push(id);

  await run(`UPDATE leads SET ${fields.join(', ')} WHERE id = ?`, params);
  invalidateOverviewCache();
  return await getLeadById(id);
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate imported spreadsheet records against database rules and channel prerequisites
 */
export const validateImportRecords = async (records, columnMap = {}) => {
  const existingRows = await query('SELECT LOWER(company_name) as name, phone FROM leads');
  const existingNames = new Set(existingRows.map(r => r.name?.trim()));
  const existingPhones = new Set(existingRows.map(r => r.phone?.replace(/[^0-9]/g, '')).filter(Boolean));

  const validated = [];
  const inBatchNames = new Set();
  const inBatchPhones = new Set();

  let eligibleCount = 0;
  let duplicateCount = 0;
  let incompleteCount = 0;

  for (let idx = 0; idx < records.length; idx++) {
    const row = records[idx];
    const company_name = (row[columnMap.company_name || 'Company Name'] || row['Business Name'] || row['company_name'] || '').trim();
    const contact_name = (row[columnMap.contact_name || 'Contact Person'] || row['Contact Name'] || row['contact_name'] || '').trim();
    const email = (row[columnMap.email || 'Email'] || row['email'] || '').trim();
    const phone = (row[columnMap.phone || 'Phone'] || row['WhatsApp Number'] || row['phone'] || '').trim();
    const industry = (row[columnMap.industry || 'Industry'] || row['industry'] || 'Corporate').trim();
    const city = (row[columnMap.city || 'City'] || row['city'] || 'Dublin').trim();
    const priority = (row[columnMap.priority || 'Priority'] || 'medium').toLowerCase();

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const cleanName = company_name.toLowerCase();

    const issues = [];
    let status = 'valid';

    if (!company_name) {
      status = 'invalid';
      issues.push('Missing company legal name');
    }

    const hasValidEmail = Boolean(email && emailRegex.test(email));
    const hasValidPhone = Boolean(cleanPhone && cleanPhone.length >= 7);

    if (email && !hasValidEmail) {
      issues.push('Invalid email format');
    }
    if (phone && !hasValidPhone) {
      issues.push('Phone number too short or invalid');
    }

    // Duplicate detection against existing database and in-batch duplicates
    const isDbDupName = existingNames.has(cleanName);
    const isDbDupPhone = cleanPhone && existingPhones.has(cleanPhone);
    const isBatchDupName = inBatchNames.has(cleanName);
    const isBatchDupPhone = cleanPhone && inBatchPhones.has(cleanPhone);

    if (isDbDupName || isBatchDupName) {
      status = 'duplicate';
      issues.push(isDbDupName ? 'Company already registered in database' : 'Duplicate company in file');
    } else if (isDbDupPhone || isBatchDupPhone) {
      status = 'duplicate';
      issues.push(isDbDupPhone ? 'Phone number already registered in database' : 'Duplicate phone in file');
    }

    // Determine channel eligibility
    const eligibleChannels = [];
    if (hasValidEmail) eligibleChannels.push('email');
    if (hasValidPhone) {
      eligibleChannels.push('whatsapp', 'sms');
    }
    if (contact_name && company_name) {
      eligibleChannels.push('linkedin');
    }

    if (status === 'valid') {
      if (eligibleChannels.length === 0) {
        status = 'incomplete';
        issues.push('No usable email or phone number for outreach');
        incompleteCount++;
      } else {
        eligibleCount++;
        inBatchNames.add(cleanName);
        if (cleanPhone) inBatchPhones.add(cleanPhone);
      }
    } else if (status === 'duplicate') {
      duplicateCount++;
    } else {
      incompleteCount++;
    }

    validated.push({
      index: idx,
      company_name,
      contact_name,
      email,
      phone,
      industry,
      city,
      priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
      status,
      issues,
      has_email: hasValidEmail,
      has_phone: hasValidPhone,
      eligible_channels: eligibleChannels,
      segment: eligibleChannels.length > 2 ? 'Multi-Channel' : hasValidEmail ? 'Email Only' : hasValidPhone ? 'Phone / WhatsApp' : 'Ineligible'
    });
  }

  return {
    total: records.length,
    eligible: eligibleCount,
    duplicates: duplicateCount,
    incomplete: incompleteCount,
    records: validated,
    segment_counts: {
      multi_channel: validated.filter(r => r.status === 'valid' && r.segment === 'Multi-Channel').length,
      email_ready: validated.filter(r => r.status === 'valid' && r.has_email).length,
      phone_ready: validated.filter(r => r.status === 'valid' && r.has_phone).length,
      linkedin_ready: validated.filter(r => r.status === 'valid' && r.eligible_channels.includes('linkedin')).length,
    }
  };
};

/**
 * Commit a validated batch of leads into SQLite
 */
export const commitImportBatch = async (approvedRecords, sourceName = 'Spreadsheet Import') => {
  let committed = 0;
  const now = new Date().toISOString();
  const createdIds = [];

  for (const row of approvedRecords) {
    if (row.status !== 'valid') continue;

    const id = uuidv4();
    await run(
      `INSERT INTO leads (id, company_name, contact_name, email, phone, industry, city, source, priority, score, owner, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 60, 'Corporate Advisory Team', 'uncontacted', ?, ?)`,
      [id, row.company_name, row.contact_name, row.email, row.phone, row.industry, row.city, sourceName, row.priority || 'medium', now, now]
    );

    createdIds.push(id);
    committed++;
  }

  await run(
    `INSERT INTO activity_events (id, actor, action, entity_type, details, created_at)
     VALUES (?, 'System', 'LEADS_BATCH_COMMITTED', 'lead', ?, ?)`,
    [uuidv4(), `Committed ${committed} validated corporate leads into database from ${sourceName}`, now]
  );

  invalidateOverviewCache();

  return { committed, createdIds };
};

/**
 * Return intelligent database-level segments computed from SQLite
 */
export const getSegments = async () => {
  const allLeads = await query('SELECT * FROM leads ORDER BY created_at DESC');

  const segments = [
    {
      id: 'all_uncontacted',
      name: 'All Uncontacted Prospects',
      description: 'Fresh prospects awaiting initial outreach campaign assignment',
      channel_fit: 'Multi-Channel',
      leads: allLeads.filter(l => l.status === 'uncontacted'),
    },
    {
      id: 'email_direct',
      name: 'Corporate Email Ready',
      description: 'Leads with verified corporate email for Outlook/365 briefings',
      channel_fit: 'Corporate Email',
      leads: allLeads.filter(l => l.email && l.email.includes('@') && l.status !== 'qualified'),
    },
    {
      id: 'phone_whatsapp',
      name: 'Direct Phone & WhatsApp Eligible',
      description: 'Managing directors with direct phone numbers for WhatsApp / SMS follow-up',
      channel_fit: 'WhatsApp / Phone',
      leads: allLeads.filter(l => l.phone && l.phone.length > 6 && l.status !== 'qualified'),
    },
    {
      id: 'multi_channel_priority',
      name: 'High Priority Multi-Channel',
      description: 'High-score corporate leads with both email and phone contactability',
      channel_fit: 'Omni-channel',
      leads: allLeads.filter(l => l.priority === 'high' && l.email && l.phone),
    },
    {
      id: 'medtech_lifesciences',
      name: 'MedTech & Life Sciences Cluster',
      description: 'Specialized Enterprise Ireland / IDA clients for R&D tax credit & grant audits',
      channel_fit: 'LinkedIn / Email',
      leads: allLeads.filter(l => l.industry?.toLowerCase().includes('medtech') || l.industry?.toLowerCase().includes('bio')),
    },
    {
      id: 'freight_logistics',
      name: 'Freight, Logistics & Marine',
      description: 'Cross-border operators for postponed VAT3 accounting and statutory audits',
      channel_fit: 'Email / Phone',
      leads: allLeads.filter(l => l.industry?.toLowerCase().includes('freight') || l.industry?.toLowerCase().includes('logistics') || l.industry?.toLowerCase().includes('marine')),
    },
    {
      id: 'dublin_hub',
      name: 'Dublin Metropolitan Headquarters',
      description: 'Companies registered in Dublin 1, 2, 4, and Greater Dublin',
      channel_fit: 'LinkedIn / Email',
      leads: allLeads.filter(l => l.city?.toLowerCase().includes('dublin')),
    },
    {
      id: 'replied_active',
      name: 'Engaged & In Discovery',
      description: 'Prospects who responded to initial outreach and are in active dialogue',
      channel_fit: 'Unified Inbox',
      leads: allLeads.filter(l => l.status === 'replied'),
    },
  ];

  return segments.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    channel_fit: s.channel_fit,
    count: s.leads.length,
    lead_ids: s.leads.map(l => l.id),
    sample_leads: s.leads.slice(0, 3).map(l => ({ id: l.id, company_name: l.company_name, city: l.city, priority: l.priority }))
  }));
};

export default {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  validateImportRecords,
  commitImportBatch,
  getSegments
};
