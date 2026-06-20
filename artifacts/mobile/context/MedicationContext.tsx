import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { DoseStatus, Medication, MedicationDayLog, MedicationForm } from '@/types';

const MED_KEY = '@raha:medications';
const CATEGORY_ID = 'MEDICATION_REMINDER';

const MED_COLORS = ['#0D8A7A', '#1A73E8', '#8B5CF6', '#F59E0B', '#E74C3C', '#27AE60', '#2E86AB', '#E67E22'];

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function getOrInitTodayLog(med: Medication): MedicationDayLog {
  const today = todayISO();
  const existing = med.logs.find(l => l.date === today);
  if (existing) return existing;
  return {
    date: today,
    doses: med.scheduledTimes.map(t => ({ scheduledTime: t, status: 'pending' as DoseStatus })),
  };
}

async function setupNotificationCategory() {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
      { identifier: 'TAKEN', buttonTitle: '✅ Taken', options: { opensAppToForeground: false } },
      { identifier: 'SNOOZE', buttonTitle: '⏰ Snooze 20m', options: { opensAppToForeground: false } },
      { identifier: 'MISSED', buttonTitle: '❌ Missed', options: { opensAppToForeground: false, isDestructive: true } },
    ]);
  } catch {
    // ignore on web/unsupported
  }
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

async function scheduleMedNotification(med: Medication, time: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const [hour, minute] = time.split(':').map(Number);
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: `💊 Time for ${med.name}`,
        body: `${med.concentration} · ${med.form}${med.instructions ? ' · ' + med.instructions : ''}`,
        categoryIdentifier: CATEGORY_ID,
        data: { medicationId: med.id, scheduledTime: time },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return id;
  } catch {
    return null;
  }
}

async function cancelNotifications(ids: string[]) {
  if (Platform.OS === 'web' || ids.length === 0) return;
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // ignore
    }
  }
}

