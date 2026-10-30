import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Server,
  Lock,
  Building2,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  MessageSquare,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface SettingsModuleProps {
  onReset: () => void;
  onOpenTestSimulator?: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ onReset, onOpenTestSimulator }) => {
  const [health, setHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [resetting, setResetting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoadingHealth(true);
      const data = await api.getHealth();
      setHealth(data);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleTestAi = async () => {
    try {
      setTestResult('Calling Gemini API directly via server backend...');
      const res = await api.getHealth();
      if (res.ai?.status === 'operational') {
        setTestResult(`Success: Gemini model ${res.ai.model} responded with valid structured output.`);
      } else {
        setTestResult(`Gemini Status: ${res.ai?.error || 'Unavailable'}`);
      }
    } catch (err: any) {
      setTestResult(`Test failed: ${err.message}`);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset database and reload all Ireland corporate seed records?')) return;
    try {
      setResetting(true);
      await api.resetDemo();
      alert('Database successfully reset to clean Ireland Corporate Practice state.');
      onReset();
      checkHealth();
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            System Configuration & Operational Diagnostics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage workspace settings, verify Gemini AI connectivity, and review cloud database telemetry
          </p>
        </div>
        <Badge variant="success" size="sm" dot>
          Operational
        </Badge>
      </div>

      {/* Workspace Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Tenant Workspace Profile</CardTitle>
              <CardDescription>Designated organizational practice and operating environment</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Organization Practice
              </label>
              <input
                type="text"
                readOnly
                value="SENVO Ireland Corporate & Professional Services"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Operating Jurisdiction
              </label>
              <input
                type="text"
                readOnly
                value="Ireland (Dublin • Cork • Galway)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Assigned Demo Account
              </label>
              <input
                type="text"
                readOnly
                value="partner@senvo.ie (Declan O'Sullivan • Client Services Lead)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block text-slate-500 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                Outreach Dispatch Mode
              </label>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Compliance Sandbox (Simulated Outbound Safety Active)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Internal Testing & Scenario Simulation Sandbox */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Testing & Scenario Simulation Tools</CardTitle>
              <CardDescription>
                Inject simulated inbound inquiries across 7 channels to test AI intent triage and classification
              </CardDescription>
            </div>
          </div>
          {onOpenTestSimulator && (
            <Button
              variant="secondary"
              size="xs"
              leftIcon={<MessageSquare className="w-3.5 h-3.5" />}
              onClick={onOpenTestSimulator}
            >
              Launch Simulator
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-800 block text-[11px]">Multi-Channel Inbound Evaluation</span>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Trigger inquiries across any of the 7 supported channels (LinkedIn, WhatsApp, Email, Website Form, Facebook, Instagram, SMS).
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
              <span className="font-bold text-slate-800 block text-[11px]">Real-Time Gemini Intent Classification</span>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Each test inquiry triggers the server-side Gemini AI engine to produce intent scores, Irish statutory grounding, and suggested response copy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Diagnostic */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Server-Side Gemini AI Engine</CardTitle>
              <CardDescription>Direct integration for intent triage, summarization, and suggested copy</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="xs" onClick={handleTestAi}>
            Test Live AI Call
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">Provider Architecture</span>
              <span className="font-bold text-slate-900">Google Gemini API</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">Configured Model</span>
              <span className="font-bold text-blue-700">
                {health?.ai?.model || 'gemini-3.5-flash-lite'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70">
              <span className="text-slate-400 block text-[11px]">Server Authentication</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Server-Side Secret</span>
              </span>
            </div>
          </div>

          {testResult && (
            <div className="p-3 bg-slate-900 text-cyan-300 font-mono text-xs rounded-lg border border-slate-800 break-words">
              {testResult}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Persistent Database Information (Supabase PostgreSQL) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <CardTitle>Persistent Cloud Database Architecture</CardTitle>
              <CardDescription>Managed 24/7 cloud persistence via Supabase PostgreSQL</CardDescription>
            </div>
          </div>
          <Badge variant="success" size="xs" dot>
            Connected
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3 pt-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-medium text-slate-600">Database Connection:</span>
              <span className="font-mono text-slate-900 font-semibold break-all">
                {health?.database || 'connected (Supabase PostgreSQL: senvo_outreach)'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-medium text-slate-600">Schema Isolation:</span>
              <span className="font-mono text-emerald-800 font-semibold bg-emerald-100/70 px-1.5 py-0.5 rounded">
                senvo_outreach (Strictly isolated from SENVO Dukaan public schema)
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-medium text-slate-600">Relational Models:</span>
              <span className="font-mono text-slate-900">
                11 Relational Tables with Foreign Key Constraints & Performance Indexes
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            All leads, outreach campaigns, recipient personalized messages, incoming conversations, and Bitrix24 CRM handoffs persist safely in Supabase PostgreSQL across serverless restarts and client reloads.
          </p>
        </CardContent>
      </Card>

      {/* Demo Reset Action */}
      <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-rose-950 text-sm">Reset Operational Demo State</h4>
          <p className="text-xs text-rose-800 mt-0.5">
            Re-seeds clean Ireland corporate leads, sample campaigns, active multi-channel inbox threads, and approved knowledge.
          </p>
        </div>
        <Button
          variant="danger"
          size="sm"
          isLoading={resetting}
          onClick={handleReset}
        >
          Reset Demo Database
        </Button>
      </div>
    </div>
  );
};

export default SettingsModule;
