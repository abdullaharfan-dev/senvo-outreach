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
  Building2,
  AlertCircle,
  Network,
  Sparkles,
  ExternalLink,
  Filter,
  Calendar,
  Briefcase,
  Bot,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import type { OverviewMetrics, Campaign, QualifiedLead } from '../types';
import type { ModuleType } from './Sidebar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { StatCard } from './ui/StatCard';
import { ProgressBar } from './ui/ProgressBar';
import { Skeleton } from './ui/Skeleton';

interface OverviewModuleProps {
  onNavigate: (module: ModuleType, conversationId?: string) => void;
}

type TimeRangeFilter = 'all' | '30d' | 'sprint';

export const OverviewModule: React.FC<OverviewModuleProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [qualifiedLeads, setQualifiedLeads] = useState<QualifiedLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');

  const fetchDashboardData = async () => {
    try {
      const [overviewData, campaignsData, qualifiedData] = await Promise.all([
        api.getOverview(),
        api.getCampaigns().catch(() => []),
        api.getQualifiedLeads().catch(() => [])
      ]);
      setMetrics(overviewData);
      setCampaigns(campaignsData);
      setQualifiedLeads(qualifiedData);
    } catch (err) {
      console.error('Failed to load executive overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Loading Skeleton */}
        <div className="bg-slate-900 rounded-2xl p-6 h-48 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 h-28 border border-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 h-80 border border-slate-200 animate-pulse" />
          <div className="bg-white rounded-xl p-6 h-80 border border-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  const { summary, funnel, channel_breakdown, recent_activity, attention_replies, intent_breakdown } = metrics;

  // Real derived engagement calculations
  const totalSent = Number(summary.simulated_sent || 0);
  const totalReplies = Number(summary.inbound_replies || 0);
  const totalLeads = Number(summary.total_leads || 0);
  const qualifiedCount = Number(summary.qualified_leads || 0);

  const replyRate = totalSent > 0 ? ((totalReplies / totalSent) * 100).toFixed(1) : '0.0';
  const qualificationRate = totalLeads > 0 ? ((qualifiedCount / totalLeads) * 100).toFixed(1) : '0.0';

  // Filtered operational activity
  const filteredActivity = (recent_activity || []).filter((act) => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'campaign') return act.action.includes('CAMPAIGN');
    if (activityFilter === 'inbound') return act.action.includes('REPLY') || act.entity_type === 'conversation';
    if (activityFilter === 'lead') return act.entity_type === 'lead' || act.action.includes('LEAD');
    return true;
  });

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      {/* 1. Executive Banner & Controls */}
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-blue-950 rounded-2xl p-5 sm:p-7 text-white shadow-card border border-slate-800/80 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-cyan-300 text-[11px] font-semibold border border-blue-500/30">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span>Ireland Corporate Practice</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-medium border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase PostgreSQL: senvo_outreach</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              B2B Outreach & Response Operations
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
              Autonomous multi-channel engagement across Irish statutory accounting, CRO compliance, cross-border VAT3 advisory, and specialist finance recruitment.
            </p>
          </div>

          {/* Quick Action Buttons & Date Filter */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {/* View Scope Filter */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-700/60 self-start sm:self-auto text-xs">
              <button
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  timeRange === 'all'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  timeRange === '30d'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange('sprint')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  timeRange === 'sprint'
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Active Sprint
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={() => onNavigate('campaigns')}
              >
                Launch Campaign
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Users className="w-3.5 h-3.5" />}
                onClick={() => onNavigate('leads')}
              >
                Import Leads
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary KPI Cards Grid (Direct from persistent Supabase tables) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Total Corporate Leads */}
        <StatCard
          label="Total Leads"
          value={summary.total_leads}
          icon={Users}
          accent="slate"
          badgeText="Active"
          subtext="Corporate registry"
          tooltip="Total leads stored in senvo_outreach.leads table"
          onClick={() => onNavigate('leads')}
        />

        {/* Card 2: In Outreach */}
        <StatCard
          label="In Outreach"
          value={summary.in_campaign}
          icon={Send}
          accent="blue"
          badgeText={`${summary.active_campaigns} running`}
          subtext="Recipient queue"
          tooltip="Leads actively assigned to active outreach campaigns"
          onClick={() => onNavigate('campaigns')}
        />

        {/* Card 3: Inbound Client Replies */}
        <StatCard
          label="Client Replies"
          value={summary.inbound_replies}
          icon={MessageSquare}
          accent="cyan"
          trend={{ value: `${replyRate}% reply rate`, positive: true }}
          subtext="7 channels"
          tooltip="Inbound prospect messages triaged in senvo_outreach.messages"
          onClick={() => onNavigate('inbox')}
        />

        {/* Card 4: Qualified Leads */}
        <StatCard
          label="Qualified"
          value={summary.qualified_leads}
          icon={Award}
          accent="emerald"
          trend={{ value: `${qualificationRate}% conv.`, positive: true }}
          subtext="Discovery ready"
          tooltip="Corporate leads verified with high intent ready for engagement"
          onClick={() => onNavigate('qualified')}
        />

        {/* Card 5: Follow-ups Needing Attention */}
        <StatCard
          label="Needs Review"
          value={summary.reviews_needed || 0}
          icon={AlertCircle}
          accent={(summary.reviews_needed || 0) > 0 ? 'amber' : 'slate'}
          badgeText={(summary.reviews_needed || 0) > 0 ? 'Action Due' : 'All Clear'}
          subtext="Human review desk"
          tooltip="Conversations flagged for human co-pilot review before response"
          onClick={() => onNavigate('inbox')}
        />

        {/* Card 6: Connected Accounts */}
        <StatCard
          label="Connected Accounts"
          value={summary.connected_channels || 9}
          icon={Network}
          accent="indigo"
          badgeText="Enterprise"
          subtext="7 active channels"
          tooltip="Active corporate communications and Bitrix24 REST integration"
          onClick={() => onNavigate('integrations')}
        />
      </div>

      {/* 3. Priority Action Desk: Leads Requiring Human Review / Immediate Attention */}
      {attention_replies && attention_replies.length > 0 && (
        <Card hoverEffect>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <CardTitle>Priority Client Follow-ups & Incoming Inquiries</CardTitle>
                <CardDescription>
                  Inbound threads requiring client partner attention, proposal review, or statutory consultation scheduling.
                </CardDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="xs"
              rightIcon={<ArrowRight className="w-3 h-3" />}
              onClick={() => onNavigate('inbox')}
            >
              Open Unified Inbox
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {attention_replies.slice(0, 5).map((reply) => (
                <div
                  key={reply.conversation_id}
                  onClick={() => onNavigate('inbox', reply.conversation_id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                        {reply.company_name}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        • {reply.contact_name} ({reply.city})
                      </span>
                      <Badge variant="neutral" size="xs">
                        {reply.channel}
                      </Badge>
                      {reply.intent && (
                        <Badge variant="primary" size="xs">
                          {reply.intent.replace(/_/g, ' ')}
                        </Badge>
                      )}
                      <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/60 font-semibold px-2 py-0.5 rounded-full">
                        Action Required
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic line-clamp-1 max-w-3xl">
                      "{reply.latest_inbound || 'Awaiting response triage...'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(reply.last_message_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <Button
                      variant="primary"
                      size="xs"
                      rightIcon={<ArrowRight className="w-3 h-3" />}
                    >
                      Respond
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Two-Column Operational Analysis: Funnel + Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Engagement & Conversion Funnel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>End-to-End Engagement Funnel</CardTitle>
              <CardDescription>
                Live operational pipeline progression calculated from Supabase PostgreSQL records.
              </CardDescription>
            </div>
            <Badge variant="neutral" size="xs" dot>
              Live Verified
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            {funnel.map((item, idx) => {
              const colors: Array<'slate' | 'blue' | 'amber' | 'cyan' | 'emerald' | 'indigo'> = [
                'slate',
                'blue',
                'amber',
                'cyan',
                'emerald',
                'indigo'
              ];
              const color = colors[idx % colors.length];

              return (
                <ProgressBar
                  key={item.stage}
                  label={item.stage}
                  value={Math.min(item.percentage, 100)}
                  color={color}
                  countLabel={
                    <span>
                      {item.count}{' '}
                      <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                    </span>
                  }
                />
              );
            })}
          </CardContent>

          <CardFooter>
            <span className="text-slate-500">Pipeline Quality Score:</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
              High Intent • Irish Enterprise Focus
            </span>
          </CardFooter>
        </Card>

        {/* 7-Channel Coverage & Account Readiness */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader>
              <div>
                <CardTitle>Channel Coverage</CardTitle>
                <CardDescription>Multi-channel response matrix</CardDescription>
              </div>
              <Button
                variant="outline"
                size="xs"
                onClick={() => onNavigate('integrations')}
              >
                Accounts
              </Button>
            </CardHeader>

            <CardContent className="p-3 sm:p-4 space-y-1">
              {[
                { name: 'Outlook / Microsoft 365', key: 'email', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
                { name: 'LinkedIn Sales Navigator', key: 'linkedin', icon: Linkedin, color: 'text-sky-600', bg: 'bg-sky-50' },
                { name: 'WhatsApp Business API', key: 'whatsapp', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { name: 'Corporate Webhook Intake', key: 'website', icon: Globe, color: 'text-purple-600', bg: 'bg-purple-50' },
                { name: 'Meta Messenger Suite', key: 'facebook', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50' },
                { name: 'Instagram Direct Corporate', key: 'instagram', icon: Layers, color: 'text-pink-600', bg: 'bg-pink-50' },
                { name: 'Enterprise Telco SMS', key: 'sms', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
              ].map((c) => {
                const count = channel_breakdown.find((x) => x.channel === c.key)?.count || 0;
                const Icon = c.icon;
                return (
                  <div
                    key={c.key}
                    onClick={() => onNavigate('inbox')}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-xs group"
                  >
                    <div className="flex items-center gap-2.5 truncate mr-2">
                      <div className={`w-6 h-6 rounded-md ${c.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-3.5 h-3.5 ${c.color}`} />
                      </div>
                      <span className="font-medium text-slate-700 text-[11px] truncate group-hover:text-slate-900">
                        {c.name}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px] sm:text-[11px] shrink-0 tabular-nums">
                      {count} active
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </div>

          <CardFooter>
            <span className="text-slate-500 font-medium">Bitrix24 CRM Gateway:</span>
            <span className="text-blue-600 font-semibold flex items-center gap-1">
              <span>Auto-Stage Ready</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            </span>
          </CardFooter>
        </Card>
      </div>

      {/* 5. Active Campaigns & Qualified Leads Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Active Campaigns Snapshot */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <div>
                <CardTitle>Active Outreach Campaigns</CardTitle>
                <CardDescription>Campaign execution and dispatch progress</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              rightIcon={<ArrowRight className="w-3 h-3" />}
              onClick={() => onNavigate('campaigns')}
            >
              All Campaigns
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {campaigns.slice(0, 3).map((camp) => (
                <div key={camp.id} className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                      {camp.name}
                    </span>
                    <Badge
                      variant={camp.status === 'running' ? 'primary' : 'success'}
                      size="xs"
                      dot
                    >
                      {camp.status}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    Channel: <span className="font-medium text-slate-700 uppercase">{camp.channel}</span> • Target: {camp.target_audience}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <span className="text-[11px]">
                      Recipients: <span className="font-semibold text-slate-900">{camp.total_recipients}</span>
                    </span>
                    <span className="text-[11px]">
                      Delivered: <span className="font-semibold text-emerald-600">{camp.sent_count}</span>
                    </span>
                    <span className="text-[11px]">
                      Replies: <span className="font-semibold text-blue-600">{camp.replied_count}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staged Bitrix24 Handoffs Snapshot */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <div>
                <CardTitle>Qualified Leads & CRM Staging</CardTitle>
                <CardDescription>Verified enterprise leads ready for partner engagement</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="xs"
              rightIcon={<ArrowRight className="w-3 h-3" />}
              onClick={() => onNavigate('qualified')}
            >
              View Pipeline
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {qualifiedLeads.slice(0, 3).map((ql) => (
                <div key={ql.id} className="p-4 sm:p-5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900">
                      {ql.company_name}
                    </span>
                    <Badge variant="success" size="xs">
                      Qualified
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    Requested Service: <span className="text-blue-700">{ql.requested_service || 'Statutory Compliance'}</span>
                  </p>

                  <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                    "{ql.qualification_summary}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Assigned: {ql.assigned_owner || 'Corporate Advisory Lead'}</span>
                    <span className="font-medium text-emerald-700">Bitrix24 Staged</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Real-Time Operational Audit Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>System Operational Audit Feed</CardTitle>
              <CardDescription>
                Chronological ledger of events, dispatches, and incoming triages in senvo_outreach.activity_events
              </CardDescription>
            </div>
          </div>

          {/* Activity Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-xs">
            <button
              onClick={() => setActivityFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                activityFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setActivityFilter('campaign')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                activityFilter === 'campaign' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActivityFilter('inbound')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                activityFilter === 'inbound' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Inbound Triages
            </button>
            <button
              onClick={() => setActivityFilter('lead')}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                activityFilter === 'lead' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Leads
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {filteredActivity.map((act) => {
              const isCampaign = act.action.includes('CAMPAIGN');
              const isLead = act.entity_type === 'lead';
              const isInbound = act.action.includes('REPLY') || act.entity_type === 'conversation';
              const isError = act.action.includes('ERROR');

              return (
                <div
                  key={act.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4 hover:bg-slate-50/60 transition-colors text-xs"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Badge
                      variant={
                        isError
                          ? 'danger'
                          : isCampaign
                          ? 'primary'
                          : isInbound
                          ? 'info'
                          : isLead
                          ? 'success'
                          : 'neutral'
                      }
                      size="xs"
                      className="shrink-0 mt-0.5"
                    >
                      {act.action.replace(/_/g, ' ')}
                    </Badge>

                    <div className="space-y-0.5 min-w-0">
                      <p className="text-slate-700 text-xs font-normal leading-relaxed break-words">
                        <span className="font-semibold text-slate-900 mr-1.5">{act.actor}:</span>
                        {act.details}
                      </p>
                    </div>
                  </div>

                  <span className="text-slate-400 whitespace-nowrap text-[11px] font-mono shrink-0 pl-7 sm:pl-0">
                    {new Date(act.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewModule;
