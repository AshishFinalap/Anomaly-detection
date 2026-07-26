import {
  AccessEvent,
  AnomalyType,
  DetectionResult,
  EntityBaselineProfile,
  FeatureAttribution,
  RiskLevel,
} from '../types';
import { calculateGeoVelocity, calculateHaversineDistance } from './geoUtils';

const PEER_GROUP_BASELINES: Record<string, { typical_hours: number[]; resources: string[]; auth: string[] }> = {
  'Factory IoT Gateways': {
    typical_hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    resources: ['/device/telemetry/heartbeat', '/edge/sensor/status'],
    auth: ['certificate'],
  },
  'Automated Backend Services': {
    typical_hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    resources: ['/api/v1/user/profile', '/auth/sso/session_refresh'],
    auth: ['token', 'certificate'],
  },
  'Standard Employee': {
    typical_hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    resources: ['/dashboard/overview', '/messaging/inbox', '/docs/team_handbook'],
    auth: ['password', 'token'],
  },
};

export class BehavioralAnomalyDetector {
  private entityProfiles: Map<string, EntityBaselineProfile>;
  private lastEventPerEntity: Map<string, AccessEvent>;
  private recentFailedAuths: Map<string, number[]>; // entity_id -> array of timestamps
  private recentIpAttempts: Map<string, number[]>; // source_ip -> array of timestamps

  constructor(initialProfiles?: Map<string, EntityBaselineProfile>) {
    this.entityProfiles = initialProfiles || new Map();
    this.lastEventPerEntity = new Map();
    this.recentFailedAuths = new Map();
    this.recentIpAttempts = new Map();
  }

  public updateProfiles(profiles: Map<string, EntityBaselineProfile>) {
    this.entityProfiles = profiles;
  }

