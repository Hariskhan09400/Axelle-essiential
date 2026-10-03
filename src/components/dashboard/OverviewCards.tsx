import type { Statistics } from '@/types';
import { Activity, ShieldAlert, FolderClosed, AlertOctagon } from 'lucide-react';
import { formatNumber } from '@/utils/format';

interface CardProps {
  stats: Statistics;
}

const cards = [
  { key: 'events', label: 'Total Events', icon: Activity, color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/30' },
  { key: 'alerts', label: 'Alerts', icon: ShieldAlert, color: 'text-high-400', bg: 'bg-high-500/10', border: 'border-high-500/30' },
  { key: 'incidents', label: 'Incidents', icon: FolderClosed, color: 'text-medium-400', bg: 'bg-medium-500/10', border: 'border-medium-500/30' },
  { key: 'critical', label: 'Critical Alerts', icon: AlertOctagon, color: 'text-critical-400', bg: 'bg-critical-500/10', border: 'border-critical-500/30' },
] as const;

export function OverviewCards({ stats }: CardProps) {
  const values: Record<string, number> = {
    events: stats.totals.events,
    alerts: stats.totals.alerts,
    incidents: stats.totals.incidents,
    critical: stats.totals.critical_alerts,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const val = values[card.key];
        return (
          <div
            key={card.key}
            className="card card-hover min-w-0 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg ${card.bg} ${card.border} border flex items-center justify-center`}>
                <Icon className={`w-4.5 h-4.5 ${card.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-base-100 mono">{formatNumber(val)}</div>
            <div className="text-xs text-base-400 mt-0.5">{card.label}</div>
          </div>
        );
      })}
    </div>
  );
}
