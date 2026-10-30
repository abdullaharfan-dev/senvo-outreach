import React, { useEffect, useState } from 'react';
import {
  Users,
  Send,
  MessageSquare,
  Award,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  Mail,
  Linkedin,
  Globe,
  Plus,
  Building2,
  AlertCircle,
  Network,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import type { OverviewMetrics } from '../types';
import type { ModuleType } from './Sidebar';

interface OverviewModuleProps {
  onNavigate: (module: ModuleType, conversationId?: string) => void;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMetrics = async () => {
    try {
      const data = await api.getOverview();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Aggregating operational pipeline metrics...</span>
        </div>
      </div>
    );
  }

  const { summary, funnel, channel_breakdown, recent_activity, attention_replies } = metrics;

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-blue-950 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-sm border border-slate-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-[11px] font-semibold mb-2.5 border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Ireland Corporate & Professional Services Operations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            Client Outreach & Response Operations
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed mb-4 sm:mb-5">
            Unified pipeline across Irish statutory accounting, CRO compliance, cross-border VAT3 advisory, and executive finance recruitment.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
            <button
              onClick={() => onNavigate('campaigns')}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Outreach Campaign</span>
            </button>
            <button
              onClick={() => onNavigate('leads')}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Import & Segment Leads</span>
            </button>
            <button
              onClick={() => onNavigate('inbox')}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Unified Inbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actionable KPI Cards (Calculated directly from SQLite records) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {/* Card 1: Total Leads */}
        <div
          onClick={() => onNavigate('leads')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to view full Lead Directory"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate group-hover:text-blue-600 transition-colors">
              Total Leads
            </span>
            <Users className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-900">{summary.total_leads}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
            <span>Directory registry</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 2: In Outreach */}
        <div
          onClick={() => onNavigate('campaigns')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to view Active Campaigns"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate group-hover:text-blue-600 transition-colors">
              In Outreach
            </span>
            <Send className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">{summary.in_campaign}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
            <span>Staged in campaigns</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 3: Client Replies */}
        <div
          onClick={() => onNavigate('inbox')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to open Unified Inbox"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate group-hover:text-cyan-600 transition-colors">
              Client Replies
            </span>
            <MessageSquare className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-cyan-600">{summary.inbound_replies}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
            <span>Triaged in Inbox</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 4: Qualified Leads */}
        <div
          onClick={() => onNavigate('qualified')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to view Qualified Leads"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate group-hover:text-emerald-600 transition-colors">
              Qualified
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600">{summary.qualified_leads}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
            <span>Discovery ready</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 5: Attention / Reviews Needed */}
        <div
          onClick={() => onNavigate('inbox')}
          className={`p-3.5 sm:p-4 rounded-xl border shadow-2xs transition-all cursor-pointer group ${
            (summary.reviews_needed || 0) > 0
              ? 'bg-amber-50/60 border-amber-300 hover:border-amber-500'
              : 'bg-white border-slate-200 hover:border-blue-500'
          }`}
          title="Click to view threads requiring attention"
        >
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate text-amber-700">
              Needs Review
            </span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-700">{summary.reviews_needed || 0}</p>
          <p className="text-[10px] sm:text-[11px] text-amber-600 mt-0.5 truncate flex items-center gap-1">
            <span>Awaiting action</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>

        {/* Card 6: Connected Accounts */}
        <div
          onClick={() => onNavigate('integrations')}
          className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer group"
          title="Click to view Connected Accounts"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider truncate group-hover:text-indigo-600 transition-colors">
              Channels
            </span>
            <Network className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-indigo-600">{summary.connected_channels || 7}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
            <span>Active accounts</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </p>
        </div>
      </div>

      {/* Immediate Attention & Inbound Responses (Actionable Highlights) */}
      {attention_replies && attention_replies.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Priority Client Inquiries & Active Threads</h3>
            </div>
            <button
              onClick={() => onNavigate('inbox')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All in Inbox</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden">
            {attention_replies.slice(0, 4).map((reply) => (
              <div
                key={reply.conversation_id}
                onClick={() => onNavigate('inbox', reply.conversation_id)}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50/80 -mx-2 px-2 rounded-lg cursor-pointer transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs truncate">{reply.company_name}</span>
                    <span className="text-[10px] text-slate-400 font-medium truncate">• {reply.contact_name}</span>
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {reply.channel}
                    </span>
                    {reply.intent && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 capitalize">
                        {reply.intent.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 truncate max-w-xl italic">
                    "{reply.latest_inbound || 'Awaiting incoming turn...'}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400">
                    {new Date(reply.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold flex items-center gap-1">
                    <span>Respond</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funnel & Channels Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Engagement & Conversion Funnel</h3>
              <p className="text-[11px] text-slate-500">Live metrics derived directly from SQLite operational records</p>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-700">
              Live DB
            </span>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {funnel.map((item, idx) => (
              <div key={idx} className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 text-[11px] sm:text-xs truncate">{item.stage}</span>
                  <span className="font-semibold text-slate-900 text-[11px] sm:text-xs shrink-0 ml-2">
                    {item.count} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? 'bg-slate-400'
                        : idx === 1
                        ? 'bg-blue-500'
                        : idx === 2
                        ? 'bg-amber-500'
                        : idx === 3
                        ? 'bg-cyan-500'
                        : idx === 4
                        ? 'bg-emerald-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7 Channels Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Inquiry Channel Coverage</h3>
              <button
                onClick={() => onNavigate('integrations')}
                className="text-[10px] sm:text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 cursor-pointer"
              >
                Manage Accounts
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 sm:mb-4">
              Active conversation threads across each supported medium:
            </p>

            <div className="space-y-1 sm:space-y-1.5">
              {[
                { name: 'Outlook / Corporate Email', key: 'email', icon: Mail, color: 'text-blue-600' },
                { name: 'LinkedIn InMail & DMs', key: 'linkedin', icon: Linkedin, color: 'text-sky-600' },
                { name: 'WhatsApp Business', key: 'whatsapp', icon: MessageSquare, color: 'text-emerald-600' },
                { name: 'Website Portal Webhook', key: 'website', icon: Globe, color: 'text-purple-600' },
                { name: 'Meta Facebook Messenger', key: 'facebook', icon: Layers, color: 'text-blue-500' },
                { name: 'Instagram Direct', key: 'instagram', icon: Layers, color: 'text-pink-600' },
                { name: 'Enterprise SMS', key: 'sms', icon: MessageSquare, color: 'text-amber-600' },
              ].map((c) => {
                const count = channel_breakdown.find((x) => x.channel === c.key)?.count || 0;
                const Icon = c.icon;
                return (
                  <div
                    key={c.key}
                    onClick={() => onNavigate('inbox')}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <Icon className={`w-3.5 h-3.5 ${c.color} shrink-0`} />
                      <span className="font-medium text-slate-700 text-[11px] truncate">{c.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px] sm:text-[11px] shrink-0">
                      {count} active
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 sm:mt-4 text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between">
            <span>Bitrix24 CRM Connector</span>
            <span className="text-blue-600 font-medium">Staged Handoff Ready</span>
          </div>
        </div>
      </div>

      {/* Real-Time Operational Audit Feed */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 shrink-0" />
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">System Operational Audit Log</h3>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400">Chronological SQLite events</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {recent_activity.map((act) => (
            <div key={act.id} className="py-2.5 flex flex-col sm:flex-row sm:items-start justify-between text-xs gap-1 sm:gap-4">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-slate-800 shrink-0 text-[11px] sm:text-xs">{act.actor}:</span>
                <span className="text-slate-600 text-[11px] sm:text-xs leading-relaxed">{act.details}</span>
              </div>
              <span className="text-slate-400 whitespace-nowrap text-[10px] sm:text-[11px] pl-2 sm:pl-0">
                {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewModule;
