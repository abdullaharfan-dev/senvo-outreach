-- SENVO Outreach SQLite Database Schema
-- Supports all 10 core entities and data integrity constraints

CREATE TABLE IF NOT EXISTS leads (
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
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL, -- linkedin, facebook, instagram, whatsapp, email, sms, website
  template_id TEXT,
  template_body TEXT NOT NULL,
  status TEXT CHECK(status IN ('draft', 'running', 'paused', 'completed')) DEFAULT 'draft',
  target_audience TEXT DEFAULT 'All Eligible Leads',
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS campaign_recipients (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL,
  lead_id TEXT NOT NULL,
  personalized_content TEXT NOT NULL,
  status TEXT CHECK(status IN ('queued', 'simulated_sent', 'failed', 'skipped', 'replied')) DEFAULT 'queued',
  error_message TEXT,
  sent_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  UNIQUE(campaign_id, lead_id)
);

CREATE INDEX IF NOT EXISTS idx_cr_campaign_status ON campaign_recipients(campaign_id, status);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT CHECK(status IN ('open', 'waiting_ai', 'review_needed', 'closed', 'handed_off')) DEFAULT 'open',
  assigned_owner TEXT DEFAULT 'AI SDR',
  last_message_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conversations_lead ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  direction TEXT CHECK(direction IN ('inbound', 'outbound')) NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  delivery_mode TEXT CHECK(delivery_mode IN ('simulated', 'live')) DEFAULT 'simulated',
  status TEXT CHECK(status IN ('delivered', 'read', 'pending_review', 'failed')) DEFAULT 'delivered',
  is_ai_generated INTEGER DEFAULT 0,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS ai_assessments (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  message_id TEXT,
  lead_id TEXT NOT NULL,
  intent TEXT NOT NULL,
  requested_service TEXT,
  summary TEXT NOT NULL,
  confidence REAL DEFAULT 0.90,
  suggested_reply TEXT,
  suggested_next_action TEXT,
  human_review_required INTEGER DEFAULT 0,
  review_status TEXT CHECK(review_status IN ('pending', 'approved', 'rejected', 'modified')) DEFAULT 'pending',
  raw_response TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS handoffs (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  conversation_id TEXT,
  requested_service TEXT,
  qualification_summary TEXT NOT NULL,
  assigned_owner TEXT NOT NULL,
  next_action TEXT NOT NULL,
  crm_target TEXT DEFAULT 'Bitrix24',
  crm_sync_status TEXT CHECK(crm_sync_status IN ('prepared_pending_sync', 'sync_failed', 'synced')) DEFAULT 'prepared_pending_sync',
  sync_details TEXT DEFAULT 'Payload formatted for Bitrix24 Lead REST API. Live sync disabled in demo mode.',
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS company_knowledge (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- service, faq, business_rule, claim_boundary, pricing_rule
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  approved INTEGER DEFAULT 1,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS integration_configs (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  provider_mode TEXT CHECK(provider_mode IN ('simulated', 'live')) DEFAULT 'simulated',
  is_connected INTEGER DEFAULT 1,
  capabilities TEXT DEFAULT '[]',
  last_heartbeat TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS connected_accounts (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_identifier TEXT NOT NULL,
  auth_type TEXT CHECK(auth_type IN ('oauth2', 'api_key', 'webhook', 'smtp_graph')) DEFAULT 'oauth2',
  connection_status TEXT CHECK(connection_status IN ('connected_simulated', 'connected_live', 'disconnected', 'auth_required', 'error')) DEFAULT 'connected_simulated',
  environment TEXT CHECK(environment IN ('sandbox_simulation', 'production')) DEFAULT 'sandbox_simulation',
  permissions_granted TEXT DEFAULT '[]',
  token_expires_at TEXT,
  rate_limit_info TEXT,
  compliance_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_connected_accounts_channel ON connected_accounts(channel);

CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY,
  actor TEXT DEFAULT 'System',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_events(created_at DESC);
