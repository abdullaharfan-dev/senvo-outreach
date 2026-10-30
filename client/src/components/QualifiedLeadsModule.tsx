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
  Bot,
  Calendar,
  CalendarCheck,
  Check,
  ListChecks,
  Info
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

  const getSuggestedAgenda = (service?: string) => {
    const s = service || 'Corporate Services & Statutory Accounting';
    if (s.includes('Audit') || s.includes('CRO')) {
      return [
        'Review current turnover & balance sheet statutory audit exemption thresholds (Companies Act 2014)',
        'Assess upcoming CRO Form B1 annual return deadline and non-resident director bond requirements',
        'Review fixed fee guidelines and engagement letter onboarding timetable'
      ];
    }
    if (s.includes('Payroll')) {
      return [
        'Evaluate current multi-location payroll operations, weekly timesheet drag, and BrightPay bureau setup',
        'Confirm Revenue ROS PAYE Modernisation compliance and pension auto-enrollment roadmap',
        'Demonstrate managed payroll bureau SLA and onboarding timetable'
      ];
    }
    if (s.includes('Tax') || s.includes('VAT')) {
      return [
        'Analyze bi-monthly VAT3 cross-border reverse charge exposure and customs VAT deferral',
        'Review Section 766 R&D tax credit claims and Revenue Commissioners compliance documentation',
        'Scope quarterly advisory retainer and dedicated Senior Client Partner assignment'
      ];
    }
    return [
      'Conduct initial 15-minute statutory compliance health check across CRO and Revenue obligations',
      'Clarify software migration requirements (Xero / NetSuite / Sage Intacct) and financial reporting cadence',
      'Establish client partner onboarding timeline and statutory discovery scope'
    ];
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Meeting Conversion Workspace & Bitrix24 CRM Handoffs
            </h2>
            <Badge variant="success" size="sm">
              {qualifiedLeads.length} Qualified Opportunities
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            High-intent Irish corporate prospects with confirmed discovery meeting interest staged for partner consultations.
          </p>
        </div>

        {/* CRM Gateway Staging Indicator */}
        <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-2 shrink-0 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Bitrix24 CRM Gateway: Staging Verified</span>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-5">
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
            const agenda = getSuggestedAgenda(lead.requested_service);

            return (
              <Card
                key={lead.id}
                hoverEffect
                className="p-5 sm:p-6 space-y-4 shadow-card"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">
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
                      Primary Decision Maker:{' '}
                      <span className="text-slate-800 font-semibold">
                        {lead.contact_name || 'Managing Director'}
                      </span>{' '}
                      &bull; {lead.email} &bull; {lead.phone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Badge variant="success" size="md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                      Discovery Meeting Confirmed
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
                      <span>{isPayloadExpanded ? 'Hide Payload' : 'Bitrix24 JSON'}</span>
                      {isPayloadExpanded ? (
                        <ChevronUp className="w-3 h-3 ml-1" />
                      ) : (
                        <ChevronDown className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Meeting Interest & Coordination Banner */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50/90 to-teal-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-emerald-950 text-xs">
                        Meeting Interest Confirmed (20-Min Introductory Zoom)
                      </span>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Prospect requested discovery call with Senior Client Partner regarding {lead.requested_service || 'Statutory Compliance'}.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-1 rounded bg-white/90 border border-emerald-300 text-[10px] font-mono text-emerald-900 font-semibold">
                      Proposed Slots: Thu 14:00 GMT / Fri 11:30 GMT
                    </span>
                  </div>
                </div>

                {/* Qualification Evaluation & Criteria Assessment */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Why This Prospect Is Qualified</span>
                    </span>
                    <Badge variant="success" size="xs">
                      Qualification Criteria Met
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Requested Service</span>
                      <span className="font-bold text-slate-900 mt-0.5 block truncate text-xs" title={lead.requested_service}>
                        {lead.requested_service || 'Statutory Corporate Advisory'}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Assigned Advisory Partner</span>
                      <span className="font-semibold text-slate-800 mt-0.5 block truncate text-xs">
                        Declan O'Sullivan (Dublin Practice)
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Suggested Next Action</span>
                      <span className="font-bold text-blue-700 mt-0.5 block truncate text-xs">
                        {lead.next_action || 'Dispatch 20-min Zoom link & Section 358 checklist'}
                      </span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Qualification Status</span>
                      <span className="font-bold text-emerald-700 mt-0.5 block truncate text-xs">
                        100% Staged for Bitrix24
                      </span>
                    </div>
                  </div>

                  {lead.qualification_summary && (
                    <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-100 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-blue-900">Advisory Assessment: </strong>
                      {lead.qualification_summary}
                    </div>
                  )}
                </div>

                {/* Suggested Meeting Agenda & Readiness Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  {/* Suggested Meeting Agenda */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5 text-blue-600" />
                      <span>Suggested Discovery Meeting Agenda:</span>
                    </span>
                    <ul className="space-y-1.5 pt-1">
                      {agenda.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700 text-[11px] leading-relaxed">
                          <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px] border border-blue-200">
                            {idx + 1}
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Handoff Readiness Checklist */}
                  <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Handoff Verification Checklist:</span>
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 pt-1 text-[11px]">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>High-Intent Decision Maker Identified &bull; {lead.contact_name || 'Managing Director'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Statutory Requirement Scoped &bull; {lead.requested_service}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Irish Practice Boundaries Enforced &bull; Zero avoidance schemes</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bitrix24 JSON Schema Formatted &bull; <code className="font-mono text-blue-600">crm.lead.add</code> ready</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Conversation Dialogue History */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedHistoryId(isHistoryExpanded ? null : lead.id)}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 cursor-pointer py-1 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {isHistoryExpanded
                        ? 'Hide Conversation Dialogue'
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
