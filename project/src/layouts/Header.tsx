import { useHealth } from '@/services/hooks';
import { Radio, AlertTriangle, RefreshCw } from 'lucide-react';

export function Header() {
  const { data: health, isLoading, isError, refetch } = useHealth();
  const mode = health?.mode;
  const isDemo = mode === 'demo';
  const isOnline = health?.status === 'ok' && !isError;

  return (
    <header className="h-14 shrink-0 bg-base-900/80 backdrop-blur-sm border-b border-base-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isDemo ? 'text-accent-400' : isOnline ? 'text-status-resolved' : 'text-critical-400'}`} />
          <span className="text-sm text-base-300">
            {isLoading ? 'Connecting…' : isError ? 'Backend offline' : !mode ? 'Mode unknown' : health.status === 'unavailable' ? 'LIVE MODE · INGESTION UNAVAILABLE' : `${mode.toUpperCase()} MODE`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* DEMO badge — always visible */}
        {isDemo && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-500/10 border border-accent-500/30">
            <AlertTriangle className="w-3.5 h-3.5 text-accent-400" />
            <span className="text-2xs font-semibold text-accent-300 uppercase tracking-wider">Demo</span>
          </div>
        )}

        {/* Backend status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-status-resolved' : 'bg-critical-500'}`} />
          <span className="text-2xs text-base-400 mono">
            {isLoading ? 'CONNECTING' : isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          <button
            onClick={() => refetch()}
            className="text-base-400 hover:text-base-200 transition-colors"
            title="Reconnect"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
