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
import { query, run } from '../db/database.js';
import { seedData } from '../db/seed.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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
    const { conversationId, leadId, channel, content, senderName } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });
    const result = await inboxService.simulateIncomingReply({ conversationId, leadId, channel, content, senderName });
    res.json(result);
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
