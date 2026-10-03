import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvents } from '@/services/hooks';
import { TableSkeleton } from '@/components/Skeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import { EventDrawer } from '@/components/EventDrawer';
import type { AlertStatus, EventType, Severity } from '@/types';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { EventTable } from '@/components/EventTable';
import { PageHeader } from '@/components/ui';

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
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-4 lg:space-y-6 lg:p-6">
      <PageHeader title="Events" subtitle="All normalized security events" />

      {/* Search bar */}
      <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
        <div className="relative min-w-0 sm:col-span-2 lg:max-w-md lg:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-400" />
          <input
            type="search"
            maxLength={120}
            aria-label="Search events"
            placeholder="Search ID, IP, host, rule, technique…"
            value={search}
            onChange={(e) => setFilter(() => setSearch(e.target.value))}
            className="input w-full pl-9"
          />
        </div>
        <select aria-label="Filter severity" value={severity} onChange={(e) => setFilter(() => setSeverity(e.target.value as Severity | ''))} className="input w-full text-xs lg:w-auto">
          <option value="">All severities</option>
          {['critical', 'high', 'medium', 'low', 'info'].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select aria-label="Filter event type" value={eventType} onChange={(e) => setFilter(() => setEventType(e.target.value as EventType | ''))} className="input w-full text-xs lg:w-auto">
          <option value="">All event types</option>
          {Object.entries(eventTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select aria-label="Filter status" value={status} onChange={(e) => setFilter(() => setStatus(e.target.value as AlertStatus | ''))} className="input w-full text-xs lg:w-auto">
          <option value="">All statuses</option>
          {['new', 'investigating', 'confirmed', 'false_positive', 'incident_created', 'resolved'].map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}
        </select>
        <select aria-label="Sort events" value={`${sort}:${sortOrder}`} onChange={(e) => {
          const [nextSort, nextOrder] = e.target.value.split(':') as ['timestamp' | 'severity' | 'event_type', 'asc' | 'desc'];
          setSort(nextSort);
          setSortOrder(nextOrder);
          setPage(1);
        }} className="input w-full text-xs lg:w-auto">
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
          <EmptyState
            title="No events found"
            message={search ? 'No events match your search or filters. Adjust the query or filters.' : 'No events have been recorded yet. Check the data source or wait for incoming activity.'}
          />
        ) : (
          <>
            <EventTable
              events={data.items}
              onSelect={(event) => navigate(`/events/${encodeURIComponent(event.id)}`)}
            />

            <div className="flex items-center justify-between gap-2 border-t border-base-700 px-3 py-3 sm:px-4">
              <span className="text-2xs text-base-400">
                <span className="sm:hidden">{data.page}/{data.pages}</span>
                <span className="hidden sm:inline">Page {data.page} of {data.pages} — {data.total} total</span>
              </span>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="btn-outline min-h-11">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>
                <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="btn-outline min-h-11">
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
