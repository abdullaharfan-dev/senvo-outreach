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
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import type { Lead, LeadSegment, ParseFileResult, ValidationResult, ValidatedLeadRecord } from '../types';

interface LeadsModuleProps {
  onLaunchCampaignWithSegment?: (segmentName: string, leadIds: string[], channel?: string) => void;
}

export const LeadsModule: React.FC<LeadsModuleProps> = ({ onLaunchCampaignWithSegment }) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'segments'>('directory');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [segments, setSegments] = useState<LeadSegment[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Modals & Panels
  const [showImportWizard, setShowImportWizard] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Guided Import Wizard State (Steps 1 to 5)
  const [importStep, setImportStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ParseFileResult | null>(null);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('all');
  const [isCommitting, setIsCommitting] = useState<boolean>(false);
  const [commitResult, setCommitResult] = useState<{ committed: number; createdIds: string[] } | null>(null);

  // New Lead Form
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
      const res = await api.getLeads({
        search,
        industry: industryFilter,
        priority: priorityFilter,
        status: statusFilter,
        limit: 100,
      });
      setLeads(res.leads);
      setTotal(res.total);
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

  // Step 4: Commit batch to SQLite
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

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Prospects & Intelligent Segments</h2>
          <p className="text-xs text-slate-500">
            {total} Irish corporate prospects registered • Structured by channel eligibility and sector
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetImportWizard();
              setShowImportWizard(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Guided Lead Import</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Lead</span>
          </button>
        </div>
      </div>

      {/* View Tabs: Directory vs Segments */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Prospects ({total})</span>
        </button>

        <button
          onClick={() => setActiveTab('segments')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'segments'
              ? 'bg-slate-900 text-white shadow-2xs'
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
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company, decision maker, city, or email..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Lifecycle Stages</option>
              <option value="uncontacted">Uncontacted</option>
              <option value="in_campaign">In Campaign</option>
              <option value="replied">Replied (Inbox)</option>
              <option value="qualified">Qualified</option>
            </select>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Company Name</th>
                    <th className="py-3 px-4">Primary Contact</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4">Channel Availability</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading records from database...
                      </td>
                    </tr>
                  ) : leads.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No prospects found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => {
                      const hasEmail = Boolean(lead.email && lead.email.includes('@'));
                      const hasPhone = Boolean(lead.phone && lead.phone.length > 5);

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{lead.company_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            <div className="font-medium">{lead.contact_name || 'Managing Director'}</div>
                            <div className="text-[11px] text-slate-400">{lead.email || 'No email on record'}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{lead.city}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{lead.industry}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {hasEmail && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                                  Email
                                </span>
                              )}
                              {hasPhone && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  Phone
                                </span>
                              )}
                              {lead.contact_name && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-50 text-sky-700 border border-sky-200">
                                  LinkedIn
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                lead.priority === 'high'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : lead.priority === 'medium'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {lead.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                lead.status === 'qualified'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : lead.status === 'replied'
                                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                                  : lead.status === 'in_campaign'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span className="capitalize">{lead.status.replace('_', ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLead(lead);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-xs cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Segments Tab View */}
      {activeTab === 'segments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {seg.channel_fit}
                  </span>
                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
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

              <button
                onClick={() => {
                  if (onLaunchCampaignWithSegment) {
                    onLaunchCampaignWithSegment(seg.name, seg.lead_ids, seg.channel_fit);
                  }
                }}
                disabled={seg.count === 0}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Launch Campaign for this Segment</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Guided Multi-Step Lead Import Wizard Modal */}
      {showImportWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-base leading-tight">Guided Prospect Import & Channel Segmentation</h3>
                  <p className="text-[11px] text-slate-400">Step {importStep} of 4: {importStep === 1 ? 'Upload File' : importStep === 2 ? 'Column Mapping' : importStep === 3 ? 'Validation & Channel Segments' : 'Commit & Campaign'}</p>
                </div>
              </div>
              <button onClick={resetImportWizard} className="text-slate-400 hover:text-white p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="grid grid-cols-4 border-b border-slate-200 text-xs font-semibold text-center bg-slate-50 shrink-0">
              <div className={`py-2.5 ${importStep === 1 ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
                1. Upload
              </div>
              <div className={`py-2.5 ${importStep === 2 ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
                2. Map Fields
              </div>
              <div className={`py-2.5 ${importStep === 3 ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
                3. Segment
              </div>
              <div className={`py-2.5 ${importStep === 4 ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500'}`}>
                4. Commit
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* STEP 1: Upload */}
              {importStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upload an Irish corporate prospect list (.CSV or .XLSX). Original source metadata is preserved, and missing contact channels will be flagged automatically.
                  </p>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-slate-900">Pre-formatted Sample Available:</span>
                      <span className="text-[11px] text-slate-500">sample_data/SENVO_Irish_Corporate_Leads.csv</span>
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
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs text-blue-900">
                    <div>
                      <span className="font-bold">File: {parseResult.filename}</span>
                      <span className="ml-2 text-blue-700">({parseResult.rowCount} total rows detected)</span>
                    </div>
                    <span className="text-[11px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                      Headers Auto-Detected
                    </span>
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
                      <div key={f.field} className="grid grid-cols-2 items-center gap-3">
                        <span className="text-slate-700 font-medium">{f.label}</span>
                        <select
                          value={columnMap[f.field] || ''}
                          onChange={(e) => setColumnMap({ ...columnMap, [f.field]: e.target.value })}
                          className="border border-slate-300 rounded-lg p-2 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
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

                  <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setImportStep(1)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Back to File
                    </button>
                    <button
                      type="button"
                      onClick={handleRunValidation}
                      disabled={isValidating || !columnMap.company_name}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isValidating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Validating Records...</span>
                        </>
                      ) : (
                        <>
                          <span>Validate & Compute Segments</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Segmentation Review & Deduplication */}
              {importStep === 3 && validationResult && (
                <div className="space-y-4">
                  {/* Validation Summary Metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="text-emerald-700 block text-[11px] font-semibold">Eligible Records</span>
                      <span className="text-xl font-bold text-emerald-900">{validationResult.eligible}</span>
                    </div>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-amber-700 block text-[11px] font-semibold">Duplicates Detected</span>
                      <span className="text-xl font-bold text-amber-900">{validationResult.duplicates}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-slate-500 block text-[11px] font-semibold">Incomplete / Skipped</span>
                      <span className="text-xl font-bold text-slate-700">{validationResult.incomplete}</span>
                    </div>
                  </div>

                  {/* Channel Breakdown Box */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <span className="font-bold text-slate-900 block text-[11px]">Contact Channel Eligibility Breakdown:</span>
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
                  <div className="border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
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
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  r.status === 'valid'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : r.status === 'duplicate'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td className="p-2 text-slate-500">{r.issues.join('; ') || 'Ready for import'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setImportStep(2)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Back to Mapping
                    </button>
                    <button
                      type="button"
                      onClick={handleCommit}
                      disabled={isCommitting || validationResult.eligible === 0}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isCommitting ? 'Committing to Database...' : `Commit ${validationResult.eligible} Eligible Leads`}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirmation & Campaign Handoff */}
              {importStep === 4 && commitResult && (
                <div className="space-y-4 text-center py-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Import Successfully Committed</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {commitResult.committed} validated Irish corporate prospects have been persisted to SQLite.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 text-left space-y-1">
                    <span className="font-bold">Next Actionable Step:</span>
                    <p>Continue straight into campaign creation using this freshly imported audience, or view them in the main directory.</p>
                  </div>

                  <div className="pt-4 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={resetImportWizard}
                      className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                    >
                      View in Leads Directory
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetImportWizard();
                        if (onLaunchCampaignWithSegment) {
                          onLaunchCampaignWithSegment('Fresh Import Batch', commitResult.createdIds, 'Corporate Email');
                        }
                      }}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Create Campaign for this Batch</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add Single Irish Corporate Prospect</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.company_name}
                  onChange={(e) => setNewLead({ ...newLead, company_name: e.target.value })}
                  placeholder="e.g. Galway Marine Engineering Ltd"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={newLead.contact_name}
                    onChange={(e) => setNewLead({ ...newLead, contact_name: e.target.value })}
                    placeholder="e.g. Liam Higgins"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Hub</label>
                  <input
                    type="text"
                    value={newLead.city}
                    onChange={(e) => setNewLead({ ...newLead, city: e.target.value })}
                    placeholder="e.g. Cork"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="contact@company.ie"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+353 1 234 5678"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sector</label>
                <select
                  value={newLead.industry}
                  onChange={(e) => setNewLead({ ...newLead, industry: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {industries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail Slide-over Panel */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    Corporate Prospect Profile
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedLead.company_name}</h3>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Primary Decision Maker</span>
                  <span className="font-semibold text-slate-900 text-sm">{selectedLead.contact_name || 'Managing Director'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Corporate Email</span>
                  <span className="text-slate-800 font-mono">{selectedLead.email || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Direct Telephone</span>
                  <span className="text-slate-800 font-mono">{selectedLead.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Operating Hub</span>
                  <span className="text-slate-800">{selectedLead.city}, Ireland</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Sector Classification</span>
                  <span className="text-slate-800">{selectedLead.industry}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Lifecycle Stage</span>
                  <span className="inline-block px-2.5 py-1 rounded bg-slate-100 font-semibold text-slate-800 capitalize">
                    {selectedLead.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedLead(null)}
                className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsModule;
