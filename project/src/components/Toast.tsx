import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const toastConfig: Record<ToastType, { Icon: typeof CheckCircle; classes: string }> = {
  success: { Icon: CheckCircle, classes: 'border-status-resolved/30 bg-status-resolved/10 text-status-resolved' },
  error: { Icon: XCircle, classes: 'border-critical-500/30 bg-critical-500/10 text-critical-300' },
  info: { Icon: Info, classes: 'border-accent-500/30 bg-accent-500/10 text-accent-300' },
  warning: { Icon: AlertCircle, classes: 'border-medium-500/30 bg-medium-500/10 text-medium-300' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((t) => {
          const cfg = toastConfig[t.type];
          const Icon = cfg.Icon;
          return (
            <div
              key={t.id}
              className={`flex items-start gap-2.5 p-3 rounded-lg border bg-base-850 shadow-lg animate-slide-in-right ${cfg.classes}`}
            >
              <Icon className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="text-sm text-base-100 flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="text-base-400 hover:text-base-200 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
