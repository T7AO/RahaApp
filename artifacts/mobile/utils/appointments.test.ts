import {
  createClinicAppointment,
  createHomeVisitAppointment,
  createVirtualAppointment,
} from './appointments';
import { Clinic, Doctor, TimeSlot } from '@/types';

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const day = { label: 'Today', short: '20 Jun', full: '20 June 2026', iso: '2026-06-20' };
const slot: TimeSlot = { id: 'slot-1', time: '09:00', isAvailable: true };
const doctor: Doctor = {
  id: 'doctor-1',
  name: 'Dr. Sara',
  specialty: 'Cardiologist',
  rating: 4.8,
  reviewCount: 120,
  experienceYears: 8,
  isAvailable: true,
  consultationFee: 150,
  avatarInitials: 'SA',
  avatarColor: '#0D8A7A',
  bio: 'Cardiology consultant',
};
const clinic: Clinic = {
  id: 'clinic-1',
  name: 'Raha Clinic',
  address: 'Riyadh',
  distanceKm: 2.4,
  rating: 4.7,
  reviewCount: 90,
  specialties: ['Cardiologist'],
  openingHours: '9 AM - 9 PM',
  isOpen: true,
  phone: '0500000000',
};

const virtual = createVirtualAppointment(doctor, day, slot);
assert(virtual.type === 'virtual', 'virtual appointment type is set');
assert(virtual.doctorName === doctor.name, 'virtual appointment keeps doctor name');
assert(virtual.date === day.full && virtual.time === slot.time, 'virtual appointment keeps selected date/time');

const homeVisit = createHomeVisitAppointment(day, slot, 'Fever');
assert(homeVisit.type === 'home_visit', 'home visit appointment type is set');
assert(homeVisit.notes === 'Fever', 'home visit keeps symptoms as notes');

const clinicAppointment = createClinicAppointment(clinic, 'Cardiologist', day, slot);
assert(clinicAppointment.type === 'clinic', 'clinic appointment type is set');
assert(clinicAppointment.locationOrMode === clinic.name, 'clinic appointment keeps clinic name');
