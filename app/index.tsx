import { Redirect } from 'expo-router';

import { useSessionStore } from '../src/store/sessionStore';
import { useSettingsStore } from '../src/store/settingsStore';

/**
 * Entry route. First launch shows onboarding; subsequent launches go straight
 * to the authenticated app or the login screen.
 */
export default function Index() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const onboardingSeen = useSettingsStore((s) => s.onboardingSeen);
  if (isAuthenticated) return <Redirect href="/(app)" />;
  return <Redirect href={onboardingSeen ? '/(auth)/login' : '/(auth)/onboarding'} />;
}
