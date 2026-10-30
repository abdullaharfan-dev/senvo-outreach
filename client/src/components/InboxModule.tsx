import React, { useState, useEffect, useRef } from 'react';
import {
  Inbox,
  Send,
  Sparkles,
  Bot,
  User,
  Building2,
  Mail,
  Linkedin,
  MessageSquare,
  Globe,
  Layers,
  CheckCircle2,
  AlertCircle,
  Award,
  Clock,
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  Zap,
  Shield,
  ShieldCheck,
  HelpCircle,
  PhoneCall,
  XCircle,
  FileText,
  Search,
  Filter,
  Check,
  Compass,
  Briefcase
} from 'lucide-react';
import { api } from '../services/api';
import type { Conversation, Message, AiAssessment, ChannelType } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge, type BadgeVariant } from './ui/Badge';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';
import { EmptyState } from './ui/EmptyState';

interface InboxModuleProps {
  initialConversationId?: string | null;
  onNavigateToQualified: () => void;
}

export const InboxModule: React.FC<InboxModuleProps> = ({
  initialConversationId,
  onNavigateToQualified,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(initialConversationId || null);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [mobileTab, setMobileTab] = useState<'list' | 'chat' | 'details'>(initialConversationId ? 'chat' : 'list');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [replyText, setReplyText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Operational Mode: Autonomous AI SDR vs Human Co-Pilot
  const [operationalMode, setOperationalMode] = useState<'autonomous' | 'copilot'>('autonomous');
  const [simulatingTurn, setSimulatingTurn] = useState<boolean>(false);
  const [reassessing, setReassessing] = useState<boolean>(false);
  const [lastTurnResult, setLastTurnResult] = useState<{
    autoQualified?: boolean;
    error?: string | null;
    message?: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const data = await api.getConversations({
        channel: channelFilter,
        status: statusFilter,
        search,
      });
      setConversations(data);

      if (!selectedConvId && data.length > 0) {
        setSelectedConvId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationDetails = async (id: string) => {
    try {
      const details = await api.getConversationDetails(id);
      setSelectedConv(details);
      if (details.assessments && details.assessments.length > 0 && !replyText) {
        setReplyText(details.assessments[0].suggested_reply || '');
      }
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 4000);
    return () => clearInterval(interval);
  }, [channelFilter, statusFilter, search]);

  useEffect(() => {
    if (initialConversationId) {
      setSelectedConvId(initialConversationId);
      setMobileTab('chat');
    }
  }, [initialConversationId]);

  useEffect(() => {
    if (selectedConvId) {
      loadConversationDetails(selectedConvId);
      setLastTurnResult(null);
    }
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  const handleSendReply = async (isAi: boolean = false, customText?: string) => {
    if (!selectedConvId) return;
    const textToSend = customText || replyText;
    if (!textToSend.trim()) return;

    try {
      setSending(true);
      const updated = await api.sendMessage(selectedConvId, {
        content: textToSend,
        is_ai_generated: isAi,
        sender_name: isAi ? 'SENVO AI Client Advisory' : 'SENVO Team',
      });
      setSelectedConv(updated);
      setReplyText('');
      fetchConversations();
    } catch (err: any) {
      alert(`Send failed: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleSimulateScenario = async (promptContent: string, scenarioLabel: string) => {
    if (!selectedConvId || !selectedConv) return;
    try {
      setSimulatingTurn(true);
      setLastTurnResult(null);

      const res = await api.simulateIncomingReply({
        conversationId: selectedConvId,
        content: promptContent,
        senderName: selectedConv.contact_name || selectedConv.company_name,
        channel: selectedConv.channel,
        auto_respond: operationalMode === 'autonomous',
      });

      setSelectedConv(res.conversation);
      fetchConversations();

      if (res.auto_qualified) {
        setLastTurnResult({
          autoQualified: true,
          message: `Meeting interest detected! Lead ${selectedConv.company_name} was automatically qualified and staged for Bitrix24 CRM handoff.`,
        });
      } else if (res.ai_result?.error) {
        setLastTurnResult({
          error: res.ai_result.error,
          message: `Gemini API response: ${res.ai_result.error}. Inbound turn recorded; staged for manual review.`,
        });
      } else if (operationalMode === 'copilot' && res.ai_result?.data?.suggested_reply) {
        setReplyText(res.ai_result.data.suggested_reply);
        setLastTurnResult({
          message: `Prospect ${scenarioLabel} received. Gemini Co-Pilot prepared recommended reply for review below.`,
        });
      } else {
        setLastTurnResult({
          message: `Turn completed (${scenarioLabel}). Autonomous response dispatched in simulated environment.`,
        });
      }
    } catch (err: any) {
      setLastTurnResult({
        error: err.message,
        message: `Simulation error: ${err.message}`,
      });
    } finally {
      setSimulatingTurn(false);
    }
  };

  const handleRegenerateAssessment = async () => {
    if (!selectedConvId) return;
    try {
      setReassessing(true);
      const res = await api.reassessConversation(selectedConvId);
      if (res.success && res.conversation) {
        setSelectedConv(res.conversation);
        if (res.assessment?.suggested_reply) {
          setReplyText(res.assessment.suggested_reply);
        }
      } else {
        alert(res.error || 'Failed to regenerate AI assessment.');
      }
    } catch (err: any) {
      alert(`Re-assessment failed: ${err.message}`);
    } finally {
      setReassessing(false);
    }
  };

  const handleQualifyLead = async () => {
    if (!selectedConv) return;
    const latestAi = selectedConv.assessments?.[0];

    try {
      await api.qualifyLead({
        leadId: selectedConv.lead_id,
        requested_service: latestAi?.requested_service || 'Corporate Services & Statutory Accounting',
        qualification_summary: latestAi?.summary || 'Qualified corporate lead requiring discovery consultation.',
        assigned_owner: 'Senior Client Partner (Dublin Practice)',
        next_action: latestAi?.suggested_next_action || 'Schedule discovery consultation call',
      });
      alert(`Lead ${selectedConv.company_name} successfully qualified and staged for Bitrix24 CRM handoff!`);
      onNavigateToQualified();
    } catch (err: any) {
      alert(`Qualification failed: ${err.message}`);
    }
  };

  const getChannelIcon = (c: ChannelType) => {
    switch (c) {
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-blue-600" />;
      case 'linkedin':
        return <Linkedin className="w-3.5 h-3.5 text-sky-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'website':
        return <Globe className="w-3.5 h-3.5 text-purple-600" />;
      case 'facebook':
        return <Layers className="w-3.5 h-3.5 text-blue-500" />;
      case 'instagram':
        return <Layers className="w-3.5 h-3.5 text-pink-600" />;
      case 'sms':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getChannelBadgeVariant = (c: ChannelType): BadgeVariant => {
    switch (c) {
      case 'email':
        return 'primary';
      case 'linkedin':
        return 'info';
      case 'whatsapp':
        return 'success';
      case 'website':
        return 'purple';
      case 'sms':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const getIntentBadgeVariant = (intent?: string): BadgeVariant => {
    if (!intent) return 'neutral';
    if (intent.includes('meeting') || intent.includes('demo')) return 'success';
    if (intent.includes('pricing') || intent.includes('scope')) return 'info';
    if (intent.includes('objection')) return 'purple';
    if (intent.includes('decline')) return 'danger';
    return 'primary';
  };

  const latestAssessment = selectedConv?.assessments?.[0];
  const isLeadHandedOff = selectedConv?.status === 'handed_off';

  // Preset multi-turn scenarios tailored to Ireland corporate advisory practice
  const scenarios = [
    {
      id: 'eligibility',
      label: 'Eligibility: Sec 358 Audit Exemption',
      icon: <HelpCircle className="w-3.5 h-3.5 text-blue-600" />,
      prompt: `Our turnover was €6.8M with 34 staff in Galway. Under Section 358 of the Companies Act 2014, do we legally qualify to dispense with our annual statutory audit?`,
    },
    {
      id: 'pricing',
      label: 'Pricing Objection: Fixed Fee vs Hourly',
      icon: <Zap className="w-3.5 h-3.5 text-amber-600" />,
      prompt: `Our current legal and accounting advisors bill €250/hour for every basic compliance phone call. How does SENVO structure retainer fees for corporate secretarial governance?`,
    },
    {
      id: 'rd_tax',
      label: 'Service: Sec 766 R&D Credit Scope',
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-600" />,
      prompt: `We spent €140k on proprietary software and sensor engineering. How does your practice substantiate the 30% R&D tax credit claim to prevent Revenue audit clawbacks?`,
    },
    {
      id: 'competitor',
      label: 'Competitor: Big 4 vs SENVO Advisory',
      icon: <Shield className="w-3.5 h-3.5 text-indigo-600" />,
      prompt: `We have used a mid-tier accounting practice in Dublin 2 for years. Why should our board transition our statutory compliance and annual filings to SENVO?`,
    },
    {
      id: 'meeting',
      label: 'Meeting Interest: 20-Min Zoom Call',
      icon: <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />,
      prompt: `The Section 358 audit exemption and Postponed VAT Accounting are both very relevant for our board. I am free Thursday at 2:30 PM for a 20-minute Zoom call with Declan. Does that work?`,
    },
    {
      id: 'handoff',
      label: 'Partner Handoff: Scope Confirmation',
      icon: <Award className="w-3.5 h-3.5 text-emerald-700" />,
      prompt: `Please send the formal engagement letter and onboarding checklist for Senior Partner Declan O'Sullivan to review with our Finance Director.`,
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Top Channel Bar */}
      <div className="bg-white border-b border-slate-200/90 px-3 sm:px-6 py-2.5 flex items-center justify-between shrink-0 gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium no-scrollbar">
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'email', label: 'Email / Outlook' },
            { id: 'linkedin', label: 'LinkedIn' },
            { id: 'whatsapp', label: 'WhatsApp' },
            { id: 'website', label: 'Website Inquiries' },
            { id: 'facebook', label: 'Facebook' },
            { id: 'instagram', label: 'Instagram' },
            { id: 'sms', label: 'SMS' },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setChannelFilter(ch.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-150 cursor-pointer font-medium ${
                channelFilter === ch.id
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Mobile View Switcher */}
        <div className="lg:hidden flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg shrink-0 text-xs border border-slate-200/60">
          <button
            onClick={() => setMobileTab('list')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
              mobileTab === 'list' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
            }`}
          >
            Threads
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
              mobileTab === 'chat' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setMobileTab('details')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
              mobileTab === 'details' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
            }`}
          >
            AI Copilot
          </button>
        </div>

        {/* Desktop Status Notice */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 font-medium whitespace-nowrap shrink-0">
          <Badge variant="success" dot size="sm">
            Sandbox Simulation Active
          </Badge>
          <div className="text-slate-600 text-xs">
            <span>Conversations: </span>
            <span className="font-bold text-slate-900 tabular-nums">{conversations.length}</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Conversation List */}
        <div
          className={`w-full lg:w-80 xl:w-96 bg-white border-r border-slate-200/90 flex flex-col shrink-0 ${
            mobileTab === 'list' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Search & Filter Header */}
          <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/60 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prospect, contact, city..."
                className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
              <span className="font-medium text-slate-600">Filter Status:</span>
              <div className="flex items-center gap-1 font-medium">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('review_needed')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    statusFilter === 'review_needed'
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Review
                </button>
                <button
                  onClick={() => setStatusFilter('handed_off')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    statusFilter === 'handed_off'
                      ? 'bg-emerald-100 text-emerald-900 font-bold'
                      : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Qualified
                </button>
              </div>
            </div>
          </div>

          {/* Conversation List Stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No conversations found"
                description="Try clearing your filters or send outreach from the Campaigns module."
                className="py-12"
              />
            ) : (
              conversations.map((c) => {
                const isSelected = selectedConvId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedConvId(c.id);
                      setReplyText('');
                      setMobileTab('chat');
                    }}
                    className={`p-3.5 transition-all duration-150 cursor-pointer border-l-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-blue-600 shadow-2xs'
                        : 'border-l-transparent hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="p-1 rounded-md bg-white border border-slate-200/80 shadow-2xs shrink-0">
                          {getChannelIcon(c.channel)}
                        </span>
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {c.company_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap tabular-nums">
                        {new Date(c.last_message_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 truncate mb-1 font-medium flex items-center justify-between">
                      <span className="truncate">{c.contact_name || 'Managing Director'}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 capitalize">{c.city}</span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {c.last_message || '(No messages yet)'}
                    </p>

                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      {c.latest_intent && (
                        <Badge variant={getIntentBadgeVariant(c.latest_intent)} size="xs">
                          {c.latest_intent.replace(/_/g, ' ')}
                        </Badge>
                      )}
                      {c.status === 'review_needed' && (
                        <Badge variant="warning" size="xs">
                          Review Needed
                        </Badge>
                      )}
                      {c.status === 'handed_off' && (
                        <Badge variant="success" size="xs">
                          Qualified / Handed Off
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center Column: Message Thread & Composer */}
        <div
          className={`flex-1 flex flex-col bg-slate-50/60 overflow-hidden ${
            mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {selectedConv ? (
            <>
              {/* Thread Header with Operational Mode Switcher */}
              <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-200/90 flex flex-wrap items-center justify-between shrink-0 shadow-2xs gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <button
                    onClick={() => setMobileTab('list')}
                    className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0 cursor-pointer flex items-center gap-0.5 text-xs font-semibold"
                    title="Back to Conversations"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Threads</span>
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 shadow-2xs">
                    {getChannelIcon(selectedConv.channel)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {selectedConv.company_name}
                      </h3>
                      <Badge variant={getChannelBadgeVariant(selectedConv.channel)} size="xs">
                        {selectedConv.channel.toUpperCase()}
                      </Badge>
                      {isLeadHandedOff && (
                        <Badge variant="success" size="xs">
                          CRM Staged
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {selectedConv.contact_name || 'Managing Director'} • {selectedConv.city}, Ireland
                    </p>
                  </div>
                </div>

                {/* Operating Mode Pill Switcher */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs shadow-2xs">
                    <button
                      onClick={() => setOperationalMode('autonomous')}
                      className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationalMode === 'autonomous'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Autonomous AI SDR: Replies automatically & auto-qualifies meeting requests"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Autonomous AI SDR</span>
                    </button>
                    <button
                      onClick={() => setOperationalMode('copilot')}
                      className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationalMode === 'copilot'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Human Co-Pilot: Prepares draft suggestions in Copilot panel for manual review"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Human Co-Pilot</span>
                    </button>
                  </div>

                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setMobileTab('details')}
                    className="lg:hidden"
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-600" />}
                  >
                    Copilot
                  </Button>
                </div>
              </div>

              {/* Multi-Turn Scenario Test Bar */}
              <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 sm:px-6 py-2.5 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      Simulate Prospect Inbound Turn (
                      {operationalMode === 'autonomous' ? 'AI SDR Auto-Responds' : 'Co-Pilot Stages Draft'}
                      ):
                    </span>
                  </div>
                  {simulatingTurn && (
                    <span className="text-xs text-blue-600 font-medium flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      Processing scenario turn...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                  {scenarios.map((sc) => (
                    <button
                      key={sc.id}
                      disabled={simulatingTurn}
                      onClick={() => handleSimulateScenario(sc.prompt, sc.label)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50/80 border border-slate-200 text-slate-700 font-medium whitespace-nowrap shadow-2xs hover:border-blue-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-[11px]"
                    >
                      {sc.icon}
                      <span>{sc.label}</span>
                    </button>
                  ))}
                  <button
                    disabled={simulatingTurn}
                    onClick={() => {
                      const custom = window.prompt('Enter simulated prospect inbound message:');
                      if (custom) handleSimulateScenario(custom, 'Custom Inbound');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-medium whitespace-nowrap text-[11px] cursor-pointer shadow-2xs"
                  >
                    + Custom Inbound...
                  </button>
                </div>
              </div>

              {/* Status Notice Banner if Turn Completed */}
              {lastTurnResult && (
                <div
                  className={`px-4 sm:px-6 py-2.5 text-xs flex items-center justify-between shrink-0 border-b ${
                    lastTurnResult.autoQualified
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      : lastTurnResult.error
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {lastTurnResult.autoQualified ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : lastTurnResult.error ? (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                    <span className="font-medium leading-relaxed">{lastTurnResult.message}</span>
                  </div>

                  {lastTurnResult.autoQualified && (
                    <button
                      onClick={onNavigateToQualified}
                      className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer shrink-0 ml-3"
                    >
                      View in Qualified Leads &rarr;
                    </button>
                  )}
                </div>
              )}

              {/* Message Bubble History Stream */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                {selectedConv.messages?.map((msg) => {
                  const isInbound = msg.direction === 'inbound';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        {isInbound ? (
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {msg.sender_name}
                          </span>
                        ) : (
                          <span className="font-semibold text-blue-700 flex items-center gap-1">
                            {msg.is_ai_generated ? (
                              <>
                                <Bot className="w-3 h-3 text-blue-600" />
                                <span>SENVO AI Client Advisory (Simulated)</span>
                              </>
                            ) : (
                              <>
                                <User className="w-3 h-3 text-slate-600" />
                                <span>SENVO Advisory Team (Manual)</span>
                              </>
                            )}
                          </span>
                        )}
                        <span>•</span>
                        <span className="tabular-nums">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[88%] sm:max-w-lg p-3.5 sm:p-4 rounded-2xl text-xs leading-relaxed font-sans shadow-card whitespace-pre-line ${
                          isInbound
                            ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                            : msg.is_ai_generated
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-blue-500/10'
                            : 'bg-slate-900 text-white rounded-tr-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Outbound Response Composer */}
              <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Manual Response Composer</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Outbound Channel: {selectedConv.channel}
                    </span>
                  </div>
                  {latestAssessment?.suggested_reply && (
                    <button
                      onClick={() => setReplyText(latestAssessment.suggested_reply)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Insert AI Copilot Draft</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type an outbound corporate response to dispatch to prospect..."
                    className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans pb-11 sm:pb-3 sm:pr-32 shadow-2xs"
                  />
                  <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={sending}
                      disabled={!replyText.trim()}
                      onClick={() => handleSendReply(false)}
                      leftIcon={<Send className="w-3 h-3" />}
                    >
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon={Inbox}
              title="Select a Conversation"
              description="Choose a prospect from the left thread list to view conversation history and qualification intelligence."
              className="m-auto"
            />
          )}
        </div>

        {/* Right Column: AI Reply Co-Pilot & Lead Intelligence Panel */}
        <div
          className={`w-full lg:w-80 xl:w-96 bg-white border-l border-slate-200 overflow-y-auto p-4 sm:p-5 space-y-4 shrink-0 ${
            mobileTab === 'details' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Mobile Back Button */}
          <div className="lg:hidden pb-3 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setMobileTab('chat')}
              className="p-1 -ml-1 text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Thread</span>
            </button>
            <span className="text-[10px] uppercase font-bold text-slate-400">AI Reply Co-Pilot</span>
          </div>

          {selectedConv && (
            <>
              {/* Prospect Profile Header Card */}
              <Card className="border-slate-200/90 shadow-2xs">
                <CardHeader className="py-3 px-4 border-b border-slate-100">
                  <CardTitle className="text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Prospect Profile</span>
                  </CardTitle>
                  <Badge variant="primary" size="xs">
                    {selectedConv.priority} Priority
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Entity</span>
                    <span className="font-bold text-slate-900 text-xs">{selectedConv.company_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Primary Contact</span>
                    <span className="text-slate-700 font-medium">
                      {selectedConv.contact_name || 'Managing Director'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Sector & Region</span>
                    <span className="text-slate-600">
                      {selectedConv.industry} • {selectedConv.city}, Ireland
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Reply Co-Pilot Panel */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI Reply Co-Pilot</span>
                  </div>
                  <Badge
                    variant={operationalMode === 'autonomous' ? 'primary' : 'purple'}
                    size="xs"
                  >
                    {operationalMode === 'autonomous' ? 'Autonomous Mode' : 'Human Review Mode'}
                  </Badge>
                </div>

                {latestAssessment ? (
                  <Card className="border-blue-200/80 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 shadow-2xs">
                    <CardContent className="p-4 space-y-3">
                      {/* Intent & Confidence Meter */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium text-[11px]">
                            Intent: <strong className="text-blue-900 capitalize">{latestAssessment.intent.replace(/_/g, ' ')}</strong>
                          </span>
                          <span className="text-emerald-700 font-bold text-[11px] tabular-nums">
                            {(latestAssessment.confidence * 100).toFixed(0)}% Match
                          </span>
                        </div>
                        <ProgressBar
                          value={latestAssessment.confidence * 100}
                          color="emerald"
                          size="sm"
                        />
                      </div>

                      {/* Requested Service Line & Approved Knowledge Grounding */}
                      <div className="text-[11px] space-y-1">
                        <div>
                          <span className="text-slate-500 font-medium">Service Line: </span>
                          <span className="font-semibold text-slate-800">
                            {latestAssessment.requested_service}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate">Grounding: Approved Irish Statutory Knowledge Base</span>
                        </div>
                      </div>

                      {/* Conversation Summary Box */}
                      <div className="text-xs bg-white/90 p-3 rounded-lg border border-blue-100/90 leading-relaxed text-slate-700 shadow-2xs">
                        <span className="font-bold text-slate-900 block mb-0.5 text-[11px]">
                          Executive Context Summary:
                        </span>
                        {latestAssessment.summary}
                      </div>

                      {/* Qualification Criteria Checklist */}
                      <div className="bg-slate-50/90 p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1.5">
                        <span className="font-bold text-slate-800 text-[10px] uppercase tracking-wider block">
                          Qualification Criteria Checklist:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          <span className="flex items-center gap-1 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>C-Suite Identified</span>
                          </span>
                          <span className="flex items-center gap-1 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Irish Legal Nexus</span>
                          </span>
                          <span className="flex items-center gap-1 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Scope Validated</span>
                          </span>
                          <span className="flex items-center gap-1 text-emerald-800 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Intent Confirmed</span>
                          </span>
                        </div>
                      </div>

                      {/* Recommended Next Action */}
                      <div className="text-xs bg-blue-100/70 p-3 rounded-lg border border-blue-200/70 leading-relaxed text-blue-950 shadow-2xs">
                        <span className="font-bold text-blue-900 block mb-0.5 text-[11px]">
                          Recommended Next Action:
                        </span>
                        {latestAssessment.suggested_next_action}
                      </div>

                      {/* Suggested Response Draft */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700 text-[11px]">
                            Suggested Response Draft:
                          </span>
                          <button
                            onClick={handleRegenerateAssessment}
                            disabled={reassessing}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                          >
                            <RotateCcw className={`w-3 h-3 ${reassessing ? 'animate-spin' : ''}`} />
                            <span>Regenerate</span>
                          </button>
                        </div>

                        <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed font-sans italic shadow-2xs">
                          "{latestAssessment.suggested_reply}"
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2 pt-1.5">
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setReplyText(latestAssessment.suggested_reply)}
                            className="flex-1"
                          >
                            Load to Composer
                          </Button>
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={async () => {
                              await handleSendReply(true, latestAssessment.suggested_reply);
                            }}
                            className="flex-1"
                          >
                            Send as AI Reply
                          </Button>
                        </div>
                      </div>

                      {/* Lead Qualification & CRM Handoff CTA */}
                      <div className="pt-2.5 border-t border-blue-200/80">
                        {isLeadHandedOff ? (
                          <div className="p-2.5 rounded-lg bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Staged for Bitrix24 Handoff</span>
                            </span>
                            <button
                              onClick={onNavigateToQualified}
                              className="text-emerald-800 underline text-[11px] cursor-pointer font-bold"
                            >
                              View &rarr;
                            </button>
                          </div>
                        ) : (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={handleQualifyLead}
                            className="w-full"
                            leftIcon={<Award className="w-3.5 h-3.5" />}
                          >
                            Stage for Senior Partner Declan O'Sullivan
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-slate-200/90 bg-slate-50/50 p-5 text-center text-xs space-y-2">
                    <Bot className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-700">Awaiting Inbound Prospect Message</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Use the scenario test buttons above to simulate prospect turns (e.g. Scope, Pricing, Objection, Meeting Request). SENVO AI Copilot will classify intent and prepare follow-ups grounded in approved Irish corporate policies.
                    </p>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxModule;
