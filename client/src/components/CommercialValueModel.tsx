import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Building2,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Printer,
  ShieldCheck,
  Target,
  Percent,
  Briefcase,
  HelpCircle,
  FileSpreadsheet,
  FileText,
  Sliders
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { getClientConfig } from '../config/clientConfig';

export interface ScenarioParams {
  name: string;
  tagline: string;
  badge: string;
  badgeColor: 'neutral' | 'primary' | 'success';
  saasEntities: number;
  logisticsEntities: number;
  midmarketEntities: number;
  targetCoveragePct: number;
  replyRate: number;
  meetingRate: number;
  closeRate: number;
  averageRetainer: number;
  rdClaims: number;
  rdEligibleSpend: number;
  rdSuccessFeePct: number;
}

const DEFAULT_SCENARIOS: Record<'conservative' | 'base' | 'ambitious', ScenarioParams> = {
  conservative: {
    name: 'Conservative Scenario',
    tagline: 'Cautious market penetration with restricted outreach bandwidth',
    badge: 'Cautious Baseline',
    badgeColor: 'neutral',
    saasEntities: 340,
    logisticsEntities: 215,
    midmarketEntities: 580,
    targetCoveragePct: 50,
    replyRate: 20,
    meetingRate: 12,
    closeRate: 15,
    averageRetainer: 4200,
    rdClaims: 2,
    rdEligibleSpend: 300000,
    rdSuccessFeePct: 8,
  },
  base: {
    name: 'Base Case (Recommended)',
    tagline: 'Balanced multi-channel engagement aligned with Irish practice benchmarks',
    badge: 'Recommended Practice Model',
    badgeColor: 'primary',
    saasEntities: 340,
    logisticsEntities: 215,
    midmarketEntities: 580,
    targetCoveragePct: 70,
    replyRate: 35,
    meetingRate: 18,
    closeRate: 25,
    averageRetainer: 4850,
    rdClaims: 5,
    rdEligibleSpend: 400000,
    rdSuccessFeePct: 10,
  },
  ambitious: {
    name: 'Ambitious Growth',
    tagline: 'Full addressable market sweep with high multi-touch frequency',
    badge: 'Aspirational Upper Bound',
    badgeColor: 'success',
    saasEntities: 340,
    logisticsEntities: 215,
    midmarketEntities: 580,
    targetCoveragePct: 100,
    replyRate: 45,
    meetingRate: 22,
    closeRate: 30,
    averageRetainer: 5500,
    rdClaims: 8,
    rdEligibleSpend: 500000,
    rdSuccessFeePct: 12,
  },
};

