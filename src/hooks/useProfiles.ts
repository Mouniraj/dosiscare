import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Profile } from '../database/models';
import { ProfileService, type ProfileInput } from '../services/ProfileService';

export const profileKeys = {
  all: ['profiles'] as const,
  list: (userId: string) => ['profiles', userId] as const,
  detail: (id: string) => ['profile', id] as const,
};

export function useProfiles(userId: string | undefined) {
  return useQuery<Profile[]>({
    queryKey: profileKeys.list(userId ?? 'none'),
    queryFn: () => ProfileService.list(userId as string),
    enabled: !!userId,
  });
}

export function useProfile(id: string | undefined) {
  return useQuery<Profile | null>({
    queryKey: profileKeys.detail(id ?? 'none'),
    queryFn: () => ProfileService.get(id as string),
    enabled: !!id,
  });
}

export function useCreateProfile(userId: string) {
  const qc = useQueryClient();
  return useMutation<Profile, Error, ProfileInput>({
    mutationFn: (input) => ProfileService.create(userId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.all }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; input: ProfileInput }>({
    mutationFn: ({ id, input }) => ProfileService.update(id, input),
    onSuccess: (_r, { id }) => {
      qc.invalidateQueries({ queryKey: profileKeys.all });
      qc.invalidateQueries({ queryKey: profileKeys.detail(id) });
    },
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => ProfileService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: profileKeys.all }),
  });
}
