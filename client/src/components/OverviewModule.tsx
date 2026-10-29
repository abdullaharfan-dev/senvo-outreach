import React, { useEffect, useState } from 'react';
import {
  Users,
  Send,
  MessageSquare,
  Award,
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  ShieldCheck,
  Mail,
  Linkedin,
  Globe
} from 'lucide-react';
import { api } from '../services/api';
import type { OverviewMetrics } from '../types';
import type { ModuleType } from './Sidebar';

interface OverviewModuleProps {
  onNavigate: (module: ModuleType) => void;
  onSimulateInbound: () => void;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({
  onNavigate,
  onSimulateInbound,
}) => {
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
          <span>Loading live performance metrics from persistent SQLite...</span>
        </div>
      </div>
    );
  }

  const { summary, funnel, channel_breakdown, recent_activity } = metrics;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-blue-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Interactive Operational Workspace — Safe Simulation Boundary</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
            SENVO Outreach — Ireland Corporate Services Practice
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-5">
            Unified client outreach, multi-channel response triage, and Gemini AI intent classification across statutory accounting, CRO compliance, Irish tax, and financial leadership recruitment.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('campaigns')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Launch Outreach Campaign</span>
            </button>
            <button
              onClick={onSimulateInbound}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Inbound Inquiry</span>
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
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Leads</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.total_leads}</p>
          <p className="text-[11px] text-slate-400 mt-1">Directory registry</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">In Outreach</span>
            <Send className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{summary.in_campaign}</p>
          <p className="text-[11px] text-slate-400 mt-1">Staged in campaigns</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Simulated Sent</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{summary.simulated_sent}</p>
          <p className="text-[11px] text-slate-400 mt-1">{summary.queued} queued in DB</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Inbound Replies</span>
            <MessageSquare className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-2xl font-bold text-cyan-600">{summary.inbound_replies}</p>
          <p className="text-[11px] text-slate-400 mt-1">Triaged in Inbox</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Qualified Leads</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{summary.qualified_leads}</p>
          <p className="text-[11px] text-slate-400 mt-1">AI intent verified</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Bitrix24 Handoffs</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-600">{summary.staged_handoffs}</p>
          <p className="text-[11px] text-slate-400 mt-1">Staged payloads</p>
        </div>
      </div>

      {/* Funnel & Channels Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Campaign Conversion & Qualification Funnel</h3>
              <p className="text-xs text-slate-500">Calculated strictly from persisted SQLite records</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Live DB Aggregation
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
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
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

        {/* 7 Channels Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm">All 7 Required Channels</h3>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                100% Covered
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Active conversation threads across each supported medium:
            </p>

            <div className="space-y-2">
              {[
                { name: 'Outlook / Corporate Email', key: 'email', icon: Mail, color: 'text-blue-600' },
                { name: 'LinkedIn InMail & DMs', key: 'linkedin', icon: Linkedin, color: 'text-sky-600' },
                { name: 'WhatsApp Business (Simulated)', key: 'whatsapp', icon: MessageSquare, color: 'text-emerald-600' },
                { name: 'Website Inbound Webhook', key: 'website', icon: Globe, color: 'text-purple-600' },
                { name: 'Meta Facebook Messenger', key: 'facebook', icon: Layers, color: 'text-blue-500' },
                { name: 'Instagram Direct Corporate', key: 'instagram', icon: Layers, color: 'text-pink-600' },
                { name: 'Telco SMS Gateway', key: 'sms', icon: MessageSquare, color: 'text-amber-600' },
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
                      <Icon className={`w-4 h-4 ${c.color}`} />
                      <span className="font-medium text-slate-700">{c.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {count} active
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Bitrix24 CRM Connector</span>
            <span className="text-blue-600 font-medium">Staged Boundary</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Real-Time Operational Audit Feed</h3>
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
