/**
 * Raised by API service stubs while no backend exists. Domain services catch it
 * and fall back to the local SQLite implementation — the Offline-First contract.
 */
export class BackendUnavailableError extends Error {
  constructor() {
    super('Backend no configurado. Operando en modo offline.');
    this.name = 'BackendUnavailableError';
  }
}
