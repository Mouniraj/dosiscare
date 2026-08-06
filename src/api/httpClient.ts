import axios, { type AxiosInstance } from 'axios';

import { API_BASE_URL } from '../constants/config';

/**
 * Shared Axios instance for the future backend. No server exists yet — services
 * are stubbed — but the transport and interceptors are wired so adding real
 * endpoints later requires no structural change.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Auth token injector. The token is read from Secure Store by the AuthService
 * and set here; kept as a setter to avoid a hard dependency cycle.
 */
export function setAuthToken(token: string | null): void {
  if (token) {
    httpClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete httpClient.defaults.headers.common.Authorization;
  }
}
