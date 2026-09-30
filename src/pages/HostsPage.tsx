import { useHosts } from '@/services/hooks';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import { CardSkeleton } from '@/components/Skeletons';
import { Server, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

const statusConfig: Record<string, { label: string; classes: string; Icon: typeof Wifi }> = {
  online: { label: 'Online', classes: 'text-status-resolved bg-status-resolved/10 border-status-resolved/30', Icon: Wifi },
  offline: { label: 'Offline', classes: 'text-base-400 bg-base-800 border-base-700', Icon: WifiOff },
  agent_down: { label: 'Agent Down', classes: 'text-critical-300 bg-critical-500/10 border-critical-500/30', Icon: AlertTriangle },
};

export function HostsPage() {
  const { data: hosts, isLoading, isError, refetch } = useHosts();

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-base-100">Hosts</h1>
        <p className="text-xs text-base-400 mt-0.5">Monitored hosts and agent status</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState message="Failed to load hosts" onRetry={() => refetch()} />
      ) : !hosts || hosts.length === 0 ? (
        <EmptyState title="No hosts" message="No hosts are being monitored." icon={Server} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hosts.map((host) => {
            const status = statusConfig[host.agent_status] ?? statusConfig.offline;
            const StatusIcon = status.Icon;
            return (
              <div key={host.hostname} className="card card-hover p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-base-800 border border-base-700 flex items-center justify-center">
                      <Server className="w-5 h-5 text-base-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-base-100 mono">{host.hostname}</h3>
                      <p className="text-2xs text-base-400 mono">{host.ip}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-2xs font-medium ${status.classes}`}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-base-700/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-base-400">OS</span>
                    <span className="text-base-200">{host.os}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-base-400">Last Seen</span>
                    <span className="text-base-200 mono">{new Date(host.last_seen).toLocaleString()}</span>
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
