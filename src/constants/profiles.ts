/** Accent colors assigned to personas/pets, taken from the prototype palette. */
export const PROFILE_COLORS = [
  '#2f6bed',
  '#17a673',
  '#f5931f',
  '#7c5cff',
  '#e5484d',
  '#0ea5e9',
] as const;

/** Deterministic color pick based on how many profiles already exist. */
export function pickProfileColor(index: number): string {
  return PROFILE_COLORS[index % PROFILE_COLORS.length];
}
