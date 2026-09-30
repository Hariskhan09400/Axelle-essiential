import type {
  SecurityEvent,
  Incident,
  Host,
  Statistics,
  Severity,
  MITREMapping,
} from '@/types';

// ── Deterministic PRNG (mulberry32) ──────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function randIp(): string {
  return `192.168.56.${randInt(2, 254)}`;
}

// ── Hosts ───────────────────────────────────────────────────
const HOSTS: Host[] = [
  { hostname: 'ubuntu-target', ip: '192.168.56.20', os: 'Ubuntu 22.04 LTS', agent_status: 'online', last_seen: new Date().toISOString() },
  { hostname: 'kali-attacker', ip: '192.168.56.10', os: 'Kali Linux 2024.1', agent_status: 'online', last_seen: new Date().toISOString() },
  { hostname: 'wazuh-server', ip: '192.168.56.30', os: 'Ubuntu 22.04 LTS', agent_status: 'online', last_seen: new Date().toISOString() },
  { hostname: 'web-proxy-01', ip: '192.168.56.40', os: 'Debian 12', agent_status: 'offline', last_seen: new Date(Date.now() - 3600_000).toISOString() },
  { hostname: 'db-server-01', ip: '192.168.56.50', os: 'Ubuntu 20.04 LTS', agent_status: 'online', last_seen: new Date().toISOString() },
];

// ── MITRE mappings ──────────────────────────────────────────
const MITRE: Record<string, MITREMapping> = {
  T1110_001: { technique_id: 'T1110.001', technique_name: 'Password Guessing', tactic: 'Credential Access' },
  T1046: { technique_id: 'T1046', technique_name: 'Network Service Discovery', tactic: 'Discovery' },
  T1078: { technique_id: 'T1078', technique_name: 'Valid Accounts', tactic: 'Defense Evasion, Persistence, Privilege Escalation, Initial Access' },
  T1548_003: { technique_id: 'T1548.003', technique_name: 'Sudo and Sudo Caching', tactic: 'Privilege Escalation, Defense Evasion' },
};

