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

// In production, can use relative /api (proxied by Netlify) or an absolute remote backend URL
const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

/**
 * Resilient API request wrapper:
 * Prevents "Unexpected token '<', '<!doctype '... is not valid JSON" errors
 * by checking content-type and detecting non-JSON HTML error pages (e.g. 502, 504, 404).
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = cleanEndpoint.startsWith('http') ? cleanEndpoint : `${API_BASE}${cleanEndpoint}`;

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(`Network connection error: ${netErr.message || 'Unable to reach backend API'}`);
  }

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();

  // If the server returned HTML instead of JSON
  if (text.trim().startsWith('<') || text.includes('<!DOCTYPE') || text.includes('<!doctype') || !contentType.includes('application/json')) {
    if (!res.ok) {
      throw new Error(`Backend service unavailable (HTTP ${res.status}): The API service is currently unreachable or starting up.`);
    }
    // Netlify fallback rewrites unknown routes to index.html with HTTP 200
    if (text.includes('<html') || text.includes('<!doctype')) {
      throw new Error(`Endpoint '${cleanEndpoint}' returned an HTML page instead of API JSON. Verify backend deployment and API proxy.`);
    }
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned invalid response format: ${text.slice(0, 100)}...`);
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `API request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Overview
  getOverview: async (): Promise<OverviewMetrics> => {
    return apiRequest<OverviewMetrics>('/overview');
  },

  // Leads
  getLeads: async (params?: { search?: string; industry?: string; priority?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<{ leads: Lead[]; total: number; page: number; limit: number }>(`/leads?${query}`);
  },

  getSegments: async (): Promise<LeadSegment[]> => {
    return apiRequest<LeadSegment[]>('/leads/segments');
  },

  parseLeadFile: async (file: File): Promise<ParseFileResult> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<ParseFileResult>('/leads/parse-file', {
      method: 'POST',
      body: formData,
    });
  },

  validateImport: async (records: any[], columnMap: Record<string, string>): Promise<ValidationResult> => {
    return apiRequest<ValidationResult>('/leads/validate-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records, columnMap }),
    });
  },

  commitImport: async (approvedRecords: any[], sourceName?: string): Promise<{ committed: number; createdIds: string[] }> => {
    return apiRequest<{ committed: number; createdIds: string[] }>('/leads/commit-import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedRecords, sourceName }),
    });
  },

  createLead: async (data: Partial<Lead>): Promise<Lead> => {
    return apiRequest<Lead>('/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  updateLead: async (id: string, data: Partial<Lead>): Promise<Lead> => {
    return apiRequest<Lead>(`/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Campaigns
  getCampaigns: async (): Promise<Campaign[]> => {
    return apiRequest<Campaign[]>('/campaigns');
  },

  getCampaignById: async (id: string): Promise<Campaign> => {
    return apiRequest<Campaign>(`/campaigns/${id}`);
  },

  createCampaign: async (data: {
    name: string;
    channel: ChannelType;
    template_id?: string;
    template_body: string;
    target_audience?: string;
    lead_ids?: string[];
  }): Promise<Campaign> => {
    return apiRequest<Campaign>('/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  startCampaign: async (id: string) => {
    return apiRequest(`/campaigns/${id}/start`, { method: 'POST' });
  },

  pauseCampaign: async (id: string) => {
    return apiRequest(`/campaigns/${id}/pause`, { method: 'POST' });
  },

  // Unified Inbox
  getConversations: async (params?: { channel?: string; status?: string; search?: string }): Promise<Conversation[]> => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest<Conversation[]>(`/inbox/conversations?${query}`);
  },

  getConversationDetails: async (id: string): Promise<Conversation> => {
    return apiRequest<Conversation>(`/inbox/conversations/${id}`);
  },

  sendMessage: async (conversationId: string, data: { content: string; is_ai_generated?: boolean; sender_name?: string }) => {
    return apiRequest(`/inbox/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  simulateIncomingReply: async (data: {
    conversationId?: string;
    leadId?: string;
    channel?: string;
    content: string;
    senderName?: string;
    auto_respond?: boolean;
  }) => {
    return apiRequest<{
      conversation: Conversation;
      ai_result: any;
      auto_responded?: boolean;
      auto_reply_message?: any;
      auto_qualified?: boolean;
    }>('/inbox/simulate-incoming', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  reassessConversation: async (conversationId: string) => {
    return apiRequest<{
      success: boolean;
      assessment?: any;
      conversation?: Conversation;
      error?: string;
    }>(`/inbox/conversations/${conversationId}/re-assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Connected Accounts
  getAccounts: async (): Promise<ConnectedAccount[]> => {
    return apiRequest<ConnectedAccount[]>('/accounts');
  },

  createAccount: async (data: Partial<ConnectedAccount>): Promise<ConnectedAccount> => {
    return apiRequest<ConnectedAccount>('/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  testAccount: async (id: string): Promise<{ success: boolean; status: string; latency_ms: number; message: string }> => {
    return apiRequest<{ success: boolean; status: string; latency_ms: number; message: string }>(`/accounts/${id}/test`, {
      method: 'POST'
    });
  },

  disconnectAccount: async (id: string): Promise<ConnectedAccount> => {
    return apiRequest<ConnectedAccount>(`/accounts/${id}/disconnect`, { method: 'POST' });
  },

  reconnectAccount: async (id: string): Promise<ConnectedAccount> => {
    return apiRequest<ConnectedAccount>(`/accounts/${id}/reconnect`, { method: 'POST' });
  },

  // Qualified Leads
  getQualifiedLeads: async (): Promise<QualifiedLead[]> => {
    return apiRequest<QualifiedLead[]>('/qualified-leads');
  },

  qualifyLead: async (data: {
    leadId: string;
    requested_service?: string;
    qualification_summary: string;
    assigned_owner?: string;
    next_action?: string;
  }) => {
    return apiRequest('/qualified-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Knowledge & Integrations
  getKnowledge: async (): Promise<KnowledgeItem[]> => {
    return apiRequest<KnowledgeItem[]>('/knowledge');
  },

  getIntegrations: async (): Promise<IntegrationConfig[]> => {
    return apiRequest<IntegrationConfig[]>('/integrations');
  },

  getHealth: async () => {
    return apiRequest<{
      server: string;
      database: string;
      ai: { status: string; model: string; authenticated: boolean };
      simulation_mode: boolean;
      timestamp: string;
    }>('/health');
  },

  resetDemo: async () => {
    return apiRequest('/admin/reset-demo', { method: 'POST' });
  }
};
