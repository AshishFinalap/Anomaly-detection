import React, { useState } from 'react';
import { DetectionResult } from '../types';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Lock,
  Globe,
  HardDrive,
  User,
  Zap,
  Activity,
  Flame,
} from 'lucide-react';

interface AlertQueueProps {
  alerts: DetectionResult[];
  onSelectAlert: (alert: DetectionResult) => void;
  onUpdateStatus: (eventId: string, newStatus: 'Contained' | 'Dismissed' | 'Pending') => void;
}

export const AlertQueue: React.FC<AlertQueueProps> = ({ alerts, onSelectAlert, onUpdateStatus }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.event.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.predicted_label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.event.source_ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.event.resource_accessed.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRisk =
      selectedRiskFilter === 'all' || alert.risk_level.toLowerCase() === selectedRiskFilter.toLowerCase();

    const status = alert.remediation_status || 'Pending';
    const matchesStatus =
      selectedStatusFilter === 'all' || status.toLowerCase() === selectedStatusFilter.toLowerCase();

    return matchesSearch && matchesRisk && matchesStatus;
  });

  const getRiskBadge = (level: string, score: number) => {
    if (level === 'Critical' || score >= 80) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-red-950 text-red-300 border border-red-800 shadow-sm flex items-center space-x-1">
          <Flame className="w-3 h-3 text-red-400 animate-pulse" />
          <span>{score} CRITICAL</span>
        </span>
      );
    }
    if (level === 'High' || score >= 60) {
      return (
        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 shadow-sm">
          {score} HIGH
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
        {score} MODERATE
      </span>
    );
  };

  const getEntityIcon = (type: string) => {
    if (type === 'edge_device') return <HardDrive className="w-3.5 h-3.5 text-cyan-400" />;
    if (type === 'service_account') return <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />;
    return <User className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-200 space-y-4">
      {/* Header & Search Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-extrabold text-slate-100 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>Industrial Security Threat Queue</span>
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-800 rounded-full">
              {filteredAlerts.length} Active Incidents
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time explainable risk scoring with multi-feature behavioral attribution
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              id="input-search-alerts"
              type="text"
              placeholder="Search entity, IP, threat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48"
            />
          </div>

          {/* Risk Level Filter */}
          <select
            id="select-risk-filter"
            value={selectedRiskFilter}
            onChange={(e) => setSelectedRiskFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical (80+)</option>
            <option value="high">High (60-79)</option>
            <option value="medium">Medium (&lt;60)</option>
          </select>

          {/* Status Filter */}
          <select
            id="select-status-filter"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Triage</option>
            <option value="contained">Contained</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Threat List Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-800/80">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider font-mono">
              <th className="py-3 px-4">Risk Score</th>
              <th className="py-3 px-4">Monitored Asset</th>
              <th className="py-3 px-4">Inferred Threat Category</th>
              <th className="py-3 px-4">Source Telemetry & Location</th>
              <th className="py-3 px-4">Primary Attribution Trigger</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                  No active security threats match the selected filter criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => {
                const status = alert.remediation_status || 'Pending';
                const primaryAttr = alert.feature_attributions[0];

                return (
                  <tr
                    key={alert.event.event_id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectAlert(alert)}
                  >
                    {/* Risk Score */}
                    <td className="py-3.5 px-4 font-mono">{getRiskBadge(alert.risk_level, alert.risk_score)}</td>

                    {/* Monitored Asset */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                          {getEntityIcon(alert.event.entity_type)}
                        </div>
                        <div>
                          <span className="font-mono font-bold text-slate-100 block">{alert.event.entity_id}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{alert.event.entity_type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </td>

                    {/* Inferred Threat */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-200 capitalize block">
                          {alert.predicted_label.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate block max-w-[160px]">
                          {alert.event.resource_accessed}
                        </span>
                      </div>
                    </td>

                    {/* Source Telemetry */}
                    <td className="py-3.5 px-4 font-mono">
                      <div>
                        <span className="text-slate-200 font-bold block">{alert.event.source_ip}</span>
                        <span className="text-[10px] text-slate-400 font-sans">
                          {alert.event.geo_location.city}, {alert.event.geo_location.country}
                        </span>
                      </div>
                    </td>

                    {/* Attribution Trigger */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      {primaryAttr ? (
                        <div className="space-y-0.5">
                          <span className="text-cyan-300 font-semibold text-[11px] block">{primaryAttr.feature}</span>
                          <p className="text-[10px] text-slate-400 truncate">{primaryAttr.reason}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[10px]">Multi-feature anomaly</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          status === 'Contained'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : status === 'Dismissed'
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          id={`btn-triage-${alert.event.event_id}`}
                          onClick={() => onSelectAlert(alert)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-bold border border-slate-700 flex items-center space-x-1 transition-all"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
