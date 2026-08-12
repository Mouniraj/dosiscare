import { useQuery } from '@tanstack/react-query';

import { AgendaService, type DoseEvent } from '../services/AgendaService';

/** Dose timeline for a specific day. Recomputed whenever medications change. */
export function useDayAgenda(userId: string | undefined, dateIso: string) {
  return useQuery<DoseEvent[]>({
    queryKey: ['agenda', userId ?? 'none', dateIso],
    queryFn: () => AgendaService.getDayEvents(userId as string, dateIso),
    enabled: !!userId,
  });
}

/** Dose events grouped by date for an N-day window starting at `startIso`. */
export function useRangeAgenda(userId: string | undefined, startIso: string, days: number) {
  return useQuery<Record<string, DoseEvent[]>>({
    queryKey: ['agenda-range', userId ?? 'none', startIso, days],
    queryFn: () => AgendaService.getRangeEvents(userId as string, startIso, days),
    enabled: !!userId,
  });
}
