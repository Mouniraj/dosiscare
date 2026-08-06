import { AuthError } from '../services/AuthService';
import type { TFn, TranslationKey } from './index';

/** Maps an error to a localized, user-facing message. */
export function authErrorMessage(t: TFn, error: Error): string {
  if (error instanceof AuthError) return t(`authErr.${error.code}` as TranslationKey);
  return t('authErr.generic');
}
