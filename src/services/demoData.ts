import type { EntityColumns } from '../database/repositories';
import {
  appointmentRepository,
  medicationRepository,
  petRepository,
  petVaccineRepository,
  profileRepository,
  vetAppointmentRepository,
} from '../database/repositories';
import type { Medication, Pet, Profile } from '../database/models';
import { todayIso } from '../utils/format';
import { addDaysIso } from '../utils/date';
import { iconForForm } from '../utils/medication';
import { AuthService } from './AuthService';

type SeedMed = Omit<
  EntityColumns<Medication>,
  'ownerType' | 'ownerId' | 'startDate' | 'icon'
>;

interface SeedProfile {
  profile: Omit<EntityColumns<Profile>, 'userId'>;
  meds: SeedMed[];
}

interface SeedPet {
  pet: Omit<EntityColumns<Pet>, 'userId'>;
  meds: SeedMed[];
}

/** Mirrors the prototype's seeded personas + treatments. */
const DEMO_PROFILES: SeedProfile[] = [
  {
    profile: {
      name: 'Sofía',
      ageNum: 3,
      birthDate: null,
      weight: 14,
      height: 96,
      allergy: 'Penicilina',
      role: null,
      color: '#2f6bed',
      initial: 'S',
      photo: null,
      isOwner: true,
    },
    meds: [
      { name: 'Paracetamol Jarabe', form: 'syrup', dose: '5 ml', intervalHours: 8, startTime: '08:00', durationDays: 5, treatmentKind: 'temporary', isActive: true, status: 'due' },
      { name: 'Amoxicilina', form: 'pill', dose: '250 mg', intervalHours: 12, startTime: '09:00', durationDays: 7, treatmentKind: 'temporary', isActive: true, status: 'ok' },
    ],
  },
  {
    profile: {
      name: 'Mateo',
      ageNum: 7,
      birthDate: null,
      weight: 22,
      height: 122,
      allergy: null,
      role: null,
      color: '#17a673',
      initial: 'M',
      photo: null,
      isOwner: false,
    },
    meds: [
      { name: 'Ibuprofeno', form: 'syrup', dose: '5 ml', intervalHours: 8, startTime: '14:00', durationDays: 5, treatmentKind: 'temporary', isActive: true, status: 'ok' },
    ],
  },
  {
    profile: {
      name: 'Abuela Rosa',
      ageNum: 72,
      birthDate: null,
      weight: 63,
      height: 158,
      allergy: 'Aspirina',
      role: null,
      color: '#f5931f',
      initial: 'R',
      photo: null,
      isOwner: false,
    },
    meds: [
      { name: 'Losartán', form: 'pill', dose: '50 mg', intervalHours: 24, startTime: '08:00', durationDays: 30, treatmentKind: 'permanent', isActive: true, status: 'ok' },
    ],
  },
];

/** Mirrors the prototype's seeded pets + treatments. */
const DEMO_PETS: SeedPet[] = [
  {
    pet: {
      name: 'Rocky',
      animalType: 'dog',
      breed: null,
      age: '4',
      ageUnit: 'y',
      weight: 12,
      color: '#7c5cff',
      initial: 'R',
      photo: null,
    },
    meds: [
      { name: 'Desparasitante', form: 'pill', dose: '1 tableta', intervalHours: 24, startTime: '09:00', durationDays: 30, treatmentKind: 'temporary', isActive: true, status: 'ok' },
    ],
  },
  {
    pet: {
      name: 'Michi',
      animalType: 'cat',
      breed: null,
      age: '2',
      ageUnit: 'y',
      weight: 4,
      color: '#17a673',
      initial: 'M',
      photo: null,
    },
    meds: [],
  },
];

/**
 * Seeds the demo account and its personas/pets/medications once, so a fresh
 * install has realistic data to explore. Idempotent: skips if the demo user
 * already has profiles. Runs at app start.
 */
export async function seedDemoData(): Promise<void> {
  const user = await AuthService.seedDemoAccount();
  const existing = await profileRepository.findByUserId(user.id);
  if (existing.length > 0) return;

  const startDate = todayIso();
  const profileByName: Record<string, string> = {};
  for (const entry of DEMO_PROFILES) {
    const profile = await profileRepository.create({ userId: user.id, ...entry.profile });
    profileByName[entry.profile.name] = profile.id;
    for (const med of entry.meds) {
      await medicationRepository.create({
        ownerType: 'person',
        ownerId: profile.id,
        startDate,
        icon: iconForForm(med.form),
        ...med,
      });
    }
  }

  // Upcoming demo appointments (relative to today so they stay in range).
  await appointmentRepository.create({
    profileId: profileByName['Sofía'],
    doctor: 'Dra. Ramírez',
    date: addDaysIso(startDate, 2),
    time: '11:30',
    remindDay: true,
    remindHour: true,
    remindAt: false,
    notes: 'Control pediátrico.',
  });
  await appointmentRepository.create({
    profileId: profileByName['Abuela Rosa'],
    doctor: 'Dr. Salinas',
    date: addDaysIso(startDate, 6),
    time: '09:00',
    remindDay: true,
    remindHour: false,
    remindAt: true,
    notes: null,
  });

  for (const entry of DEMO_PETS) {
    const pet = await petRepository.create({ userId: user.id, ...entry.pet });
    for (const med of entry.meds) {
      await medicationRepository.create({
        ownerType: 'pet',
        ownerId: pet.id,
        startDate,
        icon: iconForForm(med.form),
        ...med,
      });
    }
    // Rocky's vaccine + vet appointment from the prototype.
    if (entry.pet.name === 'Rocky') {
      await petVaccineRepository.create({
        petId: pet.id,
        name: 'Rabia',
        date: addDaysIso(startDate, 10),
        alarm: true,
      });
      await vetAppointmentRepository.create({
        petId: pet.id,
        vet: 'Dra. Laura Gómez',
        date: addDaysIso(startDate, 5),
        time: '11:00',
        description: 'Control anual y limpieza dental.',
      });
    }
  }
}
