export type ChannelType = 'email' | 'linkedin' | 'whatsapp' | 'facebook' | 'instagram' | 'sms' | 'website';

export interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  industry: string;
  city: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
  score: number;
  owner: string;
  status: 'uncontacted' | 'in_campaign' | 'replied' | 'qualified' | 'unqualified';
  custom_fields?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignRecipient {
  id: string;
  campaign_id: string;
  lead_id: string;
  personalized_content: string;
  status: 'queued' | 'simulated_sent' | 'failed' | 'skipped' | 'replied';
  error_message?: string;
  sent_at?: string;
  created_at: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  industry?: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: ChannelType;
  template_id: string;
  template_body: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  target_audience: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  skipped_count: number;
  replied_count: number;
  queued_count?: number;
  created_at: string;
  updated_at: string;
  recipients?: CampaignRecipient[];
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  sender_name: string;
  content: string;
  delivery_mode: 'simulated' | 'live';
  status: 'delivered' | 'read' | 'pending_review' | 'failed';
  is_ai_generated: number;
  metadata?: string;
  created_at: string;
}

export interface AiAssessment {
  id: string;
  conversation_id: string;
  message_id?: string;
  lead_id: string;
  intent: string;
  requested_service: string;
  summary: string;
  confidence: number;
  suggested_reply: string;
  suggested_next_action: string;
  human_review_required: number;
  review_status: 'pending' | 'approved' | 'rejected' | 'modified';
  raw_response?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  channel: ChannelType;
  status: 'open' | 'waiting_ai' | 'review_needed' | 'closed' | 'handed_off';
  assigned_owner: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  city: string;
  industry: string;
  priority: 'high' | 'medium' | 'low';
  score: number;
  lead_status?: string;
  last_message?: string;
  last_message_direction?: 'inbound' | 'outbound';
  latest_intent?: string;
  latest_confidence?: number;
  message_count?: number;
  messages?: Message[];
  assessments?: AiAssessment[];
}

export interface QualifiedLead extends Lead {
  handoff_id?: string;
  requested_service?: string;
  qualification_summary?: string;
  assigned_owner?: string;
  next_action?: string;
  crm_target?: string;
  crm_sync_status?: 'prepared_pending_sync' | 'sync_failed' | 'synced';
  sync_details?: string;
  handoff_created_at?: string;
}

export interface OverviewMetrics {
  summary: {
    total_leads: number;
    in_campaign: number;
    simulated_sent: number;
    queued: number;
    inbound_replies: number;
    qualified_leads: number;
    staged_handoffs: number;
    active_campaigns: number;
    total_conversations: number;
  };
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  channel_breakdown: Array<{
    channel: string;
    count: number;
  }>;
  intent_breakdown: Array<{
    intent: string;
    count: number;
  }>;
  recent_activity: Array<{
    id: string;
    actor: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    details: string;
    created_at: string;
  }>;
}

export interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  approved: number;
  updated_at: string;
}

export interface IntegrationConfig {
  id: string;
  channel: string;
  name: string;
  provider_mode: 'simulated' | 'live';
  is_connected: number;
  capabilities: string[];
  last_heartbeat: string;
}
