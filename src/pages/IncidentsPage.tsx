import { useIncidents } from '@/services/hooks';
import { SeverityBadge } from '@/components/Badges';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import { CardSkeleton } from '@/components/Skeletons';
import { FolderClosed, AlertOctagon, Clock, CheckCircle } from 'lucide-react';
import { PageHeader, Timestamp } from '@/components/ui';

const statusConfig: Record<string, { label: string; classes: string; Icon: typeof Clock }> = {
  open: { label: 'Open', classes: 'text-critical-300 bg-critical-500/10 border-critical-500/30', Icon: AlertOctagon },
  investigating: { label: 'Investigating', classes: 'text-medium-300 bg-medium-500/10 border-medium-500/30', Icon: Clock },
  resolved: { label: 'Resolved', classes: 'text-status-resolved bg-status-resolved/10 border-status-resolved/30', Icon: CheckCircle },
};

export function IncidentsPage() {
  const { data: incidents, isLoading, isError, refetch } = useIncidents();

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-4 lg:space-y-6 lg:p-6">
      <PageHeader title="Incidents" subtitle="Security incidents and linked alerts" />

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState message="Failed to load incidents" onRetry={() => refetch()} />
      ) : !incidents || incidents.length === 0 ? (
        <EmptyState
          title="No incidents"
          message="No security incidents have been created. Incidents are created from confirmed alerts."
          icon={FolderClosed}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {incidents.map((inc) => {
            const status = statusConfig[inc.status] ?? statusConfig.open;
            const StatusIcon = status.Icon;
            return (
              <div key={inc.id} className="card card-hover min-w-0 space-y-3 p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs mono text-base-400">{inc.id}</span>
                      <SeverityBadge severity={inc.severity} size="xs" />
                    </div>
                    <h3 className="break-words text-sm font-medium text-base-100">{inc.title}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${status.classes}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-base-400">
                  <span>Created: <span className="mono text-base-300"><Timestamp value={inc.created_at} /></span></span>
                  {inc.resolved_at && (
                    <span>Resolved: <span className="mono text-base-300"><Timestamp value={inc.resolved_at} /></span></span>
                  )}
                </div>

                <div>
                  <span className="text-2xs text-base-400 uppercase tracking-wider">Linked Alerts ({inc.linked_alert_ids.length})</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {inc.linked_alert_ids.map((id) => (
                      <span key={id} className="px-1.5 py-0.5 rounded bg-base-800 border border-base-700 text-2xs mono text-base-300">
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
