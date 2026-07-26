import React, { useState } from 'react';
import { EntityBaselineProfile, AccessEvent } from '../types';
import {
  Cpu,
  Search,
  User,
  ShieldAlert,
  HardDrive,
  Globe,
  Clock,
  Activity,
  Flame,
  CheckCircle2,
  TrendingUp,
  Key,
} from 'lucide-react';

interface EntityProfilerProps {
  profiles: Map<string, EntityBaselineProfile>;
  events: AccessEvent[];
}

export const EntityProfiler: React.FC<EntityProfilerProps> = ({ profiles, events }) => {
  const profileList = Array.from(profiles.values()) as EntityBaselineProfile[];
  const [selectedEntityId, setSelectedEntityId] = useState<string>(profileList[0]?.entity_id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredProfiles = profileList.filter(
    (p) =>
      p.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.peer_group.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.entity_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProfile = profiles.get(selectedEntityId) || profileList[0];

  const entityEvents = events.filter((e) => e.entity_id === selectedEntityId);

  const getEntityIcon = (type: string) => {
    if (type === 'edge_device') return <HardDrive className="w-4 h-4 text-cyan-400" />;
    if (type === 'service_account') return <ShieldAlert className="w-4 h-4 text-purple-400" />;
    return <User className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Entity Behavioral Profiler & Baseline Inspector</span>
          </h2>
          <p className="text-xs text-slate-400">
            Per-entity learned behavioral baseline norms, cold-start warming states, and concept drift progression
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            id="input-search-entities"
            type="text"
            placeholder="Search entity ID or peer group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity List */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 space-y-2 max-h-[600px] overflow-y-auto">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
            Entities Monitored ({filteredProfiles.length})
          </span>

          {filteredProfiles.map((p) => {
            const isSelected = p.entity_id === selectedEntityId;
            return (
              <button
                key={p.entity_id}
                id={`btn-entity-${p.entity_id}`}
                onClick={() => setSelectedEntityId(p.entity_id)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500/80 text-slate-100 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-slate-950 rounded-lg border border-slate-800">{getEntityIcon(p.entity_type)}</div>
                  <div>
                    <span className="font-mono font-bold text-xs block">{p.entity_id}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{p.peer_group}</span>
                  </div>
                </div>

                <div className="text-right">
                  {p.is_cold_start ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Cold Start
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active Profile
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{p.total_events_observed} events</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Entity Details & Baseline Inspector */}
        {activeProfile ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Header Profile Card */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">{getEntityIcon(activeProfile.entity_type)}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-extrabold text-slate-100 font-mono">{activeProfile.entity_id}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-cyan-300 border border-slate-700 capitalize">
                        {activeProfile.entity_type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Peer Group: <span className="text-slate-200 font-medium">{activeProfile.peer_group}</span></p>
                  </div>
                </div>

                {/* Cold Start Indicator */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 min-w-[180px]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400 font-semibold">Cold-Start Warmup:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {Math.min(10, activeProfile.total_events_observed)} / 10
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (activeProfile.total_events_observed / 10) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {activeProfile.is_cold_start ? 'Benchmarking against peer group prior' : 'Warmed baseline active'}
                  </span>
                </div>
              </div>

              {/* Baseline Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Geos */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold flex items-center space-x-1">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Habitual Locations / Home Geos:</span>
                  </span>
                  <div className="text-slate-200 font-medium font-mono">
                    {activeProfile.typical_geos.map((g) => `${g.city}, ${g.country}`).join(' | ')}
                  </div>
                </div>

                {/* IPs */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold flex items-center space-x-1">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Frequent Source Subnets:</span>
                  </span>
                  <div className="text-slate-200 font-mono">{activeProfile.frequent_ips.join(', ')}</div>
                </div>

                {/* Hours */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Habitual Access Hours (UTC):</span>
                  </span>
                  <div className="text-slate-200 font-mono">
                    {Math.min(...activeProfile.typical_hours)}:00 - {Math.max(...activeProfile.typical_hours)}:00 UTC
                  </div>
                </div>

                {/* Resources */}
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-semibold flex items-center space-x-1">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Habitual Resources:</span>
                  </span>
                  <div className="text-slate-200 font-mono truncate">{activeProfile.frequent_resources.join(', ')}</div>
                </div>
              </div>
            </div>

            {/* Event History Timeline */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Observed Access Events ({entityEvents.length})</span>
              </h4>

              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                      <th className="py-2 px-3">Time</th>
                      <th className="py-2 px-3">Source IP</th>
                      <th className="py-2 px-3">Location</th>
                      <th className="py-2 px-3">Resource</th>
                      <th className="py-2 px-3">Label</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {entityEvents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500">
                          No events logged for this entity yet.
                        </td>
                      </tr>
                    ) : (
                      entityEvents.slice(0, 8).map((evt) => (
                        <tr key={evt.event_id} className="hover:bg-slate-900/50">
                          <td className="py-2 px-3 text-slate-400">{new Date(evt.timestamp).toLocaleTimeString()}</td>
                          <td className="py-2 px-3 text-slate-200">{evt.source_ip}</td>
                          <td className="py-2 px-3 text-slate-300">{evt.geo_location.city}</td>
                          <td className="py-2 px-3 text-slate-300 truncate max-w-[150px]">{evt.resource_accessed}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                evt.label === 'normal'
                                  ? 'bg-slate-800 text-slate-300'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 capitalize'
                              }`}
                            >
                              {evt.label.replace(/_/g, ' ')}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
