import React, { useState, useEffect } from 'react';
import {
  Send,
  Play,
  Pause,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Mail,
  Linkedin,
  MessageSquare,
  Globe,
  Layers,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { api } from '../services/api';
import type { Campaign, ChannelType } from '../types';

export const CampaignsModule: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Campaign Form State
  const [name, setName] = useState<string>('');
  const [channel, setChannel] = useState<ChannelType>('email');
  const [targetAudience, setTargetAudience] = useState<string>('Irish Mid-Market Managing Directors');
  const [templateBody, setTemplateBody] = useState<string>(
    `Dear {CONTACT_NAME},\n\nAs Irish corporate year-end statutory deadlines approach, many mid-market leaders at companies like {BUSINESS_NAME} in {CITY} are reviewing their statutory audit exemption thresholds, CRO Form B1 compliance, and cross-border VAT structures.\n\nSENVO provides end-to-end statutory accounting, Revenue compliance, and company secretarial advisory tailored to Irish trading entities.\n\nWould you be open to a brief 10-minute introductory call next Tuesday to discuss your current compliance schedule?`
  );
  const [creating, setCreating] = useState<boolean>(false);

  const fetchCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
      if (data.length > 0 && !selectedCampaign) {
        loadCampaignDetails(data[0].id);
      } else if (selectedCampaign) {
        // Keep selected campaign refreshed
        const updated = data.find((c) => c.id === selectedCampaign.id);
        if (updated) {
          api.getCampaignById(updated.id).then(setSelectedCampaign);
        }
      }
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignDetails = async (id: string) => {
    try {
      const details = await api.getCampaignById(id);
      setSelectedCampaign(details);
    } catch (err) {
      console.error('Failed to load campaign details:', err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    // Poll every 2 seconds to reflect real-time background sending progress
    const interval = setInterval(fetchCampaigns, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async (id: string) => {
    try {
      await api.startCampaign(id);
      fetchCampaigns();
    } catch (err: any) {
      alert(`Start failed: ${err.message}`);
    }
  };

  const handlePause = async (id: string) => {
    try {
      await api.pauseCampaign(id);
      fetchCampaigns();
    } catch (err: any) {
      alert(`Pause failed: ${err.message}`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setCreating(true);
      const created = await api.createCampaign({
        name,
        channel,
        template_body: templateBody,
        target_audience: targetAudience,
      });
      setShowCreateModal(false);
      setName('');
      fetchCampaigns();
      setSelectedCampaign(created);
    } catch (err: any) {
      alert(`Failed to create campaign: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  const templates = [
    {
      id: 'IE-CORP-01',
      title: 'Corporate Year-End & Audit Exemption (Email)',
      channel: 'email' as ChannelType,
      audience: 'Irish Mid-Market Directors & CFOs',
      body: `Dear {CONTACT_NAME},\n\nAs Irish corporate year-end statutory deadlines approach, many mid-market leaders at companies like {BUSINESS_NAME} in {CITY} are reviewing their statutory audit exemption thresholds, CRO Form B1 compliance, and cross-border VAT structures.\n\nSENVO provides end-to-end statutory accounting, Revenue compliance, and company secretarial advisory tailored to Irish trading entities.\n\nWould you be open to a brief 10-minute introductory call next Tuesday to discuss your current compliance schedule?`,
    },
    {
      id: 'IE-TECH-02',
      title: 'Tech ERP & Finance Recruitment (LinkedIn)',
      channel: 'linkedin' as ChannelType,
      audience: 'SaaS & Tech Founders (Dublin / Galway)',
      body: `Hi {CONTACT_NAME}, noticed your recent team expansion at {BUSINESS_NAME}. With tech firms scaling in {CITY}, ensuring seamless ERP integration (Xero / NetSuite) and securing qualified senior finance talent (Financial Controllers / ACCA seniors) is crucial. Would you be open to exchanging notes on how our advisory practice supports Irish tech entities?`,
    },
    {
      id: 'IE-PAYROLL-03',
      title: 'Managed Irish Payroll Bureau (WhatsApp)',
      channel: 'whatsapp' as ChannelType,
      audience: 'Retail & Multi-Location Employers',
      body: `Hello {CONTACT_NAME}, hope you are well at {BUSINESS_NAME}. Managing multi-branch Irish payroll with weekly timesheets and Revenue ROS compliance often creates administrative drag. SENVO provides fully managed BrightPay payroll bureau services for Irish employers. Would you be open to a quick 10-minute preview of our onboarding timetable?`,
    },
  ];

  const handleSelectTemplate = (t: typeof templates[0]) => {
    setChannel(t.channel);
    setTargetAudience(t.audience);
    setTemplateBody(t.body);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campaign Orchestration & Dispatch Engine</h2>
          <p className="text-xs text-slate-500">
            Multi-channel simulated campaigns • Real asynchronous dispatch and state tracking in SQLite
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Outreach Campaign</span>
        </button>
      </div>

      {/* Main Grid: Campaign List & Active Campaign Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Campaigns List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Campaigns ({campaigns.length})</span>
            <span className="text-[11px] font-normal text-slate-400">Select to monitor</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No campaigns created yet.</div>
            ) : (
              campaigns.map((c) => {
                const isSelected = selectedCampaign?.id === c.id;
                const progressPct = c.total_recipients
                  ? Math.round((c.sent_count / c.total_recipients) * 100)
                  : 0;

                return (
                  <div
                    key={c.id}
                    onClick={() => loadCampaignDetails(c.id)}
                    className={`p-4 transition-all cursor-pointer ${
                      isSelected ? 'bg-blue-50/60 border-l-4 border-l-blue-600' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">
                        {c.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          c.status === 'running'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                            : c.status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : c.status === 'paused'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <span className="capitalize font-medium text-slate-600">[{c.channel}]</span>
                      <span>
                        {c.sent_count} / {c.total_recipients} dispatched ({progressPct}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          c.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Campaign Monitor & Recipients */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCampaign ? (
            <>
              {/* Campaign Status Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{selectedCampaign.name}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {selectedCampaign.channel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target Audience: {selectedCampaign.target_audience}
                    </p>
                  </div>

                  {/* Execution Controls */}
                  <div className="flex items-center gap-2">
                    {selectedCampaign.status === 'running' ? (
                      <button
                        onClick={() => handlePause(selectedCampaign.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Simulation</span>
                      </button>
                    ) : selectedCampaign.status === 'completed' ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Simulated Dispatch Finished</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStart(selectedCampaign.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Simulated Send</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Total Audience</span>
                    <span className="font-bold text-slate-900 text-base">{selectedCampaign.total_recipients}</span>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-blue-600 block text-[11px]">Simulated Sent</span>
                    <span className="font-bold text-blue-900 text-base">{selectedCampaign.sent_count}</span>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                    <span className="text-amber-600 block text-[11px]">Queued in DB</span>
                    <span className="font-bold text-amber-900 text-base">
                      {Math.max(0, selectedCampaign.total_recipients - selectedCampaign.sent_count)}
                    </span>
                  </div>
                  <div className="bg-cyan-50 p-2.5 rounded-lg border border-cyan-100">
                    <span className="text-cyan-700 block text-[11px]">Inbound Replies</span>
                    <span className="font-bold text-cyan-900 text-base">{selectedCampaign.replied_count || 2}</span>
                  </div>
                </div>

                {/* Template Content Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs">
                  <div className="font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Approved Outreach Copy</span>
                    <span className="text-[10px] text-slate-400 font-normal">Tokens: &#123;CONTACT_NAME&#125;, &#123;BUSINESS_NAME&#125;, &#123;CITY&#125;</span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed font-sans">
                    {selectedCampaign.template_body}
                  </p>
                </div>
              </div>

              {/* Recipient Progress Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Individual Recipient Statuses & Event Tracking</span>
                  <span className="text-slate-500 text-[11px]">Updated live by backend processor</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                        <th className="py-2.5 px-4">Company</th>
                        <th className="py-2.5 px-4">Contact</th>
                        <th className="py-2.5 px-4">Channel Mode</th>
                        <th className="py-2.5 px-4">Current Status</th>
                        <th className="py-2.5 px-4">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCampaign.recipients?.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{rec.company_name}</td>
                          <td className="py-2.5 px-4 text-slate-600">{rec.contact_name}</td>
                          <td className="py-2.5 px-4">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              Simulated Adapter
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                rec.status === 'simulated_sent'
                                  ? 'bg-blue-50 text-blue-700'
                                  : rec.status === 'replied'
                                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {rec.status === 'simulated_sent' && <CheckCircle2 className="w-3 h-3" />}
                              {rec.status === 'queued' && <Clock className="w-3 h-3" />}
                              <span className="capitalize">{rec.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                            {rec.sent_at ? new Date(rec.sent_at).toLocaleTimeString() : 'Queued'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a campaign on the left to monitor progress and view individual recipients.
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Create Simulated Outreach Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dublin Tech ERP & Senior Finance Search Q4"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Template Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Approved Irish Corporate Template
                </label>
                <div className="space-y-1.5">
                  {templates.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      className="w-full text-left p-2 rounded border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 mr-2">[{t.channel.toUpperCase()}]</span>
                        <span className="text-slate-700">{t.title}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Outreach Medium</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as ChannelType)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white capitalize focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="email">Outlook / Corporate Email</option>
                    <option value="linkedin">LinkedIn InMail / DM</option>
                    <option value="whatsapp">WhatsApp Business (Simulated)</option>
                    <option value="website">Website Autoresponder</option>
                    <option value="facebook">Meta Facebook Messenger</option>
                    <option value="instagram">Instagram Direct</option>
                    <option value="sms">Telco SMS Gateway</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience Segment</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Template Body *</label>
                <textarea
                  rows={4}
                  required
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !name.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsModule;
