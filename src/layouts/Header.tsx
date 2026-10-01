import { useHealth } from '@/services/hooks';
import { Radio, AlertTriangle, RefreshCw, Menu } from 'lucide-react';

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: health, isLoading, isError, refetch } = useHealth();
  const mode = health?.mode;
  const isDemo = mode === 'demo';
  const isOnline = health?.status === 'ok' && !isError;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-base-700 bg-base-900/80 px-3 backdrop-blur-sm sm:px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-base-700 bg-base-900 text-base-200 transition hover:border-base-600 hover:bg-base-800 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Radio className={`h-4 w-4 ${isDemo ? 'text-accent-400' : isOnline ? 'text-status-resolved' : 'text-critical-400'}`} />
          <span className="text-xs text-base-300 sm:text-sm">
            {isLoading ? 'Connecting…' : isError ? 'Backend offline' : !mode ? 'Mode unknown' : health.status === 'unavailable' ? 'LIVE MODE · INGESTION UNAVAILABLE' : `${mode.toUpperCase()} MODE`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isDemo && (
          <div className="hidden items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-2 py-1 sm:flex">
            <AlertTriangle className="h-3.5 w-3.5 text-accent-400" />
            <span className="text-2xs font-semibold uppercase tracking-wider text-accent-300">Demo</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-status-resolved' : 'bg-critical-500'}`} />
          <span className="hidden text-[10px] text-base-400 mono sm:inline-block">
            {isLoading ? 'CONNECTING' : isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          <button
            onClick={() => refetch()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-base-400 transition hover:bg-base-800 hover:text-base-200"
            title="Reconnect"
            aria-label="Refresh backend status"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