export const CommercialValueModel: React.FC = () => {
  const clientConfig = getClientConfig();
  const [activeScenarioKey, setActiveScenarioKey] = useState<'conservative' | 'base' | 'ambitious'>('base');
  const [scenarios, setScenarios] = useState<Record<'conservative' | 'base' | 'ambitious', ScenarioParams>>(DEFAULT_SCENARIOS);
  const [activeView, setActiveView] = useState<'interactive' | 'comparison' | 'executive_report'>('interactive');

  const current = scenarios[activeScenarioKey];

  // Helper to update active scenario params
  const updateCurrentParam = <K extends keyof ScenarioParams>(param: K, value: ScenarioParams[K]) => {
    setScenarios((prev) => ({
      ...prev,
      [activeScenarioKey]: {
        ...prev[activeScenarioKey],
        [param]: value,
      },
    }));
  };

  const handleResetDefaults = () => {
    setScenarios(DEFAULT_SCENARIOS);
  };

  // Helper calculation function for any scenario
  const calculateFunnel = (s: ScenarioParams) => {
    const totalAddressable = s.saasEntities + s.logisticsEntities + s.midmarketEntities;
    const contactedEntities = Math.round(totalAddressable * (s.targetCoveragePct / 100));
    const estimatedReplies = Math.round(contactedEntities * (s.replyRate / 100));
    const estimatedMeetings = Math.round(estimatedReplies * (s.meetingRate / 100));
    const estimatedClients = Math.round(estimatedMeetings * (s.closeRate / 100));
    const recurringAnnualRetainers = estimatedClients * s.averageRetainer;

    // R&D Advisory Calculations
    const rdAdvisoryFeeIncome = s.rdClaims * s.rdEligibleSpend * (s.rdSuccessFeePct / 100);
    const combinedOpportunity = recurringAnnualRetainers + rdAdvisoryFeeIncome;

    // Customer Value Metrics (Statutory Tax Cash Benefit)
    // Ireland Section 766 R&D Tax Credit is 30% payable corporation tax credit
    const customerGrossRdBenefit = s.rdClaims * s.rdEligibleSpend * 0.30;
    const customerNetRdBenefit = customerGrossRdBenefit - rdAdvisoryFeeIncome;
    const customerRoiMultiple = rdAdvisoryFeeIncome > 0 ? (customerGrossRdBenefit / rdAdvisoryFeeIncome).toFixed(1) : '0';

    return {
      totalAddressable,
      contactedEntities,
      estimatedReplies,
      estimatedMeetings,
      estimatedClients,
      recurringAnnualRetainers,
      rdAdvisoryFeeIncome,
      combinedOpportunity,
      customerGrossRdBenefit,
      customerNetRdBenefit,
      customerRoiMultiple,
    };
  };

  // Memoized current metrics
  const metrics = useMemo(() => calculateFunnel(current), [current]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-blue-600 uppercase">
              Module E &bull; Commercial Opportunity Engine
            </span>
            <Badge variant="primary" size="xs">Interactive Advisory Model</Badge>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Commercial Opportunity & Value Model
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visual step-by-step projection answering: <em>"If we use SENVO to identify, reach and qualify businesses, what commercial opportunity could this create for our practice?"</em>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveView('interactive')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'interactive'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 inline mr-1.5" />
              Interactive Model
            </button>
            <button
              onClick={() => setActiveView('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'comparison'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1.5" />
              Scenario Matrix
            </button>
            <button
              onClick={() => setActiveView('executive_report')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'executive_report'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              Executive Report Canvas
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleResetDefaults}
            title="Reset model assumptions to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Reset
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handlePrint}
            title="Print or export PDF report"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
            Print Report
          </Button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: INTERACTIVE MODEL                                             */}
      {/* ===================================================================== */}
      {activeView === 'interactive' && (
        <div className="space-y-6">
          {/* Scenario Selector Tabs */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Scenario:</span>
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                {(['conservative', 'base', 'ambitious'] as const).map((key) => {
                  const s = scenarios[key];
                  const isActive = activeScenarioKey === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveScenarioKey(key)}
                      className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                        isActive
                          ? 'bg-white text-blue-900 shadow-sm ring-1 ring-black/5'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {key === 'base' ? 'Base Case' : key}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={current.badgeColor} size="sm">
                {current.badge}
              </Badge>
              <span className="text-xs text-slate-500 hidden md:inline">
                {current.tagline}
              </span>
            </div>
          </div>

          {/* Section 1: Executive Narrative Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-5 rounded-2xl border border-blue-900/40 text-white shadow-md">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 ring-1 ring-blue-400/30 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs leading-relaxed">
                <p className="font-semibold text-blue-100 text-sm">
                  SENVO Outreach Advisory Mandate
                </p>
                <p className="text-slate-300">
                  "SENVO helps your practice systematically identify relevant businesses, prioritize them based on statutory fit, support personalized multi-channel outreach, qualify interested prospects, and move suitable opportunities toward a qualified partner discovery consultation."
                </p>
                <p className="text-[11px] text-blue-200/80 pt-1">
                  <strong>Commercial Realism Notice:</strong> Commercial results depend on total addressable market, targeting precision, verified corporate contact data, messaging relevance, advisory sales follow-up, and practice closing rates. Projections below are scenario models, not fixed commitments or guaranteed revenue.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Addressable Market Model & Segment Distribution */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    1. Addressable Market Sizing & Outreach Coverage
                  </CardTitle>
                  <CardDescription>
                    Configure initial addressable entities across target Irish sectors and set your practice outreach coverage.
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-mono">Total Addressable Market</span>
                  <div className="text-lg font-bold text-slate-900">
                    {metrics.totalAddressable.toLocaleString()} Entities
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Segment 1: SaaS */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">High-Growth Tech (SaaS)</span>
                    <Badge variant="primary" size="xs">Tier 1</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Software companies with Section 766 R&D expenditure and growing headcount.
                  </p>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Addressable Entities:</span>
                      <span className="font-mono text-blue-700">{current.saasEntities}</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={800}
                      step={10}
                      value={current.saasEntities}
                      onChange={(e) => updateCurrentParam('saasEntities', Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Segment 2: Freight & Logistics */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Freight & Port Logistics</span>
                    <Badge variant="neutral" size="xs">High Value</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Cross-border operators requiring Postponed VAT Accounting (PVA) cash neutralization.
                  </p>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Addressable Entities:</span>
                      <span className="font-mono text-blue-700">{current.logisticsEntities}</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={500}
                      step={5}
                      value={current.logisticsEntities}
                      onChange={(e) => updateCurrentParam('logisticsEntities', Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Segment 3: Mid-Market Audit Exemption */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Mid-Market Private Cos</span>
                    <Badge variant="success" size="xs">Volume Yield</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Companies with &lt;€12M turnover qualifying for Section 358 audit exemption compilation.
                  </p>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Addressable Entities:</span>
                      <span className="font-mono text-blue-700">{current.midmarketEntities}</span>
                    </div>
                    <input
                      type="range"
                      min={200}
                      max={1200}
                      step={20}
                      value={current.midmarketEntities}
                      onChange={(e) => updateCurrentParam('midmarketEntities', Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Market Coverage Slider */}
              <div className="mt-5 p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-blue-950 block">
                      Target Market Outreach Coverage: {current.targetCoveragePct}%
                    </span>
                    <p className="text-[11px] text-slate-600">
                      The percentage of addressable entities your practice commits to contacting in this campaign cycle.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Contacted Entities</span>
                    <span className="text-base font-bold font-mono text-blue-900">
                      {metrics.contactedEntities.toLocaleString()} of {metrics.totalAddressable.toLocaleString()}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={current.targetCoveragePct}
                  onChange={(e) => updateCurrentParam('targetCoveragePct', Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>10% Cautious Pilot</span>
                  <span>50% Phased Rollout</span>
                  <span>70% Standard Coverage</span>
                  <span>100% Comprehensive Sweep</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Interactive Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                2. Interactive Multi-Stage Conversion Funnel
              </CardTitle>
              <CardDescription>
                Each stage applies an editable conversion benchmark. Adjust rates to observe pipeline mechanics in real time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Conversion Stage Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Stage 1: Contacted */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stage 1: Audience</span>
                    <Badge variant="neutral" size="xs">Top of Funnel</Badge>
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {metrics.contactedEntities}
                  </div>
                  <span className="text-[11px] text-slate-600 block">Contacted Prospects</span>
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    Base: {current.targetCoveragePct}% market coverage
                  </div>
                </div>

                {/* Stage 2: Replies */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-sm space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Stage 2: Replies</span>
                    <span className="text-xs font-bold font-mono text-blue-700">{current.replyRate}%</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-blue-900">
                    {metrics.estimatedReplies}
                  </div>
                  <span className="text-[11px] text-slate-600 block">Inbound Responses</span>
                  <div className="pt-2 border-t border-blue-100">
                    <input
                      type="range"
                      min={10}
                      max={60}
                      step={1}
                      value={current.replyRate}
                      onChange={(e) => updateCurrentParam('replyRate', Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Reply Rate Slider</span>
                  </div>
                </div>

                {/* Stage 3: Meetings */}
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 shadow-sm space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Stage 3: Discovery</span>
                    <span className="text-xs font-bold font-mono text-indigo-700">{current.meetingRate}%</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-indigo-900">
                    {metrics.estimatedMeetings}
                  </div>
                  <span className="text-[11px] text-slate-600 block">Discovery Meetings</span>
                  <div className="pt-2 border-t border-indigo-100">
                    <input
                      type="range"
                      min={5}
                      max={40}
                      step={1}
                      value={current.meetingRate}
                      onChange={(e) => updateCurrentParam('meetingRate', Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Booking Rate Slider</span>
                  </div>
                </div>

                {/* Stage 4: Retained Clients */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Stage 4: Signed</span>
                    <span className="text-xs font-bold font-mono text-emerald-700">{current.closeRate}%</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-900">
                    {metrics.estimatedClients}
                  </div>
                  <span className="text-[11px] text-slate-600 block">New Retained Clients</span>
                  <div className="pt-2 border-t border-emerald-100">
                    <input
                      type="range"
                      min={5}
                      max={50}
                      step={1}
                      value={current.closeRate}
                      onChange={(e) => updateCurrentParam('closeRate', Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">Closing Rate Slider</span>
                  </div>
                </div>

                {/* Stage 5: Retainer Value */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Stage 5: Retainers</span>
                    <Badge variant="primary" size="xs">Annual</Badge>
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-900">
                    €{metrics.recurringAnnualRetainers.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-600 block">Recurring Retainer</span>
                  <div className="pt-2 border-t border-amber-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Retainer/yr:</span>
                      <span className="font-mono font-bold text-slate-800">€{current.averageRetainer}</span>
                    </div>
                    <input
                      type="range"
                      min={2000}
                      max={10000}
                      step={250}
                      value={current.averageRetainer}
                      onChange={(e) => updateCurrentParam('averageRetainer', Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Mathematical Methodology Disclosure */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  Explicit Funnel Formulas & Rounding Methodology
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[10px] text-slate-700">
                  <div>&bull; Replies = Contacted ({metrics.contactedEntities}) &times; {current.replyRate}% = {metrics.estimatedReplies}</div>
                  <div>&bull; Discovery Meetings = Replies ({metrics.estimatedReplies}) &times; {current.meetingRate}% = {metrics.estimatedMeetings}</div>
                  <div>&bull; Retained Clients = Meetings ({metrics.estimatedMeetings}) &times; {current.closeRate}% = {metrics.estimatedClients}</div>
                  <div>&bull; Retainer Income = {metrics.estimatedClients} Clients &times; €{current.averageRetainer} = €{metrics.recurringAnnualRetainers.toLocaleString()}</div>
                </div>
                <p className="text-[10px] text-slate-400 pt-1">
                  *Stage entity counts are rounded to the nearest whole integer (Math.round) at each transition because outreach cannot contact fractional businesses.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Separate Commercial Revenue Streams (Retainer vs R&D Project Fees) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-600" />
                3. Commercial Revenue Stream Breakdown (Recurring vs Specialized Project Fees)
              </CardTitle>
              <CardDescription>
                Advisory practices generate two distinct revenue streams: annual recurring accounting retainers and high-value contingent project fees.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stream A: Recurring Retainers */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Stream A: Recurring Annual Retainers</span>
                      <span className="text-[11px] text-slate-500">Corporate Secretarial, PVA Reconciliation, Bookkeeping</span>
                    </div>
                    <Badge variant="primary" size="xs">Annual Recurring</Badge>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Retained Clients:</span>
                      <span className="font-bold font-mono text-slate-900">{metrics.estimatedClients}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Average Annual Retainer:</span>
                      <span className="font-bold font-mono text-slate-900">€{current.averageRetainer.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                      <span className="font-bold text-slate-900">Annual Retainer Value:</span>
                      <span className="font-bold font-mono text-blue-700">
                        €{metrics.recurringAnnualRetainers.toLocaleString()}/yr
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Provides predictable baseline ARR for your practice with high retention rates across Irish SMEs.
                  </p>
                </div>

                {/* Stream B: Specialized R&D Tax Credit Fees */}
                <div className="p-5 rounded-2xl border border-purple-200 bg-purple-50/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-purple-950 block">Stream B: Section 766 R&D Advisory Fees</span>
                      <span className="text-[11px] text-slate-500">Contingent success fee on qualifying R&D tax refunds</span>
                    </div>
                    <Badge variant="success" size="xs">Contingent Project</Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                        <span className="text-[10px] text-slate-500 block">Converted Claims</span>
                        <div className="flex items-center justify-between mt-1">
                          <input
                            type="number"
                            min={1}
                            max={25}
                            value={current.rdClaims}
                            onChange={(e) => updateCurrentParam('rdClaims', Number(e.target.value))}
                            className="w-12 p-1 border border-slate-200 rounded font-bold font-mono text-purple-950 text-xs"
                          />
                          <span className="text-[10px] text-slate-400">Claims</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                        <span className="text-[10px] text-slate-500 block">Avg Eligible Spend</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold font-mono text-purple-950 text-xs">
                            €{(current.rdEligibleSpend / 1000).toFixed(0)}k
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                        <span className="text-[10px] text-slate-500 block">Success Fee %</span>
                        <div className="flex items-center justify-between mt-1">
                          <input
                            type="number"
                            min={5}
                            max={20}
                            value={current.rdSuccessFeePct}
                            onChange={(e) => updateCurrentParam('rdSuccessFeePct', Number(e.target.value))}
                            className="w-12 p-1 border border-slate-200 rounded font-bold font-mono text-purple-950 text-xs"
                          />
                          <span className="text-[10px] text-slate-400">%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-100/60 p-3 rounded-xl flex justify-between items-center text-sm">
                      <span className="font-bold text-purple-950">Potential Advisory Fee Opportunity:</span>
                      <span className="font-bold font-mono text-purple-900">
                        €{metrics.rdAdvisoryFeeIncome.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-mono">
                      Formula: {current.rdClaims} Claims &times; €{current.rdEligibleSpend.toLocaleString()} Spend &times; {current.rdSuccessFeePct}% Fee = €{metrics.rdAdvisoryFeeIncome.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Combined Opportunity Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300 block">
                    Combined Illustrative Commercial Opportunity
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                    €{metrics.combinedOpportunity.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-300">
                    Includes <strong>€{metrics.recurringAnnualRetainers.toLocaleString()}</strong> in recurring annual retainers + <strong>€{metrics.rdAdvisoryFeeIncome.toLocaleString()}</strong> in contingent project milestone fees.
                  </p>
                </div>

                <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-xs space-y-1 shrink-0 max-w-xs">
                  <span className="font-semibold text-blue-200 block">Timing Distinction:</span>
                  <p className="text-[11px] text-slate-300">
                    Retainers bill monthly/annually. R&D advisory fees are realized upon Revenue Commissioners claim approval (typically within 3–6 months of financial year-end).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Practice Value vs Customer Value (CRITICAL DISTINCTION) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                4. Value Delivered to the Advisory Practice vs. Value to Your Clients
              </CardTitle>
              <CardDescription>
                Distinguishing the practice's fee earnings from the financial and statutory benefits delivered to client businesses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Perspective A: Value to the Practice */}
                <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs">A</span>
                    <span className="font-bold text-sm text-slate-900">Value to Your Advisory Practice</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Predictable Discovery:</strong> Systematically identifies {metrics.totalAddressable} qualified Irish commercial entities with zero manual research.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>High-Yield Discovery Meetings:</strong> Generates ~{metrics.estimatedMeetings} qualified partner discovery consultations per cycle.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>Recurring Practice Expansion:</strong> Adds ~{metrics.estimatedClients} new long-term retained corporate clients (€{metrics.recurringAnnualRetainers.toLocaleString()}/yr).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span><strong>High-Margin Project Upsell:</strong> Captures ~€{metrics.rdAdvisoryFeeIncome.toLocaleString()} in specialized R&D tax credit advisory fees.</span>
                    </li>
                  </ul>
                </div>

                {/* Perspective B: Value to the Client Businesses */}
                <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs">B</span>
                    <span className="font-bold text-sm text-slate-900">Value Delivered to Your Clients (The Businesses)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Section 766 R&D Tax Credit Cash Injection:</strong>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Irish Revenue provides a 30% payable corporation tax credit. On {current.rdClaims} claims of €{(current.rdEligibleSpend / 1000).toFixed(0)}k spend, clients receive <strong>€{metrics.customerGrossRdBenefit.toLocaleString()}</strong> in gross tax refunds.
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Net Client Benefit: €{metrics.customerNetRdBenefit.toLocaleString()} ({metrics.customerRoiMultiple}:1 Client ROI on advisory fee)
                        </span>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Postponed VAT Accounting (PVA) Working Capital:</strong>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Eliminates upfront 23% import VAT drain at port, preserving tens of thousands of euros in immediate liquidity on every customs movement.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Statutory Governance Protection:</strong>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Shields against Section 363 loss of audit exemption for 2 consecutive years and avoids Section 343 late filing penalties (€100 + €3/day up to €1,200).
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Statutory Disclaimer */}
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <strong>Statutory Advisory & Eligibility Safeguard:</strong>
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  Tax credit values, audit exemptions, and postponed VAT benefits are determined strictly under the Taxes Consolidation Act 1997, Companies Act 2014, and Revenue Commissioners guidelines. Eligibility, qualifying R&D activities, and claim outcomes depend entirely on individual company facts and formal partner assessment. They are never guaranteed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: THREE-SCENARIO COMPARISON MATRIX                              */}
      {/* ===================================================================== */}
      {activeView === 'comparison' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  Comparative Scenario Matrix: Conservative vs. Base Case vs. Ambitious
                </CardTitle>
                <CardDescription>
                  Side-by-side comparison of all three commercial scenarios based on current inputs.
                </CardDescription>
              </div>
              <Button size="xs" variant="outline" onClick={handleResetDefaults}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset Defaults
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600 uppercase">
                    <th className="py-3 px-4 font-bold">Metric / Assumption</th>
                    <th className="py-3 px-4 font-bold text-slate-700">Conservative</th>
                    <th className="py-3 px-4 font-bold text-blue-700 bg-blue-50/50">Base Case (Recommended)</th>
                    <th className="py-3 px-4 font-bold text-emerald-700">Ambitious Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {/* Addressable Market */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Total Addressable Market</td>
                    <td className="py-3 px-4">{calculateFunnel(scenarios.conservative).totalAddressable} entities</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold">{calculateFunnel(scenarios.base).totalAddressable} entities</td>
                    <td className="py-3 px-4">{calculateFunnel(scenarios.ambitious).totalAddressable} entities</td>
                  </tr>

                  {/* Coverage */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Outreach Coverage %</td>
                    <td className="py-3 px-4">{scenarios.conservative.targetCoveragePct}%</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold text-blue-900">{scenarios.base.targetCoveragePct}%</td>
                    <td className="py-3 px-4">{scenarios.ambitious.targetCoveragePct}%</td>
                  </tr>

                  {/* Contacted */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Contacted Prospects</td>
                    <td className="py-3 px-4">{calculateFunnel(scenarios.conservative).contactedEntities}</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold text-blue-900">{calculateFunnel(scenarios.base).contactedEntities}</td>
                    <td className="py-3 px-4">{calculateFunnel(scenarios.ambitious).contactedEntities}</td>
                  </tr>

                  {/* Reply Rate */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Target Reply Rate</td>
                    <td className="py-3 px-4">{scenarios.conservative.replyRate}%</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold text-blue-900">{scenarios.base.replyRate}%</td>
                    <td className="py-3 px-4">{scenarios.ambitious.replyRate}%</td>
                  </tr>

                  {/* Replies */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Estimated Inbound Replies</td>
                    <td className="py-3 px-4">{calculateFunnel(scenarios.conservative).estimatedReplies}</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold text-blue-900">{calculateFunnel(scenarios.base).estimatedReplies}</td>
                    <td className="py-3 px-4">{calculateFunnel(scenarios.ambitious).estimatedReplies}</td>
                  </tr>

                  {/* Meeting Rate */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Meeting Booking Rate</td>
                    <td className="py-3 px-4">{scenarios.conservative.meetingRate}%</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold text-blue-900">{scenarios.base.meetingRate}%</td>
                    <td className="py-3 px-4">{scenarios.ambitious.meetingRate}%</td>
                  </tr>

                  {/* Discovery Meetings */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Discovery Consultations</td>
                    <td className="py-3 px-4">{calculateFunnel(scenarios.conservative).estimatedMeetings}</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold text-blue-900">{calculateFunnel(scenarios.base).estimatedMeetings}</td>
                    <td className="py-3 px-4">{calculateFunnel(scenarios.ambitious).estimatedMeetings}</td>
                  </tr>

                  {/* Close Rate */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Meeting-to-Client Close Rate</td>
                    <td className="py-3 px-4">{scenarios.conservative.closeRate}%</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold text-blue-900">{scenarios.base.closeRate}%</td>
                    <td className="py-3 px-4">{scenarios.ambitious.closeRate}%</td>
                  </tr>

                  {/* Retained Clients */}
                  <tr className="bg-slate-50/50">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">New Retained Clients</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{calculateFunnel(scenarios.conservative).estimatedClients} clients</td>
                    <td className="py-3 px-4 font-bold text-blue-900 bg-blue-50/60">{calculateFunnel(scenarios.base).estimatedClients} clients</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">{calculateFunnel(scenarios.ambitious).estimatedClients} clients</td>
                  </tr>

                  {/* Average Retainer */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">Average Annual Retainer</td>
                    <td className="py-3 px-4">€{scenarios.conservative.averageRetainer.toLocaleString()}</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold text-blue-900">€{scenarios.base.averageRetainer.toLocaleString()}</td>
                    <td className="py-3 px-4">€{scenarios.ambitious.averageRetainer.toLocaleString()}</td>
                  </tr>

                  {/* Recurring Retainer Revenue */}
                  <tr className="bg-blue-50/30">
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">Recurring Annual Retainers</td>
                    <td className="py-3 px-4 font-bold">€{calculateFunnel(scenarios.conservative).recurringAnnualRetainers.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-blue-900 bg-blue-100/40">€{calculateFunnel(scenarios.base).recurringAnnualRetainers.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-emerald-900">€{calculateFunnel(scenarios.ambitious).recurringAnnualRetainers.toLocaleString()}</td>
                  </tr>

                  {/* R&D Claims */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">R&D Tax Credit Claims</td>
                    <td className="py-3 px-4">{scenarios.conservative.rdClaims} claims</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold">{scenarios.base.rdClaims} claims</td>
                    <td className="py-3 px-4">{scenarios.ambitious.rdClaims} claims</td>
                  </tr>

                  {/* R&D Advisory Income */}
                  <tr>
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">R&D Advisory Success Fees</td>
                    <td className="py-3 px-4">€{calculateFunnel(scenarios.conservative).rdAdvisoryFeeIncome.toLocaleString()}</td>
                    <td className="py-3 px-4 bg-blue-50/30 font-bold text-blue-900">€{calculateFunnel(scenarios.base).rdAdvisoryFeeIncome.toLocaleString()}</td>
                    <td className="py-3 px-4">€{calculateFunnel(scenarios.ambitious).rdAdvisoryFeeIncome.toLocaleString()}</td>
                  </tr>

                  {/* Combined Commercial Opportunity */}
                  <tr className="bg-slate-900 text-white font-bold text-sm">
                    <td className="py-3 px-4 font-sans">Combined Illustrative Opportunity</td>
                    <td className="py-3 px-4 text-slate-200">€{calculateFunnel(scenarios.conservative).combinedOpportunity.toLocaleString()}</td>
                    <td className="py-3 px-4 text-blue-300 bg-slate-800">€{calculateFunnel(scenarios.base).combinedOpportunity.toLocaleString()}</td>
                    <td className="py-3 px-4 text-emerald-300">€{calculateFunnel(scenarios.ambitious).combinedOpportunity.toLocaleString()}</td>
                  </tr>

                  {/* Customer Gross Tax Refund */}
                  <tr className="bg-emerald-50/40 text-emerald-950">
                    <td className="py-3 px-4 font-sans font-bold">Client Gross R&D Tax Cash Injection</td>
                    <td className="py-3 px-4 font-bold">€{calculateFunnel(scenarios.conservative).customerGrossRdBenefit.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-emerald-900 bg-emerald-100/50">€{calculateFunnel(scenarios.base).customerGrossRdBenefit.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold">€{calculateFunnel(scenarios.ambitious).customerGrossRdBenefit.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
              <strong>Comparison Insight:</strong> The Base Case reflects tested conversion benchmarks for Irish corporate practices. The Ambitious scenario represents an aspirational upper bound requiring higher partner discovery capacity.
            </div>
          </CardContent>
        </Card>
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: EXECUTIVE REPORT CANVAS (PRINT / PRESENTATION VIEW)           */}
      {/* ===================================================================== */}
      {activeView === 'executive_report' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 text-slate-800 text-xs leading-relaxed max-w-4xl mx-auto print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                Executive Strategy & Commercial Valuation Canvas
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                SENVO Commercial Practice Opportunity Report
              </h1>
              <p className="text-xs text-slate-500">
                Prepared for: <strong>{clientConfig.clientName}</strong> &bull; {clientConfig.geography}
              </p>
            </div>

            <div className="text-left sm:text-right text-[11px] text-slate-500 space-y-0.5">
              <div>Active Scenario: <strong>{current.name}</strong></div>
              <div>Engagement Lead: <strong>{clientConfig.partnerLead.name}</strong></div>
              <div>Statutory Jurisdiction: <strong>{clientConfig.jurisdiction}</strong></div>
            </div>
          </div>

          {/* 1. Executive Opportunity Statement */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              1. Executive Commercial Valuation
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Based on {current.targetCoveragePct}% coverage across {metrics.totalAddressable} addressable Irish companies, SENVO's multi-channel engagement model generates an estimated <strong>€{metrics.combinedOpportunity.toLocaleString()}</strong> illustrative commercial opportunity for {clientConfig.clientName}.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 font-mono">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-sans font-semibold">Contacted</span>
                <span className="text-lg font-bold text-slate-900">{metrics.contactedEntities}</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-center">
                <span className="text-[10px] text-blue-700 block uppercase font-sans font-semibold">Discovery Calls</span>
                <span className="text-lg font-bold text-blue-900">{metrics.estimatedMeetings}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-700 block uppercase font-sans font-semibold">New Clients</span>
                <span className="text-lg font-bold text-emerald-900">{metrics.estimatedClients}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 text-white text-center">
                <span className="text-[10px] text-blue-300 block uppercase font-sans font-semibold">Total Opportunity</span>
                <span className="text-lg font-bold">€{(metrics.combinedOpportunity / 1000).toFixed(0)}k</span>
              </div>
            </div>
          </div>

          {/* 2. Practice Revenue vs Client Benefit Summary */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
              2. Revenue Streams & Client Value Generation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-2">
                <span className="font-bold text-xs text-slate-900 block">Advisory Firm Income:</span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Recurring Annual Retainers:</span>
                    <span className="font-mono font-bold">€{metrics.recurringAnnualRetainers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Section 766 R&D Success Fees:</span>
                    <span className="font-mono font-bold">€{metrics.rdAdvisoryFeeIncome.toLocaleString()}</span>
                  </div>
                  <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-blue-900">
                    <span>Total Advisory Opportunity:</span>
                    <span className="font-mono">€{metrics.combinedOpportunity.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <span className="font-bold text-xs text-emerald-950 block">Delivered Value to Clients (The Businesses):</span>
                <div className="space-y-1 text-xs text-emerald-950">
                  <div className="flex justify-between">
                    <span>Gross Statutory Tax Credit Refund:</span>
                    <span className="font-mono font-bold">€{metrics.customerGrossRdBenefit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Less Advisory Success Fee:</span>
                    <span className="font-mono text-slate-500">-€{metrics.rdAdvisoryFeeIncome.toLocaleString()}</span>
                  </div>
                  <div className="pt-1 border-t border-emerald-200 flex justify-between font-bold text-emerald-900">
                    <span>Net Client Cash-Flow Benefit:</span>
                    <span className="font-mono">€{metrics.customerNetRdBenefit.toLocaleString()} ({metrics.customerRoiMultiple}:1 ROI)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Disclaimers */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 space-y-1">
            <p>
              <strong>Commercial Realism & Compliance Notice:</strong> This valuation canvas is generated for strategic practice evaluation and partner review. Revenue and client conversion figures are illustrative projections based on configurable conversion parameters. All outbound sequences in demonstration mode operate with simulated delivery safeguards.
            </p>
            <p>
              Certified by SENVO Autonomous Advisory Delivery System &bull; Dublin Practice Hub.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommercialValueModel;
