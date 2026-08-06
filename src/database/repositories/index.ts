/**
 * Repository barrel. Each domain entity gets its own repository extending
 * BaseRepository; they are the ONLY place SQL is written. Concrete entity
 * repositories are added per feature phase.
 */
export { BaseRepository } from './BaseRepository';
export type { EntityColumns, Row, SqlValue } from './BaseRepository';
export { SettingsRepository, settingsRepository } from './SettingsRepository';
export { UserRepository, userRepository } from './UserRepository';
export { ProfileRepository, profileRepository } from './ProfileRepository';
export { MedicationRepository, medicationRepository } from './MedicationRepository';
export { PetRepository, petRepository } from './PetRepository';
export { AppointmentRepository, appointmentRepository } from './AppointmentRepository';
export { DoseHistoryRepository, doseHistoryRepository } from './DoseHistoryRepository';
export { PersonVaccineRepository, personVaccineRepository } from './PersonVaccineRepository';
export { PetVaccineRepository, petVaccineRepository } from './PetVaccineRepository';
export { VetAppointmentRepository, vetAppointmentRepository } from './VetAppointmentRepository';
export { SymptomRepository, symptomRepository } from './SymptomRepository';
