/**
 * Spacing and radius scale, matching the prototype's rhythm
 * (cards radius 16–18, action chips 36×36, device frame radius 36–46).
 */

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  card: 18,
  sheet: 24,
  pill: 100,
} as const;

/** Standard action-chip size from the prototype (ver/editar/duplicar/eliminar). */
export const actionChipSize = 36;

export type SpacingToken = keyof typeof spacing;
