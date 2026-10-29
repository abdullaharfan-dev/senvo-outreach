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
  ChevronLeft
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
        setReplyText(details.assessments[0].suggested_reply);
      }
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
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
    }
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  const handleSendReply = async (isAi: boolean = false) => {
    if (!selectedConvId || !replyText.trim()) return;

    try {
      setSending(true);
      const updated = await api.sendMessage(selectedConvId, {
        content: replyText,
        is_ai_generated: isAi,
        sender_name: isAi ? 'SENVO Client Advisory' : 'SENVO Team',
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

        <div className="text-xs text-slate-500 font-medium whitespace-nowrap shrink-0">
          <span>Threads: </span>
          <span className="font-bold text-slate-800">{conversations.length}</span>
        </div>
      </div>

      {/* Main 3-Column Inbox Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Conversation List */}
        <div className={`w-full lg:w-80 xl:w-96 bg-white border-r border-slate-200 flex flex-col shrink-0 ${mobileTab === 'list' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="p-3 border-b border-slate-200 bg-slate-50/50">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by company, decision maker..."
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No conversations found.</div>
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
                      {c.last_message || '(No messages)'}
                    </p>

                    {c.latest_intent && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 truncate capitalize">
                          {c.latest_intent.replace(/_/g, ' ')}
                        </span>
                        {c.status === 'review_needed' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Action Needed
                          </span>
                        )}
                      </div>
                    )}
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
              {/* Thread Header */}
              <div className="h-14 px-3 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setMobileTab('list')}
                    className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0 cursor-pointer flex items-center gap-0.5 text-xs font-semibold"
                    title="Back to Conversations"
                    aria-label="Back to Conversations"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden xs:inline">Threads</span>
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
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                      {selectedConv.contact_name} • {selectedConv.city}, Ireland
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {/* Mobile Info / AI Assessment Toggle */}
                  <button
                    onClick={() => setMobileTab('details')}
                    className="lg:hidden px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="View Prospect & AI Assessment"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Insights</span>
                  </button>

                  <span className="hidden sm:inline text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                    Channel: {selectedConv.channel === 'email' ? 'Microsoft 365' : selectedConv.channel === 'linkedin' ? 'LinkedIn InMail' : selectedConv.channel === 'whatsapp' ? 'WhatsApp Business' : selectedConv.channel}
                  </span>
                </div>
              </div>

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
                          <span className="font-semibold text-blue-700">
                            {msg.is_ai_generated ? 'SENVO Automated Assistant' : 'SENVO Advisory Team'}
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
                        className={`max-w-[85%] sm:max-w-lg p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow-2xs whitespace-pre-line ${
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
                  <span className="font-semibold text-slate-700">Response Composer</span>
                  {latestAssessment && (
                    <button
                      onClick={() => setReplyText(latestAssessment.suggested_reply)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">Insert Recommended Reply</span>
                      <span className="xs:hidden">Insert AI Reply</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type an outbound response to send to prospect..."
                    className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans pb-11 sm:pb-3 sm:pr-28"
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

        {/* Right: Lead Context & SENVO Intelligence Panel */}
        <div className={`w-full lg:w-80 xl:w-96 bg-white border-l border-slate-200 overflow-y-auto p-4 sm:p-5 space-y-4 sm:space-y-5 shrink-0 ${mobileTab === 'details' ? 'block' : 'hidden lg:block'}`}>
          {/* Mobile Back to Chat Button */}
          <div className="lg:hidden pb-3 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setMobileTab('chat')}
              className="p-1 -ml-1 text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Thread</span>
            </button>
            <span className="text-[10px] uppercase font-bold text-slate-400">Prospect Intelligence</span>
          </div>

          {selectedConv && (
            <>
              {/* Prospect Details */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Prospect Profile
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {selectedConv.priority} Priority
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Company</span>
                    <span className="font-semibold text-slate-800">{selectedConv.company_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Decision Maker</span>
                    <span className="text-slate-700 font-medium">
                      {selectedConv.contact_name || 'Managing Director'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Industry Sector</span>
                    <span className="text-slate-700">{selectedConv.industry}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Corporate Office</span>
                    <span className="text-slate-700">{selectedConv.city}, Ireland</span>
                  </div>
                </div>
              </div>

              {/* SENVO Intelligence Analysis Card */}
              {latestAssessment ? (
                <div className="space-y-3.5 p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>SENVO Intelligence Analysis</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {(latestAssessment.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>

                  {/* Intent & Service */}
                  <div className="space-y-1.5">
                    <div className="text-[11px]">
                      <span className="text-slate-500 font-medium">Detected Intent: </span>
                      <span className="font-bold text-blue-900 capitalize">
                        {latestAssessment.intent.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-[11px]">
                      <span className="text-slate-500 font-medium">Requested Service Line: </span>
                      <span className="font-semibold text-slate-800">
                        {latestAssessment.requested_service}
                      </span>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="text-xs bg-white/80 p-2.5 rounded-lg border border-blue-100/80 leading-relaxed text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-0.5 text-[11px]">
                      Requirement Summary:
                    </span>
                    {latestAssessment.summary}
                  </div>

                  {/* Suggested Next Action */}
                  <div className="text-xs bg-blue-100/60 p-2.5 rounded-lg border border-blue-200/60 leading-relaxed text-blue-950">
                    <span className="font-bold text-blue-900 block mb-0.5 text-[11px]">
                      Recommended Follow-Up Action:
                    </span>
                    {latestAssessment.suggested_next_action}
                  </div>

                  {/* Suggested Draft */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-700 text-[11px]">
                      Recommended Response:
                    </span>
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed font-sans italic">
                      "{latestAssessment.suggested_reply}"
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        onClick={() => setReplyText(latestAssessment.suggested_reply)}
                        className="flex-1 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Load to Editor
                      </button>
                      <button
                        onClick={async () => {
                          setReplyText(latestAssessment.suggested_reply);
                          await handleSendReply(true);
                        }}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        Send Recommended Reply
                      </button>
                    </div>
                  </div>

                  {/* Lead Qualification Handoff CTA */}
                  <div className="pt-2 border-t border-blue-200/60">
                    <button
                      onClick={handleQualifyLead}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Qualify & Stage CRM Handoff</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-2">
                  <Bot className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="font-medium text-slate-700">Awaiting Response</p>
                  <p className="text-[11px] text-slate-400">
                    When a prospect responds, SENVO automated intelligence will classify intent and prepare recommended follow-up actions.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InboxModule;
