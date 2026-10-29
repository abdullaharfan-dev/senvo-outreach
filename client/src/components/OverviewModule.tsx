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
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import type { OverviewMetrics } from '../types';
import type { ModuleType } from './Sidebar';

interface OverviewModuleProps {
  onNavigate: (module: ModuleType) => void;
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

  const { summary, funnel, channel_breakdown, recent_activity } = metrics;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-blue-950 rounded-2xl p-6 text-white shadow-sm border border-slate-800">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Ireland Corporate & Professional Services Operations</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            Client Outreach & Response Operations
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed mb-5">
            Unified pipeline across Irish statutory accounting, CRO compliance, cross-border VAT3 advisory, and executive finance recruitment.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('campaigns')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Outreach Campaign</span>
            </button>
            <button
              onClick={() => onNavigate('leads')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Import & Segment Leads</span>
            </button>
            <button
              onClick={() => onNavigate('inbox')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Unified Inbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric KPI Cards (Calculated directly from SQLite records) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Prospects</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.total_leads}</p>
          <p className="text-[11px] text-slate-400 mt-1">Directory registry</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Outreach</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{summary.in_campaign}</p>
          <p className="text-[11px] text-slate-400 mt-1">Staged in campaigns</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Dispatched</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{summary.simulated_sent}</p>
          <p className="text-[11px] text-slate-400 mt-1">{summary.queued} queued in DB</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Client Replies</span>
            <MessageSquare className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-cyan-600">{summary.inbound_replies}</p>
          <p className="text-[11px] text-slate-400 mt-1">Triaged in Inbox</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Qualified Leads</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{summary.qualified_leads}</p>
          <p className="text-[11px] text-slate-400 mt-1">Intent verified</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">CRM Handoffs</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{summary.staged_handoffs}</p>
          <p className="text-[11px] text-slate-400 mt-1">Staged for Bitrix24</p>
        </div>
      </div>

      {/* Funnel & Channels Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Engagement & Conversion Funnel</h3>
              <p className="text-xs text-slate-500">Live metrics derived directly from SQLite operational records</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Live Database
            </span>
          </div>

          <div className="space-y-4">
            {funnel.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{item.stage}</span>
                  <span className="font-semibold text-slate-900">
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
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-sm">Inquiry Channel Coverage</h3>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                7 Channels
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Active conversation threads across each supported medium:
            </p>

            <div className="space-y-1.5">
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
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 ${c.color}`} />
                      <span className="font-medium text-slate-700 text-[11px]">{c.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {count} active
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Bitrix24 CRM Connector</span>
            <span className="text-blue-600 font-medium">Staged Handoff Ready</span>
          </div>
        </div>
      </div>

      {/* Real-Time Operational Audit Feed */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">System Operational Audit Log</h3>
          </div>
          <span className="text-xs text-slate-400">Chronological SQLite events</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {recent_activity.map((act) => (
            <div key={act.id} className="py-2.5 flex items-start justify-between text-xs gap-4">
              <div className="flex items-start gap-2.5">
                <span className="font-semibold text-slate-800 min-w-16">{act.actor}:</span>
                <span className="text-slate-600">{act.details}</span>
              </div>
              <span className="text-slate-400 whitespace-nowrap text-[11px]">
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
