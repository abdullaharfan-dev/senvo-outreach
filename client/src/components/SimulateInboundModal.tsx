import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Building2, User, MessageSquare, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { Lead, ChannelType } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Simulate Inbound Client Response</h3>
              <p className="text-[11px] text-slate-400">Trigger multi-channel prospect turns into the Unified Inbox</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 leading-relaxed shadow-2xs">
            <span className="font-bold">Interactive Sandbox Walkthrough:</span> Injects a realistic prospect turn into the Unified Inbox. SENVO AI SDR will classify intent, compute confidence matching, and generate an approved Irish corporate follow-up response.
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-900 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Realistic Irish Business Scenario
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(p)}
                  className="text-left text-xs p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all text-slate-800 font-medium truncate cursor-pointer shadow-2xs"
                >
                  <span className="text-blue-600 font-bold mr-1">[{p.channel.toUpperCase()}]</span>
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Target Lead */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Prospect / Lead</label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-2xs"
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
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 capitalize shadow-2xs"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sender Name & Title</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="e.g. Declan Murphy, Managing Director"
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Incoming Message Body *</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the prospect's reply, questions, or inquiry..."
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans shadow-2xs"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={loading}
              disabled={!content.trim()}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Inject Inbound Reply
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimulateInboundModal;
