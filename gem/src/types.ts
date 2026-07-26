export type EntityType = 'user' | 'service_account' | 'edge_device';

export type AuthMethod = 'password' | 'token' | 'certificate' | 'biometric';

export type AnomalyType = 
  | 'normal' 
  | 'brute_force' 
  | 'impossible_travel' 
  | 'credential_stuffing' 
  | 'lateral_movement' 
  | 'device_spoofing' 
  | 'low_and_slow_exfiltration' 
  | 'insider_drift';

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Benign';

export interface GeoLocation {
  country: string;
  city: string;
  lat: number;
  lng: number;
}

export interface DeviceFingerprint {
  os: string;
  firmwareVersion: string;
  macAddress: string;
  protocol: string;
  userAgent: string;
}

export interface AccessEvent {
  event_id: string;
  entity_id: string;
  entity_type: EntityType;
  timestamp: string; // ISO string
  source_ip: string;
  geo_location: GeoLocation;
  resource_accessed: string;
  auth_method: AuthMethod;
  session_duration: number; // seconds
  command_sequence: string[];
  device_fingerprint: DeviceFingerprint;
  auth_success: boolean;
  bytes_transferred: number;
  label: AnomalyType; // Hidden ground truth label for inference, used for eval
  is_cold_start_event?: boolean;
}

export interface EntityBaselineProfile {
  entity_id: string;
  entity_type: EntityType;
  frequent_ips: string[];
  typical_geos: GeoLocation[];
  frequent_resources: string[];
  frequent_auth_methods: AuthMethod[];
  typical_hours: number[]; // e.g. [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
  avg_session_duration: number; // seconds
  std_session_duration: number;
  avg_bytes_transferred: number;
  typical_fingerprints: string[]; // OS/MAC combinations
  total_events_observed: number;
  is_cold_start: boolean;
  created_at: string;
  last_updated_at: string;
  peer_group: string;
  concept_drift_score: number; // 0 to 1 indicating drift
}

export interface FeatureAttribution {
  feature: string;
  impact_score: number; // 0 to 100 percentage point contribution
  observed_value: string;
  baseline_value: string;
  reason: string;
}

export interface DetectionResult {
  event: AccessEvent;
  is_anomaly: boolean;
  predicted_label: AnomalyType;
  risk_score: number; // 0 - 100
  confidence: number; // 0 - 1
  risk_level: RiskLevel;
  feature_attributions: FeatureAttribution[];
  geo_velocity_kmh?: number;
  time_delta_seconds?: number;
  distance_km?: number;
  ai_summary?: string;
  recommended_action?: string;
  remediation_status?: 'Pending' | 'Contained' | 'Dismissed' | 'Auto-Blocked';
}

export interface GeneratorConfig {
  num_entities: number;
  num_events: number;
  anomaly_rate: number; // e.g. 0.02 for 2%
  attack_distribution: Record<Exclude<AnomalyType, 'normal'>, number>;
  noise_level: number;
  include_cold_start: boolean;
  include_concept_drift: boolean;
  time_horizon_days: number;
}

export interface EvaluationMetrics {
  total_events: number;
  total_anomalies: number;
  true_positives: number;
  false_positives: number;
  true_negatives: number;
  false_negatives: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  false_positive_rate_at_1pct_budget: number;
  per_class_metrics: Record<AnomalyType, { precision: number; recall: number; f1: number; count: number }>;
  confusion_matrix: { labels: AnomalyType[]; matrix: number[][] };
  cold_start_accuracy: number;
  concept_drift_adaptation_score: number;
}

export interface AISOCAnalysisResponse {
  summary: string;
  root_cause: string;
  iocs: string[];
  severity_rationale: string;
  containment_playbook: string[];
  attack_vector_explanation: string;
}
