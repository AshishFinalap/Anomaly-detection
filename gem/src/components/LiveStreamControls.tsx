import React from 'react';
import { AnomalyType } from '../types';
import { Zap, Play, Pause, Flame, ShieldAlert, Sliders, Activity, Server, Radio } from 'lucide-react';

interface LiveStreamControlsProps {
  isStreaming: boolean;
  setIsStreaming: (s: boolean) => void;
  streamSpeed: number;
  setStreamSpeed: (speed: number) => void;
  onInjectAttack: (type: AnomalyType) => void;
  totalEventsProcessed: number;
}

export const LiveStreamControls: React.FC<LiveStreamControlsProps> = ({
  isStreaming,
  setIsStreaming,
  streamSpeed,
  setStreamSpeed,
  onInjectAttack,
  totalEventsProcessed,
}) => {
  const attackTypes: Array<{ type: AnomalyType; label: string; desc: string; style: string }> = [
    {
      type: 'impossible_travel',
      label: 'Impossible Travel',
      desc: 'Speed > 800 km/h (NY to Tokyo in 15 min)',
      style: 'border-red-800/80 hover:bg-red-950/60 text-red-300 bg-red-950/20',
    },
    {
      type: 'brute_force',
      label: 'Brute-Force Auth Burst',
      desc: '5+ failed logins in <10s',
      style: 'border-amber-800/80 hover:bg-amber-950/60 text-amber-300 bg-amber-950/20',
    },
    {
      type: 'lateral_movement',
      label: 'OT Lateral Escalation',
      desc: 'Unapproved SCADA/Modbus resource',
      style: 'border-purple-800/80 hover:bg-purple-950/60 text-purple-300 bg-purple-950/20',
    },
    {
      type: 'device_spoofing',
      label: 'MAC/Hardware Spoofing',
      desc: 'Mismatched OS & Firmware MAC',
      style: 'border-cyan-800/80 hover:bg-cyan-950/60 text-cyan-300 bg-cyan-950/20',
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl text-slate-200 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Stream Telemetry Status */}
        <div className="flex items-center space-x-4">
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">OT/IT Telemetry Stream</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                {totalEventsProcessed.toLocaleString()} Events Ingested
              </span>
            </div>
            <p className="text-xs text-slate-400">In-memory stateful evaluation & anomaly scoring engine</p>
          </div>
        </div>

        {/* Speed Controls & Stream State */}
        <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold px-2">Speed:</span>
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              id={`btn-speed-${speed}x`}
              onClick={() => setStreamSpeed(speed)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                streamSpeed === speed
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Attack Injection Controls */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>Simulate Tactical Cybersecurity Attack Injections:</span>
          </span>
          <span className="text-[10px] text-slate-500">Injects real-time attack vector into streaming telemetry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {attackTypes.map((attack) => (
            <button
              key={attack.type}
              id={`btn-inject-${attack.type}`}
              onClick={() => onInjectAttack(attack.type)}
              className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${attack.style}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold font-sans">{attack.label}</span>
                <Zap className="w-3.5 h-3.5 shrink-0 ml-1" />
              </div>
              <span className="text-[10px] opacity-80 font-mono block">{attack.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
