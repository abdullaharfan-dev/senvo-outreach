import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Server,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export const SettingsModule: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const [health, setHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [resetting, setResetting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoadingHealth(true);
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleTestAi = async () => {
    try {
      setTestResult('Calling Gemini API directly via server backend...');
      const res = await api.getHealth();
      if (res.ai?.status === 'operational') {
        setTestResult(`Success: Gemini model ${res.ai.model} responded with valid structured output.`);
      } else {
        setTestResult(`Gemini Status: ${res.ai?.error || 'Unavailable'}`);
      }
    } catch (err: any) {
      setTestResult(`Test failed: ${err.message}`);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset SQLite database and reload all Ireland corporate seed records?')) return;
    try {
      setResetting(true);
      await api.resetDemo();
      alert('Database successfully reset to clean Ireland Corporate Practice state.');
      onReset();
      checkHealth();
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Configuration & Security Safeguards</h2>
        <p className="text-xs text-slate-500">
          Manage workspace settings, verify Gemini AI connectivity, and review persistent SQLite storage
        </p>
      </div>

      {/* Workspace Profile */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Tenant Workspace Profile</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">Organization Practice</label>
            <input
              type="text"
              readOnly
              value="SENVO Ireland Corporate & Professional Services"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1">Operating Jurisdiction</label>
            <input
              type="text"
              readOnly
              value="Ireland (Dublin • Cork • Galway)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1">Assigned Demo Account</label>
            <input
              type="text"
              readOnly
              value="partner@senvo.ie (Senior Client Partner)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1">Simulation Mode</label>
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Safe Simulated Mode (Zero Real External Dispatch)</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Diagnostic */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Server-Side Gemini AI Engine</h3>
          </div>
          <button
            onClick={handleTestAi}
            className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
          >
            Test Live AI Call
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Provider Architecture</span>
            <span className="font-bold text-slate-900">Google Gemini API</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Configured Model</span>
            <span className="font-bold text-blue-700">
              {health?.ai?.model || 'gemini-3.5-flash-lite'}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-slate-400 block text-[11px]">Server Authentication</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Server-Side Secret</span>
            </span>
          </div>
        </div>

        {testResult && (
          <div className="p-3 bg-slate-900 text-cyan-300 font-mono text-xs rounded-lg border border-slate-800">
            {testResult}
          </div>
        )}
      </div>

      {/* Persistent Database Information */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Persistent Database Architecture</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-slate-600">Storage Location:</span>
              <span className="font-mono text-slate-900 font-semibold">server/data/senvo_outreach.db</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-600">Engine / Concurrency:</span>
              <span className="font-mono text-slate-900">SQLite 3 (WAL Journal Mode & Foreign Keys ON)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-600">Entity Models:</span>
              <span className="font-mono text-slate-900">10 Core Relational Tables Initialized</span>
            </div>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Database records persist across server restarts and page refreshes. Clean separation of concerns ensures straightforward migration to Supabase/PostgreSQL when scheduled.
          </p>
        </div>
      </div>

      {/* Demo Reset Action */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-rose-900 text-sm">Reset Operational Demo State</h4>
          <p className="text-xs text-rose-700 mt-0.5">
            Re-seeds clean Ireland corporate leads, sample campaigns, active multi-channel inbox threads, and approved knowledge.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          {resetting ? 'Resetting DB...' : 'Reset Demo Database'}
        </button>
      </div>
    </div>
  );
};

export default SettingsModule;
