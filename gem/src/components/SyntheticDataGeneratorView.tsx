import React, { useState } from 'react';
import { GeneratorConfig, AccessEvent, AnomalyType } from '../types';
import { DEFAULT_CONFIG } from '../utils/syntheticDataGenerator';
import { Database, Download, RefreshCw, Sliders, Table, Check, Sparkles } from 'lucide-react';

interface SyntheticDataGeneratorViewProps {
  events: AccessEvent[];
  onRegenerate: (config: GeneratorConfig) => void;
}

export const SyntheticDataGeneratorView: React.FC<SyntheticDataGeneratorViewProps> = ({ events, onRegenerate }) => {
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onRegenerate(config);
      setIsGenerating(false);
    }, 300);
  };

  const handleExportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(events, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `cybershield_synthetic_access_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2500);
  };

  const handleExportCSV = () => {
    if (events.length === 0) return;
    const headers = ['event_id', 'entity_id', 'entity_type', 'timestamp', 'source_ip', 'city', 'country', 'resource_accessed', 'auth_method', 'session_duration', 'bytes_transferred', 'label'];
    const rows = events.map((e) => [
      e.event_id,
      e.entity_id,
      e.entity_type,
      e.timestamp,
      e.source_ip,
      e.geo_location.city,
      e.geo_location.country,
      `"${e.resource_accessed}"`,
      e.auth_method,
      e.session_duration,
      e.bytes_transferred,
      e.label,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cybershield_synthetic_access_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <span>Synthetic Access-Log Data Generator</span>
          </h2>
          <p className="text-xs text-slate-400">
            Generates high-fidelity sequential access telemetry with injected cybersecurity attack taxonomy
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-export-json"
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition-all"
          >
            {exportSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
            <span>{exportSuccess ? 'Downloaded!' : 'Export JSON'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Generator Parameters</span>
          </h3>

          {/* Num Entities */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-400 font-semibold flex justify-between">
              <span>Monitored Entities:</span>
              <span className="font-mono text-cyan-400 font-bold">{config.num_entities}</span>
            </label>
            <input
              id="range-num-entities"
              type="range"
              min="10"
              max="100"
              step="5"
              value={config.num_entities}
              onChange={(e) => setConfig({ ...config, num_entities: parseInt(e.target.value) })}
              className="w-full accent-cyan-500 bg-slate-800 rounded"
            />
          </div>

          {/* Num Events */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-400 font-semibold flex justify-between">
              <span>Total Sequence Events:</span>
              <span className="font-mono text-cyan-400 font-bold">{config.num_events}</span>
            </label>
            <input
              id="range-num-events"
              type="range"
              min="200"
              max="3000"
              step="100"
              value={config.num_events}
              onChange={(e) => setConfig({ ...config, num_events: parseInt(e.target.value) })}
              className="w-full accent-cyan-500 bg-slate-800 rounded"
            />
          </div>

          {/* Anomaly Rate */}
          <div className="space-y-1 text-xs">
            <label className="text-slate-400 font-semibold flex justify-between">
              <span>Injected Anomaly Rate:</span>
              <span className="font-mono text-amber-400 font-bold">{(config.anomaly_rate * 100).toFixed(1)}%</span>
            </label>
            <input
              id="range-anomaly-rate"
              type="range"
              min="0.005"
              max="0.10"
              step="0.005"
              value={config.anomaly_rate}
              onChange={(e) => setConfig({ ...config, anomaly_rate: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 bg-slate-800 rounded"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                id="checkbox-cold-start"
                type="checkbox"
                checked={config.include_cold_start}
                onChange={(e) => setConfig({ ...config, include_cold_start: e.target.checked })}
                className="rounded accent-cyan-500"
              />
              <span className="text-slate-300 font-medium">Include Cold-Start Entities (20%)</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                id="checkbox-concept-drift"
                type="checkbox"
                checked={config.include_concept_drift}
                onChange={(e) => setConfig({ ...config, include_concept_drift: e.target.checked })}
                className="rounded accent-cyan-500"
              />
              <span className="text-slate-300 font-medium">Include Concept Drift (Adaptive Baseline)</span>
            </label>
          </div>

          <button
            id="btn-regenerate-dataset"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Generating Telemetry...' : 'Regenerate Dataset'}</span>
          </button>
        </div>

        {/* Dataset Preview & Schema Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schema Reference Table */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Table className="w-4 h-4 text-cyan-400" />
              <span>Synthetic Telemetry Schema Reference</span>
            </h3>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                    <th className="py-2 px-3">Field</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  <tr>
                    <td className="py-2 px-3 text-cyan-400">entity_id</td>
                    <td className="py-2 px-3 text-slate-400">string</td>
                    <td className="py-2 px-3 text-slate-300 font-sans">Unique identifier (usr_*, svc_*, edge_*)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-400">entity_type</td>
                    <td className="py-2 px-3 text-slate-400">enum</td>
                    <td className="py-2 px-3 text-slate-300 font-sans">user / service_account / edge_device</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-400">geo_location</td>
                    <td className="py-2 px-3 text-slate-400">object</td>
                    <td className="py-2 px-3 text-slate-300 font-sans">Country, City, Lat, Lng coordinates</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-400">device_fingerprint</td>
                    <td className="py-2 px-3 text-slate-400">object</td>
                    <td className="py-2 px-3 text-slate-300 font-sans">OS, Firmware, MAC address, Protocol</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-cyan-400">label</td>
                    <td className="py-2 px-3 text-slate-400">enum</td>
                    <td className="py-2 px-3 text-slate-300 font-sans">normal / attack taxonomy category</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Dataset Log Preview */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Generated Telemetry Preview ({events.length} events)</span>
              </h3>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Entity</th>
                    <th className="py-2 px-3">IP / Location</th>
                    <th className="py-2 px-3">Resource</th>
                    <th className="py-2 px-3">Ground Truth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {events.slice(0, 10).map((e) => (
                    <tr key={e.event_id} className="hover:bg-slate-900/50">
                      <td className="py-2 px-3 text-slate-400">{new Date(e.timestamp).toLocaleTimeString()}</td>
                      <td className="py-2 px-3 text-cyan-300">{e.entity_id}</td>
                      <td className="py-2 px-3 text-slate-300">{e.source_ip} ({e.geo_location.city})</td>
                      <td className="py-2 px-3 text-slate-300 truncate max-w-[150px]">{e.resource_accessed}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            e.label === 'normal'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {e.label.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
