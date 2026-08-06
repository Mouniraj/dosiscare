import { BackendUnavailableError } from '../errors';
import { httpClient } from '../httpClient';

/**
 * Remote medication endpoints (Axios). Stubbed until a backend exists; the
 * MedicationService operates on SQLite and will push through here when syncing.
 */
async function notImplemented(): Promise<never> {
  void httpClient;
  throw new BackendUnavailableError();
}

export const medicationApi = {
  list: (_ownerId: string): Promise<never> => notImplemented(),
  create: (_payload: unknown): Promise<never> => notImplemented(),
  update: (_id: string, _payload: unknown): Promise<never> => notImplemented(),
  remove: (_id: string): Promise<never> => notImplemented(),
};
