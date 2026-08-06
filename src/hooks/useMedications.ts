import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Medication, OwnerType } from '../database/models';
import { MedicationService, type MedicationInput } from '../services/MedicationService';

export const medicationKeys = {
  all: ['medications'] as const,
  list: (ownerType: OwnerType, ownerId: string) => ['medications', ownerType, ownerId] as const,
};

export function useMedications(ownerType: OwnerType, ownerId: string | undefined) {
  return useQuery<Medication[]>({
    queryKey: medicationKeys.list(ownerType, ownerId ?? 'none'),
    queryFn: () => MedicationService.listByOwner(ownerType, ownerId as string),
    enabled: !!ownerId,
  });
}

export function useMedication(id: string | undefined) {
  return useQuery<Medication | null>({
    queryKey: ['medication', id ?? 'none'],
    queryFn: () => MedicationService.get(id as string),
    enabled: !!id,
  });
}

export function useCreateMedication(ownerType: OwnerType, ownerId: string) {
  const qc = useQueryClient();
  return useMutation<Medication, Error, MedicationInput>({
    mutationFn: (input) => MedicationService.create(ownerType, ownerId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: medicationKeys.all }),
  });
}

export function useUpdateMedication() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; input: MedicationInput }>({
    mutationFn: ({ id, input }) => MedicationService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: medicationKeys.all }),
  });
}

export function useToggleMedication() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) => MedicationService.setActive(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: medicationKeys.all }),
  });
}

export function useDeleteMedication() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => MedicationService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: medicationKeys.all }),
  });
}
