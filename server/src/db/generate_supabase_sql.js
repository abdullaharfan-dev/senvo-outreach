import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const snapshotPath = path.join(__dirname, 'seed_snapshot.json');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

let sql = `-- ==============================================================================
-- SENVO OUTREACH DEDICATED SCHEMA & SEED DATA MIGRATION
-- Project Target: Existing Supabase Project (wsihyfmwikbkjwxhnxqt)
-- Isolation Guarantee: Operates strictly within 'senvo_outreach' schema.
-- ZERO modifications, alterations or drops to existing 'public' schema or SENVO Dukaan objects.
-- ==============================================================================

-- 1. Create Dedicated Isolated Schema
CREATE SCHEMA IF NOT EXISTS senvo_outreach;

-- Set search_path for this script
SET search_path TO senvo_outreach;

-- 2. Schema DDL: All 11 SENVO Outreach tables inside senvo_outreach

CREATE TABLE IF NOT EXISTS senvo_outreach.leads (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    industry TEXT,
    city TEXT,
    source TEXT DEFAULT 'Manual / Import',
    priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    score INTEGER DEFAULT 50,
    owner TEXT DEFAULT 'Sales Team',
    status TEXT CHECK(status IN ('uncontacted', 'in_campaign', 'replied', 'qualified', 'unqualified')) DEFAULT 'uncontacted',
    custom_fields TEXT DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS senvo_outreach.campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    channel TEXT NOT NULL,
    template_id TEXT,
    template_body TEXT NOT NULL,
    status TEXT CHECK(status IN ('draft', 'running', 'paused', 'completed')) DEFAULT 'draft',
    target_audience TEXT DEFAULT 'All Eligible Leads',
    total_recipients INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS senvo_outreach.campaign_recipients (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL REFERENCES senvo_outreach.campaigns(id) ON DELETE CASCADE,
    lead_id TEXT NOT NULL REFERENCES senvo_outreach.leads(id) ON DELETE CASCADE,
    personalized_content TEXT NOT NULL,
    status TEXT CHECK(status IN ('queued', 'simulated_sent', 'failed', 'skipped', 'replied')) DEFAULT 'queued',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT uq_cr_campaign_lead UNIQUE(campaign_id, lead_id)
);

CREATE TABLE IF NOT EXISTS senvo_outreach.conversations (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES senvo_outreach.leads(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    status TEXT CHECK(status IN ('open', 'waiting_ai', 'review_needed', 'closed', 'handed_off')) DEFAULT 'open',
    assigned_owner TEXT DEFAULT 'AI SDR',
    last_message_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS senvo_outreach.messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES senvo_outreach.conversations(id) ON DELETE CASCADE,
    direction TEXT CHECK(direction IN ('inbound', 'outbound')) NOT NULL,
    sender_name TEXT NOT NULL,
    content TEXT NOT NULL,
    delivery_mode TEXT CHECK(delivery_mode IN ('simulated', 'live')) DEFAULT 'simulated',
    status TEXT CHECK(status IN ('delivered', 'read', 'pending_review', 'failed')) DEFAULT 'delivered',
    is_ai_generated INTEGER DEFAULT 0,
    metadata TEXT DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS senvo_outreach.ai_assessments (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES senvo_outreach.conversations(id) ON DELETE CASCADE,
    message_id TEXT,
    lead_id TEXT NOT NULL REFERENCES senvo_outreach.leads(id) ON DELETE CASCADE,
    intent TEXT NOT NULL,
    requested_service TEXT,
    summary TEXT NOT NULL,
    confidence REAL DEFAULT 0.90,
    suggested_reply TEXT,
    suggested_next_action TEXT,
    human_review_required INTEGER DEFAULT 0,
    review_status TEXT CHECK(review_status IN ('pending', 'approved', 'rejected', 'modified')) DEFAULT 'pending',
    raw_response TEXT,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS senvo_outreach.handoffs (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL REFERENCES senvo_outreach.leads(id) ON DELETE CASCADE,
    conversation_id TEXT,
    requested_service TEXT,
    qualification_summary TEXT NOT NULL,
    assigned_owner TEXT NOT NULL,
    next_action TEXT NOT NULL,
    crm_target TEXT DEFAULT 'Bitrix24',
    crm_sync_status TEXT CHECK(crm_sync_status IN ('prepared_pending_sync', 'sync_failed', 'synced')) DEFAULT 'prepared_pending_sync',
    sync_details TEXT DEFAULT 'Payload formatted for Bitrix24 Lead REST API. Live sync disabled in demo mode.',
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS senvo_outreach.company_knowledge (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    approved INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS senvo_outreach.integration_configs (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    provider_mode TEXT CHECK(provider_mode IN ('simulated', 'live')) DEFAULT 'simulated',
    is_connected INTEGER DEFAULT 1,
    capabilities TEXT DEFAULT '[]',
    last_heartbeat TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS senvo_outreach.connected_accounts (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_identifier TEXT NOT NULL,
    auth_type TEXT CHECK(auth_type IN ('oauth2', 'api_key', 'webhook', 'smtp_graph')) DEFAULT 'oauth2',
    connection_status TEXT CHECK(connection_status IN ('connected_simulated', 'connected_live', 'disconnected', 'auth_required', 'error')) DEFAULT 'connected_simulated',
    environment TEXT CHECK(environment IN ('sandbox_simulation', 'production')) DEFAULT 'sandbox_simulation',
    permissions_granted TEXT DEFAULT '[]',
    token_expires_at TIMESTAMPTZ,
    rate_limit_info TEXT,
    compliance_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS senvo_outreach.activity_events (
    id TEXT PRIMARY KEY,
    actor TEXT DEFAULT 'System',
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON senvo_outreach.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON senvo_outreach.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON senvo_outreach.leads(industry);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON senvo_outreach.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_cr_campaign_status ON senvo_outreach.campaign_recipients(campaign_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_lead ON senvo_outreach.conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON senvo_outreach.conversations(channel);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON senvo_outreach.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_connected_accounts_channel ON senvo_outreach.connected_accounts(channel);
CREATE INDEX IF NOT EXISTS idx_activity_created ON senvo_outreach.activity_events(created_at DESC);

-- 3. Seed Existing Verified Ireland Corporate Demonstration Records
`;

