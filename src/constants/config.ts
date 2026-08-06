/** App-wide constants and configuration keys. */

export const DATABASE_NAME = 'dosiscare.db';

/** Base URL for the future backend. No server exists yet; the API layer is stubbed. */
export const API_BASE_URL = 'https://api.dosiscare.app';

/** Secure Store keys (single source of truth, used by `services/secureStore.ts`). */
export const SECURE_KEYS = {
  authToken: 'dc_auth_token',
  userId: 'dc_user_id',
} as const;

/** Deep-linking scheme (must match app.json). */
export const APP_SCHEME = 'dosiscare';

export const SUPPORTED_LANGUAGES = ['es', 'en', 'pt'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = 'es';
