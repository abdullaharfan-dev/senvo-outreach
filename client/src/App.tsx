import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import type { ModuleType } from './components/Sidebar';
import Header from './components/Header';
import OverviewModule from './components/OverviewModule';
import LeadsModule from './components/LeadsModule';
import CampaignsModule from './components/CampaignsModule';
import InboxModule from './components/InboxModule';
import QualifiedLeadsModule from './components/QualifiedLeadsModule';
import AnalyticsModule from './components/AnalyticsModule';
import KnowledgeModule from './components/KnowledgeModule';
import IntegrationsModule from './components/IntegrationsModule';
import SettingsModule from './components/SettingsModule';
import SimulateInboundModal from './components/SimulateInboundModal';
import LoginScreen from './components/LoginScreen';
import { api } from './services/api';

export const App: React.FC = () => {
  const [authUser, setAuthUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('senvo_demo_auth');
      return saved ? JSON.parse(saved).user : null;
    } catch {
      return null;
    }
  });

  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [targetConvId, setTargetConvId] = useState<string | null>(null);

  const [aiStatus, setAiStatus] = useState({
    status: 'operational',
    model: 'gemini-3.5-flash-lite',
    authenticated: true,
  });

  const [inboxUnreadCount, setInboxUnreadCount] = useState<number>(0);
  const [qualifiedCount, setQualifiedCount] = useState<number>(0);

  const refreshCounts = async () => {
    if (!authUser) return;
    try {
      const overview = await api.getOverview();
      setInboxUnreadCount(overview.summary.inbound_replies);
      setQualifiedCount(overview.summary.qualified_leads);

      const health = await api.getHealth();
      if (health.ai) {
        setAiStatus(health.ai);
      }
    } catch (err) {
      console.error('Failed to refresh counts:', err);
    }
  };

  useEffect(() => {
    if (authUser) {
      refreshCounts();
      const interval = setInterval(refreshCounts, 5000);
      return () => clearInterval(interval);
    }
  }, [authUser]);

  const handleLogout = () => {
    localStorage.removeItem('senvo_demo_auth');
    setAuthUser(null);
  };

  const [campaignPrefill, setCampaignPrefill] = useState<{
    segmentName?: string;
    leadIds?: string[];
    channel?: string;
  } | null>(null);

  const handleSimulateSuccess = (convId: string) => {
    setTargetConvId(convId);
    setActiveModule('inbox');
    refreshCounts();
  };

  const handleLaunchCampaignFromSegment = (segmentName: string, leadIds: string[], channel?: string) => {
    setCampaignPrefill({ segmentName, leadIds, channel });
    setActiveModule('campaigns');
  };

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'overview':
        return {
          title: 'Executive Overview',
          subtitle: 'Multi-channel activity, qualified pipeline, and live operational status',
        };
      case 'leads':
        return {
          title: 'Leads Management & Import',
          subtitle: 'Directory of Irish corporate prospects with guided CSV/XLSX import & intelligent segmentation',
        };
      case 'campaigns':
        return {
          title: 'Campaign Orchestration',
          subtitle: 'Multi-channel outreach execution and live recipient status tracking',
        };
      case 'inbox':
        return {
          title: 'Unified Communication Inbox',
          subtitle: 'All 7 client channels with Gemini AI intent classification & suggested replies',
        };
      case 'qualified':
        return {
          title: 'Qualified Leads & CRM Handoffs',
          subtitle: 'High-intent Irish corporate prospects staged for Bitrix24 CRM pipeline handoff',
        };
      case 'analytics':
        return {
          title: 'Conversion & Channel Analytics',
          subtitle: 'Calculated metrics and conversion rates derived from persistent database records',
        };
      case 'knowledge':
        return {
          title: 'Company Knowledge & Grounding',
          subtitle: 'Approved Irish corporate services, statutory FAQs, and compliance policies',
        };
      case 'integrations':
        return {
          title: 'Channel Adapters & CRM Gateway',
          subtitle: 'Enterprise communication adapters across 7 channels and Bitrix24 REST integration',
        };
      case 'settings':
        return {
          title: 'System Settings & Operational Diagnostics',
          subtitle: 'Workspace configuration, AI provider diagnostics, and persistent storage management',
        };
    }
  };

  const { title, subtitle } = getModuleTitle();

  if (!authUser) {
    return <LoginScreen onLoginSuccess={(u) => { setAuthUser(u); refreshCounts(); }} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Persistent Dark-Navy Sidebar (Desktop) + Mobile Drawer */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        inboxUnreadCount={inboxUnreadCount}
        qualifiedCount={qualifiedCount}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Working Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onRefresh={refreshCounts}
          onOpenTestTools={() => setShowSimulateModal(true)}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          aiStatus={aiStatus}
        />

        {/* Module Content View */}
        <main className={`flex-1 ${activeModule === 'inbox' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'} bg-slate-50`}>
          {activeModule === 'overview' && (
            <OverviewModule
              onNavigate={(mod) => setActiveModule(mod)}
            />
          )}

          {activeModule === 'leads' && (
            <LeadsModule onLaunchCampaignWithSegment={handleLaunchCampaignFromSegment} />
          )}

          {activeModule === 'campaigns' && (
            <CampaignsModule
              initialSegmentName={campaignPrefill?.segmentName}
              initialLeadIds={campaignPrefill?.leadIds}
              initialChannel={campaignPrefill?.channel}
            />
          )}

          {activeModule === 'inbox' && (
            <InboxModule
              initialConversationId={targetConvId}
              onNavigateToQualified={() => setActiveModule('qualified')}
            />
          )}

          {activeModule === 'qualified' && <QualifiedLeadsModule />}

          {activeModule === 'analytics' && <AnalyticsModule />}

          {activeModule === 'knowledge' && <KnowledgeModule />}

          {activeModule === 'integrations' && <IntegrationsModule />}

          {activeModule === 'settings' && (
            <SettingsModule
              onReset={refreshCounts}
              onOpenTestSimulator={() => setShowSimulateModal(true)}
            />
          )}
        </main>
      </div>

      {/* Internal Inbound Scenario Simulator */}
      <SimulateInboundModal
        isOpen={showSimulateModal}
        onClose={() => setShowSimulateModal(false)}
        onSuccess={handleSimulateSuccess}
      />
    </div>
  );
};

export default App;
