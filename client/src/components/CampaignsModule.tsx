import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  X,
  Users,
  Sparkles,
  FileText,
  Activity
} from 'lucide-react';
import { api } from '../services/api';
import type { Campaign, ChannelType, LeadSegment } from '../types';

interface CampaignsModuleProps {
  initialSegmentName?: string;
  initialLeadIds?: string[];
  initialChannel?: string;
}

export const CampaignsModule: React.FC<CampaignsModuleProps> = ({
  initialSegmentName,
  initialLeadIds,
  initialChannel,
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [segments, setSegments] = useState<LeadSegment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Guided Campaign Builder State
  const [showBuilder, setShowBuilder] = useState<boolean>(Boolean(initialSegmentName));
  const [builderStep, setBuilderStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [campaignName, setCampaignName] = useState<string>('');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('');
  const [targetAudienceText, setTargetAudienceText] = useState<string>(initialSegmentName || 'All Eligible Corporate Prospects');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>(initialLeadIds || []);
  const [channel, setChannel] = useState<ChannelType>((initialChannel as ChannelType) || 'email');
  const [templateId, setTemplateId] = useState<string>('IE-CORP-01');
  const [templateBody, setTemplateBody] = useState<string>(
    `Dear {CONTACT_NAME},\n\nAs Irish corporate year-end statutory deadlines approach, many mid-market leaders at companies like {BUSINESS_NAME} in {CITY} are reviewing their statutory audit exemption thresholds, CRO Form B1 compliance, and cross-border VAT structures.\n\nSENVO provides end-to-end statutory accounting, Revenue compliance, and company secretarial advisory tailored to Irish trading entities.\n\nWould you be open to a brief 10-minute introductory call next Tuesday or Wednesday to discuss your current compliance schedule?`
  );

  // Preview index for sample recipient preview
  const [previewLeadIndex, setPreviewLeadIndex] = useState<number>(0);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  const fetchCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
      if (data.length > 0 && !selectedCampaign) {
        loadCampaignDetails(data[0].id);
      } else if (selectedCampaign) {
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

  const fetchSegments = async () => {
    try {
      const segs = await api.getSegments();
      setSegments(segs);
      if (!selectedSegmentId && segs.length > 0) {
        const match = initialSegmentName ? segs.find((s) => s.name === initialSegmentName) : segs[0];
        if (match) {
          setSelectedSegmentId(match.id);
          setTargetAudienceText(match.name);
          if (!initialLeadIds || initialLeadIds.length === 0) {
            setSelectedLeadIds(match.lead_ids);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load segments:', err);
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
    fetchSegments();
    const interval = setInterval(fetchCampaigns, 2500);
    return () => clearInterval(interval);
  }, []);

  const processedSegmentRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialSegmentName && processedSegmentRef.current !== initialSegmentName) {
      processedSegmentRef.current = initialSegmentName;
      setShowBuilder(true);
      setBuilderStep(1);
      setTargetAudienceText(initialSegmentName);
      if (initialLeadIds && initialLeadIds.length > 0) {
        setSelectedLeadIds(initialLeadIds);
      }
      if (initialChannel) {
        setChannel(initialChannel as ChannelType);
      }
      const match = segments.find((s) => s.name === initialSegmentName);
      if (match) {
        setSelectedSegmentId(match.id);
        if (!initialLeadIds || initialLeadIds.length === 0) {
          setSelectedLeadIds(match.lead_ids);
        }
      }
    }
  }, [initialSegmentName, initialLeadIds, initialChannel, segments]);

  const handleStart = async (id: string) => {
    try {
      await api.startCampaign(id);
      fetchCampaigns();
    } catch (err: any) {
      alert(`Launch failed: ${err.message}`);
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

  const templates = [
    {
      id: 'IE-CORP-01',
      title: 'Statutory Year-End & CRO Form B1 Briefing',
      channel: 'email' as ChannelType,
      audience: 'Irish Mid-Market Directors & CFOs',
      body: `Dear {CONTACT_NAME},\n\nAs Irish corporate year-end statutory deadlines approach, many mid-market leaders at companies like {BUSINESS_NAME} in {CITY} are reviewing their statutory audit exemption thresholds, CRO Form B1 compliance, and cross-border VAT structures.\n\nSENVO provides end-to-end statutory accounting, Revenue compliance, and company secretarial advisory tailored to Irish trading entities.\n\nWould you be open to a brief 10-minute introductory call next Tuesday or Wednesday to discuss your current compliance schedule?`,
    },
    {
      id: 'IE-TECH-02',
      title: 'Tech ERP Advisory & Senior Finance Executive Search',
      channel: 'linkedin' as ChannelType,
      audience: 'Tech Founders, CFOs & Operations Leads (Dublin / Galway)',
      body: `Hi {CONTACT_NAME}, noticed your recent team expansion at {BUSINESS_NAME}. With tech firms scaling in {CITY}, ensuring seamless ERP integration (Xero / NetSuite) and securing qualified senior finance talent (Financial Controllers / ACCA seniors) is crucial. Would you be open to exchanging notes on how our advisory practice supports Irish tech entities?`,
    },
    {
      id: 'IE-PAYROLL-03',
      title: 'Managed Irish Payroll Bureau & PAYE Modernisation',
      channel: 'whatsapp' as ChannelType,
      audience: 'Retail, Hospitality & Multi-Location Employers',
      body: `Hello {CONTACT_NAME}, hope you are well at {BUSINESS_NAME}. Managing multi-branch Irish payroll with weekly timesheets and Revenue ROS compliance often creates administrative drag. SENVO provides fully managed BrightPay payroll bureau services for Irish employers. Would you be open to a quick 10-minute preview of our onboarding timetable?`,
    },
  ];

  const handleSelectTemplate = (t: typeof templates[0]) => {
    setTemplateId(t.id);
    setChannel(t.channel);
    setTemplateBody(t.body);
  };

  const handleSegmentChange = (segId: string) => {
    setSelectedSegmentId(segId);
    const seg = segments.find((s) => s.id === segId);
    if (seg) {
      setTargetAudienceText(seg.name);
      setSelectedLeadIds(seg.lead_ids);
    }
  };

  const handleLaunchCampaign = async () => {
    const finalName = campaignName.trim() || `${targetAudienceText} - Q4 Corporate Outreach`;

    try {
      setIsLaunching(true);
      const created = await api.createCampaign({
        name: finalName,
        channel,
        template_id: templateId,
        template_body: templateBody,
        target_audience: targetAudienceText,
        lead_ids: selectedLeadIds,
      });

      // Automatically launch if desired or keep in draft
      await api.startCampaign(created.id);

      setShowBuilder(false);
      setCampaignName('');
      setBuilderStep(1);
      fetchCampaigns();
      setSelectedCampaign(created);
    } catch (err: any) {
      alert(`Campaign creation failed: ${err.message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Campaign Dispatch & Audience Orchestration</h2>
          <p className="text-xs text-slate-500">
            Multi-channel outreach execution • Real-time recipient status tracking in SQLite
          </p>
        </div>

        <button
          onClick={() => {
            setShowBuilder(true);
            setBuilderStep(1);
          }}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Campaign Builder</span>
        </button>
      </div>

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Campaigns List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Campaigns ({campaigns.length})</span>
            <span className="text-[11px] font-normal text-slate-400">Click to monitor</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[640px]">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading campaigns...</div>
            ) : campaigns.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No active campaigns.</div>
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
                      isSelected ? 'bg-blue-50/70 border-l-4 border-l-blue-600' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 text-xs truncate max-w-[190px]">
                        {c.name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          c.status === 'running'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
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
                      <span className="capitalize font-semibold text-slate-700">[{c.channel}]</span>
                      <span>
                        {c.sent_count} / {c.total_recipients} sent ({progressPct}%)
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

        {/* Right: Selected Campaign Execution Monitor */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCampaign ? (
            <>
              {/* Campaign Detail Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{selectedCampaign.name}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {selectedCampaign.channel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Target Audience: <span className="font-semibold text-slate-700">{selectedCampaign.target_audience}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {selectedCampaign.status === 'running' ? (
                      <button
                        onClick={() => handlePause(selectedCampaign.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Campaign</span>
                      </button>
                    ) : selectedCampaign.status === 'completed' ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Campaign Dispatched</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStart(selectedCampaign.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Launch Campaign</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* KPI Metrics derived strictly from SQLite */}
                <div className="grid grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">Total Audience</span>
                    <span className="font-bold text-slate-900 text-base">{selectedCampaign.total_recipients}</span>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-blue-600 block text-[11px]">Messages Dispatched</span>
                    <span className="font-bold text-blue-900 text-base">{selectedCampaign.sent_count}</span>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                    <span className="text-amber-600 block text-[11px]">Audience Queued</span>
                    <span className="font-bold text-amber-900 text-base">
                      {Math.max(0, selectedCampaign.total_recipients - selectedCampaign.sent_count)}
                    </span>
                  </div>
                  <div className="bg-cyan-50 p-2.5 rounded-lg border border-cyan-100">
                    <span className="text-cyan-700 block text-[11px]">Client Replies</span>
                    <span className="font-bold text-cyan-900 text-base">{selectedCampaign.replied_count || 0}</span>
                  </div>
                </div>

                {/* Approved Message Template */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs">
                  <div className="font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Approved Outreach Copy</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Tokens: &#123;CONTACT_NAME&#125;, &#123;BUSINESS_NAME&#125;, &#123;CITY&#125;
                    </span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line leading-relaxed font-sans">
                    {selectedCampaign.template_body}
                  </p>
                </div>
              </div>

              {/* Recipient-Level Sending Progress Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-800">Recipient-Level Dispatch Status & Audit Log</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">Updated live from database</span>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                        <th className="py-2.5 px-4">Company</th>
                        <th className="py-2.5 px-4">Contact</th>
                        <th className="py-2.5 px-4">Channel</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4">Dispatch Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCampaign.recipients?.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-4 font-semibold text-slate-800">{rec.company_name}</td>
                          <td className="py-2.5 px-4 text-slate-600">{rec.contact_name}</td>
                          <td className="py-2.5 px-4">
                            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize font-medium">
                              {selectedCampaign.channel}
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
                              <span>{rec.status === 'simulated_sent' ? 'Dispatched' : rec.status === 'queued' ? 'Queued' : 'Replied'}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                            {rec.sent_at ? new Date(rec.sent_at).toLocaleTimeString() : 'Awaiting Dispatch'}
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
              Select a campaign on the left to monitor live recipient progress.
            </div>
          )}
        </div>
      </div>

      {/* Guided Campaign Builder Wizard Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base leading-tight">Guided Campaign Builder</h3>
                <p className="text-[11px] text-slate-400">Step {builderStep} of 4: {builderStep === 1 ? 'Audience & Segment' : builderStep === 2 ? 'Channel & Template' : builderStep === 3 ? 'Personalization & Preview' : 'Review & Confirm'}</p>
              </div>
              <button onClick={() => setShowBuilder(false)} className="text-slate-400 hover:text-white p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="grid grid-cols-4 border-b border-slate-200 text-xs font-semibold text-center bg-slate-50 shrink-0">
              <div className={`py-2.5 ${builderStep === 1 ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
                1. Audience
              </div>
              <div className={`py-2.5 ${builderStep === 2 ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
                2. Template
              </div>
              <div className={`py-2.5 ${builderStep === 3 ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
                3. Preview
              </div>
              <div className={`py-2.5 ${builderStep === 4 ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
                4. Confirm
              </div>
            </div>

            {/* Wizard Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* STEP 1: Audience Selection */}
              {builderStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Name *</label>
                    <input
                      type="text"
                      required
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Q4 Dublin MedTech & Logistics Year-End Compliance Briefing"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Intelligent Target Segment
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {segments.map((seg) => {
                        const isSelected = selectedSegmentId === seg.id;
                        return (
                          <div
                            key={seg.id}
                            onClick={() => handleSegmentChange(seg.id)}
                            className={`p-3 rounded-lg border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-slate-900">{seg.name}</span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {seg.count} leads
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                              {seg.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setBuilderStep(2)}
                      disabled={!campaignName.trim() || selectedLeadIds.length === 0}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>Continue to Channel & Template</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Channel & Template Selection */}
              {builderStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Outreach Medium</label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as ChannelType)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white capitalize focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">Corporate Email (Microsoft 365 Exchange)</option>
                      <option value="linkedin">LinkedIn InMail / Executive Direct Message</option>
                      <option value="whatsapp">WhatsApp Business Platform</option>
                      <option value="sms">Enterprise SMS Gateway</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Approved Practice Outreach Templates
                    </label>
                    <div className="space-y-2">
                      {templates.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleSelectTemplate(t)}
                          className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                            templateId === t.id
                              ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-900">
                              [{t.channel.toUpperCase()}] {t.title}
                            </span>
                            <span className="text-[11px] text-slate-400">{t.audience}</span>
                          </div>
                          <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">
                            {t.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Message Body</label>
                    <textarea
                      rows={4}
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                    />
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setBuilderStep(1)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Back to Audience
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilderStep(3)}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Preview Real Lead Personalization</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Personalization & Real Sample Preview */}
              {builderStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-xs">
                    <span className="font-bold text-slate-900 block mb-1">Personalization Preview with Sample Leads</span>
                    <p className="text-slate-500 text-[11px]">
                      Tokens <code className="bg-white px-1 rounded border border-slate-200 text-blue-600 font-mono">&#123;CONTACT_NAME&#125;</code>, <code className="bg-white px-1 rounded border border-slate-200 text-blue-600 font-mono">&#123;BUSINESS_NAME&#125;</code>, and <code className="bg-white px-1 rounded border border-slate-200 text-blue-600 font-mono">&#123;CITY&#125;</code> are dynamically populated for each recipient.
                    </p>
                  </div>

                  {/* Rendered Preview Card */}
                  <div className="bg-white border border-slate-300 rounded-xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">Preview Recipient:</span>
                        <span className="font-semibold text-blue-600">
                          {previewLeadIndex === 0 ? 'Declan Murphy (Apex Logistics Ireland Ltd, Dublin 2)' : 'Sean O’Connor (Celtic Marine Engineering Ltd, Cork)'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewLeadIndex(previewLeadIndex === 0 ? 1 : 0)}
                          className="px-2 py-0.5 rounded border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          Toggle Sample Lead
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                      {templateBody
                        .replace(/{CONTACT_NAME}/g, previewLeadIndex === 0 ? 'Declan' : 'Sean')
                        .replace(/{BUSINESS_NAME}/g, previewLeadIndex === 0 ? 'Apex Logistics Ireland Ltd' : 'Celtic Marine Engineering Ltd')
                        .replace(/{CITY}/g, previewLeadIndex === 0 ? 'Dublin 2' : 'Cork')}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setBuilderStep(2)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Back to Template
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuilderStep(4)}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Final Review & Launch</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Confirm */}
              {builderStep === 4 && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ready to Deploy Outreach Campaign</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed text-[11px]">
                      The campaign will be staged in the SQLite database and process {selectedLeadIds.length} recipients asynchronously.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Campaign Title:</span>
                      <span className="font-bold text-slate-900">{campaignName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Selected Medium:</span>
                      <span className="font-semibold text-slate-800 capitalize">{channel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Target Segment:</span>
                      <span className="font-semibold text-slate-800">{targetAudienceText}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Recipient Count:</span>
                      <span className="font-bold text-blue-700">{selectedLeadIds.length} corporate prospects</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setBuilderStep(3)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Back to Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleLaunchCampaign}
                      disabled={isLaunching}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isLaunching ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Initializing Queue...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Confirm & Launch Campaign</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsModule;
