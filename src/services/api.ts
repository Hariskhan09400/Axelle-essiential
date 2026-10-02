import type {
  SecurityEvent,
  Incident,
  Host,
  Statistics,
  HealthResponse,
  PaginatedResponse,
  CollectionResponse,
  EventQuery,
  ApiError,
  Severity,
} from '@/types';
import {
  getEventById as getDemoEventById,
  getIncidentById as getDemoIncidentById,
  mockData,
} from './mockData';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

class ApiUnavailableError extends Error {}

async function withDemoFallback<T>(
  request: () => Promise<T>,
  fallback: () => T,
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    if (error instanceof ApiUnavailableError) {
      return fallback();
    }
    throw error;
  }
}

function getDemoEvents(
  opts: EventQuery = {},
  alertsOnly = false,
  defaultSort: NonNullable<EventQuery['sort']> = 'timestamp',
): PaginatedResponse<SecurityEvent> {
  let items = [...mockData.events];
  if (alertsOnly) items = items.filter((event) => event.severity !== 'info');
  if (opts.severity) items = items.filter((event) => event.severity === opts.severity);
  if (opts.event_type) items = items.filter((event) => event.event_type === opts.event_type);
  if (opts.status) items = items.filter((event) => event.status === opts.status);
  if (opts.q) {
    const query = opts.q.trim().toLowerCase();
    items = items.filter((event) => JSON.stringify(event).toLowerCase().includes(query));
  }

  const sort = opts.sort ?? defaultSort;
  const order = opts.sort_order ?? (sort === 'timestamp' ? 'desc' : 'asc');
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };
  items.sort((left, right) => {
    let result = 0;
    if (sort === 'severity') {
      result = severityOrder[left.severity] - severityOrder[right.severity]
        || left.timestamp.localeCompare(right.timestamp);
    } else if (sort === 'event_type') {
      result = left.event_type.localeCompare(right.event_type)
        || left.timestamp.localeCompare(right.timestamp);
    } else {
      result = left.timestamp.localeCompare(right.timestamp)
        || left.id.localeCompare(right.id);
    }
    return order === 'desc' ? -result : result;
  });

  const page = opts.page ?? 1;
  const pageSize = opts.page_size ?? 20;
  const total = items.length;
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    page_size: pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    mode: 'demo',
  };
}

async function fetchAPI<T>(
  path: string,
  params?: Record<string, string | number>,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const url = new URL(`${API_URL}${path}`, window.location.origin);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);

  try {
    let resp: Response;
    try {
      resp = await fetch(url.toString(), {
        method,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch (error) {
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'Request timed out'
        : 'Backend unavailable';
      throw new ApiUnavailableError(message);
    }

    if ([502, 503, 504].includes(resp.status)) {
      throw new ApiUnavailableError(`Backend unavailable (${resp.status})`);
    }

    if (!resp.ok) {
      const err: ApiError = await resp.json().catch(() => ({
        error: { code: 'UNKNOWN', message: `HTTP ${resp.status}` },
      }));
      throw new Error(err.error?.message ?? `HTTP ${resp.status}`);
    }

    if (resp.status === 204) {
      return undefined as T;
    }

    return (await resp.json()) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export const api = {
  health: (): Promise<HealthResponse> => withDemoFallback(
    () => fetchAPI<HealthResponse>('/health'),
    () => ({ status: 'offline', mode: 'demo' }),
  ),

  async getEvents(opts: EventQuery = {}): Promise<PaginatedResponse<SecurityEvent>> {
    return withDemoFallback(
      () => fetchAPI<PaginatedResponse<SecurityEvent>>('/events', {
        page: opts.page ?? 1,
        page_size: opts.page_size ?? 20,
        ...(opts.sort ? { sort: opts.sort } : {}),
        ...(opts.sort_order ? { sort_order: opts.sort_order } : {}),
        ...(opts.severity ? { severity: opts.severity } : {}),
        ...(opts.event_type ? { event_type: opts.event_type } : {}),
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.q ? { q: opts.q } : {}),
      }),
      () => getDemoEvents(opts),
    );
  },

  getAlerts: async (opts: EventQuery = {}): Promise<PaginatedResponse<SecurityEvent>> =>
    withDemoFallback(
      () => fetchAPI<PaginatedResponse<SecurityEvent>>('/alerts', {
        page: opts.page ?? 1,
        page_size: opts.page_size ?? 20,
        ...(opts.sort ? { sort: opts.sort } : {}),
        ...(opts.sort_order ? { sort_order: opts.sort_order } : {}),
        ...(opts.severity ? { severity: opts.severity } : {}),
        ...(opts.event_type ? { event_type: opts.event_type } : {}),
        ...(opts.status ? { status: opts.status } : {}),
        ...(opts.q ? { q: opts.q } : {}),
      }),
      () => getDemoEvents(opts, true, 'severity'),
    ),

  getEventById: (id: string): Promise<SecurityEvent> => withDemoFallback(
    () => fetchAPI<SecurityEvent>(`/events/${id}`),
    () => {
      const event = getDemoEventById(id);
      if (!event) throw new Error(`Event ${id} not found`);
      return event;
    },
  ),
  updateEventStatus: (id: string, status: SecurityEvent['status']): Promise<SecurityEvent> =>
    fetchAPI<SecurityEvent>(`/events/${id}/status`, undefined, 'PATCH', { status }),
  createIncident: (input: { title: string; severity: string; event_ids: string[] }) =>
    fetchAPI<{ incident: Incident; mode: 'demo' | 'live' }>('/incidents', undefined, 'POST', input),

  getStatistics: (): Promise<Statistics> => withDemoFallback(
    () => fetchAPI<Statistics>('/statistics'),
    () => mockData.stats,
  ),

  async getHosts(): Promise<Host[]> {
    return withDemoFallback(async () => {
      const response = await fetchAPI<CollectionResponse<Host>>('/hosts');
      return response.items;
    }, () => mockData.hosts);
  },

  async getIncidents(): Promise<Incident[]> {
    return withDemoFallback(async () => {
      const response = await fetchAPI<CollectionResponse<Incident>>('/incidents');
      return response.items;
    }, () => mockData.incidents);
  },

  getIncidentById: (id: string): Promise<Incident> => withDemoFallback(
    () => fetchAPI<Incident>(`/incidents/${id}`),
    () => {
      const incident = getDemoIncidentById(id);
      if (!incident) throw new Error(`Incident ${id} not found`);
      return incident;
    },
  ),
};
