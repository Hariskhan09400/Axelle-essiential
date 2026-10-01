import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';

export function EmptyState({
  title = 'No data available',
  message = 'There are no items to display.',
  icon: Icon = Inbox,
}: {
  title?: string;
  message?: string;
  icon?: typeof Inbox;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-base-800 border border-base-700 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-base-400" />
      </div>
      <h3 className="text-sm font-medium text-base-200">{title}</h3>
      <p className="text-xs text-base-400 mt-1 max-w-xs">{message}</p>
    </div>
  );
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-critical-500/10 border border-critical-500/30 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-critical-400" />
      </div>
      <h3 className="text-sm font-medium text-base-200">Failed to load</h3>
      <p className="text-xs text-base-400 mt-1 max-w-xs">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-4">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}
