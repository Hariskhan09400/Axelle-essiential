import { useStatistics } from '@/services/hooks';
import { ChartSkeleton } from '@/components/Skeletons';
import { EmptyState, ErrorState } from '@/components/EmptyError';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const tooltipStyle = {
  backgroundColor: 'var(--brand-surface)',
  border: '1px solid var(--brand-border)',
  borderRadius: '6px',
  fontSize: '12px',
  color: 'var(--brand-text)',
};

export function EventTimeline() {
  const { data, isLoading, isError, refetch } = useStatistics();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ErrorState message="Failed to load timeline" onRetry={() => refetch()} />;
  if (!data || data.events_per_bucket.length === 0) {
    return (
      <div className="card min-w-0 p-4">
        <h3 className="mb-1 text-sm font-semibold text-base-200">Event Timeline</h3>
        <p className="mb-4 text-2xs text-base-400">Events per 2-hour bucket — last 24 hours</p>
        <EmptyState title="No timeline data" message="Events will appear here when activity is recorded." />
      </div>
    );
  }

  return (
    <div className="card min-w-0 p-4">
      <h3 className="text-sm font-semibold text-base-200 mb-1">Event Timeline</h3>
      <p className="text-2xs text-base-400 mb-4">Events per 2-hour bucket — last 24 hours</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data.events_per_bucket} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--brand-gold)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--brand-gold)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
          <XAxis dataKey="bucket" interval="preserveStartEnd" minTickGap={24} tick={{ fontSize: 9, fill: 'var(--chart-muted)' }} axisLine={{ stroke: 'var(--line)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--chart-muted)' }} axisLine={{ stroke: 'var(--line)' }} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--brand-gold)"
            strokeWidth={2}
            fill="url(#eventGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
