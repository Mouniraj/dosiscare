import type { Medication } from '../database/models';

export interface DoseOccurrence {
  /** "08:00" — display time. */
  time: string;
  /** Epoch ms of the scheduled dose — stable key for dose-history matching. */
  at: number;
}

/**
 * Returns every dose occurrence (time + timestamp) a medication is scheduled for
 * on a given calendar date, derived from its start datetime + interval, bounded
 * by the treatment window for temporary treatments.
 */
export function doseOccurrencesOnDate(
  med: Pick<Medication, 'startDate' | 'startTime' | 'intervalHours' | 'durationDays' | 'treatmentKind'>,
  dateIso: string,
): DoseOccurrence[] {
  const dayStart = new Date(`${dateIso}T00:00:00`).getTime();
  const dayEnd = dayStart + 86_400_000;
  const start = new Date(`${med.startDate}T${med.startTime}:00`).getTime();
  if (Number.isNaN(start)) return [];

  const windowEnd =
    med.treatmentKind === 'temporary' ? start + med.durationDays * 86_400_000 : Number.POSITIVE_INFINITY;
  const intervalMs = Math.max(1, med.intervalHours) * 3_600_000;

  let t = start >= dayStart ? start : start + Math.ceil((dayStart - start) / intervalMs) * intervalMs;

  const occurrences: DoseOccurrence[] = [];
  while (t < dayEnd && t < windowEnd) {
    occurrences.push({
      time: new Date(t).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false }),
      at: t,
    });
    t += intervalMs;
  }
  return occurrences;
}
