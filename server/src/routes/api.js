import express from 'express';
import multer from 'multer';
import { parse as csvParse } from 'csv-parse/sync';
import xlsx from 'xlsx';
import leadService from '../services/leadService.js';
import campaignService from '../services/campaignService.js';
import inboxService from '../services/inboxService.js';
import qualificationService from '../services/qualificationService.js';
import analyticsService from '../services/analyticsService.js';
import { checkAiHealth } from '../services/aiService.js';
import { query, run, get } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import { seedData } from '../db/seed.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Demo Authentication ---
const DEMO_CREDENTIALS = {
  email: process.env.DEMO_USER_EMAIL || 'partner@senvo.ie',
  password: process.env.DEMO_USER_PASSWORD || 'SenvoIreland2026!',
};

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (
    (normalizedEmail === DEMO_CREDENTIALS.email.toLowerCase() || normalizedEmail === 'demo@senvo.ie') &&
    (password === DEMO_CREDENTIALS.password || password === 'Senvo2026!' || password === 'senvo2026')
  ) {
    return res.json({
      success: true,
      token: 'senvo_demo_secure_session_token_' + Date.now(),
      user: {
        name: "Declan O'Sullivan",
        role: 'Client Services Lead & Partner',
        email: 'partner@senvo.ie',
        organization: 'SENVO Ireland Corporate Practice',
        jurisdiction: 'Dublin • Cork • Galway'
      }
    });
  }

  return res.status(401).json({
    error: 'Access restricted. Please enter approved SENVO demo credentials.'
  });
});

router.get('/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer senvo_demo_secure_session_token_')) {
    return res.json({
      authenticated: true,
      user: {
        name: "Declan O'Sullivan",
        role: 'Client Services Lead & Partner',
        email: 'partner@senvo.ie',
      }
    });
  }
  return res.status(401).json({ authenticated: false });
});

// --- Overview / Analytics ---
router.get('/overview', async (req, res) => {
  try {
    const data = await analyticsService.getOverviewMetrics();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Leads ---
router.get('/leads', async (req, res) => {
  try {
    const { search, industry, priority, status, page, limit } = req.query;
    const result = await leadService.getLeads({ search, industry, priority, status, page: Number(page) || 1, limit: Number(limit) || 100 });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/leads/segments', async (req, res) => {
  try {
    const segments = await leadService.getSegments();
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 1 of guided import: Parse uploaded file into rows and detected headers
router.post('/leads/parse-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let records = [];
    let headers = [];
    const filename = req.file.originalname;
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.csv')) {
      const content = req.file.buffer.toString('utf8');
      records = csvParse(content, { columns: true, skip_empty_lines: true, trim: true });
      if (records.length > 0) {
        headers = Object.keys(records[0]);
      }
    } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const firstSheet = workbook.SheetNames[0];
      records = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet]);
      if (records.length > 0) {
        headers = Object.keys(records[0]);
      }
    } else {
      return res.status(400).json({ error: 'Only CSV and Excel (.xlsx) files are supported' });
    }

    // Suggested column mapping based on detected header names
    const suggestedMap = {};
    for (const h of headers) {
      const lh = h.toLowerCase().trim();
      if (lh.includes('company') || lh.includes('business')) suggestedMap.company_name = h;
      else if (lh.includes('contact') || lh.includes('person') || lh.includes('name')) suggestedMap.contact_name = h;
      else if (lh.includes('email') || lh.includes('mail')) suggestedMap.email = h;
      else if (lh.includes('phone') || lh.includes('mobile') || lh.includes('whatsapp') || lh.includes('tel')) suggestedMap.phone = h;
      else if (lh.includes('industry') || lh.includes('sector')) suggestedMap.industry = h;
      else if (lh.includes('city') || lh.includes('location') || lh.includes('address')) suggestedMap.city = h;
      else if (lh.includes('priority')) suggestedMap.priority = h;
    }

    res.json({
      filename,
      headers,
      suggestedMap,
      rowCount: records.length,
      sampleRows: records.slice(0, 5),
      rawRecords: records
    });
  } catch (err) {
    res.status(500).json({ error: `File parsing failed: ${err.message}` });
  }
});

// Step 2 & 3 of guided import: Map, validate, deduplicate, and segment records
router.post('/leads/validate-import', async (req, res) => {
  try {
    const { records, columnMap } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Records array required' });
    }

    const validationResult = await leadService.validateImportRecords(records, columnMap || {});
    res.json(validationResult);
  } catch (err) {
    res.status(500).json({ error: `Validation failed: ${err.message}` });
  }
});

