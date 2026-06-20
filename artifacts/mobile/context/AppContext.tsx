import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment, UserProfile } from '@/types';
import { MOCK_USER_PROFILE } from '@/data/mockData';

const APPOINTMENTS_STORAGE_KEY = '@raha:appointments';

interface AppContextValue {
  appointments: Appointment[];
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (appointmentId: string) => void;
  userProfile: UserProfile;
  isLoading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [userProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    try {
      const stored = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (stored) {
        setAppointments(JSON.parse(stored) as Appointment[]);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function persistAppointments(updated: Appointment[]) {
    try {
      await AsyncStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to persist appointments:', err);
    }
  }

  const addAppointment = useCallback((appointment: Appointment) => {
    setAppointments(prev => {
      const updated = [appointment, ...prev];
      persistAppointments(updated);
      return updated;
    });
  }, []);

  const cancelAppointment = useCallback((appointmentId: string) => {
    setAppointments(prev => {
      const updated = prev.map(a =>
        a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a,
      );
      persistAppointments(updated);
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{ appointments, addAppointment, cancelAppointment, userProfile, isLoading }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
