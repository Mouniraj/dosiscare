/** Small presentation helpers shared across screens. */

/** "3 años" / "1 año" / "—" when unknown. */
export function formatAge(ageNum: number | null): string {
  if (ageNum === null || Number.isNaN(ageNum)) return '—';
  return `${ageNum} ${ageNum === 1 ? 'año' : 'años'}`;
}

/** First non-space character, uppercased, for avatar initials. */
export function initialFromName(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

/** "4 años" / "6 meses" / "—" for a pet's age + unit. */
export function formatPetAge(age: string | null, unit: 'y' | 'm'): string {
  if (!age || age.trim() === '') return '—';
  const n = Number(age);
  if (unit === 'm') return `${age} ${n === 1 ? 'mes' : 'meses'}`;
  return `${age} ${n === 1 ? 'año' : 'años'}`;
}

/** Today's date as an ISO calendar date (YYYY-MM-DD). */
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
