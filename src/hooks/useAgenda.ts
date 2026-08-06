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
