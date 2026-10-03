import { TableSkeleton } from '@/components/Skeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import { useEvents } from '@/services/hooks';
import { useNavigate } from 'react-router-dom';
import { EventTable } from '@/components/EventTable';

export function LiveEventsTable({ onEventClick, compact = false }: { onEventClick: (id: string) => void; compact?: boolean }) {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useEvents({ page: 1, page_size: compact ? 10 : 20 });

  if (isLoading) return <TableSkeleton rows={8} />;
  if (isError) return <ErrorState message="Failed to load events" onRetry={() => refetch()} />;
  if (!data || data.items.length === 0) return <EmptyState title="No events" message="No security events have been recorded yet. Check the data source or wait for incoming activity." />;

  return (
    <EventTable
      events={data.items}
      onSelect={(event) => {
        onEventClick(event.id);
        navigate(`/events/${encodeURIComponent(event.id)}`);
      }}
    />
  );
}
