import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  Plus,
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import type { KnowledgeItem } from '../types';

export const KnowledgeModule: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
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
        body: JSON.stringify({ category, title, content }),
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

  const filteredItems = categoryFilter === 'all' ? items : items.filter((x) => x.category === categoryFilter);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Approved Company Knowledge & Compliance Grounding</h2>
          <p className="text-xs text-slate-500">
            Authoritative source of truth injected into Gemini AI context • Enforces Irish compliance & service boundaries
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Knowledge Guideline</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-medium overflow-x-auto">
        {[
          { id: 'all', label: 'All Knowledge' },
          { id: 'service', label: 'Approved Services' },
          { id: 'claim_boundary', label: 'Compliance & Claim Boundaries' },
          { id: 'faq', label: 'Statutory & Tax FAQs' },
          { id: 'pricing_rule', label: 'Engagement & Pricing Rules' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              categoryFilter === tab.id
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Knowledge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">Loading knowledge records...</div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">No records found.</div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    item.category === 'claim_boundary'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : item.category === 'faq'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {item.category.replace('_', ' ')}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Approved for AI</span>
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-sans">
                {item.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add Approved Knowledge Entry</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Entry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="service">Approved Service</option>
                  <option value="claim_boundary">Compliance & Claim Boundary</option>
                  <option value="faq">Statutory & Tax FAQ</option>
                  <option value="pricing_rule">Engagement & Fee Guideline</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Policy Subject *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CRO Annual Return (Form B1) Rules"
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content / Instruction for AI *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed guidelines that the AI must follow when answering prospects..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !title.trim() || !content.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  {saving ? 'Saving...' : 'Add Knowledge Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeModule;