const escapeSql = (val) => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  return `'${String(val).replace(/'/g, "''")}'`;
};

const tables = [
  'company_knowledge',
  'integration_configs',
  'connected_accounts',
  'leads',
  'campaigns',
  'campaign_recipients',
  'conversations',
  'messages',
  'ai_assessments',
  'handoffs',
  'activity_events'
];

for (const table of tables) {
  const rows = snapshot[table];
  if (rows && rows.length > 0) {
    sql += `\n-- Seed ${table} (${rows.length} records)\n`;
    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = Object.values(row).map(escapeSql);
      sql += `INSERT INTO senvo_outreach.${table} (${cols.join(', ')}) VALUES (${vals.join(', ')}) ON CONFLICT DO NOTHING;\n`;
    }
  }
}

sql += `
-- Verification assertion: Verify row counts in isolated senvo_outreach schema
SELECT 'senvo_outreach.leads' AS table_name, count(*) FROM senvo_outreach.leads
UNION ALL SELECT 'senvo_outreach.campaigns', count(*) FROM senvo_outreach.campaigns
UNION ALL SELECT 'senvo_outreach.conversations', count(*) FROM senvo_outreach.conversations
UNION ALL SELECT 'senvo_outreach.messages', count(*) FROM senvo_outreach.messages
UNION ALL SELECT 'senvo_outreach.connected_accounts', count(*) FROM senvo_outreach.connected_accounts;
`;

const outputPath = path.join(__dirname, 'supabase_senvo_outreach_migration.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log(`Generated migration script at ${outputPath} (${sql.length} bytes, ${sql.split('\n').length} lines)`);
