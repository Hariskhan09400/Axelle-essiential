export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type EventType =
  | 'ssh_bruteforce'
  | 'network_scan'
  | 'auth_failure'
  | 'auth_success'
  | 'sudo_activity';
export type AlertStatus =
  | 'new'
  | 'investigating'
  | 'confirmed'
  | 'false_positive'
  | 'incident_created'
  | 'resolved';
export type Mode = 'demo' | 'live';
export type HostStatus = 'online' | 'offline' | 'agent_down';

export interface MITREMapping {
  technique_id: string;
  technique_name: string;
  tactic: string;
}

export interface AnalystNote {
  author: string;
  text: string;
  created_at: string;
}

export interface RawEvent {
  [key: string]: string | number | boolean | null;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: Severity;
  event_type: EventType;
  source_ip: string | null;
  destination_ip: string | null;
  host: string;
  rule_id: string;
  rule_description: string;
  attempt_count: number | null;
  mitre: MITREMapping | null;
  status: AlertStatus;
  analyst_notes: AnalystNote[];
  incident_id: string | null;
  related_event_ids: string[];
  mode: Mode;
  raw_event: RawEvent;
}

export interface Incident {
  id: string;
  title: string;
  severity: Severity;
  status: 'open' | 'investigating' | 'resolved';
  linked_alert_ids: string[];
  created_at: string;
  resolved_at: string | null;
}

export interface Host {
  hostname: string;
  ip: string;
  os: string;
  agent_status: HostStatus;
  last_seen: string;
}

export interface Statistics {
  mode: Mode;
  totals: {
    events: number;
    alerts: number;
    incidents: number;
    critical_alerts: number;
  };
  severity_counts: Record<Severity, number>;
  top_source_ips: { ip: string; count: number }[];
  top_techniques: { technique_id: string; technique_name: string; count: number }[];
  events_per_bucket: { bucket: string; count: number }[];
}

export interface HealthResponse {
  status: string;
  mode: Mode;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  mode: Mode;
}

export interface EventQuery {
  page?: number;
  page_size?: number;
  sort?: 'timestamp' | 'severity' | 'event_type';
  sort_order?: 'asc' | 'desc';
  severity?: Severity;
  event_type?: EventType;
  status?: AlertStatus;
  q?: string;
}

export interface CollectionResponse<T> {
  items: T[];
  mode: Mode;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
