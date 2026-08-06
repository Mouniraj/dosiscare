import { create } from 'zustand';

import type { MedicationFormValues } from '../validations/medicationSchema';

interface ScanDraftState {
  draft: MedicationFormValues | null;
  setDraft: (draft: MedicationFormValues) => void;
  /** Returns the pending draft (if any) and clears it — one-shot handoff. */
  consumeDraft: () => MedicationFormValues | null;
}

/**
 * Carries a scanned-prescription draft from the scan screen to the medication
 * form. Kept out of route params (many fields) and consumed exactly once.
 */
export const useScanDraftStore = create<ScanDraftState>((set, get) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  consumeDraft: () => {
    const { draft } = get();
    if (draft) set({ draft: null });
    return draft;
  },
}));
