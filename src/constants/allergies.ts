import type { IconName } from '../components';

export interface AllergyOption {
  id: string;
  label: string;
  icon: IconName;
}

/** Common medication/food allergies suggested at profile creation. */
export const COMMON_ALLERGIES: AllergyOption[] = [
  { id: 'penicillin', label: 'Penicilina', icon: 'medication' },
  { id: 'aspirin', label: 'Aspirina', icon: 'medical-services' },
  { id: 'ibuprofen', label: 'Ibuprofeno', icon: 'water-drop' },
  { id: 'nsaid', label: 'AINEs', icon: 'science' },
  { id: 'sulfa', label: 'Sulfamidas', icon: 'science' },
  { id: 'lactose', label: 'Lactosa', icon: 'blur-on' },
];

/** Explicit "no allergies" chip — clearing selection alone is ambiguous. */
export const NO_ALLERGIES_ID = 'none';
export const NO_ALLERGIES_LABEL = 'Sin alergias';
