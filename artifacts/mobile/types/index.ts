export type DoctorSpecialty =
  | 'General Practitioner'
  | 'Cardiologist'
  | 'Dermatologist'
  | 'Pediatrician'
  | 'Neurologist'
  | 'Orthopedic'
  | 'Gynecologist'
  | 'Psychiatrist';

export interface Doctor {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  isAvailable: boolean;
  consultationFee: number;
  avatarInitials: string;
  avatarColor: string;
  bio: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  specialties: DoctorSpecialty[];
  openingHours: string;
  isOpen: boolean;
  phone: string;
  lat?: number;
  lng?: number;
}

// ── Home Healthcare Orders ────────────────────────────────────────────
export type HomeHealthcareOrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type HomeHealthcareCareType =
  | 'wound_care'
  | 'iv_therapy'
  | 'medication_administration'
  | 'vitals_monitoring'
  | 'physiotherapy'
  | 'post_op_care'
  | 'other';

export interface HomeHealthcareOrder {
  id: string;
  patientName: string;
  patientPhone: string;
  address: string;
  careType: HomeHealthcareCareType;
  notes?: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedNurseId: string;
  assignedNurseName: string;
  priority: 'urgent' | 'routine';
  status: HomeHealthcareOrderStatus;
  createdAt: string;
}

export type AppointmentType = 'virtual' | 'home_visit' | 'clinic';
export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  type: AppointmentType;
  doctorName: string;
  specialty: DoctorSpecialty;
  date: string;
  time: string;
  status: AppointmentStatus;
  locationOrMode: string;
  notes?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  isAvailable: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  bloodType: string;
  dateOfBirth: string;
  emergencyContact: string;
}

export interface HealthRecord {
  id: string;
  type: 'vital' | 'allergy' | 'medication' | 'condition';
  label: string;
  value: string;
  icon: string;
}

// ── Role system ─────────────────────────────────────────────────────
export type AppRole = 'patient' | 'doctor' | 'nurse' | 'admin';

export interface StaffUser {
  id: string;
  role: 'doctor' | 'nurse';
  name: string;
  phone: string;
  specialty?: DoctorSpecialty;
  clinicId: string;
  clinicName: string;
  addedAt: string;
  active: boolean;
}

// ── Medications ──────────────────────────────────────────────────────
export type MedicationForm =
  | 'tablet'
  | 'capsule'
  | 'liquid'
  | 'injection'
  | 'cream'
  | 'drops'
  | 'patch'
  | 'inhaler';

export type DoseStatus = 'pending' | 'taken' | 'missed' | 'snoozed';

export interface MedicationDoseLog {
  scheduledTime: string;
  status: DoseStatus;
  respondedAt?: string;
}

export interface MedicationDayLog {
  date: string; // YYYY-MM-DD
  doses: MedicationDoseLog[];
}

export interface Medication {
  id: string;
  name: string;
  form: MedicationForm;
  concentration: string;
  frequencyPerDay: number;
  scheduledTimes: string[]; // ['08:00', '20:00']
  durationDays: number; // -1 = ongoing
  startDate: string; // YYYY-MM-DD
  instructions?: string;
  prescribedBy?: string;
  color: string;
  notificationIds: string[];
  active: boolean;
  logs: MedicationDayLog[];
}

// ── Health indicators ────────────────────────────────────────────────
export type HealthMetricType = 'heartRate' | 'steps' | 'glucose' | 'bloodPressure' | 'oxygenSaturation';

export interface HealthMetric {
  type: HealthMetricType;
  value: number;
  systolic?: number; // blood pressure
  diastolic?: number;
  unit: string;
  timestamp: string;
  source: 'apple_health' | 'google_health' | 'manual' | 'mock';
}

export interface HealthSnapshot {
  metrics: Partial<Record<HealthMetricType, HealthMetric>>;
  lastSynced: string | null;
  connected: boolean;
}
