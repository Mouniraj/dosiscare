/// <reference types="jest" />
import { doseOccurrencesOnDate } from '../utils/agenda';

const med = {
  startDate: '2026-01-10',
  startTime: '08:00',
  intervalHours: 8,
  durationDays: 5,
  treatmentKind: 'temporary' as const,
};

describe('doseOccurrencesOnDate', () => {
  it('expands a day into its dose times', () => {
    const occ = doseOccurrencesOnDate(med, '2026-01-10');
    expect(occ.map((o) => o.time)).toEqual(['08:00', '16:00']);
  });

  it('spaces timestamps by the interval', () => {
    const occ = doseOccurrencesOnDate(med, '2026-01-10');
    expect(occ[1].at - occ[0].at).toBe(8 * 3_600_000);
  });

  it('returns nothing before the treatment starts', () => {
    expect(doseOccurrencesOnDate(med, '2026-01-09')).toEqual([]);
  });

  it('stops after the treatment window for temporary treatments', () => {
    // durationDays 5 → window ends 2026-01-15 08:00; the 16th has none.
    expect(doseOccurrencesOnDate(med, '2026-01-16')).toEqual([]);
  });

  it('keeps producing doses for permanent treatments', () => {
    const permanent = { ...med, treatmentKind: 'permanent' as const };
    expect(doseOccurrencesOnDate(permanent, '2026-02-01').length).toBeGreaterThan(0);
  });
});
