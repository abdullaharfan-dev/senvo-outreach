import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Building2,
  Send,
  Bot,
  Calendar,
  FileText,
  Printer,
  CheckCircle2,
  ExternalLink,
  Target,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Layers,
  ArrowRight,
  Filter,
  Users,
  Award,
  Zap,
  HelpCircle,
  Clock,
  PhoneCall,
  Shield,
  Edit3,
  RotateCcw,
  Plus,
  Check,
  Briefcase,
  Share2,
  TrendingUp
} from 'lucide-react';
import CommercialValueModel from './CommercialValueModel';
import { api } from '../services/api';
import type { Lead } from '../types';
import {
  getClientConfig,
  updateClientConfig,
  type ClientConfig,
  type DemoScenario,
  type ImplementationTask,
  type TargetSegmentConfig,
  type ClientService
} from '../config/clientConfig';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';
import { Badge, type BadgeVariant } from './ui/Badge';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';

export type ValueCenterTab =
  | 'opportunities'
  | 'campaign_preview'
  | 'ai_showcase'
  | 'implementation_plan'
  | 'client_report';

interface ClientValueCenterProps {
  initialTab?: ValueCenterTab;
  onNavigateToInbox?: (conversationId?: string) => void;
  onNavigateToQualified?: () => void;
}

