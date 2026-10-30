import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Building2,
  User,
  ArrowRight,
  ShieldCheck,
  FileCode2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  Bot
} from 'lucide-react';
import { api } from '../services/api';
import type { QualifiedLead } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';

interface QualifiedLeadsModuleProps {
  onNavigateToInbox?: (conversationId?: string) => void;
}

export const QualifiedLeadsModule: React.FC<QualifiedLeadsModuleProps> = ({ onNavigateToInbox }) => {
  const [qualifiedLeads, setQualifiedLeads] = useState<QualifiedLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const fetchQualifiedLeads = async () => {
    try {
      const data = await api.getQualifiedLeads();
      // Deduplicate by lead id to prevent any duplicate card rendering
      const seen = new Set();
      const unique = data.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      setQualifiedLeads(unique);
    } catch (err) {
      console.error('Failed to load qualified leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQualifiedLeads();
  }, []);

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Qualified Leads & Bitrix24 CRM Handoffs
            </h2>
            <Badge variant="success" size="sm">
              {qualifiedLeads.length} Qualified
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Intent-classified high-value prospects staged for corporate advisory engagement and Bitrix24 CRM pipeline handoff.
          </p>
        </div>

        {/* CRM Gateway Staging Indicator */}
        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-2 shrink-0 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bitrix24 CRM Sync: Staging Verified</span>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading qualified leads from persistent database...
          </Card>
        ) : qualifiedLeads.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No qualified leads yet"
            description="Simulate or exchange messages with prospects in the Unified Inbox to automatically classify intent and qualify prospects."
            className="py-16"
          />
        ) : (
          qualifiedLeads.map((lead) => {
            const isPayloadExpanded = expandedPayloadId === lead.id;
            const isHistoryExpanded = expandedHistoryId === lead.id;
            const hasRecentMessages = lead.recent_messages && lead.recent_messages.length > 0;

            return (
              <Card
                key={lead.id}
                hoverEffect
                className="p-5 sm:p-6 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {lead.company_name}
                      </h3>
                      <Badge variant="primary" size="xs">
                        {lead.city}, Ireland
                      </Badge>
                      <Badge variant="neutral" size="xs">
                        {lead.industry}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Primary Contact:{' '}
                      <span className="text-slate-800 font-medium">
                        {lead.contact_name || 'Managing Director'}
                      </span>{' '}
                      • {lead.email} • {lead.phone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="success" size="md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      Ready for Discovery Call
                    </Badge>

                    {onNavigateToInbox && lead.conversation_id && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => onNavigateToInbox(lead.conversation_id)}
                        leftIcon={<MessageSquare className="w-3.5 h-3.5 text-blue-600" />}
                      >
                        Open in Inbox
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setExpandedPayloadId(isPayloadExpanded ? null : lead.id)}
                      leftIcon={<FileCode2 className="w-3.5 h-3.5 text-slate-400" />}
                    >
                      <span>{isPayloadExpanded ? 'Hide Payload' : 'CRM Payload'}</span>
                      {isPayloadExpanded ? (
                        <ChevronUp className="w-3 h-3 ml-1" />
                      ) : (
                        <ChevronDown className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Qualification Summary Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Requested Service Line</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {lead.requested_service || 'Statutory Accounting & CRO Compliance'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Assigned Lead Partner</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {lead.assigned_owner || 'Senior Partner (Dublin Practice)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Recommended Next Action</span>
                    <span className="font-bold text-blue-700 mt-0.5 block">
                      {lead.next_action || 'Schedule 15-minute discovery consultation'}
                    </span>
                  </div>
                </div>

                {lead.qualification_summary && (
                  <div className="text-xs bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 text-emerald-950 leading-relaxed shadow-2xs">
                    <span className="font-bold text-emerald-900 block mb-0.5 text-[11px]">
                      Qualification Assessment:
                    </span>
                    {lead.qualification_summary}
                  </div>
                )}

                {/* Expandable Conversation History */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedHistoryId(isHistoryExpanded ? null : lead.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer py-1 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {isHistoryExpanded
                        ? 'Hide Conversation Turns'
                        : `View Conversation History (${hasRecentMessages ? lead.recent_messages!.length : 0} Turns)`}
                    </span>
                    {isHistoryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isHistoryExpanded && (
                    <div className="mt-2.5 p-3.5 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5">
                      {!hasRecentMessages ? (
                        <p className="text-xs text-slate-400 italic">No recent messages recorded for this thread.</p>
                      ) : (
                        lead.recent_messages!.map((msg, idx) => {
                          const isInbound = msg.direction === 'inbound';
                          return (
                            <div
                              key={idx}
                              className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                            >
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                                <span
                                  className={
                                    isInbound ? 'font-semibold text-slate-700' : 'font-semibold text-blue-700'
                                  }
                                >
                                  {msg.sender_name}
                                </span>
                                <span>•</span>
                                <span className="tabular-nums">
                                  {new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <div
                                className={`p-3 rounded-xl text-xs max-w-[90%] leading-relaxed ${
                                  isInbound
                                    ? 'bg-white border border-slate-200 text-slate-800'
                                    : 'bg-blue-600 text-white shadow-2xs'
                                }`}
                              >
                                {msg.content}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Bitrix24 Handoff JSON Payload Viewer */}
                {isPayloadExpanded && (
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <FileCode2 className="w-4 h-4 text-indigo-600" />
                        <span>Bitrix24 REST API Staged Payload (crm.lead.add)</span>
                      </div>
                      <Badge variant="warning" size="xs">
                        Status: {lead.crm_sync_status || 'prepared_pending_sync'}
                      </Badge>
                    </div>

                    <pre className="bg-slate-950 text-cyan-300 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
                      {lead.sync_details ||
                        JSON.stringify(
                          {
                            endpoint: 'https://client-portal.bitrix24.eu/rest/1/webhook/crm.lead.add',
                            payload: {
                              fields: {
                                TITLE: `SENVO Lead: ${lead.company_name} - ${lead.requested_service}`,
                                NAME: lead.contact_name,
                                COMPANY_TITLE: lead.company_name,
                                EMAIL: [{ VALUE: lead.email, VALUE_TYPE: 'WORK' }],
                                PHONE: [{ VALUE: lead.phone, VALUE_TYPE: 'WORK' }],
                                COMMENTS: lead.qualification_summary,
                                ASSIGNED_BY_ID: lead.assigned_owner,
                                SOURCE_ID: 'SENVO_OUTREACH_AI',
                                STATUS_ID: 'IN_PROCESS',
                              },
                            },
                            crm_gateway: {
                              status: 'ready_for_sync',
                              environment: 'bitrix24_eu_cloud',
                              audit_logged: true,
                            },
                          },
                          null,
                          2
                        )}
                    </pre>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QualifiedLeadsModule;
