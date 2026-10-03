import { RefreshCw } from 'lucide-react';
import { Button, PageHeader } from '@/components/ui';
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

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-4 lg:space-y-6 lg:p-6">
      <PageHeader
        title="Dashboard"
        subtitle="Alerts, sources and activity across your hosts"
        actions={
          <>
            <span className="hidden text-xs text-base-400 md:inline">{today}</span>
            <Button
              type="button"
              variant="secondary"
              onClick={() => refetch()}
              aria-label="Refresh statistics"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </>
        }
      />

      {/* Overview cards */}
      <section aria-label="Key numbers">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : isError || !stats ? (
          <ErrorState message="Failed to load security statistics" onRetry={() => refetch()} />
        ) : (
          <OverviewCards stats={stats} />
        )}
      </section>

      {/* Charts row */}
      <section aria-label="Trends" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2"><EventTimeline /></div>
        <div className="min-w-0"><SeverityDistribution /></div>
      </section>

      {/* Sources and techniques */}
      <section aria-label="Sources and techniques" className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="min-w-0"><TopSourceIPs /></div>
        <div className="min-w-0"><TopTechniques /></div>
      </section>

      {/* Alerts */}
      <section aria-label="Alerts" className="min-w-0">
        <AlertCards />
      </section>

      {/* Live events table */}
      <section aria-label="Recent events" className="card min-w-0 overflow-hidden">
        <div className="flex flex-col gap-0.5 border-b border-base-700 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-base-200">Recent Events</h2>
          <span className="text-2xs text-base-400">Most recently received events</span>
        </div>
        <div className="overflow-x-auto">
          <LiveEventsTable onEventClick={() => undefined} compact />
        </div>
      </section>
    </div>
  );
}