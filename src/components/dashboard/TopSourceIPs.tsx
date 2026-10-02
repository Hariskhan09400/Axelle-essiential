import { useStatistics } from '@/services/hooks';
import { ChartSkeleton } from '@/components/Skeletons';
import { ErrorState } from '@/components/EmptyError';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const tooltipStyle = {
  backgroundColor: 'var(--brand-surface)',
  border: '1px solid var(--brand-border)',
  borderRadius: '6px',
  fontSize: '12px',
  color: 'var(--brand-text)',
};

export function TopSourceIPs() {
  const { data, isLoading, isError, refetch } = useStatistics();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ErrorState message="Failed to load source IP data" onRetry={() => refetch()} />;
  if (!data || data.top_source_ips.length === 0) return null;

  const chartData = data.top_source_ips.map((item) => ({ ip: item.ip, count: item.count }));
  const maxCount = Math.max(...chartData.map((d) => d.count));

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-base-200 mb-4">Top Source IPs</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--chart-muted)' }} axisLine={{ stroke: 'var(--line)' }} allowDecimals={false} />
          <YAxis type="category" dataKey="ip" tick={{ fontSize: 10, fill: 'var(--brand-muted)', fontFamily: 'monospace' }} axisLine={{ stroke: 'var(--line)' }} width={100} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--brand-border)' }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.ip} fill={entry.count === maxCount ? 'var(--severity-critical)' : 'var(--brand-gold)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
