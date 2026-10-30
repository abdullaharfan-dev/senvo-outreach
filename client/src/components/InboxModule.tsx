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
  HelpCircle,
  PhoneCall,
  XCircle,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import type { Conversation, Message, AiAssessment, ChannelType } from '../types';

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
          message: `Gemini API quota reached (${res.ai_result.error}). Inbound turn recorded; staged for human review.`,
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

  const latestAssessment = selectedConv?.assessments?.[0];
  const isLeadHandedOff = selectedConv?.status === 'handed_off';

  // Preset multi-turn scenarios tailored to Ireland corporate advisory
  const scenarios = [
    {
      id: 'scope',
      label: 'Ask Scope Details',
      icon: <HelpCircle className="w-3 h-3 text-blue-600" />,
      prompt: `Could you clarify what is included in your statutory audit, annual return filings, and corporate tax compliance advisory packages?`,
    },
    {
      id: 'pricing',
      label: 'Ask Pricing & Fees',
      icon: <Zap className="w-3 h-3 text-amber-600" />,
      prompt: `What are your fee guidelines or retainer models for ongoing Irish bookkeeping, payroll, and bi-monthly VAT compliance?`,
    },
    {
      id: 'objection',
      label: 'Raise Objection',
      icon: <Shield className="w-3 h-3 text-purple-600" />,
      prompt: `We already work with an established local accounting firm in Cork. Why should we consider transitioning our corporate compliance to SENVO?`,
    },
    {
      id: 'meeting',
      label: 'Request Meeting / Demo',
      icon: <PhoneCall className="w-3 h-3 text-emerald-600" />,
      prompt: `Sounds very relevant to our expansion plans. Are you available for a 20-minute Zoom introductory call this Thursday afternoon to discuss?`,
    },
    {
      id: 'decline',
      label: 'Decline / Not Now',
      icon: <XCircle className="w-3 h-3 text-rose-500" />,
      prompt: `Thank you for reaching out, but our corporate board is not evaluating external advisory or audit firms at this time.`,
    },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-50">
      {/* Top Channel Bar */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between shrink-0 gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
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
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                channelFilter === ch.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Mobile View Switcher */}
        <div className="lg:hidden flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg shrink-0 text-xs">
          <button
            onClick={() => setMobileTab('list')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
              mobileTab === 'list' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Threads
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
              mobileTab === 'chat' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setMobileTab('details')}
            className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
              mobileTab === 'details' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
            }`}
          >
            AI Copilot
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 font-medium whitespace-nowrap shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Sandbox Simulation Active</span>
          </div>
          <div>
            <span>Active Threads: </span>
            <span className="font-bold text-slate-800">{conversations.length}</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Inbox Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Conversation List */}
        <div className={`w-full lg:w-80 xl:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 ${mobileTab === 'list' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="p-3 border-b border-slate-200 bg-slate-50/50 space-y-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by company, decision maker..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Filter Status:</span>
              <div className="flex items-center gap-1 font-medium">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${statusFilter === 'all' ? 'bg-slate-200 text-slate-900 font-bold' : 'hover:bg-slate-100'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter('review_needed')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${statusFilter === 'review_needed' ? 'bg-amber-100 text-amber-900 font-bold' : 'hover:bg-slate-100'}`}
                >
                  Review
                </button>
                <button
                  onClick={() => setStatusFilter('handed_off')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${statusFilter === 'handed_off' ? 'bg-emerald-100 text-emerald-900 font-bold' : 'hover:bg-slate-100'}`}
                >
                  Qualified
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No conversations match criteria.</div>
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
                    className={`p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        {getChannelIcon(c.channel)}
                        <span className="font-bold text-slate-900 text-xs truncate">
                          {c.company_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {new Date(c.last_message_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 truncate mb-1.5 font-medium">
                      {c.contact_name || 'Managing Director'}
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {c.last_message || '(No messages yet)'}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                      {c.latest_intent && (
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 truncate capitalize">
                          {c.latest_intent.replace(/_/g, ' ')}
                        </span>
                      )}
                      {c.status === 'review_needed' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Review Needed
                        </span>
                      )}
                      {c.status === 'handed_off' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Qualified / Handed Off
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center: Message Thread & Composer */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 overflow-hidden ${mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
          {selectedConv ? (
            <>
              {/* Thread Header with Mode Switcher */}
              <div className="px-3 sm:px-6 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between shrink-0 shadow-2xs gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <button
                    onClick={() => setMobileTab('list')}
                    className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0 cursor-pointer flex items-center gap-0.5 text-xs font-semibold"
                    title="Back to Conversations"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Threads</span>
                  </button>

                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    {getChannelIcon(selectedConv.channel)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {selectedConv.company_name}
                      </h3>
                      <span className="text-[9px] sm:text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                        {selectedConv.channel}
                      </span>
                      {isLeadHandedOff && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>CRM Staged</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                      {selectedConv.contact_name} • {selectedConv.city}, Ireland
                    </p>
                  </div>
                </div>

                {/* Operating Mode Selector Pill */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      onClick={() => setOperationalMode('autonomous')}
                      className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationalMode === 'autonomous'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Autonomous AI SDR: AI replies automatically and auto-qualifies meeting requests"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Autonomous SDR</span>
                    </button>
                    <button
                      onClick={() => setOperationalMode('copilot')}
                      className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        operationalMode === 'copilot'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Human Co-Pilot: AI prepares draft suggestions in Copilot panel for manual review"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Human Co-Pilot</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setMobileTab('details')}
                    className="lg:hidden px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Copilot</span>
                  </button>
                </div>
              </div>

              {/* Multi-Turn Scenario Test Bar */}
              <div className="bg-slate-100/90 border-b border-slate-200 px-3 sm:px-6 py-2 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Simulate Prospect Turn ({operationalMode === 'autonomous' ? 'Autonomous SDR Responds' : 'Co-Pilot Stages Draft'}):</span>
                  </div>
                  {simulatingTurn && (
                    <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 animate-pulse">
                      <Clock className="w-3 h-3" />
                      Processing scenario turn...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {scenarios.map((sc) => (
                    <button
                      key={sc.id}
                      disabled={simulatingTurn}
                      onClick={() => handleSimulateScenario(sc.prompt, sc.label)}
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 font-medium whitespace-nowrap shadow-2xs hover:border-blue-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-[11px]"
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
                    className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-medium whitespace-nowrap text-[11px] cursor-pointer"
                  >
                    + Custom Turn...
                  </button>
                </div>
              </div>

              {/* Status Notice Banner if Turn Completed */}
              {lastTurnResult && (
                <div
                  className={`px-4 py-2 text-xs flex items-center justify-between shrink-0 ${
                    lastTurnResult.autoQualified
                      ? 'bg-emerald-50 text-emerald-900 border-b border-emerald-200'
                      : lastTurnResult.error
                      ? 'bg-amber-50 text-amber-900 border-b border-amber-200'
                      : 'bg-blue-50 text-blue-900 border-b border-blue-200'
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
                    <span className="font-medium">{lastTurnResult.message}</span>
                  </div>

                  {lastTurnResult.autoQualified && (
                    <button
                      onClick={onNavigateToQualified}
                      className="text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer shrink-0 ml-2"
                    >
                      View in Qualified Leads &rarr;
                    </button>
                  )}
                </div>
              )}

              {/* Message History Bubble Stream */}
              <div className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4">
                {selectedConv.messages?.map((msg) => {
                  const isInbound = msg.direction === 'inbound';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        {isInbound ? (
                          <span className="font-semibold text-slate-700">{msg.sender_name}</span>
                        ) : (
                          <span className="font-semibold text-blue-700 flex items-center gap-1">
                            {msg.is_ai_generated ? (
                              <>
                                <Bot className="w-3 h-3 text-blue-600" />
                                <span>SENVO AI Client Advisory (Simulated)</span>
                              </>
                            ) : (
                              <span>SENVO Advisory Team (Manual)</span>
                            )}
                          </span>
                        )}
                        <span>•</span>
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[88%] sm:max-w-lg p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-2xs whitespace-pre-line ${
                          isInbound
                            ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                            : msg.is_ai_generated
                            ? 'bg-blue-600 text-white rounded-tr-xs shadow-blue-500/10'
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

              {/* Outbound Reply Composer */}
              <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Manual Response Composer</span>
                    <span className="text-[10px] text-slate-400 font-mono">Channel: {selectedConv.channel}</span>
                  </div>
                  {latestAssessment?.suggested_reply && (
                    <button
                      onClick={() => setReplyText(latestAssessment.suggested_reply)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1 cursor-pointer"
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
                    placeholder="Type an outbound response to dispatch to prospect..."
                    className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans pb-11 sm:pb-3 sm:pr-32"
                  />
                  <div className="absolute right-2 bottom-2.5 flex items-center gap-1.5">
                    <button
                      onClick={() => handleSendReply(false)}
                      disabled={sending || !replyText.trim()}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{sending ? 'Sending...' : 'Send Reply'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs p-6 text-center">
              Select a conversation to view thread history and qualification analysis.
            </div>
          )}
        </div>

        {/* Right: AI Reply Co-Pilot & Lead Intelligence Panel */}
        <div className={`w-full lg:w-80 xl:w-96 bg-white border-l border-slate-200 overflow-y-auto p-4 sm:p-5 space-y-4 shrink-0 ${mobileTab === 'details' ? 'block' : 'hidden lg:block'}`}>
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
              {/* Prospect Profile Header */}
              <div className="space-y-3 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Prospect Profile</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {selectedConv.priority} Priority
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Entity</span>
                    <span className="font-bold text-slate-800">{selectedConv.company_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Contact</span>
                    <span className="text-slate-700 font-medium">
                      {selectedConv.contact_name || 'Managing Director'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-semibold">Sector & Region</span>
                    <span className="text-slate-700">{selectedConv.industry} • {selectedConv.city}, Ireland</span>
                  </div>
                </div>
              </div>

              {/* AI Reply Co-Pilot Panel */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>AI Reply Co-Pilot</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    operationalMode === 'autonomous' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {operationalMode === 'autonomous' ? 'Autonomous Mode' : 'Human Review Mode'}
                  </span>
                </div>

                {latestAssessment ? (
                  <div className="space-y-3 p-3.5 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200 shadow-2xs">
                    {/* Intent & Confidence */}
                    <div className="flex items-center justify-between">
                      <div className="text-[11px]">
                        <span className="text-slate-500 font-medium">Intent: </span>
                        <span className="font-bold text-blue-900 capitalize">
                          {latestAssessment.intent.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {(latestAssessment.confidence * 100).toFixed(0)}% Match
                      </span>
                    </div>

                    {/* Requested Service Line */}
                    <div className="text-[11px]">
                      <span className="text-slate-500 font-medium">Service Line: </span>
                      <span className="font-semibold text-slate-800">
                        {latestAssessment.requested_service}
                      </span>
                    </div>

                    {/* Requirement Summary */}
                    <div className="text-xs bg-white/80 p-2.5 rounded-lg border border-blue-100/80 leading-relaxed text-slate-700">
                      <span className="font-semibold text-slate-900 block mb-0.5 text-[11px]">
                        Conversation Summary:
                      </span>
                      {latestAssessment.summary}
                    </div>

                    {/* Recommended Next Action */}
                    <div className="text-xs bg-blue-100/60 p-2.5 rounded-lg border border-blue-200/60 leading-relaxed text-blue-950">
                      <span className="font-bold text-blue-900 block mb-0.5 text-[11px]">
                        Recommended Next Action:
                      </span>
                      {latestAssessment.suggested_next_action}
                    </div>

                    {/* Suggested Reply Draft */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 text-[11px]">
                          Suggested Response Draft:
                        </span>
                        <button
                          onClick={handleRegenerateAssessment}
                          disabled={reassessing}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3 h-3 ${reassessing ? 'animate-spin' : ''}`} />
                          <span>Regenerate</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-sans italic">
                        "{latestAssessment.suggested_reply}"
                      </p>

                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <button
                          onClick={() => setReplyText(latestAssessment.suggested_reply)}
                          className="flex-1 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center"
                        >
                          Load to Composer
                        </button>
                        <button
                          onClick={async () => {
                            await handleSendReply(true, latestAssessment.suggested_reply);
                          }}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
                        >
                          Send as AI Reply
                        </button>
                      </div>
                    </div>

                    {/* Lead Qualification CTA */}
                    <div className="pt-2 border-t border-blue-200/60">
                      {isLeadHandedOff ? (
                        <div className="p-2 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Staged for Bitrix24 Handoff</span>
                          </span>
                          <button
                            onClick={onNavigateToQualified}
                            className="text-emerald-800 underline text-[11px] cursor-pointer"
                          >
                            View &rarr;
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleQualifyLead}
                          className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Qualify & Stage CRM Handoff</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-2">
                    <Bot className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="font-semibold text-slate-700">Awaiting Inbound Prospect Message</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Use the scenario test buttons above to simulate prospect turns (e.g. Scope, Pricing, Objection, Meeting Request). SENVO AI Copilot will classify intent and prepare follow-ups grounded in approved Irish corporate policies.
                    </p>
                  </div>
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