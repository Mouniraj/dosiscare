import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Appointment } from '../database/models';
import {
  AppointmentService,
  type AppointmentInput,
  type AppointmentWithProfile,
} from '../services/AppointmentService';

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (userId: string) => ['appointments', userId] as const,
  detail: (id: string) => ['appointment', id] as const,
};

export function useAppointments(userId: string | undefined) {
  return useQuery<AppointmentWithProfile[]>({
    queryKey: appointmentKeys.list(userId ?? 'none'),
    queryFn: () => AppointmentService.list(userId as string),
    enabled: !!userId,
  });
}

export function useAppointment(id: string | undefined) {
  return useQuery<Appointment | null>({
    queryKey: appointmentKeys.detail(id ?? 'none'),
    queryFn: () => AppointmentService.get(id as string),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, AppointmentInput>({
    mutationFn: (input) => AppointmentService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: appointmentKeys.all }),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; input: AppointmentInput }>({
    mutationFn: ({ id, input }) => AppointmentService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: appointmentKeys.all }),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => AppointmentService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: appointmentKeys.all }),
  });
}