// ── Event generators ────────────────────────────────────────
function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function genId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(5, '0')}`;
}

const ATTACKER_IPS = ['192.168.56.10', '192.168.56.11', '192.168.56.12'];
const TARGET_HOST = 'ubuntu-target';
const TARGET_IP = '192.168.56.20';

function genSSHBruteForce(n: number, hoursBack: number): SecurityEvent {
  const srcIp = pick(ATTACKER_IPS);
  const attempts = randInt(20, 80);
  return {
    id: genId('evt', n),
    timestamp: hoursAgo(hoursBack),
    severity: 'critical',
    event_type: 'ssh_bruteforce',
    source_ip: srcIp,
    destination_ip: TARGET_IP,
    host: TARGET_HOST,
    rule_id: 'RL-5503',
    rule_description: 'Multiple SSH authentication failures from same source',
    attempt_count: attempts,
    mitre: MITRE.T1110_001,
    status: 'new',
    analyst_notes: [],
    incident_id: null,
    related_event_ids: [],
    mode: 'demo',
    raw_event: {
      timestamp: hoursAgo(hoursBack),
      src_ip: srcIp,
      dst_ip: TARGET_IP,
      dst_port: '22',
      protocol: 'SSH',
      action: 'fail',
      user: pick(['root', 'admin', 'user', 'ubuntu']),
      attempt_count: String(attempts),
      rule_id: '5503',
      rule_level: '10',
      description: 'SSHD: Multiple authentication failures',
    },
  };
}

function genNetworkScan(n: number, hoursBack: number): SecurityEvent {
  const srcIp = pick(ATTACKER_IPS);
  const ports = pick(['22,80,443,3306,8080', '1-1000', '21,22,23,25,53,80,110,143,443', '443,445,3306,5432,6379,8080,9200']);
  return {
    id: genId('evt', n),
    timestamp: hoursAgo(hoursBack),
    severity: 'high',
    event_type: 'network_scan',
    source_ip: srcIp,
    destination_ip: TARGET_IP,
    host: TARGET_HOST,
    rule_id: 'RL-5602',
    rule_description: 'Network service scan detected — sequential port connection pattern',
    attempt_count: randInt(15, 50),
    mitre: MITRE.T1046,
    status: 'new',
    analyst_notes: [],
    incident_id: null,
    related_event_ids: [],
    mode: 'demo',
    raw_event: {
      timestamp: hoursAgo(hoursBack),
      src_ip: srcIp,
      dst_ip: TARGET_IP,
      scanned_ports: ports,
      protocol: 'TCP',
      action: 'scan',
      rule_id: '5602',
      rule_level: '8',
      description: 'Port scan detected from external source',
    },
  };
}

function genAuthFailure(n: number, hoursBack: number): SecurityEvent {
  const srcIp = randIp();
  const user = pick(['root', 'admin', 'user', 'ubuntu', 'postgres', 'gitlab']);
  return {
    id: genId('evt', n),
    timestamp: hoursAgo(hoursBack),
    severity: 'medium',
    event_type: 'auth_failure',
    source_ip: srcIp,
    destination_ip: TARGET_IP,
    host: pick(['ubuntu-target', 'db-server-01', 'wazuh-server']),
    rule_id: 'RL-5501',
    rule_description: 'SSH authentication failure',
    attempt_count: 1,
    mitre: null,
    status: 'new',
    analyst_notes: [],
    incident_id: null,
    related_event_ids: [],
    mode: 'demo',
    raw_event: {
      timestamp: hoursAgo(hoursBack),
      src_ip: srcIp,
      dst_ip: TARGET_IP,
      dst_port: '22',
      protocol: 'SSH',
      action: 'fail',
      user: user,
      rule_id: '5501',
      rule_level: '5',
      description: 'SSHD: Failed password for invalid user',
    },
  };
}

function genAuthSuccess(n: number, hoursBack: number): SecurityEvent {
  const srcIp = randIp();
  const user = pick(['ubuntu', 'admin', 'user', 'sysadmin']);
  const host = pick(['ubuntu-target', 'db-server-01', 'wazuh-server']);
  const validAccount = rand() > 0.7;
  return {
    id: genId('evt', n),
    timestamp: hoursAgo(hoursBack),
    severity: validAccount ? 'low' : 'info',
    event_type: 'auth_success',
    source_ip: srcIp,
    destination_ip: host === 'ubuntu-target' ? TARGET_IP : '192.168.56.50',
    host: host,
    rule_id: validAccount ? 'RL-5710' : 'RL-5500',
    rule_description: validAccount
      ? 'Successful login using valid credentials from new source'
      : 'SSH session opened',
    attempt_count: null,
    mitre: validAccount ? MITRE.T1078 : null,
    status: 'new',
    analyst_notes: [],
    incident_id: null,
    related_event_ids: [],
    mode: 'demo',
    raw_event: {
      timestamp: hoursAgo(hoursBack),
      src_ip: srcIp,
      dst_ip: host === 'ubuntu-target' ? TARGET_IP : '192.168.56.50',
      dst_port: '22',
      protocol: 'SSH',
      action: 'accept',
      user: user,
      rule_id: validAccount ? '5710' : '5500',
      rule_level: validAccount ? '3' : '2',
      description: validAccount ? 'SSHD: Accepted password from new source IP' : 'SSHD: Session opened',
    },
  };
}

function genSudoActivity(n: number, hoursBack: number): SecurityEvent {
  const user = pick(['ubuntu', 'admin', 'sysadmin']);
  const command = pick(['apt update', 'systemctl restart sshd', 'cat /etc/shadow', 'useradd -m service_acct', 'chmod 4755 /bin/bash']);
  const suspicious = command.includes('shadow') || command.includes('4755');
  return {
    id: genId('evt', n),
    timestamp: hoursAgo(hoursBack),
    severity: suspicious ? 'high' : 'low',
    event_type: 'sudo_activity',
    source_ip: null,
    destination_ip: TARGET_IP,
    host: TARGET_HOST,
    rule_id: 'RL-5402',
    rule_description: suspicious
      ? 'Privileged command execution via sudo — potentially suspicious command'
      : 'Sudo command execution',
    attempt_count: null,
    mitre: MITRE.T1548_003,
    status: 'new',
    analyst_notes: [],
    incident_id: null,
    related_event_ids: [],
    mode: 'demo',
    raw_event: {
      timestamp: hoursAgo(hoursBack),
      user: user,
      command: command,
      action: 'sudo',
      rule_id: '5402',
      rule_level: suspicious ? '7' : '3',
      description: `Sudo: ${user} executed: ${command}`,
    },
  };
}

function genNoise(n: number, hoursBack: number): SecurityEvent {
  const host = pick(HOSTS).hostname;
  return {
    id: genId('evt', n),
    timestamp: hoursAgo(hoursBack),
    severity: 'info',
    event_type: 'auth_success',
    source_ip: randIp(),
    destination_ip: '192.168.56.20',
    host: host,
    rule_id: 'RL-5001',
    rule_description: 'System information event — routine log entry',
    attempt_count: null,
    mitre: null,
    status: 'new',
    analyst_notes: [],
    incident_id: null,
    related_event_ids: [],
    mode: 'demo',
    raw_event: {
      timestamp: hoursAgo(hoursBack),
      action: 'info',
      rule_id: '5001',
      rule_level: '1',
      description: 'Routine system log entry',
    },
  };
}

// ── Generate 200 events over last 24h ───────────────────────
function generateEvents(): SecurityEvent[] {
  const events: SecurityEvent[] = [];
  let n = 1;

  // SSH brute-force bursts: 3 bursts, each ~15-25 events
  for (let burst = 0; burst < 3; burst++) {
    const baseHour = randInt(1, 22);
    const count = randInt(15, 25);
    for (let i = 0; i < count; i++) {
      events.push(genSSHBruteForce(n++, baseHour + rand() * 0.5));
    }
  }

  // Network scans: 2 scans, each ~10-15 events
  for (let scan = 0; scan < 2; scan++) {
    const baseHour = randInt(2, 20);
    const count = randInt(10, 15);
    for (let i = 0; i < count; i++) {
      events.push(genNetworkScan(n++, baseHour + rand() * 0.3));
    }
  }

  // Auth failures: ~20 scattered
  for (let i = 0; i < 20; i++) {
    events.push(genAuthFailure(n++, rand() * 24));
  }

  // Auth successes: ~30 scattered
  for (let i = 0; i < 30; i++) {
    events.push(genAuthSuccess(n++, rand() * 24));
  }

  // Sudo activity: ~15 events
  for (let i = 0; i < 15; i++) {
    events.push(genSudoActivity(n++, rand() * 24));
  }

  // Noise/info: ~40 events
  for (let i = 0; i < 40; i++) {
    events.push(genNoise(n++, rand() * 24));
  }

  // Sort by timestamp descending (most recent first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Link related events (brute-force events from same source IP)
  const bfEvents = events.filter((e) => e.event_type === 'ssh_bruteforce');
  const byIp = new Map<string, SecurityEvent[]>();
  for (const e of bfEvents) {
    const key = e.source_ip ?? 'unknown';
    if (!byIp.has(key)) byIp.set(key, []);
    byIp.get(key)!.push(e);
  }
  for (const [, group] of byIp) {
    if (group.length > 1) {
      const ids = group.map((e) => e.id);
      for (const e of group) {
        e.related_event_ids = ids.filter((id) => id !== e.id);
      }
    }
  }

  return events;
}

// ── Incidents ────────────────────────────────────────────────
function generateIncidents(events: SecurityEvent[]): Incident[] {
  const bfIds = events.filter((e) => e.event_type === 'ssh_bruteforce').slice(0, 3).map((e) => e.id);
  const scanIds = events.filter((e) => e.event_type === 'network_scan').slice(0, 2).map((e) => e.id);
  return [
    {
      id: 'INC-0001',
      title: 'SSH Brute Force Campaign — 192.168.56.10',
      severity: 'critical',
      status: 'open',
      linked_alert_ids: bfIds,
      created_at: hoursAgo(6),
      resolved_at: null,
    },
    {
      id: 'INC-0002',
      title: 'Network Reconnaissance Scan Detected',
      severity: 'high',
      status: 'investigating',
      linked_alert_ids: scanIds,
      created_at: hoursAgo(12),
      resolved_at: null,
    },
  ];
}

// ── Statistics ──────────────────────────────────────────────
function computeStats(events: SecurityEvent[]): Statistics {
  const severityCounts: Record<Severity, number> = {
    critical: 0, high: 0, medium: 0, low: 0, info: 0,
  };
  const ipCounts = new Map<string, number>();
  const techniqueCounts = new Map<string, { name: string; count: number }>();

  for (const e of events) {
    severityCounts[e.severity]++;
    if (e.source_ip) {
      ipCounts.set(e.source_ip, (ipCounts.get(e.source_ip) ?? 0) + 1);
    }
    if (e.mitre) {
      const existing = techniqueCounts.get(e.mitre.technique_id);
      if (existing) {
        existing.count++;
      } else {
        techniqueCounts.set(e.mitre.technique_id, { name: e.mitre.technique_name, count: 1 });
      }
    }
  }

  // Time buckets (last 24h, 2h buckets)
  const buckets: { bucket: string; count: number }[] = [];
  const now = Date.now();
  for (let i = 11; i >= 0; i--) {
    const start = now - (i + 1) * 2 * 3600_000;
    const end = now - i * 2 * 3600_000;
    const count = events.filter(
      (e) => {
        const t = new Date(e.timestamp).getTime();
        return t >= start && t < end;
      }
    ).length;
    const label = new Date(end).toISOString().substring(11, 16);
    buckets.push({ bucket: label, count });
  }

  const topIPs = [...ipCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([ip, count]) => ({ ip, count }));

  const topTechniques = [...techniqueCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([id, v]) => ({ technique_id: id, technique_name: v.name, count: v.count }));

  return {
    mode: 'demo',
    totals: {
      events: events.length,
      alerts: events.filter((e) => e.severity !== 'info').length,
      incidents: 2,
      critical_alerts: severityCounts.critical,
    },
    severity_counts: severityCounts,
    top_source_ips: topIPs,
    top_techniques: topTechniques,
    events_per_bucket: buckets,
  };
}

// ── Exported singleton ──────────────────────────────────────
const _events = generateEvents();
const _incidents = generateIncidents(_events);

export const mockData = {
  events: _events,
  incidents: _incidents,
  hosts: HOSTS,
  stats: computeStats(_events),
  health: { status: 'ok', mode: 'demo' as const },
};

export function getEventById(id: string): SecurityEvent | undefined {
  return _events.find((e) => e.id === id);
}

export function getIncidentById(id: string): Incident | undefined {
  return _incidents.find((i) => i.id === id);
}
