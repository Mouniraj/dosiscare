import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PersonVaccine, PetVaccine } from '../database/models';
import {
  VaccineService,
  type PersonVaccineInput,
  type PetVaccineInput,
} from '../services/VaccineService';

const personKey = (profileId: string) => ['personVaccines', profileId] as const;
const petKey = (petId: string) => ['petVaccines', petId] as const;

// ---- Person vaccines ----
export function usePersonVaccines(profileId: string | undefined) {
  return useQuery<PersonVaccine[]>({
    queryKey: personKey(profileId ?? 'none'),
    queryFn: () => VaccineService.listPerson(profileId as string),
    enabled: !!profileId,
  });
}

export function useCreatePersonVaccine(profileId: string) {
  const qc = useQueryClient();
  return useMutation<PersonVaccine, Error, PersonVaccineInput>({
    mutationFn: (input) => VaccineService.createPerson(profileId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personVaccines'] }),
  });
}

export function useUpdatePersonVaccine() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; input: PersonVaccineInput }>({
    mutationFn: ({ id, input }) => VaccineService.updatePerson(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personVaccines'] }),
  });
}

export function useDeletePersonVaccine() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => VaccineService.removePerson(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['personVaccines'] }),
  });
}

// ---- Pet vaccines ----
export function usePetVaccines(petId: string | undefined) {
  return useQuery<PetVaccine[]>({
    queryKey: petKey(petId ?? 'none'),
    queryFn: () => VaccineService.listPet(petId as string),
    enabled: !!petId,
  });
}

export function useCreatePetVaccine(petId: string) {
  const qc = useQueryClient();
  return useMutation<PetVaccine, Error, PetVaccineInput>({
    mutationFn: (input) => VaccineService.createPet(petId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['petVaccines'] }),
  });
}

export function useUpdatePetVaccine() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; input: PetVaccineInput }>({
    mutationFn: ({ id, input }) => VaccineService.updatePet(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['petVaccines'] }),
  });
}

export function useDeletePetVaccine() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => VaccineService.removePet(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['petVaccines'] }),
  });
}
