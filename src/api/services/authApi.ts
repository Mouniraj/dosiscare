import { BackendUnavailableError } from '../errors';
import { httpClient } from '../httpClient';

/**
 * Remote auth endpoints (Axios). No backend exists yet, so every call throws a
 * typed BackendUnavailableError. The AuthService catches this and falls back to
 * the local SQLite implementation — Offline First. When the API ships, only the
 * bodies here change; the AuthService contract stays the same.
 */

export { BackendUnavailableError };

export interface RemoteAuthResponse {
  token: string;
  user: { id: string; email: string; name: string; role: string; avatar: string | null };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

async function notImplemented(): Promise<never> {
  // Placeholder for the real request, e.g.:
  //   const { data } = await httpClient.post<RemoteAuthResponse>('/auth/login', payload);
  //   return data;
  void httpClient;
  throw new BackendUnavailableError();
}

export const authApi = {
  login: (_payload: LoginPayload): Promise<RemoteAuthResponse> => notImplemented(),
  register: (_payload: RegisterPayload): Promise<RemoteAuthResponse> => notImplemented(),
  requestPasswordReset: (_email: string): Promise<void> => notImplemented(),
};
