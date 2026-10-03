import { useState } from 'react';
import { useAlerts } from '@/services/hooks';
import { TableSkeleton } from '@/components/Skeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import type { AlertStatus, EventType, Severity } from '@/types';
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventTable } from '@/components/EventTable';
import { PageHeader } from '@/components/ui';

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
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-4 lg:space-y-6 lg:p-6">
      <PageHeader title="Alerts" subtitle="Security alerts sorted by severity" />

      {/* Filters */}
      <div className="card grid min-w-0 grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
        <div className="hidden items-center gap-2 text-xs text-base-400 lg:flex">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        <select
          aria-label="Filter alert severity"
          value={severity}
          onChange={(e) => { setSeverity(e.target.value as Severity | 'all'); setPage(1); }}
          className="input w-full text-xs lg:w-auto"
        >
          {severityOptions.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select aria-label="Filter alert status" value={status} onChange={(e) => { setStatus(e.target.value as AlertStatus | 'all'); setPage(1); }} className="input w-full text-xs lg:w-auto">
          <option value="all">All statuses</option>
          {['new', 'investigating', 'confirmed', 'false_positive', 'incident_created', 'resolved'].map((value) => (
            <option key={value} value={value}>{value.replace('_', ' ')}</option>
          ))}
        </select>
        <div className="relative min-w-0 sm:col-span-2 lg:max-w-sm lg:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-400" />
          <input type="search" maxLength={120} aria-label="Search alerts" placeholder="Search alerts…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input w-full pl-9" />
        </div>
        <select
          value={eventType}
          onChange={(e) => { setEventType(e.target.value as EventType | 'all'); setPage(1); }}
          className="input w-full text-xs lg:w-auto"
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
          <EmptyState title="No alerts" message="No alerts match the current filters. Adjust a filter or broaden your search." />
        ) : (
          <>
            <EventTable
              events={data.items}
              onSelect={(event) => navigate(`/events/${encodeURIComponent(event.id)}`)}
            />

            {/* Pagination */}
            <div className="flex items-center justify-between gap-2 border-t border-base-700 px-3 py-3 sm:px-4">
              <span className="text-2xs text-base-400">
                <span className="sm:hidden">{data.page}/{data.pages}</span>
                <span className="hidden sm:inline">Page {data.page} of {data.pages} — {data.total} total</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-outline min-h-11"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page >= data.pages}
                  className="btn-outline min-h-11"
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
