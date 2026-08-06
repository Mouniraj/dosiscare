import * as Notifications from 'expo-notifications';

import { medicationRepository, petRepository, profileRepository } from '../database/repositories';
import type { TFn } from '../i18n';
import { AppointmentService } from './AppointmentService';
import { computeNextDose } from '../utils/medication';

/**
 * Local notifications for medication doses and medical appointments. Scheduling
 * is derived from SQLite data (Offline First) — no server push involved. Bodies
 * are localized by passing the active translator in.
 */

let configured = false;

/** Installs the foreground handler once. Call at app start. */
export function configureNotifications(): void {
  if (configured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  configured = true;
}

/** Requests permission; returns whether notifications are allowed. */
export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

const at = (date: Date): Notifications.DateTriggerInput => ({
  type: Notifications.SchedulableTriggerInputTypes.DATE,
  date,
});

async function scheduleAt(date: Date, title: string, body: string): Promise<void> {
  if (date.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: at(date) });
}

/**
 * Cancels all scheduled notifications and re-schedules upcoming medication doses
 * and appointment reminders for the user. Idempotent — safe to call on changes.
 */
export async function syncNotifications(userId: string, t: TFn): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const [profiles, pets] = await Promise.all([
    profileRepository.findByUserId(userId),
    petRepository.findByUserId(userId),
  ]);
  const ownerName = new Map<string, string>();
  profiles.forEach((p) => ownerName.set(p.id, p.name));
  pets.forEach((p) => ownerName.set(p.id, p.name));

  // Next dose per active medication. Bodies stay generic so health data never
  // appears on the lock screen.
  const meds = await medicationRepository.findAll();
  for (const med of meds) {
    if (!med.isActive) continue;
    const owner = ownerName.get(med.ownerId);
    if (!owner) continue;
    await scheduleAt(computeNextDose(med), t('notif.medTitle'), t('notif.medReminder'));
  }

  // Appointment reminders (at time, 1h before, day before).
  const appointments = await AppointmentService.list(userId);
  for (const appt of appointments) {
    const when = new Date(`${appt.date}T${appt.time}:00`).getTime();
    if (Number.isNaN(when)) continue;
    const title = t('notif.apptTitle');
    const body = t('notif.apptReminder');
    if (appt.remindAt) await scheduleAt(new Date(when), title, body);
    if (appt.remindHour) await scheduleAt(new Date(when - 3_600_000), title, body);
    if (appt.remindDay) await scheduleAt(new Date(when - 86_400_000), title, body);
  }
}

/** Cancels every scheduled notification (when the user turns reminders off). */
export function cancelAllNotifications(): Promise<void> {
  return Notifications.cancelAllScheduledNotificationsAsync();
}
