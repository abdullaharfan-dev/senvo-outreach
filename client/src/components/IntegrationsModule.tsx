import React, { useState, useEffect } from 'react';
import {
  Network,
  Mail,
  Linkedin,
  MessageSquare,
  Globe,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Plus,
  RefreshCw,
  Power,
  X,
  ExternalLink,
  Lock,
  Radio,
  Sliders,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import type { ConnectedAccount, ChannelType } from '../types';

export const IntegrationsModule: React.FC = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string; latency_ms?: number } | null>(null);

  // Connection Wizard State
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [wizardChannel, setWizardChannel] = useState<ChannelType>('linkedin');
  const [wizardName, setWizardName] = useState<string>('');
  const [wizardIdentifier, setWizardIdentifier] = useState<string>('');
  const [wizardAuthType, setWizardAuthType] = useState<'oauth2' | 'api_key' | 'webhook'>('oauth2');
  const [wizardEnvironment, setWizardEnvironment] = useState<'sandbox_simulation' | 'production'>('sandbox_simulation');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAccounts = async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await api.testAccount(id);
      setTestResult({
        id,
        success: true,
        message: res.message,
        latency_ms: res.latency_ms,
      });
    } catch (err: any) {
      setTestResult({
        id,
        success: false,
        message: err.message || 'Connection test timed out',
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleStatus = async (account: ConnectedAccount) => {
    try {
      if (account.connection_status === 'disconnected') {
        await api.reconnectAccount(account.id);
      } else {
        await api.disconnectAccount(account.id);
      }
      fetchAccounts();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleOpenWizard = (defaultCh?: ChannelType) => {
    if (defaultCh) setWizardChannel(defaultCh);
    setWizardStep(1);
    setWizardName('');
    setWizardIdentifier('');
    setWizardEnvironment('sandbox_simulation');
    updateDefaultPermissions(defaultCh || 'linkedin');
    setShowWizard(true);
  };

  const updateDefaultPermissions = (ch: ChannelType) => {
    switch (ch) {
      case 'email':
        setSelectedPermissions(['Mail.ReadWrite', 'Mail.Send', 'User.Read']);
        setWizardAuthType('oauth2');
        break;
      case 'linkedin':
        setSelectedPermissions(['r_liteprofile', 'w_member_social', 'r_messages', 'w_messages']);
        setWizardAuthType('oauth2');
        break;
      case 'whatsapp':
        setSelectedPermissions(['whatsapp_business_messaging', 'whatsapp_business_management']);
        setWizardAuthType('api_key');
        break;
      case 'facebook':
        setSelectedPermissions(['pages_messaging', 'pages_read_engagement']);
        setWizardAuthType('oauth2');
        break;
      case 'instagram':
        setSelectedPermissions(['instagram_basic', 'instagram_manage_messages']);
        setWizardAuthType('oauth2');
        break;
      case 'sms':
        setSelectedPermissions(['sms.send', 'sms.delivery_reports']);
        setWizardAuthType('api_key');
        break;
      case 'website':
        setSelectedPermissions(['inbound.webhooks', 'lead.ingest']);
        setWizardAuthType('webhook');
        break;
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardName.trim() || !wizardIdentifier.trim()) {
      alert('Please provide an Account Name and Identifier.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createAccount({
        channel: wizardChannel,
        account_name: wizardName.trim(),
        account_identifier: wizardIdentifier.trim(),
        auth_type: wizardAuthType,
        environment: wizardEnvironment,
        permissions_granted: selectedPermissions,
        compliance_notes:
          wizardEnvironment === 'sandbox_simulation'
            ? 'Interactive simulated account initialized in isolated sandbox mode.'
            : 'Live enterprise connector configured. OAuth authentication required before initiating external requests.',
      });
      setShowWizard(false);
      fetchAccounts();
    } catch (err: any) {
      alert(`Account setup failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getChannelIcon = (ch: string, sizeClass = 'w-4 h-4') => {
    switch (ch) {
      case 'email':
        return <Mail className={`${sizeClass} text-blue-600`} />;
      case 'linkedin':
        return <Linkedin className={`${sizeClass} text-sky-600`} />;
      case 'whatsapp':
        return <MessageSquare className={`${sizeClass} text-emerald-600`} />;
      case 'website':
        return <Globe className={`${sizeClass} text-purple-600`} />;
      case 'facebook':
        return <Layers className={`${sizeClass} text-blue-500`} />;
      case 'instagram':
        return <Layers className={`${sizeClass} text-pink-600`} />;
      case 'sms':
        return <MessageSquare className={`${sizeClass} text-amber-600`} />;
      default:
        return <Network className={`${sizeClass} text-slate-500`} />;
    }
  };

  const getChannelDisplayName = (ch: string) => {
    switch (ch) {
      case 'email':
        return 'Email / Microsoft Outlook';
      case 'linkedin':
        return 'LinkedIn InMail & Profiles';
      case 'whatsapp':
        return 'WhatsApp Business';
      case 'facebook':
        return 'Facebook Pages';
      case 'instagram':
        return 'Instagram Professional';
      case 'sms':
        return 'SMS Gateway';
      case 'website':
        return 'Website Inquiries (Inbound Capture)';
      default:
        return ch;
    }
  };

  const channelsList: ChannelType[] = ['email', 'linkedin', 'whatsapp', 'facebook', 'instagram', 'sms', 'website'];
  const filteredAccounts = selectedChannel === 'all' ? accounts : accounts.filter((a) => a.channel === selectedChannel);

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Connected Accounts & Channel Setup</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {accounts.filter((a) => a.connection_status.includes('connected')).length} Active Connectors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-channel outreach accounts, platform permissions, rate limits, and compliance boundaries
          </p>
        </div>

        <button
          onClick={() => handleOpenWizard()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Connect New Account</span>
        </button>
      </div>

      {/* Environment & Safety Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-start md:items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 md:mt-0" />
          <div>
            <span className="font-semibold text-white">Interactive Sandbox Simulation Mode Active: </span>
            <span className="text-slate-300">
              Accounts connect via simulated adapters. Dispatches, read receipts, and message exchanges operate in persistent isolated storage with zero real external transmission.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded">
            SIMULATION SANDBOX
          </span>
        </div>
      </div>

      {/* Channel Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium border-b border-slate-200">
        <button
          onClick={() => setSelectedChannel('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            selectedChannel === 'all' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Channels ({accounts.length})
        </button>
        {channelsList.map((ch) => {
          const count = accounts.filter((a) => a.channel === ch).length;
          return (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                selectedChannel === ch ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {getChannelIcon(ch, 'w-3.5 h-3.5')}
              <span className="capitalize">{ch}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs">Loading connected accounts...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl border border-slate-200 text-center space-y-3">
            <Network className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No accounts configured for this channel</p>
            <p className="text-[11px] text-slate-400">Click below to connect an account or integration record.</p>
            <button
              onClick={() => handleOpenWizard(selectedChannel === 'all' ? 'email' : (selectedChannel as ChannelType))}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
            >
              Add {getChannelDisplayName(selectedChannel)} Account
            </button>
          </div>
        ) : (
          filteredAccounts.map((account) => {
            const isConnected = account.connection_status === 'connected_simulated' || account.connection_status === 'connected_live';
            const isTesting = testingId === account.id;
            const thisTestResult = testResult?.id === account.id ? testResult : null;

            return (
              <div
                key={account.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Account Top Row */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        {getChannelIcon(account.channel, 'w-5 h-5')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">{account.account_name}</h3>
                        <p className="text-[11px] font-mono text-slate-500 truncate">{account.account_identifier}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                        isConnected
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </span>
                  </div>

                  {/* Mode & Auth Details */}
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-100 uppercase">
                      {account.environment.replace(/_/g, ' ')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      Auth: {account.auth_type.toUpperCase()}
                    </span>
                  </div>

                  {/* Permissions Badges */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Granted Scopes & Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {account.permissions_granted.map((perm, idx) => (
                        <span key={idx} className="text-[10px] font-mono bg-slate-50 border border-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rate Limits & Compliance Note */}
                  {account.compliance_notes && (
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-700 block mb-0.5 text-[10px] uppercase">
                        Platform Policy & Limits:
                      </span>
                      {account.compliance_notes}
                      {account.rate_limit_info && (
                        <span className="block mt-1 font-mono text-[10px] text-slate-500">
                          Quota: {account.rate_limit_info}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Test Result Callout */}
                  {thisTestResult && (
                    <div
                      className={`p-2.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2 ${
                        thisTestResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      {thisTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold">{thisTestResult.message}</span>
                        {thisTestResult.latency_ms && (
                          <span className="block text-[10px] opacity-80 mt-0.5">Gateway latency: {thisTestResult.latency_ms}ms</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleTestConnection(account.id)}
                    disabled={isTesting || !isConnected}
                    className="text-xs px-2.5 py-1 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg flex items-center gap-1.5 font-medium disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(account)}
                    className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium cursor-pointer transition-colors ${
                      isConnected
                        ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isConnected ? 'Disconnect' : 'Reconnect'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Account Connection Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Connect Outreach Channel Account</h3>
                <p className="text-xs text-slate-500">Step {wizardStep} of 4 • Guided authorization & permission mapping</p>
              </div>
              <button onClick={() => setShowWizard(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateAccount} className="p-5 overflow-y-auto space-y-4 text-xs">
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <label className="font-bold text-slate-800 block">Select Channel Platform:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {channelsList.map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => {
                          setWizardChannel(ch);
                          updateDefaultPermissions(ch);
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                          wizardChannel === ch ? 'bg-blue-50/80 border-blue-500 text-blue-900 font-bold ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {getChannelIcon(ch, 'w-4 h-4')}
                        <span className="capitalize">{ch}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Continue to Account Details →
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Account Display Name:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dublin Partner Mailbox or SENVO InMail Sdr"
                      value={wizardName}
                      onChange={(e) => setWizardName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Account Identifier (Email / Handle / Phone / URL):</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. partner@senvo.ie, +353 1 902 4410, or linkedin.com/in/..."
                      value={wizardIdentifier}
                      onChange={(e) => setWizardIdentifier(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Authentication Method:</label>
                    <select
                      value={wizardAuthType}
                      onChange={(e: any) => setWizardAuthType(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs bg-white"
                    >
                      <option value="oauth2">OAuth2 Token Gateway (Standard)</option>
                      <option value="api_key">API Secret Key / Gateway Token</option>
                      <option value="webhook">REST Inbound Webhook</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="flex-1 py-2 border border-slate-300 rounded-lg font-medium text-slate-700"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                      Configure Environment →
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-3">
                  <label className="font-bold text-slate-800 block">Choose Operational Environment:</label>

                  <div className="space-y-2">
                    <div
                      onClick={() => setWizardEnvironment('sandbox_simulation')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        wizardEnvironment === 'sandbox_simulation' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">Interactive Sandbox Simulation (Recommended for Demo)</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">SAFE</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Creates an active simulated connector. All message dispatches, token expirations, and rate limiters are verified without contacting real external prospects.
                      </p>
                    </div>

                    <div
                      onClick={() => setWizardEnvironment('production')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        wizardEnvironment === 'production' ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">Production Live Connector</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">OAUTH SETUP</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Initiates enterprise OAuth2 callback flow. Requires registered Meta / Microsoft / LinkedIn Developer App Client IDs.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="flex-1 py-2 border border-slate-300 rounded-lg font-medium text-slate-700"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                    >
                      Review Permissions & Finalize →
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-800 block text-xs">Requested Permissions & Scopes:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedPermissions.map((p, i) => (
                        <span key={i} className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-blue-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Safety & Credential Security Disclaimer */}
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-blue-950">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Security & Honest Demo Guarantee:</span>
                    </div>
                    <p className="text-[11px] text-blue-900 leading-relaxed">
                      SENVO Outreach never asks for or stores raw account passwords. In demo mode, simulated tokens are securely managed in isolated server storage.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="flex-1 py-2 border border-slate-300 rounded-lg font-medium text-slate-700"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isSubmitting ? 'Authorizing...' : 'Authorize & Connect'}</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsModule;
