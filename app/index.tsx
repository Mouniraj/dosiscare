import { Redirect } from 'expo-router';

import { useSessionStore } from '../src/store/sessionStore';

/**
 * Entry route. Directs to the authenticated app or the auth flow.
 * The real auth gate (Secure Store token check) is wired in Phase 3;
 * for now unauthenticated users land on the login flow.
 */
export default function Index() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  return <Redirect href={isAuthenticated ? '/(app)' : '/(auth)/login'} />;
}
