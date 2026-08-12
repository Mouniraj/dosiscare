import { useEffect } from 'react';
import { usePathname, useRouter, useSegments } from 'expo-router';

import { useSessionStore } from '../store/sessionStore';
import { useSettingsStore } from '../store/settingsStore';

/**
 * App-wide auth gate. Redirects any non-authenticated navigation (including
 * deep links straight to `/person/[id]`, `/settings`, etc.) to the login screen
 * (or onboarding on first launch), and keeps an authenticated user out of the
 * auth group. Runs once the boot sequence has restored the session (`ready`)
 * to avoid redirect flicker.
 */
export function useProtectedRoute(ready: boolean): void {
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);

  useEffect(() => {
    if (!ready) return;
    // Let the index route render its own <Redirect> so first-launch users
    // reach onboarding without a login flicker.
    if (pathname === '/') return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace(onboardingSeen ? '/(auth)/login' : '/(auth)/onboarding');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [ready, isAuthenticated, onboardingSeen, segments, pathname, router]);
}
