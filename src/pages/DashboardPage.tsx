import { OverviewCards } from '@/components/dashboard/OverviewCards';
import { LiveEventsTable } from '@/components/dashboard/LiveEventsTable';
import { EventTimeline } from '@/components/dashboard/EventTimeline';
import { SeverityDistribution } from '@/components/dashboard/SeverityDistribution';
import { TopSourceIPs } from '@/components/dashboard/TopSourceIPs';
import { TopTechniques } from '@/components/dashboard/TopTechniques';
import { AlertCards } from '@/components/dashboard/AlertCards';
import { useStatistics } from '@/services/hooks';
import { CardSkeleton } from '@/components/Skeletons';
import { ErrorState } from '@/components/EmptyError';

export function DashboardPage() {
  const { data: stats, isLoading, isError, refetch } = useStatistics();

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-base-100">Security Overview</h1>
          <p className="text-xs text-base-400 mt-0.5">Security telemetry overview</p>
        </div>
      </div>

      {/* Overview cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : isError || !stats ? (
        <ErrorState message="Failed to load security statistics" onRetry={() => refetch()} />
      ) : (
        <OverviewCards stats={stats} />
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><EventTimeline /></div>
        <SeverityDistribution />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopSourceIPs />
        <TopTechniques />
      </div>

      <AlertCards />

      {/* Live events table */}
      <div className="card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-700">
          <h2 className="text-sm font-semibold text-base-200">Recent Events</h2>
          <span className="text-2xs text-base-400">Most recently received events</span>
        </div>
        <LiveEventsTable onEventClick={() => undefined} compact />
      </div>
    </div>
  );
}
