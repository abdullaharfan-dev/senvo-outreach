import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Upload,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  FileSpreadsheet,
  X,
  ArrowRight,
  Layers,
  ChevronRight,
  Send,
  AlertTriangle,
  Check,
  RefreshCw,
  Sparkles,
  Download,
  CheckSquare,
  Square,
  Briefcase,
  Target,
  ExternalLink,
  Compass,
  FileText,
  ShieldCheck,
  Calendar,
  CheckCircle,
  CircleDashed,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import type { Lead, LeadSegment, ParseFileResult, ValidationResult, ValidatedLeadRecord, Conversation } from '../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge, type BadgeVariant } from './ui/Badge';
import { Button } from './ui/Button';
import { ProgressBar } from './ui/ProgressBar';
import { EmptyState } from './ui/EmptyState';

interface LeadsModuleProps {
  onLaunchCampaignWithSegment?: (segmentName: string, leadIds: string[], channel?: string) => void;
  onNavigateToInbox?: (conversationId?: string) => void;
  onNavigateToQualified?: () => void;
}

export const LeadsModule: React.FC<LeadsModuleProps> = ({
  onLaunchCampaignWithSegment,
  onNavigateToInbox,
  onNavigateToQualified,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'segments'>('directory');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [segments, setSegments] = useState<LeadSegment[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Multi-select state
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals & Panels
  const [showImportWizard, setShowImportWizard] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerTab, setDrawerTab] = useState<'brief' | 'journey'>('brief');

  // Guided Import Wizard State (Steps 1 to 4)
  const [importStep, setImportStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ParseFileResult | null>(null);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [commitResult, setCommitResult] = useState<{ committed: number; createdIds: string[] } | null>(null);

  // New Lead Form State
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    industry: 'MedTech & Life Sciences',
    city: 'Dublin',
    priority: 'high',
  });

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const [leadsRes, convsRes] = await Promise.all([
        api.getLeads({
          search,
          industry: industryFilter,
          priority: priorityFilter,
          status: statusFilter,
          limit: 100,
        }),
        api.getConversations().catch(() => [])
      ]);
      setLeads(leadsRes.leads);
      setTotal(leadsRes.total);
      setConversations(convsRes);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSegments = async () => {
    try {
      const data = await api.getSegments();
      setSegments(data);
    } catch (err) {
      console.error('Failed to load segments:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchSegments();
  }, [search, industryFilter, priorityFilter, statusFilter]);

  // Step 1: Upload file and parse headers
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    try {
      setIsParsing(true);
      const result = await api.parseLeadFile(file);
      setParseResult(result);
      setColumnMap(result.suggestedMap);
      setImportStep(2);
    } catch (err: any) {
      alert(`File parsing error: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Step 2: Validate records using current column map
  const handleRunValidation = async () => {
    if (!parseResult) return;
    try {
      setIsValidating(true);
      const result = await api.validateImport(parseResult.rawRecords, columnMap);
      setValidationResult(result);
      setImportStep(3);
    } catch (err: any) {
      alert(`Validation error: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Step 4: Commit batch to persistent store
  const handleCommit = async () => {
    if (!validationResult) return;
    const approved = validationResult.records.filter((r) => r.status === 'valid');
    try {
      setIsCommitting(true);
      const res = await api.commitImport(approved, selectedFile?.name || 'Spreadsheet Upload');
      setCommitResult(res);
      setImportStep(4);
      fetchLeads();
      fetchSegments();
    } catch (err: any) {
      alert(`Commit error: ${err.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.company_name) return;

    try {
      await api.createLead(newLead);
      setShowAddModal(false);
      setNewLead({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        industry: 'MedTech & Life Sciences',
        city: 'Dublin',
        priority: 'high',
      });
      fetchLeads();
      fetchSegments();
    } catch (err: any) {
      alert(`Failed to create lead: ${err.message}`);
    }
  };

  const resetImportWizard = () => {
    setShowImportWizard(false);
    setImportStep(1);
    setSelectedFile(null);
    setParseResult(null);
    setValidationResult(null);
    setCommitResult(null);
  };

  // Multi-select helpers
  const handleToggleLead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const handleExportSelected = () => {
    const selectedLeads = leads.filter((l) => selectedLeadIds.includes(l.id));
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Company,Contact,Email,Phone,City,Industry,Priority,Status']
        .concat(
          selectedLeads.map(
            (l) =>
              `"${l.company_name}","${l.contact_name || ''}","${l.email || ''}","${l.phone || ''}","${l.city}","${l.industry}","${l.priority}","${l.status}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `senvo_leads_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute ICP Score for a lead
  const calculateIcpScore = (lead: Lead) => {
    let score = 40; // baseline
    if (lead.email && lead.email.includes('@')) score += 20;
    if (lead.phone && lead.phone.length > 5) score += 15;
    if (lead.contact_name) score += 15;
    if (['Dublin', 'Cork', 'Galway', 'Limerick'].includes(lead.city)) score += 10;
    return Math.min(score, 100);
  };

  const getPriorityBadgeVariant = (priority: string): BadgeVariant => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'qualified':
        return 'success';
      case 'replied':
        return 'info';
      case 'in_campaign':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  const getRecommendedOutreach = (industry: string) => {
    if (industry.includes('Logistics') || industry.includes('Freight')) {
      return {
        approach: 'Statutory Audit Exemption & Port VAT3 Briefing',
        notes: 'Highlight Revenue cross-border reverse charges, customs VAT deferral, and Companies Act 2014 audit exemption limits.',
        objection: 'Existing local accountant may lack specialized cross-border logistics VAT filing workflows.'
      };
    }
    if (industry.includes('MedTech') || industry.includes('Life Sciences')) {
      return {
        approach: 'Section 766 R&D Tax Credit & Grant Audit Briefing',
        notes: 'Focus on Enterprise Ireland / IDA capital grant expenditure certification and Section 766 R&D credit optimization.',
        objection: 'Concerns over Revenue clawback or audit scrutiny for scientific research claims.'
      };
    }
    if (industry.includes('Software') || industry.includes('SaaS')) {
      return {
        approach: 'ERP Migration Advisory (NetSuite / Xero) & Controller Search',
        notes: 'Address recurring SaaS revenue recognition, cross-border IP holding structures, and ACCA finance leadership search.',
        objection: 'Firm already uses general cloud software like QuickBooks but outgrowing entry-tier reporting.'
      };
    }
    if (industry.includes('Retail') || industry.includes('Hospitality')) {
      return {
        approach: 'Managed Payroll Bureau & PAYE Modernisation',
        notes: 'Focus on multi-branch weekly timesheet processing, BrightPay integration, and mandatory pension auto-enrollment preparation.',
        objection: 'Internal payroll drag and seasonal staffing turnover.'
      };
    }
    return {
      approach: 'Statutory Year-End & CRO Form B1 Corporate Filing',
      notes: 'Highlight annual return compliance, registered Dublin office facilities, and Revenue ROS corporate tax returns.',
      objection: 'Company board inertia or satisfaction with incumbent regional bookkeeping firm.'
    };
  };

  const industries = [
    'Freight & Logistics',
    'MedTech & Life Sciences',
    'Marine & Industrial Engineering',
    'B2B Software & SaaS',
    'Retail & Hospitality Group',
    'Agri-Food & Export',
    'CleanTech & Energy',
    'Advanced Manufacturing',
    'Professional Services',
    'Media & Digital Agency',
  ];

  // Helper to match active conversation
  const activeConversationForLead = selectedLead
    ? conversations.find(
        (c) =>
          c.lead_id === selectedLead.id ||
          c.company_name.toLowerCase() === selectedLead.company_name.toLowerCase()
      )
    : null;

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Lead Intelligence & Prospect Directory
            </h2>
            <Badge variant="primary" size="sm">
              {total} Verified Records
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Irish corporate prospects structured by ICP score, channel eligibility, and Revenue/CRO compliance readiness.
          </p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetImportWizard();
              setShowImportWizard(true);
            }}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Guided Lead Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddModal(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Single Lead
          </Button>
        </div>
      </div>

      {/* View Tabs: Directory vs Segments */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Prospects ({total})</span>
        </button>

        <button
          onClick={() => setActiveTab('segments')}
          className={`px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer flex items-center gap-2 ${
            activeTab === 'segments'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Target Segments ({segments.length})</span>
        </button>
      </div>

      {/* Directory Tab View */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="p-3.5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center gap-2.5 sm:gap-3">
              <div className="w-full md:flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by company legal name, decision maker, city, or email..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-slate-50/60 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 w-full md:w-auto">
                <select
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full shadow-2xs"
                >
                  <option value="">All Industries</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full shadow-2xs"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full shadow-2xs"
                >
                  <option value="">All Lifecycle Stages</option>
                  <option value="uncontacted">Uncontacted</option>
                  <option value="in_campaign">In Campaign</option>
                  <option value="replied">Replied (Inbox)</option>
                  <option value="qualified">Qualified</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Multi-Select Bulk Action Floating Ribbon */}
          {selectedLeadIds.length > 0 && (
            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3">
                <Badge variant="primary" size="sm">
                  {selectedLeadIds.length} Selected
                </Badge>
                <span className="text-slate-300 hidden sm:inline text-[11px]">
                  Batch actions for selected corporate prospects:
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    if (onLaunchCampaignWithSegment) {
                      onLaunchCampaignWithSegment(
                        `Custom Batch (${selectedLeadIds.length} leads)`,
                        selectedLeadIds,
                        'email'
                      );
                    }
                  }}
                  leftIcon={<Send className="w-3 h-3" />}
                >
                  Add to Campaign
                </Button>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleExportSelected}
                  className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700"
                  leftIcon={<Download className="w-3 h-3" />}
                >
                  Export CSV
                </Button>

                <button
                  onClick={() => setSelectedLeadIds([])}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Desktop Leads Table (>= md) */}
          <Card className="hidden md:block overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider sticky top-0 backdrop-blur-xs">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={leads.length > 0 && selectedLeadIds.length === leads.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-4">Company Entity</th>
                    <th className="py-3 px-4">Primary Contact</th>
                    <th className="py-3 px-4">Operating Hub</th>
                    <th className="py-3 px-4">ICP Score</th>
                    <th className="py-3 px-4">Channels</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading records from database...
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No prospects found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const isSelected = selectedLeadIds.includes(lead.id);
                      const icpScore = calculateIcpScore(lead);
                      const hasEmail = Boolean(lead.email && lead.email.includes('@'));
                      const hasPhone = Boolean(lead.phone && lead.phone.length > 5);

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => {
                            setSelectedLead(lead);
                            setDrawerTab('brief');
                          }}
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <td
                            className="py-3 px-3 text-center"
                            onClick={(e) => handleToggleLead(lead.id, e)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{lead.company_name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate max-w-[200px]">
                              {lead.industry}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div className="font-medium text-slate-900">{lead.contact_name || 'Managing Director'}</div>
                            <div className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                              {lead.email || '—'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{lead.city}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-bold tabular-nums ${
                                  icpScore >= 80
                                    ? 'text-emerald-700'
                                    : icpScore >= 60
                                    ? 'text-blue-700'
                                    : 'text-amber-700'
                                }`}
                              >
                                {icpScore}%
                              </span>
                              <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    icpScore >= 80
                                      ? 'bg-emerald-500'
                                      : icpScore >= 60
                                      ? 'bg-blue-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${icpScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {hasEmail && (
                                <Badge variant="primary" size="xs">
                                  Email
                                </Badge>
                              )}
                              {hasPhone && (
                                <Badge variant="success" size="xs">
                                  Phone
                                </Badge>
                              )}
                              {lead.contact_name && (
                                <Badge variant="info" size="xs">
                                  LinkedIn
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getPriorityBadgeVariant(lead.priority)} size="xs">
                              {lead.priority.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getStatusBadgeVariant(lead.status)} size="xs">
                              {lead.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLead(lead);
                                  setDrawerTab('brief');
                                }}
                                className="text-blue-600 hover:text-blue-800 font-semibold text-xs cursor-pointer inline-flex items-center gap-0.5"
                              >
                                <span>Brief</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLead(lead);
                                  setDrawerTab('journey');
                                }}
                                className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs cursor-pointer inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200"
                                title="View 8-stage prospect journey visualizer"
                              >
                                <Compass className="w-3 h-3 text-indigo-600" />
                                <span>Journey</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Leads Card View (< md) */}
          <div className="block md:hidden space-y-2.5">
            {loading ? (
              <Card className="p-8 text-center text-slate-400 text-xs">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading records from database...
              </Card>
            ) : leads.length === 0 ? (
              <Card className="p-8 text-center text-slate-400 text-xs">
                No prospects found matching your search criteria.
              </Card>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedLeadIds.includes(lead.id);
                const icpScore = calculateIcpScore(lead);
                const hasEmail = Boolean(lead.email && lead.email.includes('@'));
                const hasPhone = Boolean(lead.phone && lead.phone.length > 5);

                return (
                  <Card
                    key={lead.id}
                    onClick={() => {
                      setSelectedLead(lead);
                      setDrawerTab('brief');
                    }}
                    className={`p-3.5 space-y-2.5 transition-all cursor-pointer ${
                      isSelected ? 'border-blue-500 bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleLead(lead.id, e as any)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.company_name}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                            {lead.contact_name || 'Managing Director'} {lead.email ? `• ${lead.email}` : ''}
                          </p>
                        </div>
                      </div>

                      <Badge variant={getPriorityBadgeVariant(lead.priority)} size="xs">
                        {lead.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 gap-1.5">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{lead.city}</span>
                        <span>•</span>
                        <span className="truncate max-w-[140px]">{lead.industry}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">ICP:</span>
                        <span className="font-bold text-slate-800 text-xs">{icpScore}%</span>
                        <Badge variant={getStatusBadgeVariant(lead.status)} size="xs">
                          {lead.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <div className="flex items-center gap-1">
                        {hasEmail && (
                          <Badge variant="primary" size="xs">
                            Email
                          </Badge>
                        )}
                        {hasPhone && (
                          <Badge variant="success" size="xs">
                            Phone
                          </Badge>
                        )}
                        {lead.contact_name && (
                          <Badge variant="info" size="xs">
                            LinkedIn
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 font-semibold text-xs flex items-center gap-0.5">
                          <span>Brief</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                            setDrawerTab('journey');
                          }}
                          className="text-indigo-600 font-semibold text-xs flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200"
                        >
                          <Compass className="w-3 h-3" />
                          <span>Journey</span>
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Target Segments Tab View */}
      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((seg) => (
            <Card
              key={seg.id}
              hoverEffect
              className="p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="primary" size="sm">
                    {seg.channel_fit}
                  </Badge>
                  <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full tabular-nums">
                    {seg.count} prospects
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{seg.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{seg.description}</p>

                {/* Sample leads preview */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 block">Sample records:</span>
                  {seg.sample_leads?.map((sl) => (
                    <div key={sl.id} className="text-slate-700 flex items-center justify-between text-[11px]">
                      <span className="font-medium truncate">{sl.company_name}</span>
                      <span className="text-slate-400">{sl.city}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (onLaunchCampaignWithSegment) {
                    onLaunchCampaignWithSegment(seg.name, seg.lead_ids, seg.channel_fit);
                  }
                }}
                disabled={seg.count === 0}
                className="w-full"
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Launch Campaign for this Segment
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Guided Multi-Step Lead Import Wizard Modal */}
      {showImportWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base leading-tight">
                    Guided Prospect Import & Channel Segmentation
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Step {importStep} of 4:{' '}
                    {importStep === 1
                      ? 'Upload File'
                      : importStep === 2
                      ? 'Column Mapping'
                      : importStep === 3
                      ? 'Validation & Channel Segments'
                      : 'Commit & Campaign'}
                  </p>
                </div>
              </div>
              <button
                onClick={resetImportWizard}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="grid grid-cols-4 border-b border-slate-200 text-xs font-semibold text-center bg-slate-50 shrink-0">
              <div
                className={`py-2.5 ${
                  importStep === 1
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-500'
                }`}
              >
                1. Upload
              </div>
              <div
                className={`py-2.5 ${
                  importStep === 2
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-500'
                }`}
              >
                2. Map Fields
              </div>
              <div
                className={`py-2.5 ${
                  importStep === 3
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-500'
                }`}
              >
                3. Segment
              </div>
              <div
                className={`py-2.5 ${
                  importStep === 4
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-slate-500'
                }`}
              >
                4. Commit
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* STEP 1: Upload */}
              {importStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upload an Irish corporate prospect list (.CSV or .XLSX). Original source metadata is preserved, and missing contact channels will be flagged automatically.
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-slate-900">Pre-formatted Sample Available:</span>
                      <span className="text-[11px] text-slate-500 font-mono break-all">
                        sample_data/SENVO_Irish_Corporate_Leads.csv
                      </span>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      id="wizard-file"
                      accept=".csv, .xlsx, .xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      className="hidden"
                    />
                    <label htmlFor="wizard-file" className="cursor-pointer block space-y-2">
                      <Upload className="w-8 h-8 text-blue-600 mx-auto" />
                      <p className="text-xs font-semibold text-slate-800">
                        {isParsing ? 'Reading and parsing file...' : 'Click to select CSV or Excel workbook'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Detects company name, decision makers, telephone, email, and corporate location
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 2: Map and Validate */}
              {importStep === 2 && parseResult && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-900 gap-1">
                    <div>
                      <span className="font-bold">File: {parseResult.filename}</span>
                      <span className="ml-2 text-blue-700">({parseResult.rowCount} total rows detected)</span>
                    </div>
                    <Badge variant="primary" size="xs">
                      Headers Auto-Detected
                    </Badge>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                      Destination Field Mapping
                    </span>
                    {[
                      { field: 'company_name', label: 'Company Legal Name *', req: true },
                      { field: 'contact_name', label: 'Primary Decision Maker', req: false },
                      { field: 'email', label: 'Corporate Email Address', req: false },
                      { field: 'phone', label: 'Direct Phone / WhatsApp', req: false },
                      { field: 'industry', label: 'Industry Sector', req: false },
                      { field: 'city', label: 'City / Operating Hub', req: false },
                      { field: 'priority', label: 'Target Priority', req: false },
                    ].map((f) => (
                      <div
                        key={f.field}
                        className="flex flex-col sm:grid sm:grid-cols-2 items-start sm:items-center gap-1 sm:gap-3"
                      >
                        <span className="text-slate-700 font-medium">{f.label}</span>
                        <select
                          value={columnMap[f.field] || ''}
                          onChange={(e) => setColumnMap({ ...columnMap, [f.field]: e.target.value })}
                          className="w-full border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">(Not Mapped)</option>
                          {parseResult.headers.map((h) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center border-t border-slate-100 gap-2 sm:gap-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImportStep(1)}
                    >
                      Back to File
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={isValidating}
                      disabled={!columnMap.company_name}
                      onClick={handleRunValidation}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Validate & Compute Segments
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Segmentation Review & Deduplication */}
              {importStep === 3 && validationResult && (
                <div className="space-y-4">
                  {/* Validation Summary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-center text-xs">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="text-emerald-700 block text-[11px] font-semibold">Eligible Records</span>
                      <span className="text-xl font-bold text-emerald-900 tabular-nums">
                        {validationResult.eligible}
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-amber-700 block text-[11px] font-semibold">Duplicates Detected</span>
                      <span className="text-xl font-bold text-amber-900 tabular-nums">
                        {validationResult.duplicates}
                      </span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-500 block text-[11px] font-semibold">Incomplete / Skipped</span>
                      <span className="text-xl font-bold text-slate-700 tabular-nums">
                        {validationResult.incomplete}
                      </span>
                    </div>
                  </div>

                  {/* Channel Breakdown Box */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <span className="font-bold text-slate-900 block text-[11px]">
                      Contact Channel Eligibility Breakdown:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded font-medium text-slate-700">
                        Multi-Channel Ready: <strong>{validationResult.segment_counts.multi_channel}</strong>
                      </span>
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded font-medium text-slate-700">
                        Email Outreach: <strong>{validationResult.segment_counts.email_ready}</strong>
                      </span>
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded font-medium text-slate-700">
                        WhatsApp / SMS: <strong>{validationResult.segment_counts.phone_ready}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Records Preview Table */}
                  <div className="border border-slate-200 rounded-lg max-h-56 overflow-y-auto overflow-x-auto shadow-2xs">
                    <table className="w-full min-w-[420px] text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="p-2">Company</th>
                          <th className="p-2">Channels</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Review Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {validationResult.records.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-2 font-medium text-slate-900">{r.company_name}</td>
                            <td className="p-2">
                              <span className="text-slate-600">{r.eligible_channels.join(', ') || 'None'}</span>
                            </td>
                            <td className="p-2">
                              <Badge
                                variant={
                                  r.status === 'valid'
                                    ? 'success'
                                    : r.status === 'duplicate'
                                    ? 'warning'
                                    : 'danger'
                                }
                                size="xs"
                              >
                                {r.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-2 text-slate-500">{r.issues.join('; ') || 'Ready for import'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-3 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center border-t border-slate-100 gap-2 sm:gap-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImportStep(2)}
                    >
                      Back to Mapping
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      isLoading={isCommitting}
                      disabled={validationResult.eligible === 0}
                      onClick={handleCommit}
                      rightIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Commit {validationResult.eligible} Eligible Leads
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirmation & Campaign Handoff */}
              {importStep === 4 && commitResult && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Import Successfully Committed</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {commitResult.committed} validated Irish corporate prospects have been persisted to the database.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 text-left space-y-1">
                    <span className="font-bold">Next Actionable Step:</span>
                    <p>
                      Continue straight into campaign creation using this freshly imported audience, or view them in the main directory.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetImportWizard}
                    >
                      View in Leads Directory
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        resetImportWizard();
                        if (onLaunchCampaignWithSegment) {
                          onLaunchCampaignWithSegment(
                            'Fresh Import Batch',
                            commitResult.createdIds,
                            'Corporate Email'
                          );
                        }
                      }}
                      leftIcon={<Send className="w-3.5 h-3.5" />}
                    >
                      Create Campaign for this Batch
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Single Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm sm:text-base">Add Single Irish Corporate Prospect</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-5 space-y-3.5 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.company_name}
                  onChange={(e) => setNewLead({ ...newLead, company_name: e.target.value })}
                  placeholder="e.g. Galway Marine Engineering Ltd"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={newLead.contact_name}
                    onChange={(e) => setNewLead({ ...newLead, contact_name: e.target.value })}
                    placeholder="e.g. Liam Higgins"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Operating Hub</label>
                  <input
                    type="text"
                    value={newLead.city}
                    onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                    placeholder="e.g. Cork"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="contact@company.ie"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+353 1 234 5678"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sector</label>
                <select
                  value={newLead.industry}
                  onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white shadow-2xs"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                >
                  Save Record
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Part 2 & Part 3: Company Intelligence Brief & Prospect Journey Visualizer Slide-over */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl p-5 sm:p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {selectedLead.company_name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedLead.city}, Ireland &bull; {selectedLead.industry}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dual Tab Switcher: Intelligence Brief vs. Prospect Journey */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setDrawerTab('brief')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    drawerTab === 'brief'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Company Intelligence Brief</span>
                </button>

                <button
                  onClick={() => setDrawerTab('journey')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    drawerTab === 'journey'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Prospect Journey Visualizer</span>
                </button>
              </div>

              {/* TAB 1: COMPANY INTELLIGENCE BRIEF */}
              {drawerTab === 'brief' && (
                <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                  {/* Verified Corporate Facts Card */}
                  <Card className="border-slate-200/90 p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Corporate Profile (CRO Registered)</span>
                      </span>
                      <Badge variant={getPriorityBadgeVariant(selectedLead.priority)} size="xs">
                        {selectedLead.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Decision Maker</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {selectedLead.contact_name || 'Managing Director'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Operating Hub</span>
                        <span className="font-semibold text-slate-800">
                          {selectedLead.city}, Ireland
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Corporate Email</span>
                        <span className="font-mono text-slate-800 break-all">{selectedLead.email || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase">Direct Telephone</span>
                        <span className="font-mono text-slate-800">{selectedLead.phone || '—'}</span>
                      </div>
                    </div>
                  </Card>

                  {/* ICP Fit Reasoning Card */}
                  <Card className="border-blue-200/80 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-4 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span>ICP Score & Evaluation Reasoning</span>
                      </div>
                      <Badge variant="primary" size="sm">
                        {calculateIcpScore(selectedLead)}/100 Tier 1 Fit
                      </Badge>
                    </div>

                    <ProgressBar
                      value={calculateIcpScore(selectedLead)}
                      color="blue"
                      size="sm"
                    />

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-white/80 p-2 rounded border border-blue-100 flex justify-between">
                        <span className="text-slate-500">Industry Fit:</span>
                        <span className="font-bold text-emerald-700">100%</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded border border-blue-100 flex justify-between">
                        <span className="text-slate-500">Hub Alignment:</span>
                        <span className="font-bold text-emerald-700">100%</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded border border-blue-100 flex justify-between">
                        <span className="text-slate-500">Decision Maker:</span>
                        <span className="font-bold text-emerald-700">
                          {selectedLead.contact_name ? '100%' : '50%'}
                        </span>
                      </div>
                      <div className="bg-white/80 p-2 rounded border border-blue-100 flex justify-between">
                        <span className="text-slate-500">Reachability:</span>
                        <span className="font-bold text-emerald-700">
                          {selectedLead.email && selectedLead.phone ? '100%' : '60%'}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Potential Objections & Recommended Approach */}
                  {(() => {
                    const rec = getRecommendedOutreach(selectedLead.industry);
                    return (
                      <Card className="border-slate-200/90 p-4 space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>Recommended Outreach Strategy</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">SENVO Practice Guidelines</span>
                        </div>

                        <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-lg space-y-1">
                          <span className="font-bold text-blue-900 block text-xs">{rec.approach}</span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{rec.notes}</p>
                        </div>

                        <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-lg space-y-1">
                          <span className="font-bold text-amber-900 block text-xs">Anticipated Objection & Defense:</span>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{rec.objection}</p>
                        </div>
                      </Card>
                    );
                  })()}

                  {/* Recorded Engagement Context */}
                  <Card className="border-slate-200/90 p-4 space-y-2 shadow-2xs">
                    <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                      Recorded Dialogue & Inbound Inquiry
                    </span>
                    {activeConversationForLead?.last_message ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700 italic">
                        "{activeConversationForLead.last_message}"
                        <span className="block not-italic text-[10px] text-slate-400 font-medium mt-1">
                          Captured via {activeConversationForLead.channel} &bull; Intent:{' '}
                          <strong className="text-blue-700 capitalize">
                            {(activeConversationForLead.latest_intent || 'General Corporate').replace(/_/g, ' ')}
                          </strong>
                        </span>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">
                        No prospect turn recorded yet. Use the Campaign Builder or Unified Inbox to begin simulated outreach.
                      </p>
                    )}
                  </Card>
                </div>
              )}

              {/* TAB 2: PROSPECT JOURNEY VISUALIZER */}
              {drawerTab === 'journey' && (
                <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-950">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span className="font-medium">
                        <strong>8-Stage Lifecycle Journey:</strong> Tracked from initial discovery to Bitrix24 CRM handoff.
                      </span>
                    </div>
                  </div>

                  {/* Journey Timeline */}
                  <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 pl-8">
                    {/* Stage 1: Discovery */}
                    <div className="relative space-y-0.5">
                      <span className="absolute -left-8 top-0.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        ✓
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">1. Ingested & Verified</span>
                        <Badge variant="success" size="xs">
                          COMPLETED
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {selectedLead.company_name} registered into persistent database with verified CRO status.
                      </p>
                    </div>

                    {/* Stage 2: Enrichment */}
                    <div className="relative space-y-0.5 pt-2">
                      <span className="absolute -left-8 top-2.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        ✓
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">2. Contact Channels Enriched</span>
                        <Badge variant="success" size="xs">
                          COMPLETED
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Primary decision maker identified: {selectedLead.contact_name || 'Managing Director'} (Email & Phone verified).
                      </p>
                    </div>

                    {/* Stage 3: Segmentation */}
                    <div className="relative space-y-0.5 pt-2">
                      <span className="absolute -left-8 top-2.5 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        ✓
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">3. Segmented for Outreach</span>
                        <Badge variant="success" size="xs">
                          COMPLETED
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Classified into {selectedLead.industry} Irish corporate target cluster.
                      </p>
                    </div>

                    {/* Stage 4: Outreach Dispatch */}
                    {(() => {
                      const isDispatched = selectedLead.status !== 'uncontacted';
                      return (
                        <div className="relative space-y-0.5 pt-2">
                          <span
                            className={`absolute -left-8 top-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                              isDispatched ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isDispatched ? '✓' : '4'}
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">4. Outbound Outreach</span>
                            <Badge variant={isDispatched ? 'success' : 'neutral'} size="xs">
                              {isDispatched ? 'DISPATCHED' : 'AWAITING CAMPAIGN'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {isDispatched
                              ? 'Personalized statutory briefing dispatched in simulated sandbox environment.'
                              : 'Ready for enrollment in multi-channel email, LinkedIn, or WhatsApp campaign.'}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Stage 5: Inbound Engagement */}
                    {(() => {
                      const hasReplied = Boolean(activeConversationForLead?.last_message);
                      return (
                        <div className="relative space-y-0.5 pt-2">
                          <span
                            className={`absolute -left-8 top-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                              hasReplied ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {hasReplied ? '✓' : '5'}
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">5. Inbound Engagement</span>
                            <Badge variant={hasReplied ? 'success' : 'neutral'} size="xs">
                              {hasReplied ? 'ENGAGED' : 'PENDING REPLY'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {hasReplied
                              ? `Prospect turn received via ${activeConversationForLead?.channel}.`
                              : 'Awaiting prospect response or simulate inbound turn in Unified Inbox.'}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Stage 6: AI Intent Qualification */}
                    {(() => {
                      const isQualified =
                        selectedLead.status === 'qualified' ||
                        Boolean(activeConversationForLead?.latest_intent?.includes('demo') || activeConversationForLead?.latest_intent?.includes('qualified'));
                      return (
                        <div className="relative space-y-0.5 pt-2">
                          <span
                            className={`absolute -left-8 top-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                              isQualified ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isQualified ? '✓' : '6'}
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">6. AI Intent Qualification</span>
                            <Badge variant={isQualified ? 'success' : 'neutral'} size="xs">
                              {isQualified ? 'QUALIFIED' : 'IN REVIEW'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {isQualified
                              ? 'Classified as high-intent opportunity requiring discovery consultation.'
                              : 'Intent classification evaluated against Irish corporate statutory guidelines.'}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Stage 7: Meeting Interest */}
                    {(() => {
                      const hasMeeting =
                        selectedLead.status === 'qualified' ||
                        Boolean(activeConversationForLead?.latest_intent?.includes('meeting') || activeConversationForLead?.latest_intent?.includes('demo'));
                      return (
                        <div className="relative space-y-0.5 pt-2">
                          <span
                            className={`absolute -left-8 top-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                              hasMeeting ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {hasMeeting ? '✓' : '7'}
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">7. Meeting Interest Confirmed</span>
                            <Badge variant={hasMeeting ? 'success' : 'neutral'} size="xs">
                              {hasMeeting ? 'CONFIRMED' : 'PENDING'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {hasMeeting
                              ? '20-minute Zoom introductory discovery consultation requested.'
                              : 'Co-Pilot prepared follow-up offering discovery timeslots.'}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Stage 8: Bitrix24 CRM Handoff */}
                    {(() => {
                      const isHandoff = selectedLead.status === 'qualified';
                      return (
                        <div className="relative space-y-0.5 pt-2">
                          <span
                            className={`absolute -left-8 top-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-2xs ${
                              isHandoff ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isHandoff ? '✓' : '8'}
                          </span>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">8. Bitrix24 CRM Handoff</span>
                            <Badge variant={isHandoff ? 'success' : 'neutral'} size="xs">
                              {isHandoff ? 'CRM STAGED' : 'PENDING QUALIFICATION'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {isHandoff
                              ? 'Opportunity formatted into crm.lead.add schema and staged for CRM webhook sync.'
                              : 'Triggers automatically upon qualification in Unified Inbox.'}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="flex gap-2">
                {activeConversationForLead && onNavigateToInbox && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(null);
                      onNavigateToInbox(activeConversationForLead.id);
                    }}
                    className="flex-1"
                    leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
                  >
                    Open in Unified Inbox
                  </Button>
                )}

                {selectedLead.status === 'qualified' && onNavigateToQualified && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(null);
                      onNavigateToQualified();
                    }}
                    className="flex-1"
                    leftIcon={<Award className="w-3.5 h-3.5" />}
                  >
                    View in Qualified Leads
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLead(null)}
                className="w-full"
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsModule;
