import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../global.css';
import { queryClient } from '../src/api/queryClient';
import { BootSplash } from '../src/components/layout/BootSplash';
import { ToastProvider } from '../src/contexts/ToastContext';
import { initDatabase } from '../src/database/connection';
import { useProtectedRoute } from '../src/hooks/useProtectedRoute';
import { initFieldCrypto } from '../src/utils/fieldCrypto';
import { makeTranslator } from '../src/i18n';
import { AuthService } from '../src/services/AuthService';
import { seedDemoData } from '../src/services/demoData';
import { configureNotifications, syncNotifications } from '../src/services/NotificationService';
import { useSessionStore } from '../src/store/sessionStore';
import { useSyncStore } from '../src/store/syncStore';
import { useSettingsStore } from '../src/store/settingsStore';
import { useTheme } from '../src/theme/useTheme';

/**
 * Root layout: boots the offline database, hydrates persisted settings, and
 * provides React Query. Renders a splash until the foundation is ready.
 */
export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const hydrate = useSettingsStore((s) => s.hydrate);
  const setUser = useSessionStore((s) => s.setUser);
  const theme = useTheme();

  // App-wide auth gate: protects every route (incl. deep links) once booted.
  useProtectedRoute(ready);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await initDatabase();
      await initFieldCrypto();
      await hydrate();
      await seedDemoData();
      const user = await AuthService.restoreSession();
      configureNotifications();
      const settings = useSettingsStore.getState();
      if (user && settings.notificationsEnabled) {
        await syncNotifications(user.id, makeTranslator(settings.language));
      }
      await useSyncStore.getState().refreshPending();
      if (mounted) {
        setUser(user);
        setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hydrate, setUser]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
        <ToastProvider>
          {ready ? (
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="catalog" options={{ presentation: 'modal' }} />
            </Stack>
          ) : (
            <BootSplash />
          )}
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
