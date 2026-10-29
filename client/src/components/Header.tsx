import React, { useState } from 'react';
import {
  RefreshCw,
  Building2,
  AlertCircle,
  CheckCircle2,
  User,
  FlaskConical
} from 'lucide-react';
import { api } from '../services/api';

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  onOpenTestTools?: () => void;
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
  onOpenTestTools,
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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-2xs">
      {/* Title & Context */}
      <div>
        <h1 className="text-base font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>

      {/* Right Controls - Production Oriented */}
      <div className="flex items-center gap-3">
        {/* Workspace Location Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-slate-800">Ireland Practice</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">Dublin HQ</span>
        </div>

        {/* Operational Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-[11px]">System Online</span>
        </div>

        {/* Refresh Data */}
        <button
          onClick={onRefresh}
          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Refresh live data from database"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Internal Testing Drawer / Sandbox Access (discreet) */}
        {onOpenTestTools && (
          <button
            onClick={onOpenTestTools}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Internal Scenario Testing & Simulation Tools"
          >
            <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline text-[11px]">Test Tools</span>
          </button>
        )}

        {/* User Account / Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
            DO
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Declan O'Sullivan</p>
            <p className="text-[10px] text-slate-400 leading-tight">Client Services Lead</p>
          </div>
        </div>
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
              This will re-initialize the persistent database with clean Ireland corporate leads, sample campaigns, active conversations across all 7 channels, and approved company knowledge.
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
