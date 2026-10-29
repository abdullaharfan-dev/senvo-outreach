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
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
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
    refreshCounts();
    const interval = setInterval(refreshCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateSuccess = (convId: string) => {
    setTargetConvId(convId);
    setActiveModule('inbox');
    refreshCounts();
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
          subtitle: 'Directory of Irish corporate prospects with CSV/XLSX import & deduplication',
        };
      case 'campaigns':
        return {
          title: 'Campaign Orchestration',
          subtitle: 'Simulated multi-channel outreach dispatch with real-time SQLite tracking',
        };
      case 'inbox':
        return {
          title: 'Unified Communication Inbox',
          subtitle: 'All 7 client channels with Gemini AI intent classification & suggested replies',
        };
      case 'qualified':
        return {
          title: 'Qualified Leads & CRM Handoffs',
          subtitle: 'High-intent prospects staged for Bitrix24 CRM REST handoff',
        };
      case 'analytics':
        return {
          title: 'Conversion & Channel Analytics',
          subtitle: 'Calculated metrics and conversion rates from persisted database records',
        };
      case 'knowledge':
        return {
          title: 'Company Knowledge & Grounding',
          subtitle: 'Approved Irish corporate services, statutory FAQs, and compliance policies',
        };
      case 'integrations':
        return {
          title: 'Channel Adapters & Integrations',
          subtitle: 'Safe simulated adapters for all 7 channels + Bitrix24 connector',
        };
      case 'settings':
        return {
          title: 'Application Settings & Diagnostics',
          subtitle: 'Workspace configuration, AI provider health, and SQLite storage verification',
        };
    }
  };

  const { title, subtitle } = getModuleTitle();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans">
      {/* Persistent Dark-Navy Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        inboxUnreadCount={inboxUnreadCount}
        qualifiedCount={qualifiedCount}
      />

      {/* Main Working Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onRefresh={refreshCounts}
          onSimulateInboundClick={() => setShowSimulateModal(true)}
          aiStatus={aiStatus}
        />

        {/* Module Content View */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {activeModule === 'overview' && (
            <OverviewModule
              onNavigate={(mod) => setActiveModule(mod)}
              onSimulateInbound={() => setShowSimulateModal(true)}
            />
          )}

          {activeModule === 'leads' && <LeadsModule />}

          {activeModule === 'campaigns' && <CampaignsModule />}

          {activeModule === 'inbox' && (
            <InboxModule
              initialConversationId={targetConvId}
              onSimulateInbound={() => setShowSimulateModal(true)}
              onNavigateToQualified={() => setActiveModule('qualified')}
            />
          )}

          {activeModule === 'qualified' && <QualifiedLeadsModule />}

          {activeModule === 'analytics' && <AnalyticsModule />}

          {activeModule === 'knowledge' && <KnowledgeModule />}

          {activeModule === 'integrations' && <IntegrationsModule />}

          {activeModule === 'settings' && <SettingsModule onReset={refreshCounts} />}
        </main>
      </div>

      {/* Global Inbound Simulation Trigger Modal */}
      <SimulateInboundModal
        isOpen={showSimulateModal}
        onClose={() => setShowSimulateModal(false)}
        onSuccess={handleSimulateSuccess}
      />
    </div>
  );
};

export default App;
