import {
  AccessEvent,
  AnomalyType,
  AuthMethod,
  DeviceFingerprint,
  EntityBaselineProfile,
  EntityType,
  GeneratorConfig,
  GeoLocation,
} from '../types';
import { CITIES_DATABASE } from './geoUtils';

const SENSITIVE_RESOURCES = [
  '/api/admin/users',
  '/sys/db/export_backup.sql',
  '/etc/shadow_auth',
  '/cloud/iam/role_policy_escalate',
  '/k8s/secrets/prod-vault-token',
  '/financials/executive_compensation.xlsx',
];

const NORMAL_RESOURCES = [
  '/dashboard/overview',
  '/api/v1/user/profile',
  '/messaging/inbox',
  '/reports/daily_summary',
  '/device/telemetry/heartbeat',
  '/edge/sensor/status',
  '/auth/sso/session_refresh',
  '/docs/team_handbook',
];

const KNOWN_MACS = [
  '70:35:09:A1:B2:C3',
  '00:1A:2B:3C:4D:5E',
  'AC:DE:48:00:11:22',
  'B8:27:EB:44:55:66',
  'DC:A6:32:77:88:99',
];

export const DEFAULT_CONFIG: GeneratorConfig = {
  num_entities: 40,
  num_events: 1500,
  anomaly_rate: 0.04, // 4% anomalies
  attack_distribution: {
    brute_force: 0.20,
    impossible_travel: 0.20,
    credential_stuffing: 0.15,
    lateral_movement: 0.15,
    device_spoofing: 0.10,
    low_and_slow_exfiltration: 0.10,
    insider_drift: 0.10,
  },
  noise_level: 0.05,
  include_cold_start: true,
  include_concept_drift: true,
  time_horizon_days: 14,
};

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomIP(subnetPrefix?: string): string {
  if (subnetPrefix) {
    return `${subnetPrefix}.${randomInt(1, 254)}.${randomInt(1, 254)}`;
  }
  return `${randomInt(10, 220)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
}

/**
 * Generates entity profiles for Users, Service Accounts, and Edge Devices
 */
export function generateEntityProfiles(numEntities: number): Map<string, EntityBaselineProfile> {
  const profiles = new Map<string, EntityBaselineProfile>();
  const citiesList = Object.values(CITIES_DATABASE);

  for (let i = 1; i <= numEntities; i++) {
    let type: EntityType = 'user';
    if (i % 5 === 0) type = 'service_account';
    else if (i % 7 === 0) type = 'edge_device';

    let entityId = '';
    let peerGroup = 'Standard Employee';
    let frequentAuth: AuthMethod[] = ['password', 'token'];
    let osOptions = ['macOS Sonoma 14.5', 'Windows 11 Enterprise', 'Ubuntu 22.04 LTS'];

    if (type === 'user') {
      entityId = `usr_${100 + i}`;
      peerGroup = i % 3 === 0 ? 'Engineering / Dev' : i % 2 === 0 ? 'Finance & HR' : 'Operations';
      frequentAuth = ['password', 'token'];
    } else if (type === 'service_account') {
      entityId = `svc_daemon_${200 + i}`;
      peerGroup = 'Automated Backend Services';
      frequentAuth = ['token', 'certificate'];
      osOptions = ['Linux Kernel 6.1 (Debian)', 'Alpine Linux 3.19'];
    } else {
      entityId = `edge_node_${300 + i}`;
      peerGroup = 'Factory IoT Gateways';
      frequentAuth = ['certificate'];
      osOptions = ['FreeRTOS v10.4', 'Embedded Linux Yocto 4.0', 'VxWorks 7'];
    }

    const homeCity = randomChoice(citiesList);
    const subnet = `${randomInt(10, 192)}.${randomInt(168, 172)}`;
    const typicalIPs = [randomIP(subnet), randomIP(subnet)];
    const mac = KNOWN_MACS[i % KNOWN_MACS.length];
    const fingerPrintStr = `${osOptions[0]} | MAC:${mac} | Auth:${frequentAuth[0]}`;

    const profile: EntityBaselineProfile = {
      entity_id: entityId,
      entity_type: type,
      frequent_ips: typicalIPs,
      typical_geos: [homeCity],
      frequent_resources: [randomChoice(NORMAL_RESOURCES), randomChoice(NORMAL_RESOURCES)],
      frequent_auth_methods: frequentAuth,
      typical_hours: type === 'service_account' ? Array.from({ length: 24 }, (_, h) => h) : [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      avg_session_duration: type === 'edge_device' ? 86400 : type === 'service_account' ? 300 : 1800,
      std_session_duration: 300,
      avg_bytes_transferred: type === 'edge_device' ? 5120 : 150000,
      typical_fingerprints: [fingerPrintStr],
      total_events_observed: 0,
      is_cold_start: i > numEntities * 0.8, // last 20% are cold start entities
      created_at: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
      last_updated_at: new Date().toISOString(),
      peer_group: peerGroup,
      concept_drift_score: 0,
    };

    profiles.set(entityId, profile);
  }

  return profiles;
}

/**
 * Generates synthetic log dataset with baseline habitual events + injected attack scenarios
 */
export function generateSyntheticDataset(
  config: GeneratorConfig = DEFAULT_CONFIG
): { events: AccessEvent[]; profiles: Map<string, EntityBaselineProfile> } {
  const profiles = generateEntityProfiles(config.num_entities);
  const profileList = Array.from(profiles.values());
  const events: AccessEvent[] = [];

  const startTime = Date.now() - config.time_horizon_days * 86400 * 1000;
  let currentTimestamp = startTime;
  const timeStepAvgMs = (config.time_horizon_days * 86400 * 1000) / config.num_events;

  const totalAnomaliesTarget = Math.floor(config.num_events * config.anomaly_rate);
  const anomalySchedule = new Set<number>();
  
  // Scatter anomaly indices
  while (anomalySchedule.size < totalAnomaliesTarget) {
    const idx = randomInt(50, config.num_events - 1);
    anomalySchedule.add(idx);
  }

  // Common attacker infrastructure for multi-target attacks
  const attackerIp = '185.220.101.5';
  const attackerGeo = CITIES_DATABASE['Moscow, Russia'];

  for (let eventIdx = 0; eventIdx < config.num_events; eventIdx++) {
    currentTimestamp += randomInt(Math.max(100, timeStepAvgMs * 0.3), timeStepAvgMs * 1.7);
    const eventTimeISO = new Date(currentTimestamp).toISOString();

    const isAnomaly = anomalySchedule.has(eventIdx);
    const targetEntity = randomChoice(profileList);

    if (!isAnomaly) {
      // --- Normal Event ---
      const isColdStart = targetEntity.is_cold_start && targetEntity.total_events_observed < 10;
      targetEntity.total_events_observed++;

      const geo = randomChoice(targetEntity.typical_geos);
      const ip = randomChoice(targetEntity.frequent_ips);
      const resource = randomChoice(targetEntity.frequent_resources);
      const auth = randomChoice(targetEntity.frequent_auth_methods);

      const hour = new Date(currentTimestamp).getHours();
      // Add slight noise
      const sessionDur = Math.max(10, Math.round(targetEntity.avg_session_duration + (Math.random() - 0.5) * targetEntity.std_session_duration));
      const bytesTransferred = Math.max(500, Math.round(targetEntity.avg_bytes_transferred + (Math.random() - 0.5) * 20000));

      const mac = targetEntity.typical_fingerprints[0].split('| MAC:')[1]?.split(' |')[0] || KNOWN_MACS[0];

      events.push({
        event_id: `evt_${Math.random().toString(36).substring(2, 10)}`,
        entity_id: targetEntity.entity_id,
        entity_type: targetEntity.entity_type,
        timestamp: eventTimeISO,
        source_ip: ip,
        geo_location: geo,
        resource_accessed: resource,
        auth_method: auth,
        session_duration: sessionDur,
        command_sequence: ['LOGIN', 'FETCH_PROFILE', 'QUERY_RESOURCE', 'LOGOUT'],
        device_fingerprint: {
          os: targetEntity.entity_type === 'edge_device' ? 'Embedded Linux Yocto' : 'macOS Sonoma 14.5',
          firmwareVersion: 'v2.4.1',
          macAddress: mac,
          protocol: targetEntity.entity_type === 'edge_device' ? 'MQTT/TLS' : 'HTTPS',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        },
        auth_success: true,
        bytes_transferred: bytesTransferred,
        label: 'normal',
        is_cold_start_event: isColdStart,
      });
    } else {
      // --- Anomaly Event Injection ---
      const attackTypes: AnomalyType[] = [
        'brute_force',
        'impossible_travel',
        'credential_stuffing',
        'lateral_movement',
        'device_spoofing',
        'low_and_slow_exfiltration',
        'insider_drift',
      ];
      const selectedAttack = randomChoice(attackTypes);

      if (selectedAttack === 'impossible_travel') {
        // Target logged in from home city 10 mins ago, now logging in from Tokyo/Moscow
        const homeGeo = targetEntity.typical_geos[0];
        const remoteGeo = homeGeo.country === 'USA' ? CITIES_DATABASE['Tokyo, Japan'] : CITIES_DATABASE['New York, USA'];

        // Inject 2 paired events close in time
        events.push({
          event_id: `evt_travel_a_${eventIdx}`,
          entity_id: targetEntity.entity_id,
          entity_type: targetEntity.entity_type,
          timestamp: new Date(currentTimestamp - 10 * 60 * 1000).toISOString(),
          source_ip: targetEntity.frequent_ips[0],
          geo_location: homeGeo,
          resource_accessed: targetEntity.frequent_resources[0],
          auth_method: targetEntity.frequent_auth_methods[0],
          session_duration: 120,
          command_sequence: ['LOGIN', 'FETCH'],
          device_fingerprint: {
            os: 'Windows 11 Enterprise',
            firmwareVersion: '10.0.22631',
            macAddress: KNOWN_MACS[0],
            protocol: 'HTTPS',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
          auth_success: true,
          bytes_transferred: 12000,
          label: 'normal',
        });

        events.push({
          event_id: `evt_travel_b_${eventIdx}`,
          entity_id: targetEntity.entity_id,
          entity_type: targetEntity.entity_type,
          timestamp: eventTimeISO,
          source_ip: attackerIp,
          geo_location: remoteGeo,
          resource_accessed: '/cloud/iam/role_policy_escalate',
          auth_method: 'password',
          session_duration: 45,
          command_sequence: ['LOGIN', 'ELEVATE_PRIVILEGES'],
          device_fingerprint: {
            os: 'Linux (Kali)',
            firmwareVersion: '6.5.0-kali',
            macAddress: 'DE:AD:BE:EF:00:01',
            protocol: 'SSH-2.0',
            userAgent: 'Curl/8.4.0',
          },
          auth_success: true,
          bytes_transferred: 85000,
          label: 'impossible_travel',
        });
      } else if (selectedAttack === 'brute_force') {
        // High frequency failed auth from single IP
        for (let b = 0; b < 8; b++) {
          events.push({
            event_id: `evt_bf_${eventIdx}_${b}`,
            entity_id: targetEntity.entity_id,
            entity_type: targetEntity.entity_type,
            timestamp: new Date(currentTimestamp - (10 - b) * 2000).toISOString(),
            source_ip: attackerIp,
            geo_location: attackerGeo,
            resource_accessed: '/auth/login',
            auth_method: 'password',
            session_duration: 2,
            command_sequence: ['AUTH_ATTEMPT_FAILED'],
            device_fingerprint: {
              os: 'Linux x86_64',
              firmwareVersion: '1.0',
              macAddress: '00:00:00:00:00:00',
              protocol: 'HTTP/1.1',
              userAgent: 'Hydra/9.5-BruteForce',
            },
            auth_success: false,
            bytes_transferred: 320,
            label: 'brute_force',
          });
        }
      } else if (selectedAttack === 'credential_stuffing') {
        // Single IP trying many entity_ids
        events.push({
          event_id: `evt_cs_${eventIdx}`,
          entity_id: targetEntity.entity_id,
          entity_type: targetEntity.entity_type,
          timestamp: eventTimeISO,
          source_ip: attackerIp,
          geo_location: attackerGeo,
          resource_accessed: '/api/v1/auth/token',
          auth_method: 'password',
          session_duration: 1,
          command_sequence: ['PASSWORD_SPRAY_ATTEMPT'],
          device_fingerprint: {
            os: 'Android 14 (AutomatedBot)',
            firmwareVersion: 'v1.0.0',
            macAddress: 'AA:BB:CC:DD:EE:FF',
            protocol: 'HTTPS',
            userAgent: 'Python-requests/2.31.0',
          },
          auth_success: false,
          bytes_transferred: 410,
          label: 'credential_stuffing',
        });
      } else if (selectedAttack === 'lateral_movement') {
        events.push({
          event_id: `evt_lat_${eventIdx}`,
          entity_id: targetEntity.entity_id,
          entity_type: targetEntity.entity_type,
          timestamp: eventTimeISO,
          source_ip: targetEntity.frequent_ips[0],
          geo_location: targetEntity.typical_geos[0],
          resource_accessed: randomChoice(SENSITIVE_RESOURCES),
          auth_method: 'token',
          session_duration: 3600,
          command_sequence: ['TOKEN_EXCHANGE', 'SCAN_SUBNET', 'ENUMERATE_SHARE', 'RESOURCE_COPY'],
          device_fingerprint: {
            os: 'Windows 11 Enterprise',
            firmwareVersion: '10.0.22631',
            macAddress: KNOWN_MACS[0],
            protocol: 'SMB3/RPC',
            userAgent: 'PowerShell/7.4.0',
          },
          auth_success: true,
          bytes_transferred: 2500000,
          label: 'lateral_movement',
        });
      } else if (selectedAttack === 'device_spoofing') {
        events.push({
          event_id: `evt_spoof_${eventIdx}`,
          entity_id: targetEntity.entity_id,
          entity_type: targetEntity.entity_type,
          timestamp: eventTimeISO,
          source_ip: '198.51.100.44',
          geo_location: CITIES_DATABASE['Bucharest, Romania'],
          resource_accessed: targetEntity.frequent_resources[0],
          auth_method: 'certificate',
          session_duration: 180,
          command_sequence: ['CERT_AUTH', 'SPOOFED_HANDSHAKE'],
          device_fingerprint: {
            os: 'Windows Server 2022 (Unmatched)',
            firmwareVersion: 'Mismatched-v9.9',
            macAddress: 'FF:FF:FF:00:11:22', // Mismatched MAC
            protocol: 'TLS1.2-Legacy',
            userAgent: 'CustomSpoofer/1.0',
          },
          auth_success: true,
          bytes_transferred: 45000,
          label: 'device_spoofing',
        });
      } else if (selectedAttack === 'low_and_slow_exfiltration') {
        events.push({
          event_id: `evt_exfil_${eventIdx}`,
          entity_id: targetEntity.entity_id,
          entity_type: targetEntity.entity_type,
          timestamp: new Date(currentTimestamp).toISOString(),
          source_ip: targetEntity.frequent_ips[0],
          geo_location: targetEntity.typical_geos[0],
          resource_accessed: '/sys/db/export_backup.sql',
          auth_method: 'token',
          session_duration: 14400, // 4 hours off-hours
          command_sequence: ['CONNECT', 'DUMP_CHUNK_01', 'SLEEP', 'DUMP_CHUNK_02'],
          device_fingerprint: {
            os: 'Ubuntu 22.04 LTS',
            firmwareVersion: 'v5.15',
            macAddress: KNOWN_MACS[1],
            protocol: 'SFTP',
            userAgent: 'OpenSSH_8.9p1',
          },
          auth_success: true,
          bytes_transferred: 18500000, // 18.5 MB exfiltrated
          label: 'low_and_slow_exfiltration',
        });
      } else {
        // Insider drift (ambiguous expansion of resource usage)
        events.push({
          event_id: `evt_drift_${eventIdx}`,
          entity_id: targetEntity.entity_id,
          entity_type: targetEntity.entity_type,
          timestamp: eventTimeISO,
          source_ip: targetEntity.frequent_ips[0],
          geo_location: targetEntity.typical_geos[0],
          resource_accessed: '/financials/executive_compensation.xlsx',
          auth_method: 'password',
          session_duration: 900,
          command_sequence: ['AUTH', 'READ_FINANCIALS'],
          device_fingerprint: {
            os: 'macOS Sonoma 14.5',
            firmwareVersion: 'v14.5',
            macAddress: KNOWN_MACS[0],
            protocol: 'HTTPS',
            userAgent: 'Mozilla/5.0 (Macintosh)',
          },
          auth_success: true,
          bytes_transferred: 1200000,
          label: 'insider_drift',
        });
      }
    }
  }

  // Sort chronologically
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return { events, profiles };
}
