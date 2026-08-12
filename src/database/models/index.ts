/**
 * Domain models. Field shapes are derived from the prototype's seeded state
 * (`profiles`, `meds`, `appts`, `sym`, `pets`, `vaccines`, `vetAppts`, `caregivers`)
 * and normalized (stable FKs instead of array indices, explicit enums).
 */
import type { SyncMetadata } from '../../types/sync';

export type MedicationForm = 'pill' | 'syrup' | 'capsule' | 'drops' | 'injection';
export type TreatmentKind = 'permanent' | 'temporary';
export type MedicationStatus = 'ok' | 'due' | 'administered' | 'pending' | 'scheduled';
export type OwnerType = 'person' | 'pet';
export type TemperatureUnit = 'C' | 'F';
export type DoseStatus = 'administered' | 'postponed' | 'skipped';
export type ReminderCadence = 'once' | 'daily' | 'weekly' | 'monthly';
export type CaregiverTag = 'owner' | 'active';
export type AgeUnit = 'y' | 'm';

export interface User extends SyncMetadata {
  email: string;
  name: string;
  role: string;
  passwordHash: string;
  avatar: string | null;
}

/** A person profile ("persona"). */
export interface Profile extends SyncMetadata {
  userId: string;
  name: string;
  ageNum: number | null;
  birthDate: string | null;
  weight: number | null;
  height: number | null;
  allergy: string | null;
  role: string | null;
  color: string;
  initial: string;
  photo: string | null;
  isOwner: boolean;
}

export interface Pet extends SyncMetadata {
  userId: string;
  name: string;
  animalType: string;
  breed: string | null;
  age: string | null;
  ageUnit: AgeUnit;
  weight: number | null;
  color: string;
  initial: string;
  photo: string | null;
}

export interface Medication extends SyncMetadata {
  ownerType: OwnerType;
  ownerId: string;
  name: string;
  form: MedicationForm;
  dose: string;
  intervalHours: number;
  startTime: string; // "08:00"
  durationDays: number;
  treatmentKind: TreatmentKind;
  startDate: string; // ISO date
  icon: string;
  isActive: boolean;
  status: MedicationStatus;
}

export interface Appointment extends SyncMetadata {
  profileId: string;
  doctor: string;
  date: string;
  time: string;
  remindDay: boolean;
  remindHour: boolean;
  remindAt: boolean;
  notes: string | null;
}

export interface Symptom extends SyncMetadata {
  profileId: string;
  loggedAt: number;
  items: string[]; // stored as JSON
  custom: string[]; // stored as JSON
  temperature: number | null;
  tempUnit: TemperatureUnit;
  note: string | null;
}

export interface PersonVaccine extends SyncMetadata {
  profileId: string;
  name: string;
  date: string;
  reminder: ReminderCadence;
}

export interface PetVaccine extends SyncMetadata {
  petId: string;
  name: string;
  date: string;
  alarm: boolean;
}

export interface VetAppointment extends SyncMetadata {
  petId: string;
  vet: string;
  date: string;
  time: string;
  description: string | null;
}

export interface TrackingRecord extends SyncMetadata {
  profileId: string;
  type: string; // 'blood_pressure' | 'glucose' | custom label
  value: string;
  recordedAt: number;
  reminder: ReminderCadence;
}

export interface DoseHistory extends SyncMetadata {
  medicationId: string;
  profileId: string;
  scheduledAt: number;
  actualAt: number | null;
  caregiverId: string | null;
  status: DoseStatus;
}

export interface Caregiver extends SyncMetadata {
  profileId: string;
  name: string;
  role: string;
  tag: CaregiverTag;
  invitedEmail: string | null;
}
