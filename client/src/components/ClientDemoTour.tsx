import React, { useState, useEffect } from 'react';
import {
  Compass,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Building2,
  Users,
  Send,
  MessageSquare,
  Award,
  Database,
  BarChart3,
  Layers,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import type { ModuleType } from './Sidebar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface TourStep {
  module: ModuleType;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  highlights: string[];
  callToAction: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    module: 'overview',
    title: 'Executive Dashboard & Operations Desk',
    badge: 'Step 1 of 8',
    icon: Building2,
    description:
      'High-level operational cockpit aggregating real-time outreach pipeline telemetry from Supabase PostgreSQL (senvo_outreach schema).',
    highlights: [
      'Executive KPI cards with live conversion ratios & pipeline value',
      'Priority Action Desk flagging inbound prospect turns requiring advisory review',
      'End-to-end conversion funnel & categorized practice audit logs',
      'Sandbox safety indicator confirming 100% simulated delivery'
    ],
    callToAction: 'Inspect priority action replies and live database metrics.'
  },
  {
    module: 'leads',
    title: 'Lead Intelligence & Prospect Directory',
    badge: 'Step 2 of 8',
    icon: Users,
    description:
      'Structured directory of verified Irish corporate prospects categorized by ICP fit score, channel eligibility, and statutory filing readiness.',
    highlights: [
      'Computed ICP Fit Score (40–100%) based on Irish B2B corporate criteria',
      'Multi-select checkboxes with floating batch action ribbon for instant campaign staging',
      'Company Intelligence Brief with decision-maker profile and CRO status',
      'Guided 4-Step Import Wizard supporting .CSV and .XLSX workbooks'
    ],
    callToAction: 'Click any prospect in the table to inspect their Company Intelligence Brief.'
  },
  {
    module: 'campaigns',
    title: 'Campaign Orchestration & Dispatch Monitor',
    badge: 'Step 3 of 8',
    icon: Send,
    description:
      'Multi-channel outreach execution engine tracking recipient delivery status live from persistent database tables.',
    highlights: [
      'Real-time execution monitor with live progress bars and recipient audit logs',
      'Approved practice copy with dynamic personalization tokens ({CONTACT_NAME}, {BUSINESS_NAME}, {CITY})',
      'Multi-touch sequence previews (Touch 1, Touch 2, Touch 3, LinkedIn variations)',
      'Strict simulation safeguard: all dispatches execute in simulated delivery mode'
    ],
    callToAction: 'View live recipient audit logs or open the Campaign Builder.'
  },
  {
    module: 'inbox',
    title: 'Unified Communication Inbox & AI SDR',
    badge: 'Step 4 of 8',
    icon: MessageSquare,
    description:
      '3-panel communication hub unifying inquiries across 7 channels with dual operating modes: Autonomous AI SDR and Human Co-Pilot.',
    highlights: [
      'Dual operational modes: Autonomous AI SDR vs. Human Co-Pilot review',
      'Client-specific scenario simulations (Audit Exemption, R&D Credit, Pricing, Zoom Call)',
      'AI Reply Copilot with confidence matching, context summary, and suggested drafts',
      'Honest Gemini AI fallback: transparent diagnostics without fabricating simulated replies'
    ],
    callToAction: 'Click any scenario chip (e.g. "Request 20-Min Zoom Call") to test real-time AI triage.'
  },
  {
    module: 'qualified',
    title: 'Qualified Leads & Meeting Conversion',
    badge: 'Step 5 of 8',
    icon: Award,
    description:
      'High-intent Irish corporate opportunities staged for senior partner discovery consultations and Bitrix24 CRM synchronization.',
    highlights: [
      'Meeting Conversion Workspace with verified prospect requirements',
      'Suggested 3-point statutory discovery call meeting agenda',
      'Structured evaluation criteria explaining why each prospect is qualified',
      'Bitrix24 REST API staged payload viewer (crm.lead.add schema)'
    ],
    callToAction: 'Review staged meeting agendas and inspect the Bitrix24 JSON schema.'
  },
  {
    module: 'analytics',
    title: 'Performance & Conversion Analytics',
    badge: 'Step 6 of 8',
    icon: BarChart3,
    description:
      'Executive business intelligence workspace displaying monotonic conversion funnels, campaign comparisons, and actionable insights.',
    highlights: [
      'Executive performance overview (Contacted, Responses, Positive Intent, Objections, Handoffs)',
      'Lead-quality distribution across 4 weighted ICP scoring tiers',
      'Cross-campaign delivery and response comparison table',
      'Evidence-based actionable recommendations grounded in database records'
    ],
    callToAction: 'Explore the conversion funnel and campaign comparison table.'
  },
  {
    module: 'value_center',
    title: 'Client Value Center (Presentation Workspace)',
    badge: 'Step 7 of 8',
    icon: Sparkles,
    description:
      'Dedicated client-facing presentation workspace featuring targeted Irish business opportunities, personalized campaign previews, 7 interactive AI scenarios, and a 30-day onboarding plan.',
    highlights: [
      'Module A: Target segments & business opportunities with verified facts vs inferred opportunities',
      'Module B: Personalized campaign previews across first-touch and multi-touch follow-ups',
      'Module C: Interactive AI conversation showcase with 7 realistic prospect engagement dialogues',
      'Module D: Editable 30-day implementation plan with task status tracking',
      'Module E: Comprehensive client-facing report with print & PDF export support'
    ],
    callToAction: 'Review target segments, preview personalized sequence copy, or print the Client Value Report.'
  },
  {
    module: 'integrations',
    title: 'Connected Accounts & Honest Gateway Setup',
    badge: 'Step 8 of 8',
    icon: Layers,
    description:
      'Enterprise communication channels across 8 platforms with transparent distinction between simulated sandbox accounts and live OAuth.',
    highlights: [
      'Supported channels: Microsoft 365, LinkedIn, WhatsApp Business, Website Webhooks, SMS, and Bitrix24',
      'Honest integration status policy: clearly labels sandbox adapters vs. production connectors',
      'Interactive loopback connection testing with gateway latency probes',
      'Bitrix24 CRM REST API Webhook Gateway card with verified field mappings'
    ],
    callToAction: 'Test a sandbox connector or review the Bitrix24 REST webhook configuration.'
  }
];

