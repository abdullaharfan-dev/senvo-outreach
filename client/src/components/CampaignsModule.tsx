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
  Activity,
  Check,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import type { Campaign, ChannelType, LeadSegment } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge, type BadgeVariant } from './ui/Badge';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';
import { EmptyState } from './ui/EmptyState';

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
  const [targetAudienceText, setTargetAudienceText] = useState<string>(
    initialSegmentName || 'All Eligible Corporate Prospects'
  );
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
    const interval = setInterval(fetchCampaigns, 3000);
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

  const handleSelectTemplate = (t: (typeof templates)[0]) => {
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

      // Automatically launch in simulation environment
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

  const getCampaignStatusBadge = (status: string): BadgeVariant => {
    switch (status) {
      case 'running':
        return 'success';
      case 'completed':
        return 'primary';
      case 'paused':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Campaign Dispatch & Audience Orchestration
            </h2>
            <Badge variant="primary" size="sm">
              {campaigns.length} Active Campaigns
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Multi-channel outreach execution with real-time recipient delivery tracking in persistent database.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setShowBuilder(true);
            setBuilderStep(1);
          }}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          New Campaign Builder
        </Button>
      </div>

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Left Column: Campaigns List */}
        <Card className="overflow-hidden shadow-card flex flex-col">
          <CardHeader className="py-3.5 px-4 bg-slate-50/80 border-b border-slate-200">
            <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Campaigns ({campaigns.length})
            </CardTitle>
            <span className="text-[11px] font-normal text-slate-400">Click to monitor</span>
          </CardHeader>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[640px]">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading campaigns...
              </div>
            ) : campaigns.length === 0 ? (
              <EmptyState
                icon={Send}
                title="No campaigns found"
                description="Create a new campaign to begin simulated prospect outreach."
                className="py-12"
              />
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
                    className={`p-4 transition-all duration-150 cursor-pointer border-l-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-blue-600 shadow-2xs'
                        : 'border-l-transparent hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {c.name}
                      </span>
                      <Badge variant={getCampaignStatusBadge(c.status)} size="xs">
                        {c.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <span className="capitalize font-semibold text-slate-700">[{c.channel}]</span>
                      <span className="tabular-nums">
                        {c.sent_count} / {c.total_recipients} sent ({progressPct}%)
                      </span>
                    </div>

                    <ProgressBar
                      value={progressPct}
                      color={c.status === 'completed' ? 'emerald' : 'blue'}
                      size="sm"
                    />
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Right Column: Selected Campaign Execution Monitor */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {selectedCampaign ? (
            <>
              {/* Campaign Detail Card */}
              <Card className="p-5 sm:p-6 shadow-card space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {selectedCampaign.name}
                      </h3>
                      <Badge variant="primary" size="xs">
                        {selectedCampaign.channel.toUpperCase()}
                      </Badge>
                      <Badge variant={getCampaignStatusBadge(selectedCampaign.status)} size="xs">
                        {selectedCampaign.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      Target Audience:{' '}
                      <span className="font-semibold text-slate-700">
                        {selectedCampaign.target_audience}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedCampaign.status === 'running' ? (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handlePause(selectedCampaign.id)}
                        leftIcon={<Pause className="w-3.5 h-3.5" />}
                      >
                        Pause Campaign
                      </Button>
                    ) : selectedCampaign.status === 'completed' ? (
                      <Badge variant="success" size="md">
                        Campaign Dispatched
                      </Badge>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStart(selectedCampaign.id)}
                        leftIcon={<Play className="w-3.5 h-3.5" />}
                      >
                        Resume Campaign
                      </Button>
                    )}
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    <span className="text-slate-500 block text-[11px] font-medium">Total Audience</span>
                    <span className="font-bold text-slate-900 text-base mt-0.5 block tabular-nums">
                      {selectedCampaign.total_recipients}
                    </span>
                  </div>
                  <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-200/80">
                    <span className="text-blue-700 block text-[11px] font-medium">Messages Sent</span>
                    <span className="font-bold text-blue-900 text-base mt-0.5 block tabular-nums">
                      {selectedCampaign.sent_count}
                    </span>
                  </div>
                  <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/80">
                    <span className="text-amber-700 block text-[11px] font-medium">Queued</span>
                    <span className="font-bold text-amber-900 text-base mt-0.5 block tabular-nums">
                      {Math.max(0, selectedCampaign.total_recipients - selectedCampaign.sent_count)}
                    </span>
                  </div>
                  <div className="bg-cyan-50/80 p-3 rounded-xl border border-cyan-200/80">
                    <span className="text-cyan-700 block text-[11px] font-medium">Client Replies</span>
                    <span className="font-bold text-cyan-900 text-base mt-0.5 block tabular-nums">
                      {selectedCampaign.replied_count || 0}
                    </span>
                  </div>
                </div>

                {/* Approved Message Template */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="font-semibold text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Approved Outreach Copy</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600 font-mono text-[10px]">
                        &#123;CONTACT_NAME&#125;
                      </code>
                      <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600 font-mono text-[10px]">
                        &#123;BUSINESS_NAME&#125;
                      </code>
                      <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-blue-600 font-mono text-[10px]">
                        &#123;CITY&#125;
                      </code>
                    </div>
                  </div>
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed font-sans text-xs bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                    {selectedCampaign.template_body}
                  </p>
                </div>
              </Card>

              {/* Recipient-Level Sending Progress Table */}
              <Card className="overflow-hidden shadow-card">
                <CardHeader className="py-3.5 px-4 bg-slate-50/80 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                    <CardTitle className="text-xs font-bold text-slate-800">
                      Recipient-Level Dispatch Status & Audit Log
                    </CardTitle>
                  </div>
                  <Badge variant="success" dot size="xs">
                    Simulated Sandbox
                  </Badge>
                </CardHeader>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full min-w-[500px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider sticky top-0 backdrop-blur-xs">
                        <th className="py-2.5 px-4">Company Entity</th>
                        <th className="py-2.5 px-4">Decision Maker</th>
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
                            <Badge
                              variant={
                                rec.status === 'simulated_sent'
                                  ? 'primary'
                                  : rec.status === 'replied'
                                  ? 'success'
                                  : 'warning'
                              }
                              size="xs"
                            >
                              {rec.status === 'simulated_sent'
                                ? 'Dispatched'
                                : rec.status === 'queued'
                                ? 'Queued'
                                : 'Replied'}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-slate-400 text-[11px] tabular-nums">
                            {rec.sent_at ? new Date(rec.sent_at).toLocaleTimeString() : 'Awaiting Dispatch'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <EmptyState
              icon={Send}
              title="Select a Campaign"
              description="Choose a campaign from the left list to monitor live recipient progress and response metrics."
              className="py-16"
            />
          )}
        </div>
      </div>

      {/* Guided Campaign Builder Wizard Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-sm sm:text-base leading-tight">Guided Campaign Builder</h3>
                <p className="text-[11px] text-slate-400">
                  Step {builderStep} of 4:{' '}
                  {builderStep === 1
                    ? 'Audience & Segment'
                    : builderStep === 2
                    ? 'Channel & Template'
                    : builderStep === 3
                    ? 'Personalization & Preview'
                    : 'Review & Confirm'}
                </p>
              </div>
              <button
                onClick={() => setShowBuilder(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="grid grid-cols-4 border-b border-slate-200 text-xs font-semibold text-center bg-slate-50 shrink-0">
              <div
                className={`py-2.5 ${
                  builderStep === 1
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-500'
                }`}
              >
                1. Audience
              </div>
              <div
                className={`py-2.5 ${
                  builderStep === 2
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-500'
                }`}
              >
                2. Template
              </div>
              <div
                className={`py-2.5 ${
                  builderStep === 3
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-500'
                }`}
              >
                3. Preview
              </div>
              <div
                className={`py-2.5 ${
                  builderStep === 4
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-500'
                }`}
              >
                4. Confirm
              </div>
            </div>

            {/* Wizard Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* STEP 1: Audience Selection */}
              {builderStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Q4 Dublin MedTech & Logistics Year-End Compliance Briefing"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Intelligent Target Segment
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {segments.map((seg) => {
                        const isSelected = selectedSegmentId === seg.id;
                        return (
                          <div
                            key={seg.id}
                            onClick={() => handleSegmentChange(seg.id)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-slate-900">{seg.name}</span>
                              <Badge variant="neutral" size="xs">
                                {seg.count} leads
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                              {seg.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!campaignName.trim() || selectedLeadIds.length === 0}
                      onClick={() => setBuilderStep(2)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Continue to Channel & Template
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Channel & Template Selection */}
              {builderStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Outreach Medium
                    </label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as ChannelType)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white capitalize focus:ring-2 focus:ring-blue-500 shadow-2xs"
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
                          className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            templateId === t.id
                              ? 'bg-blue-50/70 border-blue-500 shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Custom Message Body
                    </label>
                    <textarea
                      rows={4}
                      value={templateBody}
                      onChange={(e) => setTemplateBody(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans shadow-2xs"
                    />
                  </div>

                  <div className="pt-3 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center border-t border-slate-100 gap-2 sm:gap-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBuilderStep(1)}
                    >
                      Back to Audience
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setBuilderStep(3)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Preview Lead Personalization
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Personalization & Real Sample Preview */}
              {builderStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">
                      Dynamic Personalization Token Tokens
                    </span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Tokens <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-blue-600 font-mono text-[10px]">&#123;CONTACT_NAME&#125;</code>, <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-blue-600 font-mono text-[10px]">&#123;BUSINESS_NAME&#125;</code>, and <code className="bg-white px-1 py-0.5 rounded border border-slate-200 text-blue-600 font-mono text-[10px]">&#123;CITY&#125;</code> are dynamically populated for each recipient in the queue.
                    </p>
                  </div>

                  {/* Rendered Preview Card */}
                  <Card className="p-4 sm:p-5 space-y-3 shadow-2xs">
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between text-xs border-b border-slate-100 pb-2.5 gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800">Simulated Recipient Preview:</span>
                        <span className="font-semibold text-blue-600">
                          {previewLeadIndex === 0
                            ? 'Declan Murphy (Apex Logistics Ireland Ltd, Dublin 2)'
                            : 'Sean O’Connor (Celtic Marine Engineering Ltd, Cork)'}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setPreviewLeadIndex(previewLeadIndex === 0 ? 1 : 0)}
                      >
                        Toggle Sample
                      </Button>
                    </div>

                    <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                      {templateBody
                        .replace(/{CONTACT_NAME}/g, previewLeadIndex === 0 ? 'Declan' : 'Sean')
                        .replace(
                          /{BUSINESS_NAME}/g,
                          previewLeadIndex === 0 ? 'Apex Logistics Ireland Ltd' : 'Celtic Marine Engineering Ltd'
                        )
                        .replace(/{CITY}/g, previewLeadIndex === 0 ? 'Dublin 2' : 'Cork')}
                    </div>
                  </Card>

                  <div className="pt-3 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center border-t border-slate-100 gap-2 sm:gap-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBuilderStep(2)}
                    >
                      Back to Template
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setBuilderStep(4)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      Final Review & Launch
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Review & Confirm */}
              {builderStep === 4 && (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Ready to Deploy Outreach Campaign</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed text-[11px]">
                      The campaign will be staged in the persistent database and process{' '}
                      <strong>{selectedLeadIds.length} recipients</strong> asynchronously in simulated dispatch mode.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500 font-medium shrink-0">Campaign:</span>
                      <span className="font-bold text-slate-900 truncate text-right">{campaignName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Channel:</span>
                      <span className="font-semibold text-slate-800 capitalize">{channel}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-slate-500 font-medium shrink-0">Audience:</span>
                      <span className="font-semibold text-slate-800 truncate text-right">{targetAudienceText}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Recipients:</span>
                      <span className="font-bold text-blue-700 tabular-nums">
                        {selectedLeadIds.length} corporate prospects
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center border-t border-slate-100 gap-2 sm:gap-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBuilderStep(3)}
                    >
                      Back to Preview
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      isLoading={isLaunching}
                      onClick={handleLaunchCampaign}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Confirm & Launch Campaign
                    </Button>
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
