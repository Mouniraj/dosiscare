import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Symptom } from '../database/models';
import { SymptomService, type SymptomInput } from '../services/SymptomService';

const key = (profileId: string) => ['symptoms', profileId] as const;

export function useSymptoms(profileId: string | undefined) {
  return useQuery<Symptom[]>({
    queryKey: key(profileId ?? 'none'),
    queryFn: () => SymptomService.list(profileId as string),
    enabled: !!profileId,
  });
}

export function useCreateSymptom(profileId: string) {
  const qc = useQueryClient();
  return useMutation<Symptom, Error, SymptomInput>({
    mutationFn: (input) => SymptomService.create(profileId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['symptoms'] }),
  });
}

export function useDeleteSymptom() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => SymptomService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['symptoms'] }),
  });
}
