import { useStatistics } from '@/services/hooks';
import { ChartSkeleton } from '@/components/Skeletons';
import { ErrorState } from '@/components/EmptyError';
import { Shield } from 'lucide-react';

export function TopTechniques() {
  const { data, isLoading, isError, refetch } = useStatistics();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ErrorState message="Failed to load technique data" onRetry={() => refetch()} />;
  if (!data || data.top_techniques.length === 0) {
    return (
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-base-200 mb-4">Top MITRE Techniques</h3>
        <div className="text-center py-8 text-base-400 text-xs">No MITRE-mapped techniques detected</div>
      </div>
    );
  }

  const maxCount = Math.max(...data.top_techniques.map((t) => t.count));

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-base-200 mb-4">Top MITRE Techniques</h3>
      <div className="space-y-3">
        {data.top_techniques.map((tech) => (
          <div key={tech.technique_id} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-accent-400" />
                <span className="text-xs mono text-accent-300">{tech.technique_id}</span>
                <span className="text-xs text-base-300">{tech.technique_name}</span>
              </div>
              <span className="text-xs font-mono text-base-200">{tech.count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-base-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-accent-500 transition-all duration-500"
                style={{ width: `${(tech.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
