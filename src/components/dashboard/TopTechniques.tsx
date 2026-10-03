import { useStatistics } from '@/services/hooks';
import { ChartSkeleton } from '@/components/Skeletons';
import { ErrorState } from '@/components/EmptyError';
import { Shield } from 'lucide-react';
import { formatNumber } from '@/utils/format';

export function TopTechniques() {
  const { data, isLoading, isError, refetch } = useStatistics();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ErrorState message="Failed to load technique data" onRetry={() => refetch()} />;
  if (!data || data.top_techniques.length === 0) {
    return (
      <div className="card min-w-0 p-4">
        <h3 className="text-sm font-semibold text-base-200 mb-4">Top MITRE Techniques</h3>
        <div className="flex h-[200px] items-center justify-center text-center text-xs text-base-400">No MITRE-mapped techniques detected</div>
      </div>
    );
  }

  const maxCount = Math.max(...data.top_techniques.map((t) => t.count));

  return (
    <div className="card min-w-0 p-4">
      <h3 className="text-sm font-semibold text-base-200 mb-4">Top MITRE Techniques</h3>
      <div className="space-y-3">
        {data.top_techniques.map((tech) => (
          <div key={tech.technique_id} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent-400" />
                <span className="text-xs mono text-accent-300">{tech.technique_id}</span>
                <span className="truncate text-xs text-base-300" title={tech.technique_name}>{tech.technique_name}</span>
              </div>
              <span className="text-xs font-mono text-base-200">{formatNumber(tech.count)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-base-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-500 transition-[width] duration-200"
                style={{ width: `${(tech.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
