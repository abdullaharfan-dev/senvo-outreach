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
  X,
  Database,
  Sparkles
} from 'lucide-react';
import { Badge } from './ui/Badge';

export type ModuleType =
  | 'overview'
  | 'leads'
  | 'campaigns'
  | 'inbox'
  | 'qualified'
  | 'analytics'
  | 'knowledge'
  | 'integrations'
  | 'settings'
  | 'value_center';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  inboxUnreadCount?: number;
  qualifiedCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavGroup {
  label: string;
  items: Array<{
    id: ModuleType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeVariant?: 'primary' | 'success';
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  inboxUnreadCount = 0,
  qualifiedCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navGroups: NavGroup[] = [
    {
      label: 'OPERATIONS',
      items: [
        { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'leads', label: 'Leads & Segments', icon: Users },
        { id: 'campaigns', label: 'Campaigns', icon: Send },
        {
          id: 'inbox',
          label: 'Unified Inbox',
          icon: Inbox,
          badge: inboxUnreadCount > 0 ? inboxUnreadCount : undefined,
          badgeVariant: 'primary',
        },
      ],
    },
    {
      label: 'INTELLIGENCE & CRM',
      items: [
        {
          id: 'qualified',
          label: 'Qualified Leads',
          icon: Award,
          badge: qualifiedCount > 0 ? qualifiedCount : undefined,
          badgeVariant: 'success',
        },
        { id: 'analytics', label: 'Analytics & KPIs', icon: BarChart3 },
        { id: 'knowledge', label: 'Company Knowledge', icon: BookOpen },
      ],
    },
    {
      label: 'CLIENT PRESENTATION',
      items: [
        {
          id: 'value_center',
          label: 'Client Value Center',
          icon: Sparkles,
        },
      ],
    },
    {
      label: 'PLATFORM',
      items: [
        { id: 'integrations', label: 'Connected Accounts', icon: Network },
        { id: 'settings', label: 'Settings & Health', icon: Settings },
      ],
    },
  ];

  const handleItemClick = (id: ModuleType) => {
    setActiveModule(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full select-none bg-navy-950 text-slate-300">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800/80 bg-navy-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs ring-1 ring-blue-400/30">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm tracking-wide">SENVO</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                Outreach
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">B2B Response Operations</p>
          </div>
        </div>

        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Target Market Context Pill */}
      <div className="mx-3.5 mt-3.5 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/90 text-xs flex items-center gap-2.5 text-slate-300 shadow-2xs">
        <div className="w-6 h-6 rounded-md bg-blue-950/80 border border-blue-800/50 flex items-center justify-center shrink-0">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
        </div>
        <div className="truncate min-w-0">
          <p className="font-semibold text-slate-200 text-[11px] truncate leading-tight">
            Ireland Corporate Services
          </p>
          <p className="text-[10px] text-slate-400 truncate leading-tight">Dublin • Cork • Galway</p>
        </div>
      </div>

      {/* Grouped Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
              {group.label}
            </h4>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer min-h-[36px] ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs ring-1 ring-blue-500/50'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeVariant === 'success'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                            : 'bg-blue-950/80 text-cyan-300 border border-blue-700/60'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Cloud Infrastructure Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-navy-950/80 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Database className="w-3 h-3 text-slate-400" />
            <span>Supabase Cloud</span>
          </span>
          <span className="text-[10px] text-emerald-400/90 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
            senvo_outreach
          </span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          24/7 Managed Serverless Architecture
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-navy-950 text-slate-300 flex-col h-screen select-none border-r border-slate-800 shrink-0">
        {renderContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop & Slide-out Menu */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Dark backdrop overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-navy-950 text-slate-300 shadow-2xl border-r border-slate-800 z-50 flex flex-col h-full animate-in slide-in-from-left duration-200">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
