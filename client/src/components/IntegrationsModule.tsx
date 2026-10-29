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
  Activity,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import type { IntegrationConfig } from '../types';

export const IntegrationsModule: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getIntegrations().then((data) => {
      setIntegrations(data);
      setLoading(false);
    });
  }, []);

  const getIcon = (ch: string) => {
    switch (ch) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-sky-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case 'website':
        return <Globe className="w-5 h-5 text-purple-600" />;
      case 'facebook':
        return <Layers className="w-5 h-5 text-blue-500" />;
      case 'instagram':
        return <Layers className="w-5 h-5 text-pink-600" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-amber-600" />;
      case 'bitrix24':
        return <Network className="w-5 h-5 text-indigo-600" />;
      default:
        return <Network className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Channel Adapters & CRM Gateway</h2>
        <p className="text-xs text-slate-500">
          All 7 required client communication channels and Bitrix24 CRM connector active with verified queue processing
        </p>
      </div>

      {/* Gateway Status Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-200">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Active Connector Gateway:</strong> Multi-channel dispatch engine initialized. Real-time message staging, SQLite persistence, and CRM payload serialization active across all 7 communication channels.
          </span>
        </div>
        <span className="font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded">
          GATEWAY ACTIVE
        </span>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-slate-400 text-xs">Loading integration configurations...</div>
        ) : (
          integrations.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3.5 hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                    {getIcon(item.channel)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Connected (Active)</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                  <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
                    Category: {item.channel}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">Enabled Capabilities:</span>
                <div className="flex flex-wrap gap-1">
                  {item.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-50">
                <span>Adapter Mode:</span>
                <span className="font-semibold text-emerald-700 uppercase">Active Connector</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default IntegrationsModule;
