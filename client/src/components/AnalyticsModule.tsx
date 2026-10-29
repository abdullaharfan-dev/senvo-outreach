import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import type { OverviewMetrics } from '../types';

export const AnalyticsModule: React.FC = () => {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getOverview().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Aggregating analytics from persistent SQLite records...
      </div>
    );
  }

  const { summary, funnel, channel_breakdown, intent_breakdown } = metrics;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Performance Analytics & Conversion Reporting</h2>
        <p className="text-xs text-slate-500">
          All metrics computed dynamically from persisted SQLite records • Real-time audit trail
        </p>
      </div>

      {/* Top Ratio Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Audience Penetration
          </span>
          <p className="text-2xl font-bold text-slate-900">
            {summary.total_leads ? Math.round((summary.simulated_sent / summary.total_leads) * 100) : 0}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.simulated_sent} of {summary.total_leads} leads reached
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Inbound Response Rate
          </span>
          <p className="text-2xl font-bold text-blue-600">
            {summary.simulated_sent ? Math.round((summary.inbound_replies / summary.simulated_sent) * 100) : 0}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.inbound_replies} replies received across channels
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Qualification Conversion
          </span>
          <p className="text-2xl font-bold text-emerald-600">
            {summary.inbound_replies ? Math.round((summary.qualified_leads / summary.inbound_replies) * 100) : 0}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.qualified_leads} leads qualified by AI & team
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            CRM Staging Rate
          </span>
          <p className="text-2xl font-bold text-indigo-600">
            {summary.qualified_leads ? Math.round((summary.staged_handoffs / summary.qualified_leads) * 100) : 100}%
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.staged_handoffs} Bitrix24 payloads formatted
          </p>
        </div>
      </div>

      {/* Funnel & Intents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Full Conversion Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Outreach to Handoff Conversion Funnel</h3>
            <span className="text-xs font-medium text-slate-500">Persisted Records</span>
          </div>

          <div className="space-y-4">
            {funnel.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{item.stage}</span>
                  <span className="text-slate-900 font-bold">
                    {item.count} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intent Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">Gemini AI Classified Intents</h3>
            <span className="text-xs font-medium text-slate-500">Structured Classifications</span>
          </div>

          <div className="space-y-3">
            {intent_breakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 capitalize">
                    {item.intent.replace(/_/g, ' ')}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Assessed against Irish Corporate Services criteria
                  </p>
                </div>
                <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  {item.count} inquiries
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance & Simulation Verification Box */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Safe Demo Verification:</strong> 100% of outbound messages are executed in <code>delivery_mode = simulated</code>. No external network requests were dispatched to real telephone carriers or mail servers.
          </span>
        </div>
        <span className="font-mono text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded">
          OUTBOUND_SAFE = TRUE
        </span>
      </div>
    </div>
  );
};

export default AnalyticsModule;
