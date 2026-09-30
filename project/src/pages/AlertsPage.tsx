import { useState } from 'react';
import { useAlerts } from '@/services/hooks';
import { SeverityBadge, StatusBadge, ModeBadge } from '@/components/Badges';
import { TableSkeleton } from '@/components/Skeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import type { AlertStatus, EventType, SecurityEvent, Severity } from '@/types';
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const eventTypeLabel: Record<EventType, string> = {
  ssh_bruteforce: 'SSH Brute Force',
  network_scan: 'Network Scan',
  auth_failure: 'Auth Failure',
  auth_success: 'Auth Success',
  sudo_activity: 'Sudo Activity',
};

const severityOptions: (Severity | 'all')[] = ['all', 'critical', 'high', 'medium', 'low', 'info'];
const eventTypeOptions: (EventType | 'all')[] = ['all', 'ssh_bruteforce', 'network_scan', 'auth_failure', 'auth_success', 'sudo_activity'];

export function AlertsPage() {
  const [page, setPage] = useState(1);
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [eventType, setEventType] = useState<EventType | 'all'>('all');
  const [status, setStatus] = useState<AlertStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useAlerts({
    page,
    page_size: 15,
    severity: severity !== 'all' ? severity : undefined,
    event_type: eventType !== 'all' ? eventType : undefined,
    sort: 'severity',
    sort_order: 'asc',
    status: status !== 'all' ? status : undefined,
    q: search.trim() || undefined,
  });

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-base-100">Alerts</h1>
        <p className="text-xs text-base-400 mt-0.5">Security alerts sorted by severity</p>
      </div>

      {/* Filters */}
      <div className="card p-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-base-400">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        <select
          value={severity}
          onChange={(e) => { setSeverity(e.target.value as Severity | 'all'); setPage(1); }}
          className="input text-xs"
        >
          {severityOptions.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select aria-label="Filter alert status" value={status} onChange={(e) => { setStatus(e.target.value as AlertStatus | 'all'); setPage(1); }} className="input text-xs">
          <option value="all">All statuses</option>
          {['new', 'investigating', 'confirmed', 'false_positive', 'incident_created', 'resolved'].map((value) => (
            <option key={value} value={value}>{value.replace('_', ' ')}</option>
          ))}
        </select>
        <div className="relative min-w-56 flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-400" />
          <input type="search" maxLength={120} aria-label="Search alerts" placeholder="Search alerts…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input w-full pl-9" />
        </div>
        <select
          value={eventType}
          onChange={(e) => { setEventType(e.target.value as EventType | 'all'); setPage(1); }}
          className="input text-xs"
        >
          {eventTypeOptions.map((t) => (
            <option key={t} value={t}>{t === 'all' ? 'All Types' : eventTypeLabel[t] ?? t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <TableSkeleton rows={10} />
        ) : isError ? (
          <ErrorState message="Failed to load alerts" onRetry={() => refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No alerts" message="No alerts match the current filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-2xs text-base-400 uppercase tracking-wider border-b border-base-700 sticky top-0 bg-base-850">
                    <th className="text-left font-medium px-3 py-2">Time</th>
                    <th className="text-left font-medium px-3 py-2">Severity</th>
                    <th className="text-left font-medium px-3 py-2">Status</th>
                    <th className="text-left font-medium px-3 py-2">Type</th>
                    <th className="text-left font-medium px-3 py-2">Source IP</th>
                    <th className="text-left font-medium px-3 py-2">Host</th>
                    <th className="text-left font-medium px-3 py-2 hidden lg:table-cell">Description</th>
                    <th className="text-left font-medium px-3 py-2">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((event: SecurityEvent) => (
                    <tr
                      key={event.id}
                      onClick={() => navigate(`/events/${encodeURIComponent(event.id)}`)}
                      className={`table-row-hover cursor-pointer border-b border-base-700/30 ${
                        event.severity === 'critical' ? 'bg-critical-500/5' : ''
                      }`}
                    >
                      <td className="px-3 py-2 text-2xs text-base-400 mono whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleString()}
                      </td>
                      <td className="px-3 py-2"><SeverityBadge severity={event.severity} size="xs" /></td>
                      <td className="px-3 py-2"><StatusBadge status={event.status} /></td>
                      <td className="px-3 py-2 text-xs text-base-200 whitespace-nowrap">{eventTypeLabel[event.event_type] ?? event.event_type}</td>
                      <td className="px-3 py-2 text-xs mono text-base-300">{event.source_ip ?? '—'}</td>
                      <td className="px-3 py-2 text-xs text-base-300 mono">{event.host}</td>
                      <td className="px-3 py-2 text-xs text-base-300 hidden lg:table-cell max-w-xs truncate">{event.rule_description}</td>
                      <td className="px-3 py-2"><ModeBadge mode={event.mode} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-base-700">
              <span className="text-2xs text-base-400">
                Page {data.page} of {data.pages} — {data.total} total
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-outline"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page >= data.pages}
                  className="btn-outline"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
