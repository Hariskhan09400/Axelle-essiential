import type { EventQuery } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.health(),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useEvents(opts: EventQuery = {}) {
  return useQuery({
    queryKey: ['events', opts],
    queryFn: () => api.getEvents(opts),
    staleTime: 10_000,
  });
}

export function useAlerts(opts: EventQuery = {}) {
  return useQuery({
    queryKey: ['alerts', opts],
    queryFn: () => api.getAlerts(opts),
    staleTime: 10_000,
  });
}

export function useEventById(id: string | undefined) {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => {
      if (!id) throw new Error('No ID');
      return api.getEventById(id);
    },
    enabled: !!id,
  });
}

export function useStatistics() {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: () => api.getStatistics(),
    staleTime: 15_000,
  });
}

export function useHosts() {
  return useQuery({
    queryKey: ['hosts'],
    queryFn: () => api.getHosts(),
    staleTime: 30_000,
  });
}

export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: () => api.getIncidents(),
    staleTime: 15_000,
  });
}

export function useIncidentById(id: string | undefined) {
  return useQuery({
    queryKey: ['incident', id],
    queryFn: () => {
      if (!id) throw new Error('No ID');
      return api.getIncidentById(id);
    },
    enabled: !!id,
  });
}
