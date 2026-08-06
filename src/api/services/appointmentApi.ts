import { BackendUnavailableError } from '../errors';
import { httpClient } from '../httpClient';

/**
 * Remote appointment (cita médica) endpoints (Axios). Stubbed until a backend
 * exists; the AppointmentService operates on SQLite and syncs through here later.
 */
async function notImplemented(): Promise<never> {
  void httpClient;
  throw new BackendUnavailableError();
}

export const appointmentApi = {
  list: (_userId: string): Promise<never> => notImplemented(),
  create: (_payload: unknown): Promise<never> => notImplemented(),
  update: (_id: string, _payload: unknown): Promise<never> => notImplemented(),
  remove: (_id: string): Promise<never> => notImplemented(),
};