interface MedicationContextValue {
  medications: Medication[];
  addMedication: (data: {
    name: string;
    form: MedicationForm;
    concentration: string;
    frequencyPerDay: number;
    scheduledTimes: string[];
    durationDays: number;
    startDate?: string;
    instructions?: string;
    prescribedBy?: string;
  }) => Promise<void>;
  updateMedication: (id: string, data: Partial<Omit<Medication, 'id' | 'notificationIds' | 'logs'>>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  logDose: (medicationId: string, scheduledTime: string, status: 'taken' | 'missed') => void;
  snoozeNotification: (medicationId: string, scheduledTime: string) => Promise<void>;
  getTodayDoses: () => { medication: Medication; log: MedicationDayLog }[];
  getActiveMedications: () => Medication[];
}

const MedicationContext = createContext<MedicationContextValue | null>(null);

export function MedicationProvider({ children }: { children: React.ReactNode }) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const listenerRef = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null);

  useEffect(() => {
    (async () => {
      await setupNotificationCategory();
      await requestNotificationPermission();
      try {
        const saved = await AsyncStorage.getItem(MED_KEY);
        if (saved) setMedications(JSON.parse(saved) as Medication[]);
      } catch {
        // ignore
      }
    })();

    if (Platform.OS !== 'web') {
      listenerRef.current = Notifications.addNotificationResponseReceivedListener(response => {
        const { actionIdentifier, notification } = response;
        const data = notification.request.content.data as { medicationId?: string; scheduledTime?: string };
        if (!data.medicationId || !data.scheduledTime) return;
        if (actionIdentifier === 'TAKEN') {
          logDoseInternal(data.medicationId, data.scheduledTime, 'taken');
        } else if (actionIdentifier === 'MISSED') {
          logDoseInternal(data.medicationId, data.scheduledTime, 'missed');
        } else if (actionIdentifier === 'SNOOZE') {
          snoozeInternal(data.medicationId, data.scheduledTime);
        }
      });
    }
    return () => {
      listenerRef.current?.remove();
    };
  }, []);

  const persist = useCallback((updated: Medication[]) => {
    setMedications(updated);
    AsyncStorage.setItem(MED_KEY, JSON.stringify(updated)).catch(() => {});
  }, []);

  const logDoseInternal = useCallback((medicationId: string, scheduledTime: string, status: 'taken' | 'missed') => {
    setMedications(prev => {
      const updated = prev.map(med => {
        if (med.id !== medicationId) return med;
        const today = todayISO();
        const existingLogIdx = med.logs.findIndex(l => l.date === today);
        const log = existingLogIdx >= 0 ? { ...med.logs[existingLogIdx] } : getOrInitTodayLog(med);
        const doses = log.doses.map(d =>
          d.scheduledTime === scheduledTime ? { ...d, status, respondedAt: new Date().toISOString() } : d,
        );
        const updatedLog = { ...log, doses };
        const updatedLogs =
          existingLogIdx >= 0
            ? med.logs.map((l, i) => (i === existingLogIdx ? updatedLog : l))
            : [...med.logs, updatedLog];
        return { ...med, logs: updatedLogs };
      });
      AsyncStorage.setItem(MED_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const snoozeInternal = useCallback(async (medicationId: string, scheduledTime: string) => {
    logDoseInternal(medicationId, scheduledTime, 'missed');
    if (Platform.OS === 'web') return;
    try {
      const snoozeTime = new Date(Date.now() + 20 * 60 * 1000);
      setMedications(prev => {
        const med = prev.find(m => m.id === medicationId);
        if (!med) return prev;
        Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ Snoozed: ${med.name}`,
            body: `Take your ${med.concentration} ${med.form} now`,
            categoryIdentifier: CATEGORY_ID,
            data: { medicationId, scheduledTime },
            sound: true,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: snoozeTime,
          },
        }).catch(() => {});
        return prev;
      });
    } catch {
      // ignore
    }
  }, [logDoseInternal]);

  const addMedication = useCallback(
    async (data: {
      name: string;
      form: MedicationForm;
      concentration: string;
      frequencyPerDay: number;
      scheduledTimes: string[];
      durationDays: number;
      startDate?: string;
      instructions?: string;
      prescribedBy?: string;
    }) => {
      const color = MED_COLORS[medications.length % MED_COLORS.length];
      const med: Medication = {
        id: `med-${Date.now()}`,
        ...data,
        startDate: data.startDate ?? todayISO(),
        color,
        notificationIds: [],
        active: true,
        logs: [{
          date: todayISO(),
          doses: data.scheduledTimes.map(t => ({ scheduledTime: t, status: 'pending' as DoseStatus })),
        }],
      };

      const ids: string[] = [];
      for (const time of data.scheduledTimes) {
        const id = await scheduleMedNotification(med, time);
        if (id) ids.push(id);
      }
      med.notificationIds = ids;

      persist([...medications, med]);
    },
    [medications, persist],
  );

  const updateMedication = useCallback(
    async (id: string, data: Partial<Omit<Medication, 'id' | 'notificationIds' | 'logs'>>) => {
      const med = medications.find(m => m.id === id);
      if (!med) return;
      await cancelNotifications(med.notificationIds);
      const updated = { ...med, ...data };
      const newIds: string[] = [];
      for (const time of updated.scheduledTimes) {
        const nId = await scheduleMedNotification(updated, time);
        if (nId) newIds.push(nId);
      }
      updated.notificationIds = newIds;
      persist(medications.map(m => (m.id === id ? updated : m)));
    },
    [medications, persist],
  );

  const deleteMedication = useCallback(
    async (id: string) => {
      const med = medications.find(m => m.id === id);
      if (med) await cancelNotifications(med.notificationIds);
      persist(medications.filter(m => m.id !== id));
    },
    [medications, persist],
  );

  const logDose = useCallback(
    (medicationId: string, scheduledTime: string, status: 'taken' | 'missed') => {
      logDoseInternal(medicationId, scheduledTime, status);
    },
    [logDoseInternal],
  );

  const snoozeNotification = useCallback(
    async (medicationId: string, scheduledTime: string) => {
      await snoozeInternal(medicationId, scheduledTime);
    },
    [snoozeInternal],
  );

  const getTodayDoses = useCallback(() => {
    const today = todayISO();
    return medications
      .filter(m => m.active)
      .map(med => {
        const existing = med.logs.find(l => l.date === today);
        const log = existing ?? getOrInitTodayLog(med);
        return { medication: med, log };
      });
  }, [medications]);

  const getActiveMedications = useCallback(
    () =>
      medications.filter(m => {
        if (!m.active) return false;
        if (m.durationDays === -1) return true;
        const end = new Date(m.startDate);
        end.setDate(end.getDate() + m.durationDays);
        return end >= new Date();
      }),
    [medications],
  );

  return (
    <MedicationContext.Provider
      value={{
        medications,
        addMedication,
        updateMedication,
        deleteMedication,
        logDose,
        snoozeNotification,
        getTodayDoses,
        getActiveMedications,
      }}
    >
      {children}
    </MedicationContext.Provider>
  );
}

export function useMedications(): MedicationContextValue {
  const ctx = useContext(MedicationContext);
  if (!ctx) throw new Error('useMedications must be used within MedicationProvider');
  return ctx;
}
