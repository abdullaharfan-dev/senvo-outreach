import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  Plus,
  X,
  Sparkles,
  Layers,
  Search,
  Filter,
  FileText,
  Clock,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import type { KnowledgeItem } from '../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './ui/Card';
import { Badge, type BadgeVariant } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';

export const KnowledgeModule: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('service');
  const [content, setContent] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const fetchKnowledge = async () => {
    try {
      const data = await api.getKnowledge();
      setItems(data);
    } catch (err) {
      console.error('Failed to load knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setSaving(true);
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, title: title.trim(), content: content.trim() }),
      });
      setShowAddModal(false);
      setTitle('');
      setContent('');
      fetchKnowledge();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getCategoryBadgeVariant = (cat: string): BadgeVariant => {
    switch (cat) {
      case 'claim_boundary':
        return 'danger';
      case 'faq':
        return 'info';
      case 'pricing_rule':
        return 'warning';
      case 'service':
        return 'primary';
      case 'objection':
        return 'purple';
      default:
        return 'neutral';
    }
  };

  const filteredItems = items.filter((x) => {
    const matchesCategory = categoryFilter === 'all' || x.category === categoryFilter;
    const matchesSearch =
      search === '' ||
      x.title.toLowerCase().includes(search.toLowerCase()) ||
      x.content.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Approved Company Knowledge & Compliance Grounding
            </h2>
            <Badge variant="success" size="sm">
              {items.length} Grounding Documents
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative source of truth injected into Gemini AI prompt context &bull; Enforces Irish corporate statutory, tax, and service boundaries.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Knowledge Guideline
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search approved knowledge by topic, statute, CRO rules, or service line..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50/60 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {[
              { id: 'all', label: 'All Knowledge' },
              { id: 'service', label: 'Approved Services' },
              { id: 'claim_boundary', label: 'Compliance Boundaries' },
              { id: 'faq', label: 'Statutory & Tax FAQs' },
              { id: 'pricing_rule', label: 'Pricing Guidelines' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer font-medium ${
                  categoryFilter === tab.id
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Knowledge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-16 text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading knowledge records from Supabase PostgreSQL...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-2">
            <EmptyState
              icon={BookOpen}
              title="No knowledge records found"
              description="No documents match your category or search query. Try clearing filters or create a new guideline."
              actionLabel="Clear Filters"
              onAction={() => {
                setCategoryFilter('all');
                setSearch('');
              }}
              className="py-16"
            />
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card
              key={item.id}
              hoverEffect
              onClick={() => setSelectedItem(item)}
              className="p-5 flex flex-col justify-between space-y-3 cursor-pointer shadow-card"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge variant={getCategoryBadgeVariant(item.category)} size="xs">
                    {item.category.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Approved for AI Grounding</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-sans">
                  {item.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono">{item.content.length} characters</span>
                <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                  <span>Inspect Document</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Selected Document Detail Slide-over Panel */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex justify-end z-50 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-5 sm:p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <Badge variant={getCategoryBadgeVariant(selectedItem.category)} size="xs">
                    {selectedItem.category.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    {selectedItem.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Verified Knowledge Base Document:</strong> Automatically injected into the Gemini prompt pipeline to ground autonomous SDR and Co-Pilot draft replies.
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">
                  Approved Content & Guidelines
                </label>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-line shadow-2xs">
                  {selectedItem.content}
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Document ID:</span>
                  <span className="font-mono text-slate-700">{selectedItem.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Approval Status:</span>
                  <span className="text-emerald-700 font-semibold">Active &bull; Injected in Production Context</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="text-slate-700">
                    {new Date(selectedItem.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedItem(null)}
                className="w-full"
              >
                Close Document Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Knowledge Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Add Approved Knowledge Entry</h3>
                <p className="text-[11px] text-slate-400">Ground Gemini AI on verified Irish practice policies</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Entry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 shadow-2xs"
                >
                  <option value="service">Approved Service Offering</option>
                  <option value="claim_boundary">Compliance & Claim Boundary</option>
                  <option value="faq">Statutory & Tax FAQ</option>
                  <option value="pricing_rule">Engagement & Fee Guideline</option>
                  <option value="objection">Objection Handling Guidance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CRO Annual Return (Form B1) Rules"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content / Instructions for AI *
                </label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed guidelines that the AI SDR and Co-Pilot must follow when answering prospects..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans shadow-2xs"
                />
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
                  isLoading={saving}
                >
                  Save Guideline
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeModule;
