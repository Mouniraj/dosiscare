import { Stack } from 'expo-router';

/** Authentication flow: login, register, password recovery, onboarding. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
