import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  Award,
  Sparkles,
  Zap,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import type { OverviewMetrics } from '../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './ui/Card';
import { Badge } from './ui/Badge';
import { StatCard } from './ui/StatCard';
import { ProgressBar } from './ui/ProgressBar';

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
      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Aggregating analytics from persistent Supabase PostgreSQL tables...</span>
        </div>
      </div>
    );
  }

  const { summary, funnel, channel_breakdown, intent_breakdown } = metrics;

  const totalLeads = Number(summary.total_leads || 0);
  const totalSent = Number(summary.simulated_sent || 0);
  const totalReplies = Number(summary.inbound_replies || 0);
  const qualifiedCount = Number(summary.qualified_leads || 0);
  const stagedHandoffs = Number(summary.staged_handoffs || 0);

  const penetrationPct = totalLeads > 0 ? Math.round((totalSent / totalLeads) * 100) : 0;
  const responsePct = totalSent > 0 ? Math.round((totalReplies / totalSent) * 100) : 0;
  const qualPct = totalReplies > 0 ? Math.round((qualifiedCount / totalReplies) * 100) : 0;
  const crmStagingPct = qualifiedCount > 0 ? Math.round((stagedHandoffs / qualifiedCount) * 100) : 100;

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Performance Analytics & Conversion Reporting
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline metrics aggregated directly from Supabase PostgreSQL (<span className="font-mono text-slate-700">senvo_outreach</span> schema)
          </p>
        </div>
        <Badge variant="success" size="sm" dot>
          Live Cloud Synced
        </Badge>
      </div>

      {/* Top Ratio KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Audience Reach"
          value={`${penetrationPct}%`}
          icon={Users}
          accent="slate"
          badgeText="Penetration"
          subtext={`${totalSent} of ${totalLeads} leads reached`}
        />

        <StatCard
          label="Response Rate"
          value={`${responsePct}%`}
          icon={MessageSquare}
          accent="blue"
          badgeText="Engagement"
          subtext={`${totalReplies} replies across channels`}
        />

        <StatCard
          label="Qualification Rate"
          value={`${qualPct}%`}
          icon={Award}
          accent="emerald"
          badgeText="High Intent"
          subtext={`${qualifiedCount} qualified accounts`}
        />

        <StatCard
          label="CRM Staging"
          value={`${crmStagingPct}%`}
          icon={CheckCircle2}
          accent="indigo"
          badgeText="Bitrix24"
          subtext={`${stagedHandoffs} payloads formatted`}
        />
      </div>

      {/* Funnel & Intents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Full Conversion Funnel */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Outreach to Handoff Conversion Funnel</CardTitle>
              <CardDescription>Pipeline stages from database activity records</CardDescription>
            </div>
            <Badge variant="neutral" size="xs">
              Live DB
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {funnel.map((item, idx) => (
              <ProgressBar
                key={item.stage}
                label={item.stage}
                value={Math.min(item.percentage, 100)}
                color={idx % 2 === 0 ? 'blue' : 'cyan'}
                countLabel={
                  <span>
                    {item.count} <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                  </span>
                }
              />
            ))}
          </CardContent>
        </Card>

        {/* Intent Distribution */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Gemini AI Intent Classification</CardTitle>
              <CardDescription>Structured intent categorization across inbound responses</CardDescription>
            </div>
            <Badge variant="primary" size="xs">
              Structured
            </Badge>
          </CardHeader>

          <CardContent className="space-y-2.5 p-4 sm:p-5">
            {intent_breakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <span className="font-semibold text-slate-800 capitalize">
                    {item.intent.replace(/_/g, ' ')}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Assessed against Irish Corporate Services criteria
                  </p>
                </div>
                <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/80 text-[11px] tabular-nums">
                  {item.count} inquiries
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Compliance & Simulation Verification Box */}
      <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="leading-relaxed">
            <strong>Safe Demo Verification:</strong> 100% of outbound messages are executed in <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[11px]">delivery_mode = simulated</code>. No external network requests were dispatched to real telephone carriers or corporate email exchangers.
          </span>
        </div>
        <span className="font-mono text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded border border-emerald-300/60 shrink-0 self-start sm:self-auto">
          OUTBOUND_SAFE = TRUE
        </span>
      </div>
    </div>
  );
};

export default AnalyticsModule;
