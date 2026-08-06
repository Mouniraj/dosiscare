import type { BadgeTone } from '../components/ui/Badge';
import type { IconName } from '../components/ui/Icon';
import type { DoseStatus, Medication, MedicationForm, MedicationStatus } from '../database/models';

/** Selectable medication forms with their display label and icon. */
export const MEDICATION_FORMS: { value: MedicationForm; label: string; icon: IconName }[] = [
  { value: 'pill', label: 'Pastilla', icon: 'medication' },
  { value: 'syrup', label: 'Jarabe', icon: 'medication-liquid' },
  { value: 'capsule', label: 'Cápsula', icon: 'medication' },
  { value: 'drops', label: 'Gotas', icon: 'water-drop' },
  { value: 'injection', label: 'Inyección', icon: 'vaccines' },
];

export function iconForForm(form: MedicationForm): IconName {
  return MEDICATION_FORMS.find((f) => f.value === form)?.icon ?? 'medication';
}

/** "cada 8 h · 08:00" */
export function formatSchedule(med: Pick<Medication, 'intervalHours' | 'startTime'>): string {
  const every = med.intervalHours === 24 ? 'cada 24 h' : `cada ${med.intervalHours} h`;
  return `${every} · ${med.startTime}`;
}

/** "Permanente" or "5 días" */
export function formatDuration(
  med: Pick<Medication, 'treatmentKind' | 'durationDays'>,
): string {
  if (med.treatmentKind === 'permanent') return 'Permanente';
  return `${med.durationDays} ${med.durationDays === 1 ? 'día' : 'días'}`;
}

/** Computes the next scheduled dose datetime from the treatment's cadence. */
export function computeNextDose(
  med: Pick<Medication, 'startDate' | 'startTime' | 'intervalHours'>,
  from: number = Date.now(),
): Date {
  const start = new Date(`${med.startDate}T${med.startTime}:00`).getTime();
  const intervalMs = Math.max(1, med.intervalHours) * 3_600_000;
  if (Number.isNaN(start) || from <= start) return new Date(start || from);
  const elapsed = from - start;
  const steps = Math.ceil(elapsed / intervalMs);
  return new Date(start + steps * intervalMs);
}

/** "14:00" — the time of the next dose. */
export function nextDoseLabel(
  med: Pick<Medication, 'startDate' | 'startTime' | 'intervalHours'>,
): string {
  const next = computeNextDose(med);
  return next.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** Maps a medication status to a status badge (label + tone). */
export function statusBadge(status: MedicationStatus): { label: string; tone: BadgeTone } {
  switch (status) {
    case 'administered':
      return { label: 'Administrada', tone: 'ok' };
    case 'due':
      return { label: 'Próxima dosis', tone: 'warn' };
    case 'pending':
      return { label: 'Pendiente', tone: 'warn' };
    case 'scheduled':
      return { label: 'Programada', tone: 'info' };
    case 'ok':
    default:
      return { label: 'Al día', tone: 'ok' };
  }
}

/** Display metadata for a logged dose outcome. */
export const DOSE_STATUS_META: Record<DoseStatus, { label: string; tone: BadgeTone; icon: IconName }> = {
  administered: { label: 'Administrada', tone: 'ok', icon: 'check-circle' },
  postponed: { label: 'Pospuesta', tone: 'warn', icon: 'schedule' },
  skipped: { label: 'Omitida', tone: 'danger', icon: 'cancel' },
};

/** All dose outcomes in display order (for action rows and filters). */
export const DOSE_STATUSES: DoseStatus[] = ['administered', 'postponed', 'skipped'];

