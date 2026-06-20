import { Appointment, Clinic, Doctor, DoctorSpecialty, TimeSlot } from '@/types';
import { DayOption } from './dateTime';

function createAppointmentId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createVirtualAppointment(doctor: Doctor, day: DayOption, slot: TimeSlot): Appointment {
  return {
    id: createAppointmentId(),
    type: 'virtual',
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date: day.full,
    time: slot.time,
    status: 'upcoming',
    locationOrMode: 'Virtual',
  };
}

export function createHomeVisitAppointment(day: DayOption, slot: TimeSlot, symptoms: string): Appointment {
  return {
    id: createAppointmentId(),
    type: 'home_visit',
    doctorName: 'Raha Doctor',
    specialty: 'General Practitioner',
    date: day.full,
    time: slot.time,
    status: 'upcoming',
    locationOrMode: 'Home Visit',
    notes: symptoms,
  };
}

export function createClinicAppointment(
  clinic: Clinic,
  specialty: DoctorSpecialty,
  day: DayOption,
  slot: TimeSlot,
): Appointment {
  return {
    id: createAppointmentId(),
    type: 'clinic',
    doctorName: `${specialty} Doctor`,
    specialty,
    date: day.full,
    time: slot.time,
    status: 'upcoming',
    locationOrMode: clinic.name,
  };
}
