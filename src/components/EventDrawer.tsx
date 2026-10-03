import { useEffect, useRef } from 'react';
import { useEventById } from '@/services/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useToast } from './Toast';
import { SeverityBadge, StatusBadge, ModeBadge } from './Badges';
import { ErrorState } from './EmptyError';
import { X, Clock, Globe, Server, Hash, Tag, Link2, FileJson, Shield, Search, CircleCheck, CircleX, FolderPlus, Check } from 'lucide-react';
import type { SecurityEvent } from '@/types';

function DetailRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: typeof Clock;
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-base-800/50 transition-colors">
      <Icon className="w-4 h-4 text-base-400 shrink-0" />
      <span className="text-xs text-base-400 w-28 shrink-0">{label}</span>
      <span className={`min-w-0 flex-1 break-words text-sm text-base-100 ${mono ? 'mono' : ''}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

function EventDetails({ event }: { event: SecurityEvent }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const statusMutation = useMutation({
    mutationFn: (status: SecurityEvent['status']) => api.updateEventStatus(event.id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event', event.id] }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
          queryClient.invalidateQueries({ queryKey: ['alerts'] }),
          queryClient.invalidateQueries({ queryKey: ['alerts'] }),
        queryClient.invalidateQueries({ queryKey: ['statistics'] }),
        queryClient.invalidateQueries({ queryKey: ['incidents'] }),
      ]);
      toast('Event status updated', 'success');
    },
    onError: (error) => toast(error.message, 'error'),
  });
  const incidentMutation = useMutation({
    mutationFn: () => api.createIncident({
      title: event.rule_description,
      severity: event.severity,
      event_ids: [event.id],
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['event', event.id] }),
        queryClient.invalidateQueries({ queryKey: ['events'] }),
        queryClient.invalidateQueries({ queryKey: ['statistics'] }),
        queryClient.invalidateQueries({ queryKey: ['incidents'] }),
      ]);
      toast('Incident created from confirmed event', 'success');
    },
    onError: (error) => toast(error.message, 'error'),
  });

  return (
    <div className="space-y-5">
      {/* Header info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={event.severity} />
          <StatusBadge status={event.status} />
          <ModeBadge mode={event.mode} />
        </div>
        <h2 className="text-base font-semibold text-base-100">{event.rule_description}</h2>
        <p className="text-xs text-base-400 mono">{event.id}</p>
      </div>

      {event.status === 'new' && (
        <button className="btn-outline" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate('investigating')}>
          <Search className="w-3.5 h-3.5" /> Start investigation
        </button>
      )}
      {event.status === 'investigating' && (
        <div className="flex flex-wrap gap-2">
          <button className="btn-outline" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate('confirmed')}>
            <CircleCheck className="w-3.5 h-3.5" /> Confirm
          </button>
          <button className="btn-outline" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate('false_positive')}>
            <CircleX className="w-3.5 h-3.5" /> False positive
          </button>
        </div>
      )}
      {event.status === 'confirmed' && event.severity !== 'info' && (
        <button className="btn-outline" disabled={incidentMutation.isPending} onClick={() => incidentMutation.mutate()}>
          <FolderPlus className="w-3.5 h-3.5" /> Create incident
        </button>
      )}
      {event.status === 'incident_created' && (
        <button className="btn-outline" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate('resolved')}>
          <Check className="w-3.5 h-3.5" /> Resolve
        </button>
      )}

      {/* Details grid */}
      <div className="card divide-y divide-base-700/50">
        <DetailRow icon={Clock} label="Timestamp" value={new Date(event.timestamp).toLocaleString()} mono />
        <DetailRow icon={Tag} label="Event Type" value={event.event_type} mono />
        <DetailRow icon={Hash} label="Rule ID" value={event.rule_id} mono />
        <DetailRow icon={Server} label="Host" value={event.host} mono />
        <DetailRow icon={Globe} label="Source IP" value={event.source_ip} mono />
        <DetailRow icon={Globe} label="Dest. IP" value={event.destination_ip} mono />
        <DetailRow icon={Hash} label="Attempts" value={event.attempt_count?.toString() ?? null} mono />
      </div>

      {/* MITRE */}
      {event.mitre && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-accent-400" />
            <h3 className="text-xs font-semibold text-base-300 uppercase tracking-wider">MITRE ATT&CK</h3>
          </div>
          <div className="card p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-accent-500/10 border border-accent-500/30 text-accent-300 text-xs font-mono">
                {event.mitre.technique_id}
              </span>
              <span className="text-sm text-base-100">{event.mitre.technique_name}</span>
            </div>
            <div className="text-xs text-base-400">
              <span className="text-base-300">Tactic: </span>
              {event.mitre.tactic}
            </div>
          </div>
        </div>
      )}

      {/* Related events */}
      {event.related_event_ids.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-base-400" />
            <h3 className="text-xs font-semibold text-base-300 uppercase tracking-wider">Related Events</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {event.related_event_ids.map((id) => (
              <span key={id} className="px-2 py-1 rounded bg-base-800 border border-base-700 text-xs mono text-base-300">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Analyst notes */}
      {event.analyst_notes.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-base-300 uppercase tracking-wider mb-2">Analyst Notes</h3>
          <div className="space-y-2">
            {event.analyst_notes.map((note, i) => (
              <div key={i} className="card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-base-200">{note.author}</span>
                  <span className="text-2xs text-base-400 mono">{new Date(note.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-base-300">{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw event */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileJson className="w-4 h-4 text-base-400" />
          <h3 className="text-xs font-semibold text-base-300 uppercase tracking-wider">Raw Event</h3>
        </div>
        <pre className="card max-h-64 max-w-full overflow-y-auto whitespace-pre-wrap break-words p-3 text-xs text-base-300 mono">
          {JSON.stringify(event.raw_event, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export function EventDrawer({
  eventId,
  onClose,
}: {
  eventId: string | null;
  onClose: () => void;
}) {
  const { data: event, isLoading, isError, refetch } = useEventById(eventId ?? undefined);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const isOpen = Boolean(eventId);

  closeRef.current = onClose;

  useEffect(() => {
    if (panelRef.current) panelRef.current.inert = !isOpen;
    if (!isOpen) {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
      return;
    }

    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('button[aria-label="Close event details"]')?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        panelRef.current.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-base-950/70 transition-opacity duration-200 motion-reduce:transition-none"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={isOpen}
        aria-labelledby="event-drawer-title"
        aria-hidden={!isOpen}
        tabIndex={-1}
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[94dvh] overflow-y-auto rounded-t-xl border border-base-700 bg-base-850 transition-transform duration-200 motion-reduce:transition-none md:inset-y-0 md:left-auto md:right-0 md:h-full md:max-h-none md:w-full md:max-w-lg md:rounded-none md:border-y-0 md:border-r-0 ${
          isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-base-700 bg-base-850 px-4 py-3">
          <h2 id="event-drawer-title" className="text-sm font-semibold text-base-100">Event Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-base-300 transition-colors hover:bg-base-800 hover:text-base-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            aria-label="Close event details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {isLoading && (
            <div className="space-y-3">
              <div className="skeleton h-6 w-32" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-32 w-full" />
              <div className="skeleton h-48 w-full" />
            </div>
          )}
          {isError && <ErrorState message="Failed to load event details" onRetry={() => refetch()} />}
          {event && <EventDetails event={event} />}
        </div>
      </div>
    </>
  );
}
