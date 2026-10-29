import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Building2, User, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import type { Lead, ChannelType } from '../types';

interface SimulateInboundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (convId: string) => void;
}

export const SimulateInboundModal: React.FC<SimulateInboundModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [channel, setChannel] = useState<ChannelType>('email');
  const [senderName, setSenderName] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getLeads({ limit: 50 }).then((res) => {
        setLeads(res.leads);
        if (res.leads.length > 0 && !selectedLeadId) {
          setSelectedLeadId(res.leads[0].id);
          setSenderName(res.leads[0].contact_name || res.leads[0].company_name);
        }
      });
    }
  }, [isOpen]);

  const presets = [
    {
      title: 'Tax & VAT3 Review (Apex Logistics, Dublin)',
      channel: 'email' as ChannelType,
      text: 'Declan here. Could your corporate team conduct an initial review of our quarterly cross-border VAT3 reconciliations and prepare statutory audit files for our Dublin Port freight operations?',
    },
    {
      title: 'R&D Tax Credit Advisory (MedTech Galway)',
      channel: 'website' as ChannelType,
      text: 'We are an Enterprise Ireland supported MedTech company in Galway. We need guidance on Section 766 R&D Tax Credit filing, grant expenditure certification, and payroll for 28 staff.',
    },
    {
      title: 'ERP Advisory & Controller Search (Tech Dublin 4)',
      channel: 'linkedin' as ChannelType,
      text: 'Hi SENVO, we are evaluating migrating our recurring SaaS billing from QuickBooks to NetSuite or Sage Intacct, and we are searching for an ACA/ACCA Financial Controller.',
    },
    {
      title: 'Multi-Store Payroll Bureau (Retail Limerick)',
      channel: 'whatsapp' as ChannelType,
      text: 'Hello, we operate 6 retail stores in Munster with 85 employees. We need an outsourced Irish payroll bureau to manage PAYE modernization, pension auto-enrollment, and weekly payslips.',
    },
    {
      title: 'CRO Audit Exemption Review (Cork Marine)',
      channel: 'sms' as ChannelType,
      text: 'Sean here from Celtic Marine Cork. Looking to verify our statutory audit exemption status under the Companies Act 2014 before the October CRO deadline. Please call.',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setChannel(p.channel);
    setContent(p.text);
  };

  const handleLeadChange = (id: string) => {
    setSelectedLeadId(id);
    const l = leads.find((x) => x.id === id);
    if (l) setSenderName(l.contact_name || l.company_name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setLoading(true);
      setError(null);
      const res = await api.simulateIncomingReply({
        leadId: selectedLeadId,
        channel,
        content,
        senderName: senderName || 'Irish Corporate Prospect',
      });

      onSuccess(res.conversation.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-base">Simulate Inbound Client Response</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 leading-relaxed">
            <span className="font-semibold">Interactive Walkthrough Tool:</span> Triggers a simulated inbound response from a prospect into the Unified Inbox. Gemini AI will automatically classify intent, summarize requirements, and generate a suggested response.
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Realistic Irish Business Scenario
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {presets.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="text-left text-xs p-2 rounded border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-slate-800 font-medium truncate"
                >
                  <span className="text-blue-600 font-bold mr-1">[{p.channel.toUpperCase()}]</span>
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Lead */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prospect / Lead</label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.company_name} ({l.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Channel */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Inbound Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as ChannelType)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 capitalize"
              >
                <option value="email">Outlook / Corporate Email</option>
                <option value="linkedin">LinkedIn InMail / DM</option>
                <option value="whatsapp">WhatsApp Business</option>
                <option value="website">Website Inquiry Webhook</option>
                <option value="facebook">Meta Facebook Messenger</option>
                <option value="instagram">Instagram Direct</option>
                <option value="sms">Telco SMS Gateway</option>
              </select>
            </div>
          </div>

          {/* Sender Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Name</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Declan Murphy, Managing Director"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Incoming Message Body</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the prospect's reply or question..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Evaluating with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Inject Inbound Reply</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimulateInboundModal;