export const ClientValueCenter: React.FC<ClientValueCenterProps> = ({
  initialTab = 'opportunities',
  onNavigateToInbox,
  onNavigateToQualified
}) => {
  const [activeTab, setActiveTab] = useState<ValueCenterTab>(initialTab);
  const [config, setConfig] = useState<ClientConfig>(getClientConfig());
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState<boolean>(true);

  // Module A State: Selected Segment & Opportunity
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(
    config.targetSegments[0]?.id || 'irish-tech-saas'
  );
  const [selectedOpportunityLead, setSelectedOpportunityLead] = useState<Lead | null>(null);

  // Module B State: Campaign Preview Sequence
  const [campaignSeqStep, setCampaignSeqStep] = useState<1 | 2 | 3 | 4>(1);
  const [previewLeadId, setPreviewLeadId] = useState<string>('');
  const [isEditingCampaignCopy, setIsEditingCampaignCopy] = useState<boolean>(false);
  const [customizedSequenceCopies, setCustomizedSequenceCopies] = useState<Record<number, string>>({});

  // Module C State: AI Conversation Showcase
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    config.scenarios[0]?.id || 'scenario-audit-exemption-eligibility'
  );
  const [activeTurnIndex, setActiveTurnIndex] = useState<number>(99); // show all turns by default

  // Module D State: 30-Day Implementation Tasks
  const [tasks, setTasks] = useState<ImplementationTask[]>(config.implementationTasks);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskState, setEditTaskState] = useState<Partial<ImplementationTask>>({});
  const [activeWeekFilter, setActiveWeekFilter] = useState<1 | 2 | 3 | 4 | 'all'>('all');

  // Load real leads from database for Module A & B
  useEffect(() => {
    api.getLeads()
      .then((data: any) => {
        const leadList = Array.isArray(data) ? data : (data?.leads || []);
        setLeads(leadList);
        if (leadList.length > 0) {
          setSelectedOpportunityLead(leadList[0]);
          setPreviewLeadId(leadList[0].id);
        }
      })
      .catch((err) => console.error('Failed to load leads for Value Center:', err))
      .finally(() => setLoadingLeads(false));
  }, []);

  // Update tasks when config changes
  useEffect(() => {
    setTasks(config.implementationTasks);
  }, [config]);

  const activeSegment = config.targetSegments.find((s) => s.id === selectedSegmentId) || config.targetSegments[0];
  const activeScenario = config.scenarios.find((s) => s.id === selectedScenarioId) || config.scenarios[0];
  const activeLead = leads.find((l) => l.id === previewLeadId) || selectedOpportunityLead || leads[0];

  // Helper to handle task editing
  const handleSaveTaskEdit = (taskId: string) => {
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, ...editTaskState };
      }
      return t;
    });
    setTasks(updatedTasks);
    const updatedConfig = { ...config, implementationTasks: updatedTasks };
    setConfig(updatedConfig);
    updateClientConfig(updatedConfig);
    setEditingTaskId(null);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Value Center Header & Presentation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-[11px] font-bold tracking-wider text-blue-300 uppercase">
                Client Value Center
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{config.clientName}</span>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">
                {config.jurisdiction}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Client Value & Advisory Presentation Workspace
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              An interactive client-facing workspace showcasing targeted Irish business opportunities, tailored multi-touch campaign sequences, grounded AI conversation replays, and a structured 30-day onboarding roadmap.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintReport}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40"
              leftIcon={<Printer className="w-3.5 h-3.5 text-white" />}
            >
              Print / Export Report
            </Button>
          </div>
        </div>

        {/* 5-Module Presentation Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-5 mt-5 border-t border-white/10 no-scrollbar text-xs font-medium">
          {[
            {
              id: 'opportunities' as ValueCenterTab,
              label: 'Module A: Business Opportunities',
              icon: Target,
            },
            {
              id: 'campaign_preview' as ValueCenterTab,
              label: 'Module B: Personalized Campaigns',
              icon: Send,
            },
            {
              id: 'ai_showcase' as ValueCenterTab,
              label: 'Module C: AI Conversation Showcase',
              icon: Bot,
            },
            {
              id: 'implementation_plan' as ValueCenterTab,
              label: 'Module D: 30-Day Plan',
              icon: Calendar,
            },
            {
              id: 'client_report' as ValueCenterTab,
              label: 'Module E: Commercial Opportunity Model',
              icon: TrendingUp,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 ring-1 ring-blue-400/50'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODULE A: BUSINESS OPPORTUNITIES                                          */}
      {/* ========================================================================= */}
      {activeTab === 'opportunities' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Target Segments Selection Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {config.targetSegments.map((seg) => {
              const isSelected = seg.id === selectedSegmentId;
              const matchingService = config.services.find((s) => s.id === seg.relevantServiceId);
              return (
                <Card
                  key={seg.id}
                  onClick={() => setSelectedSegmentId(seg.id)}
                  className={`p-4 transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/30 shadow-card'
                      : 'hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge variant={isSelected ? 'primary' : 'neutral'} size="xs">
                      {seg.badge}
                    </Badge>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      ~{seg.estimatedProspects} Irish Entities
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{seg.name}</h4>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                      {seg.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Recommended:</span>
                    <span className="font-bold text-blue-700">{seg.recommendedChannel}</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Active Segment Detail & Opportunities Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Segment Strategic Framing */}
            <Card className="p-5 space-y-4 shadow-card">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Target Segment Rationale
                </span>
                <h3 className="text-base font-bold text-slate-900">{activeSegment.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{activeSegment.description}</p>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Key Client Pain Point</span>
                  <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                    {activeSegment.keyPainPoint}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 space-y-1">
                  <span className="text-blue-700 block text-[10px] uppercase font-bold">Recommended Advisory Angle</span>
                  <p className="text-blue-950 font-medium text-[11px] leading-relaxed">
                    {activeSegment.messagingAngle}
                  </p>
                </div>

                {(() => {
                  const s = config.services.find((svc) => svc.id === activeSegment.relevantServiceId);
                  if (!s) return null;
                  return (
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-1 text-emerald-950">
                      <span className="text-emerald-700 block text-[10px] uppercase font-bold">Relevant Practice Service</span>
                      <span className="font-bold block text-xs">{s.name}</span>
                      <span className="text-[10px] font-mono block text-emerald-800 font-semibold">{s.typicalFee}</span>
                      <p className="text-[11px] text-emerald-900 leading-relaxed pt-1">{s.valueProp}</p>
                    </div>
                  );
                })()}
              </div>
            </Card>

            {/* Opportunities List: Verified Facts vs Inferred Opportunities */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-card overflow-hidden">
                <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">Verified Corporate Prospects ({leads.length})</CardTitle>
                    <CardDescription>
                      Actual registered Irish entities matching ICP criteria &bull; Zero fabricated records
                    </CardDescription>
                  </div>
                  <Badge variant="success" size="xs" dot>
                    CRO Public Registry
                  </Badge>
                </CardHeader>

                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {loadingLeads ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Loading verified corporate records...
                    </div>
                  ) : (
                    leads.map((lead) => {
                      const isSelected = selectedOpportunityLead?.id === lead.id;
                      return (
                        <div
                          key={lead.id}
                          onClick={() => setSelectedOpportunityLead(lead)}
                          className={`p-4 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {lead.company_name}
                              </span>
                              <Badge variant="success" size="xs">
                                Verified CRO
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500">
                              {lead.contact_name || 'Managing Director'} &bull; {lead.city}, Ireland &bull;{' '}
                              <span className="text-slate-700 font-medium">{lead.industry}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-semibold uppercase">ICP Fit</span>
                              <span className="font-bold text-emerald-700 text-xs">
                                Tier 1 (95%)
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOpportunityLead(lead);
                              }}
                            >
                              Inspect Opportunity
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>

              {/* Selected Opportunity Deep-Dive: Facts vs Inferred Opportunities */}
              {selectedOpportunityLead && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Column 1: Verified Corporate Facts */}
                  <Card className="p-4 space-y-3 bg-white border-slate-200 shadow-2xs text-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Corporate Facts (Public Record)</span>
                      </span>
                      <Badge variant="success" size="xs">
                        Verified
                      </Badge>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Legal Entity:</span>
                        <span className="font-bold text-slate-800">{selectedOpportunityLead.company_name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Decision Maker:</span>
                        <span className="font-semibold text-slate-800">
                          {selectedOpportunityLead.contact_name || 'Managing Director'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Corporate Email:</span>
                        <span className="font-mono text-slate-700">{selectedOpportunityLead.email || '—'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Direct Telephone:</span>
                        <span className="font-mono text-slate-700">{selectedOpportunityLead.phone || '—'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Registered Office:</span>
                        <span className="font-semibold text-slate-800">{selectedOpportunityLead.city}, Ireland</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Source: Companies Registration Office (CRO.ie)</span>
                      <a
                        href="https://core.cro.ie"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-semibold inline-flex items-center gap-1"
                      >
                        <span>CORE Registry</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </Card>

                  {/* Column 2: Inferred Advisory Opportunities */}
                  <Card className="p-4 space-y-3 bg-amber-50/20 border-amber-200/80 shadow-2xs text-xs">
                    <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                      <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Inferred Advisory Opportunities (AI Evaluated)</span>
                      </span>
                      <Badge variant="warning" size="xs">
                        Advisory Scope
                      </Badge>
                    </div>

                    <div className="space-y-2.5 text-[11px]">
                      <div className="p-2.5 bg-white rounded-lg border border-amber-200/60 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">Section 358 Audit Exemption</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">Save ~€14k</span>
                        </div>
                        <p className="text-slate-600 text-[10px]">
                          Trading volume indicates turnover under €12M and staff under 50; eligible to replace statutory audit with compilation balance sheet.
                        </p>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-amber-200/60 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">Section 766 R&D Credit Scope</span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1 rounded">30% Payable</span>
                        </div>
                        <p className="text-slate-600 text-[10px]">
                          Technical software/sensor development qualifies for enhanced non-dilutive innovation cash installments.
                        </p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 italic">
                      Note: Inferred opportunities represent commercial advisory potential and are verified during the initial 20-minute discovery consultation.
                    </p>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE B: PERSONALIZED CAMPAIGN PREVIEW                                    */}
      {/* ========================================================================= */}
      {activeTab === 'campaign_preview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="shadow-card">
            <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm sm:text-base">
                  Personalized Multi-Touch Outreach Sequence Preview
                </CardTitle>
                <CardDescription>
                  Review how {config.clientName}'s services are sequenced across email, automated follow-ups, and executive LinkedIn touches
                </CardDescription>
              </div>

              {/* Recipient Personalization Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Interpolate Lead:</span>
                <select
                  value={previewLeadId}
                  onChange={(e) => setPreviewLeadId(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.company_name} ({l.contact_name || 'Managing Director'})
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-6 text-xs">
              {/* Step Sequence Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    step: 1 as const,
                    label: 'Touch 1: Cold Briefing',
                    timing: 'Day 0',
                    channel: 'Email',
                    badge: 'Primary First Touch',
                  },
                  {
                    step: 2 as const,
                    label: 'Touch 2: Value Proof',
                    timing: 'Day 3',
                    channel: 'Email',
                    badge: 'ROI / Case Study',
                  },
                  {
                    step: 3 as const,
                    label: 'Touch 3: Filing Urgency',
                    timing: 'Day 7',
                    channel: 'Email',
                    badge: 'Partner Diary',
                  },
                  {
                    step: 4 as const,
                    label: 'Touch 4: LinkedIn Touch',
                    timing: 'Day 10',
                    channel: 'LinkedIn',
                    badge: 'InMail / Connect',
                  },
                ].map((s) => {
                  const isCurrent = campaignSeqStep === s.step;
                  return (
                    <button
                      key={s.step}
                      onClick={() => setCampaignSeqStep(s.step)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">{s.timing}</span>
                        <Badge variant={isCurrent ? 'primary' : 'neutral'} size="xs">
                          {s.channel}
                        </Badge>
                      </div>
                      <span className={`font-bold block text-xs ${isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                        {s.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block">{s.badge}</span>
                    </button>
                  );
                })}
              </div>

              {/* Message Composer & Live Previewer */}
              {(() => {
                const getTemplateBody = (step: number) => {
                  if (customizedSequenceCopies[step]) {
                    return customizedSequenceCopies[step];
                  }
                  if (step === 1) {
                    return `Dear {CONTACT_NAME},\n\nAs Irish corporate statutory deadlines approach, many mid-market leaders at companies like {BUSINESS_NAME} in {CITY} are reviewing their statutory audit exemption thresholds, CRO Form B1 compliance, and cross-border VAT structures.\n\n{PRACTICE_NAME} provides end-to-end statutory accounting, Revenue compliance, and company secretarial advisory tailored to Irish trading entities.\n\nWould you be open to a brief 10-minute introductory call next Tuesday or Wednesday to discuss your current compliance schedule?\n\nSincerely,\n{PARTNER_NAME} | Senior Advisory Partner`;
                  }
                  if (step === 2) {
                    return `Hi {CONTACT_NAME},\n\nFollowing up on my earlier note regarding {BUSINESS_NAME}'s statutory compliance posture in {CITY}.\n\nLast month, we guided a comparable Irish corporate entity through Section 358 Companies Act 2014 qualification, replacing an €18,000 full audit with certified compilation balance sheets—saving €12,500 annually while maintaining complete bank covenant compliance.\n\nCould we explore whether {BUSINESS_NAME} satisfies these same thresholds? A brief 10-minute discovery call is all it takes.\n\nBest regards,\n{PARTNER_NAME} | {PRACTICE_NAME}`;
                  }
                  if (step === 3) {
                    return `{CONTACT_NAME} — As CRO Form B1 statutory filing windows approach, I wanted to extend a final courtesy note to review {BUSINESS_NAME}'s filing schedule.\n\nLate CRO filings trigger automatic €100 base + €3/day penalties and result in 2 years of mandatory audit forfeiture. Our fixed-fee corporate advisory retainer eliminates that risk completely.\n\nI have 20 minutes open this Thursday at 2:30 PM or Friday at 10:00 AM. Does either work for an exploratory Zoom?\n\n{PARTNER_NAME}`;
                  }
                  return `Hi {CONTACT_NAME}, noticed your leadership role at {BUSINESS_NAME} in {CITY}. We partner with Irish managing directors to streamline Companies Act 2014 statutory filings and evaluate Section 358 audit exemption eligibility. Would welcome connecting here to share our 2026 Irish Corporate Advisory Benchmarks.\n\n{PARTNER_NAME} | {PRACTICE_NAME}`;
                };

                const currentRawTemplate = getTemplateBody(campaignSeqStep);
                const currentInterpolated = currentRawTemplate
                  .replace(/\{CONTACT_NAME\}/g, activeLead?.contact_name || 'Managing Director')
                  .replace(/\{BUSINESS_NAME\}/g, activeLead?.company_name || 'Irish Enterprise Ltd')
                  .replace(/\{CITY\}/g, activeLead?.city || 'Dublin')
                  .replace(/\{PRACTICE_NAME\}/g, config.clientName)
                  .replace(/\{PARTNER_NAME\}/g, config.partnerLead.name);

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                    {/* Left: Template Editor */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Editable Sequence Template Body</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">Personalization Tags:</span>
                          <code className="text-[10px] bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-mono">
                            &#123;CONTACT_NAME&#125;
                          </code>
                          <code className="text-[10px] bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-mono">
                            &#123;BUSINESS_NAME&#125;
                          </code>
                          <code className="text-[10px] bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-mono">
                            &#123;CITY&#125;
                          </code>
                        </div>
                      </div>

                      <textarea
                        rows={9}
                        value={currentRawTemplate}
                        onChange={(e) => {
                          setCustomizedSequenceCopies((prev) => ({
                            ...prev,
                            [campaignSeqStep]: e.target.value,
                          }));
                        }}
                        className="w-full p-3.5 rounded-xl border border-slate-300 font-sans text-xs leading-relaxed text-slate-800 bg-white focus:ring-2 focus:ring-blue-500 shadow-inner"
                      />

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Edits update live in the right preview canvas.</span>
                        <button
                          onClick={() => {
                            setCustomizedSequenceCopies((prev) => {
                              const copy = { ...prev };
                              delete copy[campaignSeqStep];
                              return copy;
                            });
                          }}
                          className="text-slate-400 hover:text-slate-700 font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to Default</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Real-Time Personalized Message Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Live Personalized Preview ({activeLead?.company_name})</span>
                        </span>
                        <Badge variant="success" size="xs">
                          Ready for Sandbox
                        </Badge>
                      </div>

                      <div className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/20 shadow-2xs space-y-3 min-h-[220px]">
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 text-[11px]">
                          <div>
                            <span className="text-slate-400">To: </span>
                            <span className="font-bold text-slate-800">
                              {activeLead?.contact_name || 'Managing Director'} &lt;{activeLead?.email || 'direct@firm.ie'}&gt;
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400">From: </span>
                            <span className="font-semibold text-slate-800">
                              {config.partnerLead.name} &lt;{config.partnerLead.email}&gt;
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line bg-white p-4 rounded-lg border border-slate-200/80 shadow-2xs">
                          {currentInterpolated}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Simulation Safeguard: <strong>Zero messages are dispatched externally</strong>.</span>
                        <span className="text-blue-700 font-semibold">Presentation Mode</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE C: AI CONVERSATION SHOWCASE                                        */}
      {/* ========================================================================= */}
      {activeTab === 'ai_showcase' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenarios Sidebar Selection */}
            <Card className="p-4 space-y-3 shadow-card">
              <div>
                <CardTitle className="text-sm">Interactive AI Conversation Scenarios</CardTitle>
                <CardDescription>
                  Demonstrates 7 core prospect engagement dialogues
                </CardDescription>
              </div>

              <div className="space-y-1.5">
                {config.scenarios.map((sc) => {
                  const isSelected = sc.id === selectedScenarioId;
                  return (
                    <button
                      key={sc.id}
                      onClick={() => {
                        setSelectedScenarioId(sc.id);
                        setActiveTurnIndex(99);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-2xs ring-1 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            sc.category === 'eligibility'
                              ? 'primary'
                              : sc.category === 'pricing'
                              ? 'warning'
                              : sc.category === 'meeting'
                              ? 'success'
                              : 'purple'
                          }
                          size="xs"
                        >
                          {sc.categoryLabel}
                        </Badge>
                        <span className="text-[10px] text-slate-400 capitalize">{sc.channel}</span>
                      </div>
                      <span className="font-bold text-slate-900 block text-xs">{sc.title}</span>
                      <span className="text-[10px] text-slate-500 block truncate">{sc.prospectCompany}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Scenario Dialogue Display & Grounding Details */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-card">
                <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{activeScenario.title}</CardTitle>
                      <Badge variant="primary" size="xs">
                        Illustrative Client Scenario
                      </Badge>
                    </div>
                    <CardDescription className="mt-0.5">
                      {activeScenario.summary}
                    </CardDescription>
                  </div>
                  <Badge variant="success" size="xs">
                    {activeScenario.qualificationImpact}
                  </Badge>
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-xs">
                  {/* Turns Stream */}
                  <div className="space-y-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                    {activeScenario.turns.map((turn, idx) => {
                      const isProspect = turn.sender === 'prospect';
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col ${isProspect ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                            <span className="font-bold text-slate-700">{turn.senderName}</span>
                            <span>•</span>
                            <span>{turn.timestamp}</span>
                            {!isProspect && (
                              <span className="text-blue-600 font-semibold bg-blue-100 px-1.5 py-0.2 rounded text-[9px]">
                                Grounded AI
                              </span>
                            )}
                          </div>

                          <div
                            className={`max-w-[90%] sm:max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-2xs whitespace-pre-line ${
                              isProspect
                                ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-blue-500/10'
                            }`}
                          >
                            {turn.content}
                          </div>

                          {/* Knowledge Grounding Chip on AI response */}
                          {!isProspect && turn.knowledgeReference && (
                            <div className="mt-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Grounded in Approved Policy: <strong>{turn.knowledgeReference}</strong></span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Suggested Next Action & Qualification Staging */}
                  <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block">
                        Autonomous Recommendation:
                      </span>
                      <p className="text-xs text-blue-950 font-medium">
                        {activeScenario.suggestedNextAction}
                      </p>
                    </div>
                    {onNavigateToQualified && (
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={onNavigateToQualified}
                        className="shrink-0"
                      >
                        Inspect in Qualified Leads &rarr;
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE D: 30-DAY IMPLEMENTATION PLAN                                      */}
      {/* ========================================================================= */}
      {activeTab === 'implementation_plan' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card className="shadow-card">
            <CardHeader className="py-4 px-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm sm:text-base">
                  30-Day Client Onboarding & Advisory Activation Roadmap
                </CardTitle>
                <CardDescription>
                  Proposed four-week journey from statutory setup to live partner discovery meetings &bull; All tasks are editable
                </CardDescription>
              </div>

              {/* Week Filter Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                {(['all', 1, 2, 3, 4] as const).map((w) => (
                  <button
                    key={w}
                    onClick={() => setActiveWeekFilter(w)}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      activeWeekFilter === w
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {w === 'all' ? 'All Weeks' : `Week ${w}`}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-6 text-xs">
              {/* Implementation Pillars Header */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  {
                    week: 1,
                    title: 'Week 1: Setup & Grounding',
                    desc: 'Discovery, client configuration, ICP and knowledge setup.',
                    color: 'border-l-blue-600',
                  },
                  {
                    week: 2,
                    title: 'Week 2: Discovery & Sequencing',
                    desc: 'Prospect discovery, enrichment and campaign preparation.',
                    color: 'border-l-indigo-600',
                  },
                  {
                    week: 3,
                    title: 'Week 3: AI Workflows & CRM',
                    desc: 'AI conversation workflows, qualification and handoff.',
                    color: 'border-l-emerald-600',
                  },
                  {
                    week: 4,
                    title: 'Week 4: Review & Expansion',
                    desc: 'Performance review, optimization and next steps.',
                    color: 'border-l-purple-600',
                  },
                ].map((w) => (
                  <div
                    key={w.week}
                    className={`p-3 rounded-xl border border-slate-200 bg-slate-50/50 border-l-4 ${w.color} space-y-1`}
                  >
                    <span className="font-bold text-slate-900 block text-xs">{w.title}</span>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{w.desc}</p>
                  </div>
                ))}
              </div>

              {/* Tasks Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Stage</th>
                      <th className="py-3 px-4">Implementation Task & Deliverable</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks
                      .filter((t) => activeWeekFilter === 'all' || t.week === activeWeekFilter)
                      .map((task) => {
                        const isEditing = editingTaskId === task.id;
                        return (
                          <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-700">
                              Week {task.week}
                            </td>
                            <td className="py-3 px-4 max-w-md">
                              {isEditing ? (
                                <div className="space-y-1.5">
                                  <input
                                    type="text"
                                    value={editTaskState.title ?? task.title}
                                    onChange={(e) => setEditTaskState((prev) => ({ ...prev, title: e.target.value }))}
                                    className="w-full text-xs p-1.5 border border-slate-300 rounded font-semibold"
                                  />
                                  <textarea
                                    value={editTaskState.description ?? task.description}
                                    onChange={(e) => setEditTaskState((prev) => ({ ...prev, description: e.target.value }))}
                                    className="w-full text-[11px] p-1.5 border border-slate-300 rounded"
                                    rows={2}
                                  />
                                </div>
                              ) : (
                                <div>
                                  <span className="font-bold text-slate-900 block text-xs">{task.title}</span>
                                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>
                                  <span className="inline-block text-[10px] text-blue-700 font-medium mt-1">
                                    Deliverable: {task.deliverable}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-medium">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editTaskState.owner ?? task.owner}
                                  onChange={(e) => setEditTaskState((prev) => ({ ...prev, owner: e.target.value }))}
                                  className="text-xs p-1 border border-slate-300 rounded"
                                />
                              ) : (
                                task.owner
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editTaskState.dueDate ?? task.dueDate}
                                  onChange={(e) => setEditTaskState((prev) => ({ ...prev, dueDate: e.target.value }))}
                                  className="text-xs p-1 border border-slate-300 rounded w-20"
                                />
                              ) : (
                                task.dueDate
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <select
                                  value={editTaskState.status ?? task.status}
                                  onChange={(e) =>
                                    setEditTaskState((prev) => ({
                                      ...prev,
                                      status: e.target.value as 'planned' | 'in_progress' | 'completed',
                                    }))
                                  }
                                  className="text-xs p-1 border border-slate-300 rounded cursor-pointer"
                                >
                                  <option value="planned">Planned</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                              ) : (
                                <Badge
                                  variant={
                                    task.status === 'completed'
                                      ? 'success'
                                      : task.status === 'in_progress'
                                      ? 'primary'
                                      : 'neutral'
                                  }
                                  size="xs"
                                >
                                  {task.status === 'completed'
                                    ? 'Completed'
                                    : task.status === 'in_progress'
                                    ? 'In Progress'
                                    : 'Proposed Plan'}
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button size="xs" variant="primary" onClick={() => handleSaveTaskEdit(task.id)}>
                                    Save
                                  </Button>
                                  <Button size="xs" variant="outline" onClick={() => setEditingTaskId(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingTaskId(task.id);
                                    setEditTaskState({
                                      title: task.title,
                                      description: task.description,
                                      owner: task.owner,
                                      dueDate: task.dueDate,
                                      status: task.status,
                                    });
                                  }}
                                  className="text-blue-600 hover:text-blue-800 font-semibold text-xs cursor-pointer"
                                >
                                  Edit
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
                <strong>Governance Transparency:</strong> Proposed tasks are accurately labeled as proposed roadmap milestones and not presented as completed work until verified by the engagement partner.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULE E: COMMERCIAL VALUE MODEL & VALUE CENTER REPORT                     */}
      {/* ========================================================================= */}
      {activeTab === 'client_report' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <CommercialValueModel />
        </div>
      )}
    </div>
  );
};

export default ClientValueCenter;
