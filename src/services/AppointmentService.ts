import type { Appointment } from '../database/models';
import { appointmentRepository, profileRepository } from '../database/repositories';

export interface AppointmentInput {
  profileId: string;
  doctor: string;
  date: string;
  time: string;
  remindDay: boolean;
  remindHour: boolean;
  remindAt: boolean;
  notes: string | null;
}

/** An appointment enriched with its persona's display fields for the UI. */
export interface AppointmentWithProfile extends Appointment {
  profileName: string;
  profileColor: string;
  profileInitial: string;
}

/**
 * Domain service for medical appointments. Appointments belong to a persona;
 * `list` resolves them to the current user's profiles and attaches display data.
 */
export const AppointmentService = {
  async list(userId: string): Promise<AppointmentWithProfile[]> {
    const profiles = await profileRepository.findByUserId(userId);
    const byId = new Map(profiles.map((p) => [p.id, p]));
    const appointments = await appointmentRepository.findAllChronological();
    return appointments
      .filter((a) => byId.has(a.profileId))
      .map((a) => {
        const p = byId.get(a.profileId)!;
        return { ...a, profileName: p.name, profileColor: p.color, profileInitial: p.initial };
      });
  },

  get(id: string): Promise<Appointment | null> {
    return appointmentRepository.findById(id);
  },

  create(input: AppointmentInput): Promise<Appointment> {
    return appointmentRepository.create({ ...input, doctor: input.doctor.trim() });
  },

  async update(id: string, input: AppointmentInput): Promise<void> {
    await appointmentRepository.update(id, { ...input, doctor: input.doctor.trim() });
  },

  remove(id: string): Promise<void> {
    return appointmentRepository.softDelete(id);
  },
};
