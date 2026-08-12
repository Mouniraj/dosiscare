import { SECURE_KEYS } from '../constants/config';

/**
 * Web-only fallback for the session store. Expo Secure Store has no web
 * implementation; this preview build uses `localStorage` so login/register
 * flows can be exercised in the browser. DEV/PREVIEW only — native builds
 * use the real keystore/keychain-backed Secure Store (see `secureStore.ts`).
 */

const TOKEN_KEY = SECURE_KEYS.authToken;
const USER_ID_KEY = SECURE_KEYS.userId;

export interface StoredSession {
  token: string;
  userId: string;
}

const store = () => (typeof window !== 'undefined' ? window.localStorage : null);

export async function saveSession(session: StoredSession): Promise<void> {
  const s = store();
  if (!s) return;
  s.setItem(TOKEN_KEY, session.token);
  s.setItem(USER_ID_KEY, session.userId);
}

export async function readSession(): Promise<StoredSession | null> {
  const s = store();
  if (!s) return null;
  const token = s.getItem(TOKEN_KEY);
  const userId = s.getItem(USER_ID_KEY);
  if (!token || !userId) return null;
  return { token, userId };
}

export async function clearSession(): Promise<void> {
  const s = store();
  if (!s) return;
  s.removeItem(TOKEN_KEY);
  s.removeItem(USER_ID_KEY);
}
