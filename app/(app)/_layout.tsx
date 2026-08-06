import type { ColorValue } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useTranslation } from '../../src/i18n/useTranslation';
import { useSessionStore } from '../../src/store/sessionStore';
import { useTheme } from '../../src/theme/useTheme';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

/** Bottom navigation matching the prototype: Inicio · Personas · Mascotas · Cuidados · Menú. */
export default function AppTabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  // Auth guard: protected area is unreachable without a session.
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  const icon =
    (name: IconName) =>
    ({ color, size }: { color: ColorValue; size: number }) =>
      <MaterialIcons name={name} color={color} size={size} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textVar,
        tabBarStyle: {
          backgroundColor: theme.colors.navBg,
          borderTopColor: theme.colors.outline,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.home'), tabBarIcon: icon('home') }} />
      <Tabs.Screen name="people" options={{ title: t('tabs.people'), tabBarIcon: icon('people') }} />
      <Tabs.Screen name="pets" options={{ title: t('tabs.pets'), tabBarIcon: icon('pets') }} />
      <Tabs.Screen name="care" options={{ title: t('tabs.care'), tabBarIcon: icon('calendar-month') }} />
      <Tabs.Screen name="menu" options={{ title: t('tabs.menu'), tabBarIcon: icon('menu') }} />
    </Tabs>
  );
}
