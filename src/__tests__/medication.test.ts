/// <reference types="jest" />
import { computeNextDose, formatSchedule, iconForForm, statusBadge } from '../utils/medication';

describe('computeNextDose', () => {
  const med = { startDate: '2020-01-01', startTime: '08:00', intervalHours: 8 };

  it('returns a future dose aligned to the interval', () => {
    const from = new Date('2020-01-02T09:00:00').getTime();
    const next = computeNextDose(med, from).getTime();
    const start = new Date('2020-01-01T08:00:00').getTime();
    expect(next).toBeGreaterThan(from);
    expect((next - start) % (8 * 3_600_000)).toBe(0);
  });

  it('returns the start when the treatment has not begun', () => {
    const from = new Date('2019-12-31T00:00:00').getTime();
    const next = computeNextDose(med, from).getTime();
    expect(next).toBe(new Date('2020-01-01T08:00:00').getTime());
  });
});

describe('medication helpers', () => {
  it('maps status to a badge tone', () => {
    expect(statusBadge('administered').tone).toBe('ok');
    expect(statusBadge('due').tone).toBe('warn');
    expect(statusBadge('scheduled').tone).toBe('info');
  });

  it('formats the schedule string', () => {
    expect(formatSchedule({ intervalHours: 8, startTime: '08:00' })).toBe('cada 8 h · 08:00');
  });

  it('resolves an icon per form', () => {
    expect(iconForForm('drops')).toBe('water-drop');
    expect(iconForForm('injection')).toBe('vaccines');
  });
});
