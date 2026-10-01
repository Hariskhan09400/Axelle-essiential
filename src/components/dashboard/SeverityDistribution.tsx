import { useStatistics } from '@/services/hooks';
import { ChartSkeleton } from '@/components/Skeletons';
import { ErrorState } from '@/components/EmptyError';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const severityColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#3b82f6',
  info: '#64748b',
};

const tooltipStyle = {
  backgroundColor: '#0f1420',
  border: '1px solid #2d3848',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#c8d0db',
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
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-base-200 mb-4">Severity Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
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
              <Cell key={entry.name} fill={severityColors[entry.name] ?? '#64748b'} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            wrapperStyle={{ fontSize: '11px', color: '#a4afbd' }}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
