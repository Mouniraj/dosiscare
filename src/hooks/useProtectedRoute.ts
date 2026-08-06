import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

import { useSessionStore } from '../store/sessionStore';

/**
 * App-wide auth gate. Redirects any non-authenticated navigation (including
 * deep links straight to `/person/[id]`, `/settings`, etc.) to the login screen,
 * and keeps an authenticated user out of the auth group. Runs once the boot
 * sequence has restored the session (`ready`) to avoid redirect flicker.
 */
export function useProtectedRoute(ready: boolean): void {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [ready, isAuthenticated, segments, router]);
}
