import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Pet } from '../database/models';
import { PetService, type PetInput } from '../services/PetService';

export const petKeys = {
  all: ['pets'] as const,
  list: (userId: string) => ['pets', userId] as const,
  detail: (id: string) => ['pet', id] as const,
};

export function usePets(userId: string | undefined) {
  return useQuery<Pet[]>({
    queryKey: petKeys.list(userId ?? 'none'),
    queryFn: () => PetService.list(userId as string),
    enabled: !!userId,
  });
}

export function usePet(id: string | undefined) {
  return useQuery<Pet | null>({
    queryKey: petKeys.detail(id ?? 'none'),
    queryFn: () => PetService.get(id as string),
    enabled: !!id,
  });
}

export function useCreatePet(userId: string) {
  const qc = useQueryClient();
  return useMutation<Pet, Error, PetInput>({
    mutationFn: (input) => PetService.create(userId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: petKeys.all }),
  });
}

export function useUpdatePet() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; input: PetInput }>({
    mutationFn: ({ id, input }) => PetService.update(id, input),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: petKeys.all });
      qc.invalidateQueries({ queryKey: petKeys.detail(id) });
    },
  });
}

export function useDeletePet() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => PetService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: petKeys.all }),
  });
}
