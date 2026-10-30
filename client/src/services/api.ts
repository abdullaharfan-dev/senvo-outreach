import type {
  OverviewMetrics,
  Lead,
  LeadSegment,
  ValidationResult,
  ParseFileResult,
  Campaign,
  Conversation,
  QualifiedLead,
  KnowledgeItem,
  IntegrationConfig,
  ConnectedAccount,
  ChannelType
} from '../types';

const API_BASE = '/api';

export const api = {
  // Overview
  getOverview: async (): Promise<OverviewMetrics> => {
    const res = await fetch(`${API_BASE}/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview metrics');
    return res.json();
  },

  // Leads
  getLeads: async (params?: { search?: string; industry?: string; priority?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/leads?${query}`);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json() as Promise<{ leads: Lead[]; total: number; page: number; limit: number }>;
  },

  getSegments: async (): Promise<LeadSegment[]> => {
    const res = await fetch(`${API_BASE}/leads/segments`);
    if (!res.ok) throw new Error('Failed to fetch segments');
    return res.json();
  },

  parseLeadFile: async (file: File): Promise<ParseFileResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/leads/parse-file`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to parse file');
    }
    return res.json();
  },

  validateImport: async (records: any[], columnMap: Record<string, string>): Promise<ValidationResult> => {
    const res = await fetch(`${API_BASE}/leads/validate-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records, columnMap }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to validate records');
    }
    return res.json();
  },

  commitImport: async (approvedRecords: any[], sourceName?: string): Promise<{ committed: number; createdIds: string[] }> => {
    const res = await fetch(`${API_BASE}/leads/commit-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedRecords, sourceName }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to commit batch');
    }
    return res.json();
  },

  createLead: async (data: Partial<Lead>): Promise<Lead> => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create lead');
    return res.json();
  },

  updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update lead');
    return res.json();
  },

  // Campaigns
  getCampaigns: async (): Promise<Campaign[]> => {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) throw new Error('Failed to fetch campaigns');
    return res.json();
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    const res = await fetch(`${API_BASE}/campaigns/${id}`);
    if (!res.ok) throw new Error('Failed to fetch campaign');
    return res.json();
  },

  createCampaign: async (data: {
    name: string;
    channel: ChannelType;
    template_id?: string;
    template_body: string;
    target_audience?: string;
    lead_ids?: string[];
  }): Promise<Campaign> => {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create campaign');
    return res.json();
  },

  startCampaign: async (id: string) => {
    const res = await fetch(`${API_BASE}/campaigns/${id}/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start campaign');
    return res.json();
  },

  pauseCampaign: async (id: string) => {
    const res = await fetch(`${API_BASE}/campaigns/${id}/pause`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to pause campaign');
    return res.json();
  },

  // Unified Inbox
  getConversations: async (params?: { channel?: string; status?: string; search?: string }): Promise<Conversation[]> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/inbox/conversations?${query}`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  getConversationDetails: async (id: string): Promise<Conversation> => {
    const res = await fetch(`${API_BASE}/inbox/conversations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch conversation details');
    return res.json();
  },

  sendMessage: async (conversationId: string, data: { content: string; is_ai_generated?: boolean; sender_name?: string }) => {
    const res = await fetch(`${API_BASE}/inbox/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  simulateIncomingReply: async (data: {
    conversationId?: string;
    leadId?: string;
    channel?: string;
    content: string;
    senderName?: string;
    auto_respond?: boolean;
  }) => {
    const res = await fetch(`${API_BASE}/inbox/simulate-incoming`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to simulate incoming message');
    }
    return res.json() as Promise<{
      conversation: Conversation;
      ai_result: any;
      auto_responded?: boolean;
      auto_reply_message?: any;
      auto_qualified?: boolean;
    }>;
  },

  reassessConversation: async (conversationId: string) => {
    const res = await fetch(`${API_BASE}/inbox/conversations/${conversationId}/re-assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to re-assess conversation');
    }
    return res.json() as Promise<{
      success: boolean;
      assessment?: any;
      conversation?: Conversation;
      error?: string;
    }>;
  },

  // Connected Accounts
  getAccounts: async (): Promise<ConnectedAccount[]> => {
    const res = await fetch(`${API_BASE}/accounts`);
    if (!res.ok) throw new Error('Failed to fetch connected accounts');
    return res.json();
  },

  createAccount: async (data: Partial<ConnectedAccount>): Promise<ConnectedAccount> => {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create account');
    }
    return res.json();
  },

  testAccount: async (id: string): Promise<{ success: boolean; status: string; latency_ms: number; message: string }> => {
    const res = await fetch(`${API_BASE}/accounts/${id}/test`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to test account connection');
    return res.json();
  },

  disconnectAccount: async (id: string): Promise<ConnectedAccount> => {
    const res = await fetch(`${API_BASE}/accounts/${id}/disconnect`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to disconnect account');
    return res.json();
  },

  reconnectAccount: async (id: string): Promise<ConnectedAccount> => {
    const res = await fetch(`${API_BASE}/accounts/${id}/reconnect`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reconnect account');
    return res.json();
  },

  // Qualified Leads
  getQualifiedLeads: async (): Promise<QualifiedLead[]> => {
    const res = await fetch(`${API_BASE}/qualified-leads`);
    if (!res.ok) throw new Error('Failed to fetch qualified leads');
    return res.json();
  },

  qualifyLead: async (data: {
    leadId: string;
    requested_service?: string;
    qualification_summary: string;
    assigned_owner?: string;
    next_action?: string;
  }) => {
    const res = await fetch(`${API_BASE}/qualified-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to qualify lead');
    return res.json();
  },

  // Knowledge & Integrations
  getKnowledge: async (): Promise<KnowledgeItem[]> => {
    const res = await fetch(`${API_BASE}/knowledge`);
    if (!res.ok) throw new Error('Failed to fetch knowledge');
    return res.json();
  },

  getIntegrations: async (): Promise<IntegrationConfig[]> => {
    const res = await fetch(`${API_BASE}/integrations`);
    if (!res.ok) throw new Error('Failed to fetch integrations');
    return res.json();
  },

  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health check');
    return res.json();
  },

  resetDemo: async () => {
    const res = await fetch(`${API_BASE}/admin/reset-demo`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo');
    return res.json();
  }
};
