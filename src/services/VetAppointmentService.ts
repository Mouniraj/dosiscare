import type { VetAppointment } from '../database/models';
import { vetAppointmentRepository } from '../database/repositories';

export interface VetAppointmentInput {
  vet: string;
  date: string;
  time: string;
  description: string | null;
}

/** Domain service for veterinary appointments (SQLite, Offline First). */
export const VetAppointmentService = {
  list(petId: string): Promise<VetAppointment[]> {
    return vetAppointmentRepository.findByPetId(petId);
  },
  create(petId: string, input: VetAppointmentInput): Promise<VetAppointment> {
    return vetAppointmentRepository.create({ petId, ...input, vet: input.vet.trim() });
  },
  async update(id: string, input: VetAppointmentInput): Promise<void> {
    await vetAppointmentRepository.update(id, { ...input, vet: input.vet.trim() });
  },
  remove(id: string): Promise<void> {
    return vetAppointmentRepository.softDelete(id);
  },
};
