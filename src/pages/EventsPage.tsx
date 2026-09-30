import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvents } from '@/services/hooks';
import { SeverityBadge, StatusBadge, ModeBadge } from '@/components/Badges';
import { TableSkeleton } from '@/components/Skeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import { EventDrawer } from '@/components/EventDrawer';
import type { AlertStatus, EventType, SecurityEvent, Severity } from '@/types';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const eventTypeLabel: Record<EventType, string> = {
  ssh_bruteforce: 'SSH Brute Force',
  network_scan: 'Network Scan',
  auth_failure: 'Auth Failure',
  auth_success: 'Auth Success',
  sudo_activity: 'Sudo Activity',
};

export function EventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<Severity | ''>('');
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [status, setStatus] = useState<AlertStatus | ''>('');
  const [sort, setSort] = useState<'timestamp' | 'severity' | 'event_type'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();
  const { eventId } = useParams();

  const { data, isLoading, isError, refetch } = useEvents({
    page,
    page_size: 25,
    q: search.trim() || undefined,
    severity: severity || undefined,
    event_type: eventType || undefined,
    status: status || undefined,
    sort,
    sort_order: sortOrder,
  });
  const setFilter = (update: () => void) => {
    update();
    setPage(1);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-base-100">Events</h1>
        <p className="text-xs text-base-400 mt-0.5">All normalized security events</p>
      </div>

      {/* Search bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-400" />
          <input
            type="search"
            maxLength={120}
            placeholder="Search ID, IP, host, rule, technique…"
            value={search}
            onChange={(e) => setFilter(() => setSearch(e.target.value))}
            className="input w-full pl-9"
          />
        </div>
        <select aria-label="Filter severity" value={severity} onChange={(e) => setFilter(() => setSeverity(e.target.value as Severity | ''))} className="input text-xs">
          <option value="">All severities</option>
          {['critical', 'high', 'medium', 'low', 'info'].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select aria-label="Filter event type" value={eventType} onChange={(e) => setFilter(() => setEventType(e.target.value as EventType | ''))} className="input text-xs">
          <option value="">All event types</option>
          {Object.entries(eventTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select aria-label="Filter status" value={status} onChange={(e) => setFilter(() => setStatus(e.target.value as AlertStatus | ''))} className="input text-xs">
          <option value="">All statuses</option>
          {['new', 'investigating', 'confirmed', 'false_positive', 'incident_created', 'resolved'].map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}
        </select>
        <select aria-label="Sort events" value={`${sort}:${sortOrder}`} onChange={(e) => {
          const [nextSort, nextOrder] = e.target.value.split(':') as ['timestamp' | 'severity' | 'event_type', 'asc' | 'desc'];
          setSort(nextSort);
          setSortOrder(nextOrder);
          setPage(1);
        }} className="input text-xs">
          <option value="timestamp:desc">Newest first</option>
          <option value="timestamp:asc">Oldest first</option>
          <option value="severity:asc">Highest severity</option>
          <option value="event_type:asc">Event type</option>
        </select>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <TableSkeleton rows={12} />
        ) : isError ? (
          <ErrorState message="Failed to load events" onRetry={() => refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState title="No events found" message={search ? 'No events match your search.' : 'No events have been recorded.'} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-2xs text-base-400 uppercase tracking-wider border-b border-base-700 sticky top-0 bg-base-850">
                    <th className="text-left font-medium px-3 py-2">Timestamp</th>
                    <th className="text-left font-medium px-3 py-2">Severity</th>
                                        <th className="text-left font-medium px-3 py-2">Status</th>
                    <th className="text-left font-medium px-3 py-2">Type</th>
                    <th className="text-left font-medium px-3 py-2">Source IP</th>
                    <th className="text-left font-medium px-3 py-2">Host</th>
                    <th className="text-left font-medium px-3 py-2 hidden lg:table-cell">Rule</th>
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
                        {new Date(event.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
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

            <div className="flex items-center justify-between px-4 py-3 border-t border-base-700">
              <span className="text-2xs text-base-400">
                Page {data.page} of {data.pages} — {data.total} total
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-outline">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="btn-outline">
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <EventDrawer eventId={eventId ?? null} onClose={() => navigate('/events')} />
    </div>
  );
}
