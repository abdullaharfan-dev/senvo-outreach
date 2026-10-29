import { v4 as uuidv4 } from 'uuid';
import { query, get, run } from '../db/database.js';

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
  return await getLeadById(id);
};

export const importLeads = async (records, columnMap = {}) => {
  let imported = 0;
  let duplicates = 0;
  let skipped = 0;
  const now = new Date().toISOString();

  // Load existing phones and company names to detect duplicates
  const existingRows = await query('SELECT LOWER(company_name) as name, phone FROM leads');
  const existingNames = new Set(existingRows.map(r => r.name?.trim()));
  const existingPhones = new Set(existingRows.map(r => r.phone?.replace(/[^0-9]/g, '')).filter(Boolean));

  for (const row of records) {
    const company_name = row[columnMap.company_name || 'Company Name'] || row['Business Name'] || row['company_name'];
    if (!company_name) {
      skipped++;
      continue;
    }

    const phone = row[columnMap.phone || 'Phone'] || row['WhatsApp Number'] || row['phone'] || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // Duplicate check
    const isDupName = existingNames.has(company_name.toLowerCase().trim());
    const isDupPhone = cleanPhone && existingPhones.has(cleanPhone);

    if (isDupName || isDupPhone) {
      duplicates++;
      continue;
    }

    const id = uuidv4();
    const contact_name = row[columnMap.contact_name || 'Contact Person'] || row['Contact Name'] || row['contact_name'] || '';
    const email = row[columnMap.email || 'Email'] || row['email'] || '';
    const industry = row[columnMap.industry || 'Industry'] || row['industry'] || 'Corporate';
    const city = row[columnMap.city || 'City'] || row['city'] || 'Dublin';
    const priority = (row[columnMap.priority || 'Priority'] || 'medium').toLowerCase();

    await run(
      `INSERT INTO leads (id, company_name, contact_name, email, phone, industry, city, source, priority, score, owner, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Spreadsheet Import', ?, 60, 'Corporate Advisory Team', 'uncontacted', ?, ?)`,
      [id, company_name, contact_name, email, phone, industry, city, ['high', 'medium', 'low'].includes(priority) ? priority : 'medium', now, now]
    );

    existingNames.add(company_name.toLowerCase().trim());
    if (cleanPhone) existingPhones.add(cleanPhone);
    imported++;
  }

  await run(
    `INSERT INTO activity_events (id, actor, action, entity_type, details, created_at)
     VALUES (?, 'System', 'LEADS_IMPORTED', 'lead', ?, ?)`,
    [uuidv4(), `Imported ${imported} leads (${duplicates} duplicates skipped)`, now]
  );

  return { imported, duplicates, skipped };
};

export default { getLeads, getLeadById, createLead, updateLead, importLeads };
