import { useMutation } from '@tanstack/react-query';

import type { User } from '../database/models';
import {
  AuthService,
  type Credentials,
  type RegisterInput,
  type ResetInput,
} from '../services/AuthService';
import { useSessionStore } from '../store/sessionStore';

/**
 * React Query auth mutations. Each wraps an AuthService method and, on success,
 * updates the session store — keeping screens free of orchestration logic.
 */

export function useLogin() {
  const setUser = useSessionStore((s) => s.setUser);
  return useMutation<User, Error, Credentials>({
    mutationFn: (creds) => AuthService.login(creds),
    onSuccess: (user) => setUser(user),
  });
}

export function useRegister() {
  const setUser = useSessionStore((s) => s.setUser);
  return useMutation<User, Error, RegisterInput>({
    mutationFn: (input) => AuthService.register(input),
    onSuccess: (user) => setUser(user),
  });
}

export function useGuestLogin() {
  const setUser = useSessionStore((s) => s.setUser);
  return useMutation<User, Error, void>({
    mutationFn: () => AuthService.continueAsGuest(),
    onSuccess: (user) => setUser(user),
  });
}

export function useRequestPasswordReset() {
  return useMutation<void, Error, string>({
    mutationFn: (email) => AuthService.requestPasswordReset(email),
  });
}

export function useResetPassword() {
  return useMutation<void, Error, ResetInput>({
    mutationFn: (input) => AuthService.resetPassword(input),
  });
}

export function useLogout() {
  const signOut = useSessionStore((s) => s.signOut);
  return useMutation<void, Error, void>({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => signOut(),
  });
}
