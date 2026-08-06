export interface Migration {
  /** Monotonic version number; must be unique and ordered. */
  version: number;
  /** Human-readable label for logging. */
  name: string;
  /** SQL executed inside a transaction when upgrading to this version. */
  up: string;
}
