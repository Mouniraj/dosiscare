import type { IconName } from '../components/ui/Icon';

export type PetType = 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'other';

/** Selectable animal types with Spanish labels (icon is the generic paw). */
export const PET_TYPES: { value: PetType; label: string }[] = [
  { value: 'dog', label: 'Perro' },
  { value: 'cat', label: 'Gato' },
  { value: 'bird', label: 'Ave' },
  { value: 'rabbit', label: 'Conejo' },
  { value: 'fish', label: 'Pez' },
  { value: 'other', label: 'Otro' },
];

export function petTypeLabel(type: string): string {
  return PET_TYPES.find((t) => t.value === type)?.label ?? 'Otro';
}

/** Icon representing a pet (MaterialIcons has a single generic paw). */
export const PET_ICON: IconName = 'pets';
