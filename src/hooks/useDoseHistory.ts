import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  DoseHistoryService,
  type DayLog,
  type DoseHistoryEntry,
  type LogDoseInput,
} from '../services/DoseHistoryService';

export const doseHistoryKeys = {
  all: ['doseHistory'] as const,
  list: (userId: string) => ['doseHistory', userId] as const,
  dayLogs: (dateIso: string) => ['dayLogs', dateIso] as const,
};

function invalidateDoseData(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: doseHistoryKeys.all });
  qc.invalidateQueries({ queryKey: ['dayLogs'] });
}

export function useDoseHistory(userId: string | undefined) {
  return useQuery<DoseHistoryEntry[]>({
    queryKey: doseHistoryKeys.list(userId ?? 'none'),
    queryFn: () => DoseHistoryService.list(userId as string),
    enabled: !!userId,
  });
}

export function useDayLogs(userId: string | undefined, dateIso: string) {
  return useQuery<Record<string, DayLog>>({
    queryKey: doseHistoryKeys.dayLogs(dateIso),
    queryFn: () => DoseHistoryService.getDayLogs(dateIso),
    enabled: !!userId,
  });
}

export function useLogDose() {
  const qc = useQueryClient();
  return useMutation<void, Error, LogDoseInput>({
    mutationFn: (input) => DoseHistoryService.logDose(input),
    onSuccess: () => invalidateDoseData(qc),
  });
}

export function useUndoDose() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => DoseHistoryService.undo(id),
    onSuccess: () => invalidateDoseData(qc),
  });
}