interface ClientDemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: ModuleType) => void;
  currentModule: ModuleType;
}

export const ClientDemoTour: React.FC<ClientDemoTourProps> = ({
  isOpen,
  onClose,
  onNavigate,
  currentModule
}) => {
  const [stepIndex, setStepIndex] = useState<number>(0);

  // Sync step with module if user manually opened tour
  useEffect(() => {
    if (isOpen) {
      const matchIdx = TOUR_STEPS.findIndex((s) => s.module === currentModule);
      if (matchIdx !== -1) {
        setStepIndex(matchIdx);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[stepIndex];
  const StepIcon = currentStep.icon;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('senvo_demo_tour_completed', 'true');
      onClose();
    } else {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      onNavigate(TOUR_STEPS[nextIdx].module);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIdx = stepIndex - 1;
      setStepIndex(prevIdx);
      onNavigate(TOUR_STEPS[prevIdx].module);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('senvo_demo_tour_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Interactive Product Tour</h3>
              <p className="text-[11px] text-slate-400">SENVO Outreach B2B Sales Intelligence Demonstration</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="primary" size="xs">
              {currentStep.badge}
            </Badge>
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              title="Close Tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs mt-0.5">
              <StepIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 leading-tight">
                {currentStep.title}
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Highlights Box */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-2">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              Key Capabilities Implemented:
            </span>
            <ul className="space-y-1.5">
              {currentStep.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Call to action guidance */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-950 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">
              <strong>Live Walkthrough Suggestion:</strong> {currentStep.callToAction}
            </span>
          </div>
        </div>

        {/* Footer Controls */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={handleSkip}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
          >
            Skip Walkthrough
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isFirst}
              onClick={handlePrev}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              rightIcon={isLast ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            >
              {isLast ? 'Complete Tour' : 'Next Step'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDemoTour;
