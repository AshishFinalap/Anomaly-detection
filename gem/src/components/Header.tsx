import React from 'react';
import { Shield, AlertTriangle, Cpu, BarChart3, Database, FileText, Bot, Play, Pause, Activity, Server, Brain } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeAlertsCount: number;
  criticalCount: number;
  isStreaming: boolean;
  setIsStreaming: (s: boolean) => void;
  toggleCopilot: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeAlertsCount,
  criticalCount,
  isStreaming,
  setIsStreaming,
  toggleCopilot,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'SOC Operations', icon: Shield },
    { id: 'alerts', label: 'Threat Queue', icon: AlertTriangle, badge: activeAlertsCount },
    { id: 'ml_pipeline', label: 'ML Models Pipeline', icon: Brain },
    { id: 'entities', label: 'Monitored Assets', icon: Cpu },
    { id: 'generator', label: 'Telemetry Generator', icon: Database },
    { id: 'evaluation', label: 'ML Evaluation', icon: BarChart3 },
    { id: 'report', label: 'Executive Deck', icon: FileText },
  ];

  return (
    <header className="bg-slate-950/90 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-2xl backdrop-blur-lg">
      {/* Top Status Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 sm:px-6 py-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            <strong className="text-white font-sans font-black uppercase tracking-wider">AEGIS-3D SECURITY CORE</strong>
            <span className="text-slate-500">| Behavioral Anomaly Detection</span>
          </span>
          <span className="hidden md:inline text-slate-500">Domain: Industrial OT & IT Gateways</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2">
            <Server className="w-3 h-3 text-cyan-400" />
            <span>Active Nodes: <strong className="text-slate-200">40 Edge/Svc/User Nodes</strong></span>
          </div>
          <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Telemetry Stream: ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-red-600 flex items-center justify-center font-black text-white text-xs tracking-wider shadow-lg shadow-cyan-500/20 card-3d">
              AEGIS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-black tracking-tight text-white font-sans uppercase">
                  Aegis CyberShield AI
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-cyan-950/90 text-cyan-400 border border-cyan-800/80 rounded-md tracking-wider uppercase font-mono">
                  3D SOC Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Dual-Model Behavioral Anomaly & Explainable AI Threat Engine</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-md cyber-glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                        criticalCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              id="btn-toggle-stream"
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isStreaming
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-800 hover:bg-emerald-900 shadow-lg shadow-emerald-950/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ingesting Stream</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-slate-400" />
                  <span>Stream Paused</span>
                </>
              )}
            </button>

            <button
              id="btn-open-copilot"
              onClick={toggleCopilot}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-600 via-indigo-600 to-red-600 hover:from-cyan-500 hover:to-red-500 text-white shadow-lg shadow-cyan-600/30 transition-all cursor-pointer card-3d"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Aegis AI Copilot</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
