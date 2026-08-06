/** Predefined symptom keys; labels are resolved via i18n (`symptom.<key>`). */
export const SYMPTOM_KEYS = [
  'fever',
  'headache',
  'cough',
  'soreThroat',
  'nausea',
  'vomiting',
  'diarrhea',
  'fatigue',
] as const;

export type SymptomKey = (typeof SYMPTOM_KEYS)[number];
