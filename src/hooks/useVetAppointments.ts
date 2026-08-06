import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { VetAppointment } from '../database/models';
import { VetAppointmentService, type VetAppointmentInput } from '../services/VetAppointmentService';

const key = (petId: string) => ['vetAppointments', petId] as const;

export function useVetAppointments(petId: string | undefined) {
  return useQuery<VetAppointment[]>({
    queryKey: key(petId ?? 'none'),
    queryFn: () => VetAppointmentService.list(petId as string),
    enabled: !!petId,
  });
}

export function useVetAppointment(id: string | undefined, petId: string | undefined) {
  const list = useVetAppointments(petId);
  return { ...list, data: list.data?.find((a) => a.id === id) ?? null };
}

export function useCreateVetAppointment(petId: string) {
  const qc = useQueryClient();
  return useMutation<VetAppointment, Error, VetAppointmentInput>({
    mutationFn: (input) => VetAppointmentService.create(petId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vetAppointments'] }),
  });
}

export function useUpdateVetAppointment() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; input: VetAppointmentInput }>({
    mutationFn: ({ id, input }) => VetAppointmentService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vetAppointments'] }),
  });
}

export function useDeleteVetAppointment() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => VetAppointmentService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vetAppointments'] }),
  });
}