// Step 4 of guided import: Commit approved records into SQLite
router.post('/leads/commit-import', async (req, res) => {
  try {
    const { approvedRecords, sourceName } = req.body;
    if (!approvedRecords || !Array.isArray(approvedRecords)) {
      return res.status(400).json({ error: 'Approved records array required' });
    }

    const result = await leadService.commitImportBatch(approvedRecords, sourceName || 'Spreadsheet Import');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Batch commit failed: ${err.message}` });
  }
});

router.post('/leads', async (req, res) => {
  try {
    const lead = await leadService.createLead(req.body);
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/leads/:id', async (req, res) => {
  try {
    const lead = await leadService.updateLead(req.params.id, req.body);
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/leads/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let records = [];
    const filename = req.file.originalname.toLowerCase();

    if (filename.endsWith('.csv')) {
      const content = req.file.buffer.toString('utf8');
      records = csvParse(content, { columns: true, skip_empty_lines: true, trim: true });
    } else if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const firstSheet = workbook.SheetNames[0];
      records = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheet]);
    } else {
      return res.status(400).json({ error: 'Only CSV and Excel (.xlsx) files are supported' });
    }

    const columnMap = req.body.columnMap ? JSON.parse(req.body.columnMap) : {};
    const result = await leadService.importLeads(records, columnMap);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: `Import failed: ${err.message}` });
  }
});

// --- Campaigns ---
router.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await campaignService.getCampaigns();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/campaigns/:id', async (req, res) => {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/campaigns', async (req, res) => {
  try {
    const campaign = await campaignService.createCampaign(req.body);
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/campaigns/:id/start', async (req, res) => {
  try {
    const result = await campaignService.startCampaign(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/campaigns/:id/pause', async (req, res) => {
  try {
    const result = await campaignService.pauseCampaign(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Unified Inbox ---
router.get('/inbox/conversations', async (req, res) => {
  try {
    const { channel, status, search } = req.query;
    const conversations = await inboxService.getConversations({ channel, status, search });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/inbox/conversations/:id', async (req, res) => {
  try {
    const details = await inboxService.getConversationDetails(req.params.id);
    if (!details) return res.status(404).json({ error: 'Conversation not found' });
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/inbox/conversations/:id/messages', async (req, res) => {
  try {
    const { content, is_ai_generated, sender_name } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content required' });
    const result = await inboxService.sendMessage(req.params.id, { content, is_ai_generated, sender_name });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Controllable incoming simulation endpoint
router.post('/inbox/simulate-incoming', async (req, res) => {
  try {
    const { conversationId, leadId, channel, content, senderName, auto_respond } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const result = await inboxService.simulateIncomingReply({
      conversationId,
      leadId,
      channel,
      content,
      senderName,
      auto_respond: auto_respond !== false
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Re-assess conversation with Gemini AI Copilot
router.post('/inbox/conversations/:id/re-assess', async (req, res) => {
  try {
    const result = await inboxService.reassessConversation(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Connected Accounts & Channels ---
router.get('/accounts', async (req, res) => {
  try {
    const accounts = await query('SELECT * FROM connected_accounts ORDER BY channel, created_at ASC');
    res.json(accounts.map(a => ({
      ...a,
      permissions_granted: JSON.parse(a.permissions_granted || '[]')
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/accounts', async (req, res) => {
  try {
    const { channel, account_name, account_identifier, auth_type, environment, permissions_granted, compliance_notes } = req.body;
    if (!channel || !account_name || !account_identifier) {
      return res.status(400).json({ error: 'channel, account_name, and account_identifier are required' });
    }
    const id = uuidv4();
    const now = new Date().toISOString();
    const status = environment === 'production' ? 'auth_required' : 'connected_simulated';
    await run(
      `INSERT INTO connected_accounts (id, channel, account_name, account_identifier, auth_type, connection_status, environment, permissions_granted, token_expires_at, rate_limit_info, compliance_notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        channel,
        account_name,
        account_identifier,
        auth_type || 'oauth2',
        status,
        environment || 'sandbox_simulation',
        JSON.stringify(permissions_granted || []),
        new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        'Sandbox simulation limits active (max 100/day)',
        compliance_notes || 'Interactive simulated channel connection for client demo.',
        now,
        now
      ]
    );
    const created = await get('SELECT * FROM connected_accounts WHERE id = ?', [id]);
    res.status(201).json({ ...created, permissions_granted: JSON.parse(created.permissions_granted || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/accounts/:id/test', async (req, res) => {
  try {
    const account = await get('SELECT * FROM connected_accounts WHERE id = ?', [req.params.id]);
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json({
      success: true,
      account_id: account.id,
      channel: account.channel,
      status: 'healthy',
      latency_ms: Math.floor(45 + Math.random() * 80),
      tested_at: new Date().toISOString(),
      message: `Connection test passed for ${account.account_name} on ${account.channel}. Sandbox adapter healthy.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/accounts/:id/disconnect', async (req, res) => {
  try {
    const now = new Date().toISOString();
    await run("UPDATE connected_accounts SET connection_status = 'disconnected', updated_at = ? WHERE id = ?", [now, req.params.id]);
    const updated = await get('SELECT * FROM connected_accounts WHERE id = ?', [req.params.id]);
    res.json({ ...updated, permissions_granted: JSON.parse(updated.permissions_granted || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/accounts/:id/reconnect', async (req, res) => {
  try {
    const now = new Date().toISOString();
    await run("UPDATE connected_accounts SET connection_status = 'connected_simulated', updated_at = ? WHERE id = ?", [now, req.params.id]);
    const updated = await get('SELECT * FROM connected_accounts WHERE id = ?', [req.params.id]);
    res.json({ ...updated, permissions_granted: JSON.parse(updated.permissions_granted || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Qualified Leads & Bitrix24 Handoff ---
router.get('/qualified-leads', async (req, res) => {
  try {
    const leads = await qualificationService.getQualifiedLeads();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/qualified-leads', async (req, res) => {
  try {
    const handoff = await qualificationService.qualifyLead(req.body);
    res.json(handoff);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Company Knowledge ---
router.get('/knowledge', async (req, res) => {
  try {
    const entries = await query('SELECT * FROM company_knowledge ORDER BY category, title');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/knowledge', async (req, res) => {
  try {
    const { category, title, content } = req.body;
    const now = new Date().toISOString();
    await run(
      'INSERT INTO company_knowledge (id, category, title, content, approved, updated_at) VALUES (?, ?, ?, ?, 1, ?)',
      [req.body.id || Math.random().toString(36).substring(2), category, title, content, now]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Integrations ---
router.get('/integrations', async (req, res) => {
  try {
    const configs = await query('SELECT * FROM integration_configs ORDER BY channel');
    res.json(configs.map(c => ({ ...c, capabilities: JSON.parse(c.capabilities || '[]') })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- System & AI Health Check ---
router.get('/health', async (req, res) => {
  try {
    const aiHealth = await checkAiHealth();
    res.json({
      server: 'operational',
      database: 'connected (SQLite persistent file)',
      ai: aiHealth,
      simulation_mode: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Demo Reset / Re-seed ---
router.post('/admin/reset-demo', async (req, res) => {
  try {
    // Clear all existing operational tables
    await run('DELETE FROM campaign_recipients');
    await run('DELETE FROM campaigns');
    await run('DELETE FROM messages');
    await run('DELETE FROM ai_assessments');
    await run('DELETE FROM handoffs');
    await run('DELETE FROM conversations');
    await run('DELETE FROM leads');
    await run('DELETE FROM company_knowledge');
    await run('DELETE FROM integration_configs');
    await run('DELETE FROM activity_events');

    await seedData();
    res.json({ success: true, message: 'Database reset and re-seeded with Ireland corporate demo data.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
