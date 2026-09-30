import type { SecurityEvent } from '@/types';
import { SeverityBadge, ModeBadge } from '@/components/Badges';
import { TableSkeleton } from '@/components/Skeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import { useEvents } from '@/services/hooks';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const eventTypeLabel: Record<string, string> = {
  ssh_bruteforce: 'SSH Brute Force',
  network_scan: 'Network Scan',
  auth_failure: 'Auth Failure',
  auth_success: 'Auth Success',
  sudo_activity: 'Sudo Activity',
};

function formatTime(ts: string): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return d.toLocaleString();
}

export function LiveEventsTable({ onEventClick, compact = false }: { onEventClick: (id: string) => void; compact?: boolean }) {
    const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useEvents({ page: 1, page_size: compact ? 10 : 20 });

  if (isLoading) return <TableSkeleton rows={8} />;
  if (isError) return <ErrorState message="Failed to load events" onRetry={() => refetch()} />;
  if (!data || data.items.length === 0) return <EmptyState title="No events" message="No security events have been recorded." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-2xs text-base-400 uppercase tracking-wider border-b border-base-700">
            <th className="text-left font-medium px-3 py-2">Time</th>
            <th className="text-left font-medium px-3 py-2">Severity</th>
            <th className="text-left font-medium px-3 py-2">Type</th>
            <th className="text-left font-medium px-3 py-2">Source IP</th>
            <th className="text-left font-medium px-3 py-2">Host</th>
            <th className="text-left font-medium px-3 py-2 hidden lg:table-cell">Description</th>
            <th className="text-left font-medium px-3 py-2">Mode</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {data.items.map((event: SecurityEvent) => (
            <tr
              key={event.id}
              onClick={() => { onEventClick(event.id); navigate(`/events/${encodeURIComponent(event.id)}`); }}
              className={`table-row-hover cursor-pointer border-b border-base-700/30 ${
                event.severity === 'critical' ? 'bg-critical-500/5' : ''
              }`}
            >
              <td className="px-3 py-2 text-2xs text-base-400 mono whitespace-nowrap">{formatTime(event.timestamp)}</td>
              <td className="px-3 py-2"><SeverityBadge severity={event.severity} size="xs" /></td>
              <td className="px-3 py-2 text-xs text-base-200 whitespace-nowrap">{eventTypeLabel[event.event_type] ?? event.event_type}</td>
              <td className="px-3 py-2 text-xs mono text-base-300">{event.source_ip ?? '—'}</td>
              <td className="px-3 py-2 text-xs text-base-300 mono">{event.host}</td>
              <td className="px-3 py-2 text-xs text-base-300 hidden lg:table-cell max-w-xs truncate">{event.rule_description}</td>
              <td className="px-3 py-2"><ModeBadge mode={event.mode} /></td>
              <td className="px-3 py-2"><ChevronRight className="w-4 h-4 text-base-500" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
