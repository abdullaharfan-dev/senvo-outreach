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
  Building2,
  Shield
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
    { id: 'leads' as ModuleType, label: 'Leads & Segments', icon: Users },
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
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
          S
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm tracking-wide">SENVO</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
              Outreach
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Client Response Operations</p>
        </div>
      </div>

      {/* Target Market Context Pill */}
      <div className="mx-3.5 mt-3.5 p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-xs flex items-center gap-2.5 text-slate-300">
        <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <div className="truncate">
          <p className="font-medium text-slate-200 text-[11px] truncate">Ireland Corporate Services</p>
          <p className="text-[10px] text-slate-400">Dublin • Cork • Galway</p>
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-cyan-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Production Workspace Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Database Active
          </span>
          <span className="text-slate-500 font-mono">v2.4</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          SENVO Outreach Platform • Enterprise Staging
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
