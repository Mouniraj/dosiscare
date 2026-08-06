import type { MedicationFormValues } from '../validations/medicationSchema';

/**
 * Turns a prescription photo into a medication draft. In production this uploads
 * the image to the backend / an AI vision model and maps the structured response
 * to the form shape. There is no backend or model key in this offline build, so
 * the parse is simulated — the integration point is the single call below.
 */
export const PrescriptionScanService = {
  async scan(imageUri: string): Promise<MedicationFormValues> {
    // Production: const { data } = await httpClient.post('/ai/prescription', { imageUri });
    void imageUri;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      name: 'Amoxicilina',
      form: 'pill',
      dose: '500 mg',
      intervalHours: '8',
      startTime: '08:00',
      durationDays: '7',
      treatmentKind: 'temporary',
    };
  },
};
