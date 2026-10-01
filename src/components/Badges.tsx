import type { Severity, AlertStatus } from '@/types';
import { CriticalIcon, HighIcon, MediumIcon, LowIcon, InfoIcon, StatusIcon } from './SeverityIcons';

const severityConfig: Record<
  Severity,
  { label: string; classes: string; Icon: typeof CriticalIcon; dot: string }
> = {
  critical: { label: 'Critical', classes: 'text-critical-300 bg-critical-500/10 border-critical-500/30', Icon: CriticalIcon, dot: 'bg-critical-500' },
  high: { label: 'High', classes: 'text-high-300 bg-high-500/10 border-high-500/30', Icon: HighIcon, dot: 'bg-high-500' },
  medium: { label: 'Medium', classes: 'text-medium-300 bg-medium-500/10 border-medium-500/30', Icon: MediumIcon, dot: 'bg-medium-500' },
  low: { label: 'Low', classes: 'text-low-300 bg-low-500/10 border-low-500/30', Icon: LowIcon, dot: 'bg-low-500' },
  info: { label: 'Info', classes: 'text-info-400 bg-info-500/10 border-info-500/20', Icon: InfoIcon, dot: 'bg-info-500' },
};

export function SeverityBadge({ severity, size = 'sm' }: { severity: Severity; size?: 'sm' | 'xs' }) {
  const cfg = severityConfig[severity];
  const Icon = cfg.Icon;
  const padding = size === 'xs' ? 'px-1.5 py-0.5 text-2xs' : 'px-2 py-0.5 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1 ${padding} rounded-full border font-medium ${cfg.classes}`}
    >
      <Icon className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {cfg.label}
    </span>
  );
}

export function SeverityDot({ severity }: { severity: Severity }) {
  return <span className={`inline-block w-2 h-2 rounded-full ${severityConfig[severity].dot}`} />;
}

const statusConfig: Record<AlertStatus, { label: string; classes: string }> = {
  new: { label: 'New', classes: 'text-accent-300 bg-accent-500/10 border-accent-500/30' },
  investigating: { label: 'Investigating', classes: 'text-medium-300 bg-medium-500/10 border-medium-500/30' },
  confirmed: { label: 'Confirmed', classes: 'text-critical-300 bg-critical-500/10 border-critical-500/30' },
  false_positive: { label: 'False Positive', classes: 'text-info-400 bg-info-500/10 border-info-500/20' },
  incident_created: { label: 'Incident Created', classes: 'text-high-300 bg-high-500/10 border-high-500/30' },
  resolved: { label: 'Resolved', classes: 'text-status-resolved bg-status-resolved/10 border-status-resolved/30' },
};

export function StatusBadge({ status }: { status: AlertStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.classes}`}>
      <StatusIcon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export function ModeBadge({ mode }: { mode: 'demo' | 'live' }) {
  if (mode === 'live') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-mono text-status-resolved bg-status-resolved/10 border border-status-resolved/30">
        LIVE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-2xs font-mono text-accent-300 bg-accent-500/10 border border-accent-500/30">
      DEMO
    </span>
  );
}

