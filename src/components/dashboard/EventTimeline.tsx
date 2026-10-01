import { useStatistics } from '@/services/hooks';
import { ChartSkeleton } from '@/components/Skeletons';
import { ErrorState } from '@/components/EmptyError';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const tooltipStyle = {
  backgroundColor: '#0f1420',
  border: '1px solid #2d3848',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#c8d0db',
};

export function EventTimeline() {
  const { data, isLoading, isError, refetch } = useStatistics();

  if (isLoading) return <ChartSkeleton />;
  if (isError) return <ErrorState message="Failed to load timeline" onRetry={() => refetch()} />;
  if (!data) return null;

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-base-200 mb-1">Event Timeline</h3>
      <p className="text-2xs text-base-400 mb-4">Events per 2-hour bucket — last 24 hours</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data.events_per_bucket} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2130" />
          <XAxis dataKey="bucket" tick={{ fontSize: 10, fill: '#7c8898' }} axisLine={{ stroke: '#2d3848' }} />
          <YAxis tick={{ fontSize: 10, fill: '#7c8898' }} axisLine={{ stroke: '#2d3848' }} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#eventGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
