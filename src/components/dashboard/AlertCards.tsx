import { useNavigate } from 'react-router-dom';
import { useAlerts } from '@/services/hooks';
import { SeverityBadge, StatusBadge, ModeBadge } from '@/components/Badges';
import { CardSkeleton } from '@/components/Skeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import { AlertTriangle } from 'lucide-react';

export function AlertCards() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useAlerts({ page: 1, page_size: 3, sort: 'severity', sort_order: 'asc' });

  if (isLoading) {
    return <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">{[0, 1, 2].map((item) => <CardSkeleton key={item} />)}</div>;
  }
  if (isError) return <ErrorState message="Failed to load priority alerts" onRetry={() => refetch()} />;
  if (!data || data.items.length === 0) return <EmptyState title="No priority alerts" message="No alerts match the current view." icon={AlertTriangle} />;

  return (
    <section aria-labelledby="priority-alerts-title" className="space-y-2">
      <h2 id="priority-alerts-title" className="text-sm font-semibold text-base-200">Priority Alerts</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {data.items.map((event) => (
          <button
            type="button"
            key={event.id}
            onClick={() => navigate(`/events/${encodeURIComponent(event.id)}`)}
            className="card card-hover min-h-24 p-3 text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <SeverityBadge severity={event.severity} size="xs" />
              <ModeBadge mode={event.mode} />
            </div>
            <p className="text-xs font-medium text-base-100 line-clamp-2">{event.rule_description}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-2xs text-base-400 mono truncate">{event.source_ip ?? event.host}</span>
              <StatusBadge status={event.status} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}