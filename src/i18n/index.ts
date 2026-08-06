import type { Language } from '../constants/config';
import { en } from './translations/en';
import { es, type TranslationKey } from './translations/es';
import { pt } from './translations/pt';

export type { TranslationKey };
export type TranslateParams = Record<string, string | number>;
export type TFn = (key: TranslationKey, params?: TranslateParams) => string;

const DICTS: Record<Language, Record<TranslationKey, string>> = { es, en, pt };

/** Builds a translator for a language, with `{param}` interpolation and es fallback. */
export function makeTranslator(language: Language): TFn {
  const dict = DICTS[language] ?? es;
  return (key, params) => {
    let text = dict[key] ?? es[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  };
}
