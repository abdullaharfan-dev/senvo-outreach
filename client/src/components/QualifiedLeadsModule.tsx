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
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {qualifiedLeads.length} Qualified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Intent-classified high-value prospects staged for corporate advisory engagement and CRM pipeline handoff
          </p>
        </div>

        {/* CRM Gateway Staging Indicator */}
        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bitrix24 CRM Sync: Staging Verified</span>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            Loading qualified leads from persistent database...
          </div>
        ) : qualifiedLeads.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs space-y-2">
            <Award className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700">No qualified leads yet</p>
            <p className="text-[11px] text-slate-400">
              Simulate or exchange messages with prospects in the Unified Inbox to automatically classify intent and qualify prospects.
            </p>
          </div>
        ) : (
          qualifiedLeads.map((lead) => {
            const isPayloadExpanded = expandedPayloadId === lead.id;
            const isHistoryExpanded = expandedHistoryId === lead.id;
            const hasRecentMessages = lead.recent_messages && lead.recent_messages.length > 0;

            return (
              <div
                key={lead.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {lead.company_name}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {lead.city}, Ireland
                      </span>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {lead.industry}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Primary Contact: <span className="text-slate-800 font-medium">{lead.contact_name || 'Managing Director'}</span> • {lead.email} • {lead.phone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready for Discovery Call</span>
                    </span>

                    {onNavigateToInbox && lead.conversation_id && (
                      <button
                        onClick={() => onNavigateToInbox(lead.conversation_id)}
                        className="text-xs px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center gap-1 font-semibold cursor-pointer"
                        title="View conversation thread in Unified Inbox"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open in Inbox</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedPayloadId(isPayloadExpanded ? null : lead.id)}
                      className="text-xs px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isPayloadExpanded ? 'Hide Payload' : 'CRM Payload'}</span>
                      {isPayloadExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
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
                  <div className="text-xs bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 text-emerald-950 leading-relaxed">
                    <span className="font-bold text-emerald-900 block mb-0.5 text-[11px]">
                      Qualification Assessment:
                    </span>
                    {lead.qualification_summary}
                  </div>
                )}

                {/* Expandable Conversation History (Turn history leading to qualification) */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedHistoryId(isHistoryExpanded ? null : lead.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer py-1"
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
                    <div className="mt-2.5 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
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
                                <span className={isInbound ? 'font-semibold text-slate-700' : 'font-semibold text-blue-700'}>
                                  {msg.sender_name}
                                </span>
                                <span>•</span>
                                <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div
                                className={`p-2.5 sm:p-3 rounded-xl text-xs max-w-[90%] leading-relaxed ${
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
                      <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Status: {lead.crm_sync_status || 'prepared_pending_sync'}
                      </span>
                    </div>

                    <pre className="bg-slate-950 text-cyan-300 p-4 rounded-lg text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QualifiedLeadsModule;
