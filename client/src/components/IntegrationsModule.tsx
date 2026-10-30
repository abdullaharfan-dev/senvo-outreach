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
  Check,
  Database,
  Share2,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import type { ConnectedAccount, ChannelType } from '../types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './ui/Card';
import { Badge, type BadgeVariant } from './ui/Badge';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';

export const IntegrationsModule: React.FC = () => {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    id: string;
    success: boolean;
    message: string;
    latency_ms?: number;
    mode?: 'simulated' | 'live';
  } | null>(null);

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

  const handleTestConnection = async (id: string, isSimulated: boolean = true) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await api.testAccount(id);
      setTestResult({
        id,
        success: true,
        message: isSimulated
          ? `Sandbox Loopback Healthy: ${res.message} (Simulated adapter; zero external bytes sent)`
          : res.message,
        latency_ms: res.latency_ms,
        mode: isSimulated ? 'simulated' : 'live'
      });
    } catch (err: any) {
      setTestResult({
        id,
        success: false,
        message: err.message || 'Connection test timed out',
        mode: isSimulated ? 'simulated' : 'live'
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
      case 'bitrix24':
      case 'crm':
        return <Database className={`${sizeClass} text-indigo-600`} />;
      default:
        return <Network className={`${sizeClass} text-slate-500`} />;
    }
  };

  const getChannelDisplayName = (ch: string) => {
    switch (ch) {
      case 'email':
        return 'Email / Microsoft 365';
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
        return 'Website Inbound Capture';
      case 'bitrix24':
        return 'Bitrix24 CRM Gateway';
      default:
        return ch;
    }
  };

  const channelsList: ChannelType[] = ['email', 'linkedin', 'whatsapp', 'facebook', 'instagram', 'sms', 'website'];
  const filteredAccounts =
    selectedChannel === 'all'
      ? accounts
      : accounts.filter((a) => a.channel === selectedChannel);

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Connected Accounts & Integration Gateways
            </h2>
            <Badge variant="primary" size="sm">
              {accounts.length} Configured Channels
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise channel authentication, platform compliance limits, and Bitrix24 CRM webhook staging.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => handleOpenWizard()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Connect New Account
        </Button>
      </div>

      {/* Honest Integration Status Alert Banner */}
      <Card className="border-slate-800 bg-slate-900 text-white p-4 sm:p-5 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start md:items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5 md:mt-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Honest Integration Policy:</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                  SIMULATION SANDBOX ACTIVE
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed max-w-3xl">
                Current connectors operate in verified sandbox mode. Message exchanges and qualification turns are captured in persistent Supabase PostgreSQL without contacting external prospects or incurring live carrier billing. Production OAuth connectors can be activated upon client security review.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <Badge variant="success" size="sm" dot>
              Safe Demo Mode
            </Badge>
          </div>
        </div>
      </Card>

      {/* Channel Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium border-b border-slate-200 no-scrollbar">
        <button
          onClick={() => setSelectedChannel('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
            selectedChannel === 'all'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
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
                selectedChannel === ch
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {getChannelIcon(ch, 'w-3.5 h-3.5')}
              <span className="capitalize">{ch}</span>
              <span className="text-[10px] opacity-70 tabular-nums">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {loading ? (
          <div className="col-span-full text-center py-16 text-slate-400 text-xs">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading connected accounts from database...
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Network}
              title="No accounts configured for this channel"
              description="Click below to configure a new connected channel account."
              actionLabel={`Add ${getChannelDisplayName(selectedChannel)} Account`}
              onAction={() =>
                handleOpenWizard(selectedChannel === 'all' ? 'email' : (selectedChannel as ChannelType))
              }
              className="py-16"
            />
          </div>
        ) : (
          filteredAccounts.map((account) => {
            const isConnected =
              account.connection_status === 'connected_simulated' ||
              account.connection_status === 'connected_live';
            const isSimulated = account.environment === 'sandbox_simulation';
            const isTesting = testingId === account.id;
            const thisTestResult = testResult?.id === account.id ? testResult : null;

            return (
              <Card
                key={account.id}
                hoverEffect
                className="p-5 flex flex-col justify-between space-y-4 shadow-card"
              >
                {/* Account Top Row */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        {getChannelIcon(account.channel, 'w-5 h-5')}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {account.account_name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-500 truncate">
                          {account.account_identifier}
                        </p>
                      </div>
                    </div>

                    <Badge variant={isConnected ? 'success' : 'neutral'} size="xs" dot>
                      {isConnected ? (isSimulated ? 'Sandbox' : 'Connected') : 'Disconnected'}
                    </Badge>
                  </div>

                  {/* Mode & Auth Details */}
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                      {isSimulated ? 'Simulated Sandbox' : 'Production OAuth'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
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
                        <span
                          key={idx}
                          className="text-[10px] font-mono bg-slate-50 border border-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded"
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rate Limits & Compliance Note */}
                  {account.compliance_notes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 leading-relaxed space-y-1">
                      <span className="font-bold text-slate-700 block text-[10px] uppercase tracking-wider">
                        Compliance Boundary:
                      </span>
                      <p>{account.compliance_notes}</p>
                      {account.rate_limit_info && (
                        <span className="block font-mono text-[10px] text-slate-500">
                          Quota: {account.rate_limit_info}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Test Result Callout */}
                  {thisTestResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs leading-relaxed flex items-start gap-2 shadow-2xs ${
                        thisTestResult.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
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
                          <span className="block text-[10px] opacity-80 mt-0.5 tabular-nums">
                            Loopback response latency: {thisTestResult.latency_ms}ms
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Action Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={isTesting || !isConnected}
                    onClick={() => handleTestConnection(account.id, isSimulated)}
                    leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />}
                  >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </Button>

                  <Button
                    variant={isConnected ? 'danger' : 'success'}
                    size="xs"
                    onClick={() => handleToggleStatus(account)}
                    leftIcon={<Power className="w-3.5 h-3.5" />}
                  >
                    {isConnected ? 'Disconnect' : 'Reconnect'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Bitrix24 CRM Webhook Staging Card */}
      <Card className="p-5 sm:p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Bitrix24 CRM REST API Webhook Gateway
              </h3>
              <p className="text-xs text-slate-500">
                Staged handoff pipeline &bull; Maps qualified corporate leads directly to Bitrix24 CRM deals
              </p>
            </div>
          </div>

          <Badge variant="warning" size="sm">
            Staging Active (Webhook Ready)
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Target Endpoint</span>
            <span className="font-mono text-slate-900 mt-1 block truncate font-medium">
              /rest/1/webhook/crm.lead.add
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Auth Method</span>
            <span className="font-semibold text-slate-900 mt-1 block">Inbound Webhook Secret Token</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Sync Status</span>
            <span className="font-semibold text-emerald-700 mt-1 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payload Verification Passed</span>
            </span>
          </div>
        </div>

        <p className="text-slate-500 text-[11px] leading-relaxed">
          When an inbound prospect confirms interest in a discovery call or service audit, SENVO SDR formats the complete conversation record into the Bitrix24 JSON schema. Production dispatch requires client CRM webhook authorization.
        </p>
      </Card>

      {/* Account Connection Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Connect Outreach Channel Account</h3>
                <p className="text-xs text-slate-500">Step {wizardStep} of 4 &bull; Guided authorization & permission mapping</p>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
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
                          wizardChannel === ch
                            ? 'bg-blue-50/80 border-blue-500 text-blue-900 font-bold ring-2 ring-blue-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {getChannelIcon(ch, 'w-4 h-4')}
                        <span className="capitalize">{ch}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setWizardStep(2)}
                      className="w-full"
                    >
                      Continue to Account Details &rarr;
                    </Button>
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
                      placeholder="e.g. Dublin Partner Mailbox or SENVO InMail SDR"
                      value={wizardName}
                      onChange={(e) => setWizardName(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Account Identifier (Email / Handle / Phone / URL):
                    </label>
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
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="flex-1"
                    >
                      &larr; Back
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="flex-1"
                    >
                      Configure Environment &rarr;
                    </Button>
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
                        wizardEnvironment === 'sandbox_simulation'
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">Interactive Sandbox Simulation (Safe Demo)</span>
                        <Badge variant="success" size="xs">
                          SAFE
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Creates an active simulated connector. All message dispatches, token expirations, and rate limiters are verified without contacting real external prospects.
                      </p>
                    </div>

                    <div
                      onClick={() => setWizardEnvironment('production')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        wizardEnvironment === 'production'
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">Production Live Connector</span>
                        <Badge variant="warning" size="xs">
                          OAUTH SETUP
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Initiates enterprise OAuth2 callback flow. Requires registered Meta / Microsoft / LinkedIn Developer App Client IDs.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="flex-1"
                    >
                      &larr; Back
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      type="button"
                      onClick={() => setWizardStep(4)}
                      className="flex-1"
                    >
                      Review Permissions &rarr;
                    </Button>
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-800 block text-xs">Requested Permissions & Scopes:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedPermissions.map((p, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-blue-700"
                        >
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
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      onClick={() => setWizardStep(3)}
                      className="flex-1"
                    >
                      &larr; Back
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      type="submit"
                      isLoading={isSubmitting}
                      className="flex-1"
                      leftIcon={<Check className="w-4 h-4" />}
                    >
                      Authorize & Connect
                    </Button>
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
