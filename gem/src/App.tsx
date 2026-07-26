import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessEvent,
  AnomalyType,
  DetectionResult,
  EntityBaselineProfile,
  GeneratorConfig,
} from './types';
import { generateSyntheticDataset } from './utils/syntheticDataGenerator';
import { BehavioralAnomalyDetector } from './utils/anomalyDetectionEngine';
import { computeEvaluationMetrics } from './utils/evaluationEngine';
import { Header } from './components/Header';
import { LiveStreamControls } from './components/LiveStreamControls';
import { AlertQueue } from './components/AlertQueue';
import { AlertDetailModal } from './components/AlertDetailModal';
import { EntityProfiler } from './components/EntityProfiler';
import { SyntheticDataGeneratorView } from './components/SyntheticDataGeneratorView';
import { ModelEvaluationView } from './components/ModelEvaluationView';
import { ExecutiveReportView } from './components/ExecutiveReportView';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { MLPipelineInspectorView } from './components/MLPipelineInspectorView';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Server,
  Zap,
  Flame,
  Radio,
  Lock,
  Brain,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);

  // Core Data State
  const [profiles, setProfiles] = useState<Map<string, EntityBaselineProfile>>(new Map());
  const [events, setEvents] = useState<AccessEvent[]>([]);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<DetectionResult | null>(null);

  // Detector Instance Ref
  const detectorRef = useRef<BehavioralAnomalyDetector>(new BehavioralAnomalyDetector());

  // Initialize Data & Detector
  useEffect(() => {
    const { events: initialEvents, profiles: initialProfiles } = generateSyntheticDataset();
    setProfiles(initialProfiles);
    setEvents(initialEvents);

    const detector = new BehavioralAnomalyDetector(initialProfiles);
    detectorRef.current = detector;

    const results: DetectionResult[] = initialEvents.map((evt) => detector.detect(evt));
    setDetectionResults(results);
  }, []);

  // Live Telemetry Streaming Loop
  useEffect(() => {
    if (!isStreaming || profiles.size === 0) return;

    const intervalTime = Math.max(100, 1500 / streamSpeed);

    const interval = setInterval(() => {
      const profileList = Array.from(profiles.values()) as EntityBaselineProfile[];
      const randomEntity = profileList[Math.floor(Math.random() * profileList.length)];
      if (!randomEntity) return;

      const newEvent: AccessEvent = {
        event_id: `evt_live_${Math.random().toString(36).substring(2, 9)}`,
        entity_id: randomEntity.entity_id,
        entity_type: randomEntity.entity_type,
        timestamp: new Date().toISOString(),
        source_ip: randomEntity.frequent_ips[0] || '192.168.1.100',
        geo_location: randomEntity.typical_geos[0] || { country: 'USA', city: 'Houston', lat: 29.7604, lng: -95.3698 },
        resource_accessed: randomEntity.frequent_resources[0] || '/scada/gateway/status',
        auth_method: randomEntity.frequent_auth_methods[0] || 'token',
        session_duration: 120,
        command_sequence: ['LOGIN', 'ACCESS'],
        device_fingerprint: {
          os: 'Industrial Embedded OS v4.2',
          firmwareVersion: 'v2.1',
          macAddress: '70:35:09:A1:B2:C3',
          protocol: 'MQTT-TLS',
          userAgent: 'AegisNode/1.0',
        },
        auth_success: true,
        bytes_transferred: 45000,
        label: 'normal',
      };

      const result = detectorRef.current.detect(newEvent);

      setEvents((prev) => [newEvent, ...prev.slice(0, 1999)]);
      setDetectionResults((prev) => [result, ...prev.slice(0, 1999)]);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isStreaming, streamSpeed, profiles]);

  // Inject Simulated Attack
  const handleInjectAttack = (attackType: AnomalyType) => {
    const profileList = Array.from(profiles.values()) as EntityBaselineProfile[];
    const targetEntity = profileList[Math.floor(Math.random() * profileList.length)];
    if (!targetEntity) return;

    const now = new Date();
    const eventTimeISO = now.toISOString();

    let attackEvent: AccessEvent;

    if (attackType === 'impossible_travel') {
      attackEvent = {
        event_id: `evt_inj_travel_${Date.now()}`,
        entity_id: targetEntity.entity_id,
        entity_type: targetEntity.entity_type,
        timestamp: eventTimeISO,
        source_ip: '185.220.101.5',
        geo_location: { country: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503 },
        resource_accessed: '/cloud/iam/role_policy_escalate',
        auth_method: 'password',
        session_duration: 30,
        command_sequence: ['ELEVATE_PRIVILEGES'],
        device_fingerprint: {
          os: 'Linux Kali',
          firmwareVersion: '6.5',
          macAddress: 'DE:AD:BE:EF:00:01',
          protocol: 'SSH-2.0',
          userAgent: 'Curl/8.4.0',
        },
        auth_success: true,
        bytes_transferred: 85000,
        label: 'impossible_travel',
      };
    } else if (attackType === 'brute_force') {
      attackEvent = {
        event_id: `evt_inj_bf_${Date.now()}`,
        entity_id: targetEntity.entity_id,
        entity_type: targetEntity.entity_type,
        timestamp: eventTimeISO,
        source_ip: '198.51.100.99',
        geo_location: { country: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173 },
        resource_accessed: '/scada/auth/login',
        auth_method: 'password',
        session_duration: 1,
        command_sequence: ['AUTH_FAILED'],
        device_fingerprint: {
          os: 'Linux x86_64',
          firmwareVersion: '1.0',
          macAddress: '00:00:00:00:00:00',
          protocol: 'Modbus-TCP',
          userAgent: 'HydraBrute/9.5',
        },
        auth_success: false,
        bytes_transferred: 210,
        label: 'brute_force',
      };
    } else {
      attackEvent = {
        event_id: `evt_inj_gen_${Date.now()}`,
        entity_id: targetEntity.entity_id,
        entity_type: targetEntity.entity_type,
        timestamp: eventTimeISO,
        source_ip: '203.0.113.42',
        geo_location: { country: 'Romania', city: 'Bucharest', lat: 44.4323, lng: 26.1063 },
        resource_accessed: '/factory/db/export_plc_config.bin',
        auth_method: 'token',
        session_duration: 12000,
        command_sequence: ['EXFILTRATE_DATA'],
        device_fingerprint: {
          os: 'Windows Server 2022',
          firmwareVersion: '10.0',
          macAddress: 'FF:FF:FF:00:11:22',
          protocol: 'DNP3',
          userAgent: 'CustomExfil/1.0',
        },
        auth_success: true,
        bytes_transferred: 14500000,
        label: attackType,
      };
    }

    const result = detectorRef.current.detect(attackEvent);

    setEvents((prev) => [attackEvent, ...prev]);
    setDetectionResults((prev) => [result, ...prev]);

    // Automatically inspect injected alert
    setSelectedAlert(result);
  };

  // Regenerate Entire Dataset
  const handleRegenerateDataset = (config: GeneratorConfig) => {
    const { events: newEvents, profiles: newProfiles } = generateSyntheticDataset(config);
    setProfiles(newProfiles);
    setEvents(newEvents);

    const detector = new BehavioralAnomalyDetector(newProfiles);
    detectorRef.current = detector;

    const results = newEvents.map((e) => detector.detect(e));
    setDetectionResults(results);
  };

  // Status Updates
  const handleUpdateStatus = (eventId: string, newStatus: 'Contained' | 'Dismissed' | 'Pending') => {
    setDetectionResults((prev) =>
      prev.map((res) => (res.event.event_id === eventId ? { ...res, remediation_status: newStatus } : res))
    );
  };

  // Filtered Alert Queues & Metrics
  const anomaliesOnly = useMemo(() => detectionResults.filter((r) => r.is_anomaly), [detectionResults]);
  const criticalAlerts = useMemo(() => anomaliesOnly.filter((r) => r.risk_level === 'Critical'), [anomaliesOnly]);
  const metrics = useMemo(() => computeEvaluationMetrics(detectionResults), [detectionResults]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black bg-grid-pattern bg-radial-spotlight">
      {/* Navbar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertsCount={anomaliesOnly.filter((a) => a.remediation_status !== 'Dismissed').length}
        criticalCount={criticalAlerts.length}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        toggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stream & Injection Bar */}
        <LiveStreamControls
          isStreaming={isStreaming}
          setIsStreaming={setIsStreaming}
          streamSpeed={streamSpeed}
          setStreamSpeed={setStreamSpeed}
          onInjectAttack={handleInjectAttack}
          totalEventsProcessed={events.length}
        />

        {/* Tab 1: SOC Operations Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Operational KPI Cards with 3D Transforms */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 perspective-1000">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl card-3d card-3d-red">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Active Threats</span>
                  <div className="p-2 bg-red-950/80 text-red-400 rounded-xl border border-red-800/80 shadow-md">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-red-400 font-mono">
                    {anomaliesOnly.filter((a) => a.remediation_status !== 'Dismissed').length}
                  </span>
                  <span className="text-xs text-red-300 font-bold font-mono">
                    ({criticalAlerts.length} Critical)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Ranked OT/IT anomalies requiring SOC triage</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl card-3d card-3d-cyan">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Detection Accuracy</span>
                  <div className="p-2 bg-emerald-950/80 text-emerald-400 rounded-xl border border-emerald-800/80 shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-emerald-400 font-mono">
                    {Math.round(metrics.accuracy * 100)}%
                  </span>
                  <span className="text-xs text-emerald-300 font-bold font-mono">
                    F1: {Math.round(metrics.f1_score * 100)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Tested on extreme class imbalance</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl card-3d">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Top 1% Alert FPR</span>
                  <div className="p-2 bg-amber-950/80 text-amber-400 rounded-xl border border-amber-800/80 shadow-md">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    {(metrics.false_positive_rate_at_1pct_budget * 100).toFixed(1)}%
                  </span>
                  <span className="text-xs text-amber-300 font-bold font-mono">Low Fatigue</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Analyst alert triage budget limit</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl card-3d card-3d-cyan">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Cold Start Warmup</span>
                  <div className="p-2 bg-cyan-950/80 text-cyan-400 rounded-xl border border-cyan-800/80 shadow-md">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-cyan-400 font-mono">
                    {Math.round(metrics.cold_start_accuracy * 100)}%
                  </span>
                  <span className="text-xs text-cyan-300 font-bold font-mono">Peer Norms</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Zero-history entity prior accuracy</p>
              </div>
            </div>

            {/* Quick Threat Feed */}
            <AlertQueue
              alerts={anomaliesOnly}
              onSelectAlert={(a) => setSelectedAlert(a)}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        )}

        {/* Tab 2: Threat Queue */}
        {activeTab === 'alerts' && (
          <AlertQueue
            alerts={anomaliesOnly}
            onSelectAlert={(a) => setSelectedAlert(a)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {/* Tab 3: ML Models Pipeline */}
        {activeTab === 'ml_pipeline' && <MLPipelineInspectorView />}

        {/* Tab 4: Industrial Assets */}
        {activeTab === 'entities' && <EntityProfiler profiles={profiles} events={events} />}

        {/* Tab 5: Synthetic Data Generator */}
        {activeTab === 'generator' && (
          <SyntheticDataGeneratorView events={events} onRegenerate={handleRegenerateDataset} />
        )}

        {/* Tab 6: ML Model Evaluation */}
        {activeTab === 'evaluation' && <ModelEvaluationView metrics={metrics} />}

        {/* Tab 7: Executive Deliverable Report & Slide Deck */}
        {activeTab === 'report' && <ExecutiveReportView />}
      </main>

      {/* Alert Deep Dive Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* AI Copilot Chat Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeAlerts={anomaliesOnly}
      />
    </div>
  );
}
