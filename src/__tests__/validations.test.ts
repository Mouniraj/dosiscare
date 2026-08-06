/// <reference types="jest" />
import type { TFn } from '../i18n';
import { makeMedicationSchema, toMedicationInput } from '../validations/medicationSchema';
import { makeProfileSchema, toProfileInput } from '../validations/profileSchema';

/** Fake translator returning the key — enough to assert which message fired. */
const t: TFn = (key) => key;

describe('medication schema', () => {
  const schema = makeMedicationSchema(t);

  it('accepts a valid medication', () => {
    const result = schema.safeParse({
      name: 'Paracetamol',
      form: 'syrup',
      dose: '5 ml',
      intervalHours: '8',
      startTime: '08:00',
      durationDays: '5',
      treatmentKind: 'temporary',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an out-of-range interval', () => {
    const result = schema.safeParse({
      name: 'Paracetamol',
      form: 'pill',
      dose: '1',
      intervalHours: '200',
      startTime: '08:00',
      durationDays: '5',
      treatmentKind: 'temporary',
    });
    expect(result.success).toBe(false);
  });

  it('converts form values into a typed input with a start date', () => {
    const input = toMedicationInput(
      {
        name: '  Amoxicilina ',
        form: 'pill',
        dose: '250 mg',
        intervalHours: '12',
        startTime: '09:00',
        durationDays: '7',
        treatmentKind: 'temporary',
      },
      '2026-08-05',
    );
    expect(input).toMatchObject({ name: 'Amoxicilina', intervalHours: 12, durationDays: 7, startDate: '2026-08-05' });
  });
});

describe('profile schema', () => {
  it('coerces optional numeric text to numbers or null', () => {
    const input = toProfileInput({ name: 'Sofía', ageNum: '3', weight: '', height: '96', allergy: '', role: 'Hija' });
    expect(input).toEqual({ name: 'Sofía', ageNum: 3, weight: null, height: 96, allergy: null, role: 'Hija' });
  });

  it('rejects a name shorter than 2 chars', () => {
    const result = makeProfileSchema(t).safeParse({ name: 'A', ageNum: '', weight: '', height: '', allergy: '', role: '' });
    expect(result.success).toBe(false);
  });
});
