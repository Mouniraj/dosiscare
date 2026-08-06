import * as SecureStore from 'expo-secure-store';

import { SECURE_KEYS } from '../constants/config';

/**
 * Thin wrapper over Expo Secure Store for auth credentials/tokens. Key names live
 * in `SECURE_KEYS` (constants/config) so there is a single source of truth.
 */

const TOKEN_KEY = SECURE_KEYS.authToken;
const USER_ID_KEY = SECURE_KEYS.userId;

export interface StoredSession {
  token: string;
  userId: string;
}

export async function saveSession(session: StoredSession): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, session.token),
    SecureStore.setItemAsync(USER_ID_KEY, session.userId),
  ]);
}

export async function readSession(): Promise<StoredSession | null> {
  const [token, userId] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_ID_KEY),
  ]);
  if (!token || !userId) return null;
  return { token, userId };
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_ID_KEY),
  ]);
}
