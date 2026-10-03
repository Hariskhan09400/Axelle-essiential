import { useStatistics } from '@/services/hooks';
import { ChartSkeleton } from '@/components/Skeletons';
import { ErrorState } from '@/components/EmptyError';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const severityColors: Record<string, string> = {
  critical: 'var(--severity-critical)',
  high: 'var(--severity-high)',
  medium: 'var(--severity-medium)',
  low: 'var(--severity-low)',
  info: 'var(--severity-info)',
};

const tooltipStyle = {
  backgroundColor: 'var(--brand-surface)',
  border: '1px solid var(--brand-border)',
  borderRadius: '6px',
  fontSize: '12px',
  color: 'var(--brand-text)',
};

export function SeverityDistribution() {
  const { data, isLoading, isError, refetch } = useStatistics();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ErrorState message="Failed to load severity data" onRetry={() => refetch()} />;
  if (!data) return null;

  const chartData = (Object.entries(data.severity_counts) as [string, number][])
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: key, value }));

  return (
    <div className="card min-w-0 p-4">
      <h3 className="text-sm font-semibold text-base-200 mb-4">Severity Distribution</h3>
      {chartData.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center text-center text-xs text-base-400">
          No severity data is available yet.
        </div>
      ) : <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={severityColors[entry.name] ?? 'var(--severity-info)'} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: 'var(--brand-muted)', maxWidth: '100%' }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>}
    </div>
  );
}
