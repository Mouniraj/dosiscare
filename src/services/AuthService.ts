import { setAuthToken } from '../api/httpClient';
import type { User } from '../database/models';
import { userRepository } from '../database/repositories';
import { generateId } from '../utils/id';
import { hashPassword, verifyPassword } from '../utils/password';
import { clearSession, readSession, saveSession } from './secureStore';

/** Seeded demo account from the prototype (offline sign-in works out of the box). */
export const DEMO_EMAIL = 'ana.martinez@gmail.com';
export const DEMO_PASSWORD = '123456';
/** Local stand-in for a backend OTP during password recovery. */
export const DEMO_RESET_CODE = '123456';

export type AuthErrorCode =
  | 'noAccount'
  | 'wrongPassword'
  | 'emailExists'
  | 'invalidCode'
  | 'generic';

/** Auth error carrying a stable code; screens translate it via `authErr.<code>`. */
export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
  }
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ResetInput {
  email: string;
  code: string;
  password: string;
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

/** Issues a local session token and persists it in Secure Store. */
async function establishSession(user: User): Promise<User> {
  const token = generateId();
  await saveSession({ token, userId: user.id });
  setAuthToken(token);
  return user;
}

/**
 * Domain authentication service. CRUD runs against SQLite today; each method is
 * shaped so that a future `authApi` call can be tried first with this as the
 * offline fallback. Screens/hooks never touch the repository or Secure Store
 * directly — they go through this service.
 */
export const AuthService = {
  /** Idempotently seeds the demo account so login works on a fresh install. */
  async seedDemoAccount(): Promise<User> {
    const existing = await userRepository.findByEmail(DEMO_EMAIL);
    if (existing) return existing;
    const passwordHash = await hashPassword(DEMO_PASSWORD);
    return userRepository.create({
      email: DEMO_EMAIL,
      name: 'Ana Martínez',
      role: 'owner',
      passwordHash,
      avatar: null,
    });
  },

  async login({ email, password }: Credentials): Promise<User> {
    const user = await userRepository.findByEmail(normalizeEmail(email));
    if (!user) throw new AuthError('noAccount');
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) throw new AuthError('wrongPassword');
    return establishSession(user);
  },

  async register({ name, email, password }: RegisterInput): Promise<User> {
    const normalized = normalizeEmail(email);
    const existing = await userRepository.findByEmail(normalized);
    if (existing) throw new AuthError('emailExists');
    const passwordHash = await hashPassword(password);
    const user = await userRepository.create({
      email: normalized,
      name: name.trim(),
      role: 'owner',
      passwordHash,
      avatar: null,
    });
    return establishSession(user);
  },

  /** Guest mode: a local, password-less account so their data still has an owner. */
  async continueAsGuest(): Promise<User> {
    const user = await userRepository.create({
      email: `guest+${generateId()}@local.dosiscare`,
      name: 'Invitado',
      role: 'guest',
      passwordHash: '',
      avatar: null,
    });
    return establishSession(user);
  },

  /** Step 1 of recovery: verify the account exists (a backend would send an OTP). */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await userRepository.findByEmail(normalizeEmail(email));
    if (!user) throw new AuthError('noAccount');
  },

  /** Final step: validate the code and set the new password. */
  async resetPassword({ email, code, password }: ResetInput): Promise<void> {
    if (code.trim() !== DEMO_RESET_CODE) {
      throw new AuthError('invalidCode');
    }
    const user = await userRepository.findByEmail(normalizeEmail(email));
    if (!user) throw new AuthError('noAccount');
    const passwordHash = await hashPassword(password);
    await userRepository.update(user.id, { passwordHash });
  },

  /** Clears the persisted session/token. Caller resets the session store. */
  async logout(): Promise<void> {
    await clearSession();
    setAuthToken(null);
  },

  /** Restores a persisted session on app start, or null if none/invalid. */
  async restoreSession(): Promise<User | null> {
    const stored = await readSession();
    if (!stored) return null;
    const user = await userRepository.findById(stored.userId);
    if (!user) {
      await clearSession();
      return null;
    }
    setAuthToken(stored.token);
    return user;
  },
};
