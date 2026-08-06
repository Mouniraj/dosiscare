import { APP_SCHEME } from '../constants/config';

/**
 * Deep-linking prefixes. Expo Router derives most routes automatically from the
 * `app/` folder; these prefixes let notifications open a specific record
 * (e.g. `dosiscare://med/<id>`).
 */
export const linkingPrefixes = [`${APP_SCHEME}://`, `https://dosiscare.app`];
