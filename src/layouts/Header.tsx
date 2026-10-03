import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useHealth } from '@/services/hooks';
import { AlertTriangle, RefreshCw, Menu } from 'lucide-react';

export function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const { data: health, isLoading, isError, refetch, dataUpdatedAt } = useHealth();
  const location = useLocation();
  const [now, setNow] = useState(Date.now());
  const mode = health?.mode;
  const isDemo = mode === 'demo';
  const isLive = mode === 'live';
  const isOnline = health?.status === 'ok' && !isError;
  const pageTitle = ({
    '/dashboard': 'Dashboard',
    '/alerts': 'Alerts',
    '/events': 'Events',
    '/incidents': 'Incidents',
    '/hosts': 'Hosts',
    '/mitre': 'MITRE ATT&CK',
    '/settings': 'Settings',
  } as Record<string, string>)[location.pathname] ?? 'Axelle Sentinel';
  const secondsAgo = dataUpdatedAt ? Math.max(0, Math.floor((now - dataUpdatedAt) / 1000)) : null;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-base-700 bg-base-900 px-3 sm:px-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          id="mobile-menu-trigger"
          type="button"
          onClick={onMenuToggle}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-base-700 bg-base-900 text-base-200 transition hover:border-base-600 hover:bg-base-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 lg:hidden"
          aria-label="Toggle navigation"
          aria-controls="mobile-navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="truncate text-sm font-semibold text-base-100 sm:text-base">{pageTitle}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-1 text-[10px] font-semibold tracking-wide sm:px-2 sm:text-2xs ${isDemo ? 'border-accent-500/30 bg-accent-500/10 text-accent-300' : isLive ? 'border-status-resolved/30 bg-status-resolved/10 text-status-resolved' : 'border-base-700 bg-base-800 text-base-300'}`}>
          {isDemo && <AlertTriangle className="h-3 w-3" aria-hidden="true" />}
          {isLoading ? '…' : (mode ?? 'DEMO').toUpperCase()}
        </span>

        <div className="flex items-center gap-1.5" role="status" aria-label={`Backend ${isOnline ? 'online' : 'offline'}`}>
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-status-resolved' : 'bg-critical-500'}`} />
          <span className="hidden text-[10px] text-base-400 mono sm:inline-block">
            {isLoading ? 'CONNECTING' : isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <span className="hidden whitespace-nowrap text-2xs text-base-400 md:inline">
          {secondsAgo === null ? 'Updated —' : `Updated ${secondsAgo}s ago`}
        </span>

        <button
          type="button"
          onClick={() => void refetch()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-base-300 transition hover:bg-base-800 hover:text-base-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          title="Refresh backend status"
          aria-label="Refresh backend status"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
