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
  ChevronUp
} from 'lucide-react';
import { api } from '../services/api';
import type { QualifiedLead } from '../types';

export const QualifiedLeadsModule: React.FC = () => {
  const [qualifiedLeads, setQualifiedLeads] = useState<QualifiedLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

  const fetchQualifiedLeads = async () => {
    try {
      const data = await api.getQualifiedLeads();
      setQualifiedLeads(data);
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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
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

        {/* Boundary Notice */}
        <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Bitrix24 Live Sync Paused in Demo Mode</span>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            Loading qualified leads from persistent database...
          </div>
        ) : qualifiedLeads.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No qualified leads yet. Classify incoming responses in the Unified Inbox to qualify leads.
          </div>
        ) : (
          qualifiedLeads.map((lead) => {
            const isExpanded = expandedLeadId === lead.id;

            return (
              <div
                key={lead.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-slate-900 text-sm md:text-base">
                        {lead.company_name}
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {lead.city}, Ireland
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Primary Contact: <span className="text-slate-800 font-medium">{lead.contact_name || 'Managing Director'}</span> • {lead.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ready for Discovery Call</span>
                    </span>

                    <button
                      onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}
                      className="text-xs px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isExpanded ? 'Hide CRM Payload' : 'View CRM Payload'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Qualification Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Requested Service Line</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {lead.requested_service || 'Statutory Accounting & Tax Review'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Assigned Lead Partner</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {lead.assigned_owner || 'Corporate Advisory Partner'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium">Next Actionable Step</span>
                    <span className="font-semibold text-blue-700 mt-0.5 block">
                      {lead.next_action || 'Schedule 15-minute discovery consultation'}
                    </span>
                  </div>
                </div>

                {lead.qualification_summary && (
                  <div className="text-xs bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 text-emerald-950 leading-relaxed">
                    <span className="font-bold text-emerald-900 block mb-0.5 text-[11px]">
                      Qualification Assessment:
                    </span>
                    {lead.qualification_summary}
                  </div>
                )}

                {/* Bitrix24 Handoff JSON Payload Viewer */}
                {isExpanded && (
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
                            simulation_disclaimer:
                              'SIMULATION BOUNDARY: Live REST dispatch paused to prevent external state modification.',
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
