import React, { useState } from 'react';
import {
  RefreshCw,
  Building2,
  AlertCircle,
  FlaskConical,
  LogOut,
  Menu,
  Database,
  Compass
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  onOpenTestTools?: () => void;
  onStartTour?: () => void;
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
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
  onStartTour,
  onLogout,
  onToggleMobileMenu,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <header className="h-14 sm:h-16 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-20 sticky top-0">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Open navigation menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">
              {title}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/70 uppercase">
              Production Staging
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 font-normal truncate max-w-[150px] xs:max-w-[240px] sm:max-w-none hidden xs:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls - Responsive & Polished */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Client Demo Environment Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-[11px] font-bold text-blue-800 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
          <span className="hidden sm:inline">CLIENT DEMO</span>
          <span className="sm:hidden">DEMO</span>
        </div>

        {/* Database Cloud Active Indicator */}
        <div
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-[11px] font-medium text-emerald-800"
          title="Connected to Supabase PostgreSQL dedicated schema: senvo_outreach"
        >
          <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-emerald-900">Supabase Cloud</span>
          <span className="text-emerald-400">•</span>
          <span className="text-[10px] font-mono text-emerald-700">senvo_outreach</span>
        </div>

        {/* Practice Region */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-800">Ireland HQ</span>
        </div>

        {/* Refresh Live Data */}
        <button
          onClick={handleManualRefresh}
          className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          title="Refresh live metrics from cloud database"
          aria-label="Refresh live data"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
          />
        </button>

        {/* Product Tour Guide */}
        {onStartTour && (
          <button
            onClick={onStartTour}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-blue-700 bg-blue-50/80 hover:bg-blue-100/90 border border-blue-200/90 hover:border-blue-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Start Interactive Guided Demo Tour"
            aria-label="Start Guided Product Tour"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Product Tour</span>
          </button>
        )}

        {/* Internal Testing Drawer / Sandbox Access */}
        {onOpenTestTools && (
          <button
            onClick={onOpenTestTools}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Internal Scenario Testing & Simulation Tools"
            aria-label="Testing Tools"
          >
            <FlaskConical className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            <span className="hidden md:inline text-[11px]">Test Simulator</span>
          </button>
        )}

        {/* User Account / Partner Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-slate-800/10 shadow-2xs">
            DO
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Declan O'Sullivan</p>
            <p className="text-[10px] text-slate-400 leading-tight">Partner & Client Services Lead</p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="Reset Demo Session"
              aria-label="Reset Demo Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