  /**
   * Main inference engine: analyzes a single AccessEvent against behavioral baselines
   */
  public detect(event: AccessEvent): DetectionResult {
    const profile = this.entityProfiles.get(event.entity_id);
    const featureAttributions: FeatureAttribution[] = [];
    let totalRiskScore = 0;

    const eventTime = new Date(event.timestamp).getTime();
    const eventHour = new Date(event.timestamp).getHours();

    // ----------------------------------------------------
    // 1. Cold-Start Check & Baseline Benchmarking
    // ----------------------------------------------------
    const isColdStart = !profile || profile.is_cold_start || profile.total_events_observed < 5;
    const peerGroupKey = profile?.peer_group || (event.entity_type === 'edge_device' ? 'Factory IoT Gateways' : 'Standard Employee');
    const peerDefaults = PEER_GROUP_BASELINES[peerGroupKey] || PEER_GROUP_BASELINES['Standard Employee'];

    if (isColdStart) {
      featureAttributions.push({
        feature: 'Cold-Start Baseline',
        impact_score: 5,
        observed_value: `New Entity (${event.entity_id})`,
        baseline_value: `Peer Group: ${peerGroupKey}`,
        reason: 'Entity has minimal prior history. Evaluating against peer group norms.',
      });
    }

    // ----------------------------------------------------
    // 2. Geo-Velocity & Impossible Travel Check
    // ----------------------------------------------------
    let geoVelocityKmh = 0;
    let distanceKm = 0;
    let timeDeltaSeconds = 0;

    const prevEvent = this.lastEventPerEntity.get(event.entity_id);
    if (prevEvent) {
      const prevTime = new Date(prevEvent.timestamp).getTime();
      timeDeltaSeconds = Math.max(1, (eventTime - prevTime) / 1000);
      distanceKm = calculateHaversineDistance(prevEvent.geo_location, event.geo_location);
      geoVelocityKmh = calculateGeoVelocity(distanceKm, timeDeltaSeconds);

      // Velocity > 800 km/h is implausible for non-overlapping legitimate logins
      if (distanceKm > 100 && geoVelocityKmh > 800) {
        const impact = Math.min(60, Math.round((geoVelocityKmh / 1000) * 15) + 35);
        totalRiskScore += impact;
        featureAttributions.push({
          feature: 'Geo-Velocity / Travel Impossibility',
          impact_score: impact,
          observed_value: `${Math.round(geoVelocityKmh).toLocaleString()} km/h (${event.geo_location.city})`,
          baseline_value: `Prev Location: ${prevEvent.geo_location.city} (${Math.round(timeDeltaSeconds / 60)} min ago)`,
          reason: `Physical speed of ${Math.round(geoVelocityKmh).toLocaleString()} km/h between ${prevEvent.geo_location.city} and ${event.geo_location.city} exceeds physical travel limits (800 km/h threshold).`,
        });
      }
    }

    // ----------------------------------------------------
    // 3. Failed Auth & Brute Force / Credential Stuffing
    // ----------------------------------------------------
    if (!event.auth_success) {
      const failedList = this.recentFailedAuths.get(event.entity_id) || [];
      const updatedFailed = failedList.filter((t) => eventTime - t < 5 * 60 * 1000); // 5 min window
      updatedFailed.push(eventTime);
      this.recentFailedAuths.set(event.entity_id, updatedFailed);

      const ipList = this.recentIpAttempts.get(event.source_ip) || [];
      const updatedIpAttempts = ipList.filter((t) => eventTime - t < 5 * 60 * 1000);
      updatedIpAttempts.push(eventTime);
      this.recentIpAttempts.set(event.source_ip, updatedIpAttempts);

      if (updatedFailed.length >= 3) {
        const impact = Math.min(50, updatedFailed.length * 12);
        totalRiskScore += impact;
        featureAttributions.push({
          feature: 'Authentication Failure Burst',
          impact_score: impact,
          observed_value: `${updatedFailed.length} failed attempts in 5 mins`,
          baseline_value: 'Expected 0 failed logins',
          reason: `High velocity auth failures (${updatedFailed.length} failures) detected from IP ${event.source_ip}.`,
        });
      }

      if (updatedIpAttempts.length >= 6) {
        const impact = 40;
        totalRiskScore += impact;
        featureAttributions.push({
          feature: 'Credential Stuffing Source IP',
          impact_score: impact,
          observed_value: `${updatedIpAttempts.length} attempts across entities from ${event.source_ip}`,
          baseline_value: 'Single account per source IP',
          reason: `Source IP ${event.source_ip} is spraying authentication requests across multiple accounts.`,
        });
      }
    }

    // ----------------------------------------------------
    // 4. Device Fingerprint & Spoofing Check
    // ----------------------------------------------------
    const currentFingerprint = `${event.device_fingerprint.os} | MAC:${event.device_fingerprint.macAddress}`;
    const typicalFingerprints = profile?.typical_fingerprints || [];

    if (profile && typicalFingerprints.length > 0) {
      const matchExact = typicalFingerprints.some((f) => f.includes(event.device_fingerprint.macAddress));
      if (!matchExact) {
        const impact = 35;
        totalRiskScore += impact;
        featureAttributions.push({
          feature: 'Device Fingerprint Mismatch',
          impact_score: impact,
          observed_value: `OS: ${event.device_fingerprint.os}, MAC: ${event.device_fingerprint.macAddress}`,
          baseline_value: `Historical MAC: ${typicalFingerprints[0]?.split('MAC:')[1] || 'Known Hardware'}`,
          reason: `Device fingerprint (MAC ${event.device_fingerprint.macAddress}, OS ${event.device_fingerprint.os}) differs from entity's registered hardware baseline.`,
        });
      }
    }

    // ----------------------------------------------------
    // 5. Sensitive Resource & Lateral Movement
    // ----------------------------------------------------
    const isSensitive =
      event.resource_accessed.includes('/admin/') ||
      event.resource_accessed.includes('/sys/') ||
      event.resource_accessed.includes('/shadow') ||
      event.resource_accessed.includes('/secrets/');

    const usualResources = profile?.frequent_resources || peerDefaults.resources;
    const isKnownResource = usualResources.includes(event.resource_accessed);

    if (isSensitive && !isKnownResource) {
      const impact = 45;
      totalRiskScore += impact;
      featureAttributions.push({
        feature: 'Lateral Resource Access',
        impact_score: impact,
        observed_value: event.resource_accessed,
        baseline_value: usualResources.join(', '),
        reason: `Entity requested critical privilege path '${event.resource_accessed}' never accessed in historical baseline.`,
      });
    }

    // ----------------------------------------------------
    // 6. Time-of-Day & Exfiltration / Off-Hours Volumetric
    // ----------------------------------------------------
    const typicalHours = profile?.typical_hours || peerDefaults.typical_hours;
    const isOffHours = !typicalHours.includes(eventHour);

    if (isOffHours) {
      const impact = 15;
      totalRiskScore += impact;
      featureAttributions.push({
        feature: 'Off-Hours Anomaly',
        impact_score: impact,
        observed_value: `${eventHour}:00 UTC`,
        baseline_value: `Active Hours: ${Math.min(...typicalHours)}:00 - ${Math.max(...typicalHours)}:00 UTC`,
        reason: `Connection initiated during non-working hours (${eventHour}:00 UTC).`,
      });
    }

    if (event.bytes_transferred > 5000000) {
      // > 5MB
      const mb = (event.bytes_transferred / (1024 * 1024)).toFixed(1);
      const impact = Math.min(40, Math.round(event.bytes_transferred / 1000000) * 2 + 15);
      totalRiskScore += impact;
      featureAttributions.push({
        feature: 'Volumetric Exfiltration Data Surge',
        impact_score: impact,
        observed_value: `${mb} MB transferred`,
        baseline_value: `Avg: ${( (profile?.avg_bytes_transferred || 150000) / 1024 ).toFixed(0)} KB`,
        reason: `High volume data transfer (${mb} MB) during connection session.`,
      });
    }

    // Cap total risk score
    totalRiskScore = Math.min(100, totalRiskScore);

    // ----------------------------------------------------
    // 7. Attack Type Classification
    // ----------------------------------------------------
    let predictedLabel: AnomalyType = 'normal';
    if (totalRiskScore >= 30) {
      if (geoVelocityKmh > 800) predictedLabel = 'impossible_travel';
      else if (featureAttributions.some((a) => a.feature.includes('Stuffing'))) predictedLabel = 'credential_stuffing';
      else if (featureAttributions.some((a) => a.feature.includes('Authentication Failure'))) predictedLabel = 'brute_force';
      else if (featureAttributions.some((a) => a.feature.includes('Fingerprint'))) predictedLabel = 'device_spoofing';
      else if (featureAttributions.some((a) => a.feature.includes('Lateral'))) predictedLabel = 'lateral_movement';
      else if (featureAttributions.some((a) => a.feature.includes('Volumetric'))) predictedLabel = 'low_and_slow_exfiltration';
      else if (featureAttributions.some((a) => a.feature.includes('Off-Hours'))) predictedLabel = 'insider_drift';
      else predictedLabel = 'lateral_movement';
    }

    const isAnomaly = totalRiskScore >= 35;
    let riskLevel: RiskLevel = 'Benign';
    if (totalRiskScore >= 80) riskLevel = 'Critical';
    else if (totalRiskScore >= 60) riskLevel = 'High';
    else if (totalRiskScore >= 35) riskLevel = 'Medium';
    else if (totalRiskScore >= 15) riskLevel = 'Low';

    // ----------------------------------------------------
    // 8. Adaptive Baseline Update (Concept Drift)
    // ----------------------------------------------------
    if (profile && !isAnomaly) {
      // Smoothly adapt baseline with new non-anomalous events
      if (!profile.frequent_ips.includes(event.source_ip)) {
        if (profile.frequent_ips.length < 5) profile.frequent_ips.push(event.source_ip);
      }
      profile.total_events_observed++;
      if (profile.is_cold_start && profile.total_events_observed >= 10) {
        profile.is_cold_start = false;
      }
      profile.last_updated_at = new Date().toISOString();
    }

    // Save event for sequential travel calculation
    this.lastEventPerEntity.set(event.entity_id, event);

    return {
      event,
      is_anomaly: isAnomaly,
      predicted_label: predictedLabel,
      risk_score: totalRiskScore,
      confidence: Math.min(0.99, Math.max(0.65, totalRiskScore / 100)),
      risk_level: riskLevel,
      feature_attributions: featureAttributions,
      geo_velocity_kmh: Math.round(geoVelocityKmh),
      time_delta_seconds: Math.round(timeDeltaSeconds),
      distance_km: Math.round(distanceKm),
      remediation_status: 'Pending',
    };
  }
}
