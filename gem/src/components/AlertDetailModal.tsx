import React, { useEffect, useState } from 'react';
import { DetectionResult, AISOCAnalysisResponse } from '../types';
import {
  X,
  ShieldAlert,
  Bot,
  Activity,
  Globe,
  HardDrive,
  User,
  CheckCircle2,
  Lock,
  Sparkles,
  AlertOctagon,
  Flame,
} from 'lucide-react';

interface AlertDetailModalProps {
  alert: DetectionResult | null;
  onClose: () => void;
  onUpdateStatus: (eventId: string, newStatus: 'Contained' | 'Dismissed' | 'Pending') => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({ alert, onClose, onUpdateStatus }) => {
  const [aiAnalysis, setAiAnalysis] = useState<AISOCAnalysisResponse | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!alert) return;

    let isMounted = true;
    setIsLoadingAi(true);
    setAiAnalysis(null);
    setCompletedSteps(new Set());

    fetch('/api/explain-anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detectionResult: alert }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setAiAnalysis(data);
          setIsLoadingAi(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch AI explanation:', err);
        if (isMounted) setIsLoadingAi(false);
      });

    return () => {
      isMounted = false;
    };
  }, [alert]);

  if (!alert) return null;

  const toggleStep = (idx: number) => {
    const next = new Set(completedSteps);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setCompletedSteps(next);
  };

  const status = alert.remediation_status || 'Pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl text-slate-200 my-8 overflow-hidden card-3d">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-red-950/80 text-red-400 border border-red-800 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-slate-100 uppercase tracking-tight font-sans">
                  {alert.predicted_label.replace(/_/g, ' ')} Forensic Investigation
                </h3>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                  Event: {alert.event.event_id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Asset: <span className="text-slate-100 font-mono font-bold">{alert.event.entity_id}</span> ({alert.event.entity_type}) | Log Time: {new Date(alert.event.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Top Banner & Risk Score Gauge */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Risk Gauge */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 font-mono">Behavioral Anomaly Score</span>
              <div className="relative flex items-center justify-center my-2">
                <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 shadow-inner">
                  <div className="text-center">
                    <span className={`text-3xl font-black font-mono ${alert.risk_score >= 80 ? 'text-red-400' : 'text-amber-400'}`}>
                      {alert.risk_score}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">/ 100</span>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border font-mono ${alert.risk_score >= 80 ? 'bg-red-950 text-red-300 border-red-800' : 'bg-amber-950 text-amber-300 border-amber-800'}`}>
                {alert.risk_level} Risk Level
              </span>
            </div>

            {/* Quick Context Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 md:col-span-2 space-y-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Industrial Telemetry Context</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Source IP & Location:</span>
                  <span className="font-mono font-bold text-slate-200">{alert.event.source_ip}</span>
                  <span className="text-slate-400 block">{alert.event.geo_location.city}, {alert.event.geo_location.country}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Endpoint:</span>
                  <span className="font-mono text-slate-200 truncate block">{alert.event.resource_accessed}</span>
                  <span className="text-slate-400 block">Auth: {alert.event.auth_method}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Hardware MAC:</span>
                  <span className="font-mono text-slate-200">{alert.event.device_fingerprint.macAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">OS / Protocol:</span>
                  <span className="text-slate-200">{alert.event.device_fingerprint.os} ({alert.event.device_fingerprint.protocol})</span>
                </div>
              </div>

              {alert.geo_velocity_kmh ? (
                <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-200 flex items-center justify-between font-mono">
                  <span>Geo-Velocity Trigger:</span>
                  <span className="font-bold">{alert.geo_velocity_kmh.toLocaleString()} km/h ({alert.distance_km} km / {alert.time_delta_seconds} sec)</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Feature Attribution Breakdown Section */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2 font-mono">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Feature Attribution & Risk Delta Contribution</span>
            </h4>

            <div className="space-y-3">
              {alert.feature_attributions.map((fa, idx) => (
                <div key={idx} className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-cyan-300 font-mono">{fa.feature}</span>
                    <span className="font-mono font-bold text-amber-400">+{fa.impact_score} pts contribution</span>
                  </div>

                  {/* Impact Bar */}
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (fa.impact_score / alert.risk_score) * 100)}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{fa.reason}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                    <span>Observed: <strong className="text-slate-200">{fa.observed_value}</strong></span>
                    <span>Baseline Norm: <strong className="text-slate-200">{fa.baseline_value}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aegis AI Assistant Report */}
          <div className="bg-slate-950 p-5 rounded-xl border border-red-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-red-600/20 text-red-400 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-1.5 font-sans">
                    <span>Aegis AI SOC Forensic Report</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">Powered by server-side Gemini 3.6 Flash reasoning</p>
                </div>
              </div>
            </div>

            {isLoadingAi ? (
              <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium font-mono">Generating SOC Forensic Report & Containment Playbook...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-4 text-xs">
                {/* Executive Summary */}
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px] font-mono">Threat Summary:</span>
                  <p className="text-slate-200 leading-relaxed">{aiAnalysis.summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px] font-mono">Root Cause Trigger:</span>
                    <p className="text-slate-300">{aiAnalysis.root_cause}</p>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px] font-mono">Severity Rationale:</span>
                    <p className="text-slate-300">{aiAnalysis.severity_rationale}</p>
                  </div>
                </div>

                {/* IoCs */}
                {aiAnalysis.iocs && aiAnalysis.iocs.length > 0 && (
                  <div>
                    <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px] font-mono">Indicators of Compromise (IoCs):</span>
                    <div className="flex flex-wrap gap-1.5 font-mono">
                      {aiAnalysis.iocs.map((ioc, i) => (
                        <span key={i} className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800 rounded text-[11px]">
                          {ioc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Containment Playbook Checklist */}
                <div>
                  <span className="text-slate-300 font-bold block mb-2 flex items-center space-x-1.5 font-sans">
                    <AlertOctagon className="w-4 h-4 text-amber-400" />
                    <span>Recommended Containment Playbook:</span>
                  </span>
                  <div className="space-y-1.5">
                    {aiAnalysis.containment_playbook.map((step, idx) => {
                      const isDone = completedSteps.has(idx);
                      return (
                        <button
                          key={idx}
                          id={`btn-playbook-step-${idx}`}
                          onClick={() => toggleStep(idx)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start space-x-2.5 ${
                            isDone
                              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300 line-through opacity-80'
                              : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${isDone ? 'text-emerald-400' : 'text-slate-500'}`} />
                          <span className="text-xs font-medium">{step}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Footer / Remediation Controls */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Incident Status:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded ${status === 'Contained' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : status === 'Dismissed' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-red-950 text-red-300 border border-red-800'}`}>
              {status}
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto font-sans">
            <button
              id="btn-modal-dismiss"
              onClick={() => {
                onUpdateStatus(alert.event.event_id, 'Dismissed');
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
            >
              Dismiss (False Alarm)
            </button>

            <button
              id="btn-modal-contain"
              onClick={() => {
                onUpdateStatus(alert.event.event_id, 'Contained');
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Execute Containment</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
