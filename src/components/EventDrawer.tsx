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
      <span className={`text-sm text-base-100 flex-1 ${mono ? 'mono' : ''}`}>
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
        <pre className="card p-3 text-xs mono text-base-300 overflow-x-auto max-h-64 overflow-y-auto">
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

  return (
    <>
      {/* Backdrop */}
      {eventId && (
        <div
          className="fixed inset-0 bg-base-950/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-base-850 border-l border-base-700 z-50 overflow-y-auto transition-transform duration-300 ${
          eventId ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-base-850/95 backdrop-blur-sm border-b border-base-700 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-sm font-semibold text-base-100">Event Details</h2>
          <button onClick={onClose} className="text-base-400 hover:text-base-200 transition-colors">
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
