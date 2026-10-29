import React from 'react';
import {
  LayoutDashboard,
  Users,
  Send,
  Inbox,
  Award,
  BarChart3,
  BookOpen,
  Network,
  Settings,
  ShieldCheck,
  Building2
} from 'lucide-react';

export type ModuleType =
  | 'overview'
  | 'leads'
  | 'campaigns'
  | 'inbox'
  | 'qualified'
  | 'analytics'
  | 'knowledge'
  | 'integrations'
  | 'settings';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  inboxUnreadCount?: number;
  qualifiedCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  inboxUnreadCount = 0,
  qualifiedCount = 0,
}) => {
  const navItems = [
    { id: 'overview' as ModuleType, label: 'Overview', icon: LayoutDashboard },
    { id: 'leads' as ModuleType, label: 'Leads', icon: Users },
    { id: 'campaigns' as ModuleType, label: 'Campaigns', icon: Send },
    {
      id: 'inbox' as ModuleType,
      label: 'Unified Inbox',
      icon: Inbox,
      badge: inboxUnreadCount > 0 ? inboxUnreadCount : undefined,
    },
    {
      id: 'qualified' as ModuleType,
      label: 'Qualified Leads',
      icon: Award,
      badge: qualifiedCount > 0 ? qualifiedCount : undefined,
    },
    { id: 'analytics' as ModuleType, label: 'Analytics', icon: BarChart3 },
    { id: 'knowledge' as ModuleType, label: 'Company Knowledge', icon: BookOpen },
    { id: 'integrations' as ModuleType, label: 'Integrations', icon: Network },
    { id: 'settings' as ModuleType, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-900 text-slate-300 flex flex-col h-screen select-none border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
          S
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-base tracking-wide">SENVO</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Outreach
            </span>
          </div>
          <p className="text-xs text-slate-400">AI Client Response System</p>
        </div>
      </div>

      {/* Target Market Context Pill */}
      <div className="mx-4 mt-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs flex items-center gap-2 text-slate-300">
        <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
        <div className="truncate">
          <p className="font-medium text-slate-200 truncate">Ireland Corporate Practice</p>
          <p className="text-[11px] text-slate-400">Dublin • Cork • Galway</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-900/60 text-cyan-300 border border-cyan-800/50'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Safety & Simulation Status Banner */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-medium">
          <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Simulation Safety Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          All messaging simulated via local adapters. No real external outbound sent.
        </p>
        <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SQLite Persistent
          </span>
          <span className="text-slate-400">v2.0 (Phase 2)</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
