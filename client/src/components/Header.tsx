import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  onSimulateInboundClick: () => void;
  aiStatus: {
    status: string;
    model: string;
    authenticated: boolean;
  };
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  onSimulateInboundClick,
  aiStatus,
}) => {
  const [resetting, setResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleReset = async () => {
    try {
      setResetting(true);
      await api.resetDemo();
      setShowConfirmReset(false);
      onRefresh();
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
      {/* Title & Context */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Gemini AI Status Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin-slow" />
          <span>AI Engine:</span>
          <span className="font-semibold text-blue-900">
            {aiStatus.status === 'operational' ? aiStatus.model : 'Unavailable'}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              aiStatus.status === 'operational' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
        </div>

        {/* Simulation Guardrail Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          <span>Simulated Send</span>
        </div>

        {/* Walkthrough Action: Simulate Inbound */}
        <button
          onClick={onSimulateInboundClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
          title="Controllable trigger for fictional prospect responses"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Simulate Incoming Lead</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => setShowConfirmReset(true)}
          disabled={resetting}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 transition-colors cursor-pointer"
          title="Reset SQLite database with pristine Ireland demo data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Reset Demo Database?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              This will re-initialize the persistent SQLite database with clean Ireland corporate leads, sample campaigns, active conversations across all 7 channels, and approved company knowledge.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                {resetting ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
