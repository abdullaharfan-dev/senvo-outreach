import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('partner@senvo.ie');
  const [password, setPassword] = useState<string>('SenvoIreland2026!');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Access denied. Please check your credentials.');
      }

      localStorage.setItem('senvo_demo_auth', JSON.stringify({ token: data.token, user: data.user }));
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('partner@senvo.ie');
    setPassword('SenvoIreland2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-4 font-sans relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-8 z-10 space-y-5 sm:space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-semibold border border-blue-500/20 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Restricted Client Demo Environment</span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              S
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">SENVO Outreach</h1>
          </div>

          <p className="text-xs text-slate-400">
            Client-Response Management & AI Triage Platform
          </p>
          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>Ireland Practice • Dublin HQ</span>
          </div>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white text-[11px] uppercase tracking-wider">Approved Demo Access:</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold underline cursor-pointer"
            >
              Fill Credentials
            </button>
          </div>
          <div className="font-mono text-[11px] space-y-0.5 text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800">
            <div><span className="text-slate-500">Email:</span> partner@senvo.ie</div>
            <div><span className="text-slate-500">Password:</span> SenvoIreland2026!</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Corporate Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.ie"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Access Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-hidden focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Access...</span>
              </span>
            ) : (
              <>
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Disclaimers */}
        <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 text-center leading-relaxed">
          <p>Multi-channel simulation sandbox active. Dispatches persist safely to SQLite without contacting external prospect accounts.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
