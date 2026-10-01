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
} from '@/types';

const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function fetchAPI<T>(
  path: string,
  params?: Record<string, string | number>,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, String(v));
    }
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);

  try {
    const resp = await fetch(url.toString(), {
      method,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

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
  health: (): Promise<HealthResponse> => fetchAPI<HealthResponse>('/health'),

  async getEvents(opts: EventQuery = {}): Promise<PaginatedResponse<SecurityEvent>> {
    return fetchAPI<PaginatedResponse<SecurityEvent>>('/events', {
      page: opts.page ?? 1,
      page_size: opts.page_size ?? 20,
      ...(opts.sort ? { sort: opts.sort } : {}),
      ...(opts.sort_order ? { sort_order: opts.sort_order } : {}),
      ...(opts.severity ? { severity: opts.severity } : {}),
      ...(opts.event_type ? { event_type: opts.event_type } : {}),
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.q ? { q: opts.q } : {}),
    });
  },

  getAlerts: async (opts: EventQuery = {}): Promise<PaginatedResponse<SecurityEvent>> =>
    fetchAPI<PaginatedResponse<SecurityEvent>>('/alerts', {
      page: opts.page ?? 1,
      page_size: opts.page_size ?? 20,
      ...(opts.sort ? { sort: opts.sort } : {}),
      ...(opts.sort_order ? { sort_order: opts.sort_order } : {}),
      ...(opts.severity ? { severity: opts.severity } : {}),
      ...(opts.event_type ? { event_type: opts.event_type } : {}),
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.q ? { q: opts.q } : {}),
    }),

  getEventById: (id: string): Promise<SecurityEvent> => fetchAPI<SecurityEvent>(`/events/${id}`),
  updateEventStatus: (id: string, status: SecurityEvent['status']): Promise<SecurityEvent> =>
    fetchAPI<SecurityEvent>(`/events/${id}/status`, undefined, 'PATCH', { status }),
  createIncident: (input: { title: string; severity: string; event_ids: string[] }) =>
    fetchAPI<{ incident: Incident; mode: 'demo' | 'live' }>('/incidents', undefined, 'POST', input),

  getStatistics: (): Promise<Statistics> => fetchAPI<Statistics>('/statistics'),

  async getHosts(): Promise<Host[]> {
    const response = await fetchAPI<CollectionResponse<Host>>('/hosts');
    return response.items;
  },

  async getIncidents(): Promise<Incident[]> {
    const response = await fetchAPI<CollectionResponse<Incident>>('/incidents');
    return response.items;
  },

  getIncidentById: (id: string): Promise<Incident> => fetchAPI<Incident>(`/incidents/${id}`),
};
