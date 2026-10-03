import type { KeyboardEvent } from 'react';
import type { SecurityEvent } from '@/types';
import { ModeBadge, SeverityBadge, StatusBadge } from '@/components/Badges';
import { Timestamp } from '@/components/ui';

const eventTypeLabel: Record<string, string> = {
  ssh_bruteforce: 'SSH Brute Force',
  network_scan: 'Network Scan',
  auth_failure: 'Auth Failure',
  auth_success: 'Auth Success',
  sudo_activity: 'Sudo Activity',
};

function activateOnKey(event: KeyboardEvent<HTMLTableRowElement>, callback: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
}

export function EventTable({
  events,
  onSelect,
}: {
  events: SecurityEvent[];
  onSelect: (event: SecurityEvent) => void;
}) {
  return (
    <>
      <div className="space-y-2 p-2 md:hidden">
        {events.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => onSelect(event)}
            className="card w-full space-y-2 p-3 text-left transition-colors hover:bg-base-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <SeverityBadge severity={event.severity} size="xs" />
              <StatusBadge status={event.status} />
            </div>
            <div className="flex items-center justify-between gap-2 text-2xs text-base-400">
              <Timestamp value={event.timestamp} />
              <span className="truncate font-mono text-base-300">{event.source_ip ?? '—'}</span>
            </div>
            <p className="break-words text-xs font-medium text-base-100">{event.rule_description}</p>
            <div className="flex min-w-0 items-center justify-between gap-2 text-2xs text-base-400">
              <span className="truncate">{eventTypeLabel[event.event_type] ?? event.event_type} · {event.host}</span>
              <ModeBadge mode={event.mode} />
            </div>
          </button>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-base-850">
            <tr className="border-b border-base-700 text-2xs uppercase tracking-wider text-base-400">
              <th scope="col" className="px-3 py-2 text-left font-medium">Time</th>
              <th scope="col" className="px-3 py-2 text-left font-medium">Severity</th>
              <th scope="col" className="px-3 py-2 text-left font-medium">Status</th>
              <th scope="col" className="px-3 py-2 text-left font-medium">Type</th>
              <th scope="col" className="px-3 py-2 text-left font-medium">Source IP</th>
              <th scope="col" className="px-3 py-2 text-left font-medium">Host</th>
              <th scope="col" className="hidden max-w-xs px-3 py-2 text-left font-medium lg:table-cell">Description</th>
              <th scope="col" className="px-3 py-2 text-left font-medium">Mode</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const select = () => onSelect(event);
              return (
                <tr
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  onClick={select}
                  onKeyDown={(keyEvent) => activateOnKey(keyEvent, select)}
                  title={event.rule_description}
                  className={`table-row-hover cursor-pointer border-b border-base-700/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-400 ${event.severity === 'critical' ? 'bg-critical-500/5' : ''}`}
                >
                  <td className="whitespace-nowrap px-3 py-2 text-2xs text-base-400"><Timestamp value={event.timestamp} /></td>
                  <td className="px-3 py-2"><SeverityBadge severity={event.severity} size="xs" /></td>
                  <td className="px-3 py-2"><StatusBadge status={event.status} /></td>
                  <td className="max-w-40 truncate px-3 py-2 text-xs text-base-200" title={eventTypeLabel[event.event_type] ?? event.event_type}>{eventTypeLabel[event.event_type] ?? event.event_type}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-base-300">{event.source_ip ?? '—'}</td>
                  <td className="max-w-36 truncate px-3 py-2 font-mono text-xs text-base-300" title={event.host}>{event.host}</td>
                  <td className="hidden max-w-xs truncate px-3 py-2 text-xs text-base-300 lg:table-cell" title={event.rule_description}>{event.rule_description}</td>
                  <td className="px-3 py-2"><ModeBadge mode={event.mode} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
