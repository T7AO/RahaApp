import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { HealthMetric, HealthMetricType, HealthSnapshot } from '@/types';

const HEALTH_KEY = '@raha:health_snapshot';

function generateMockMetrics(): Partial<Record<HealthMetricType, HealthMetric>> {
  const now = new Date().toISOString();
  return {
    heartRate: { type: 'heartRate', value: 72 + Math.floor(Math.random() * 12), unit: 'bpm', timestamp: now, source: 'mock' },
    steps: { type: 'steps', value: 4820 + Math.floor(Math.random() * 2000), unit: 'steps', timestamp: now, source: 'mock' },
    glucose: { type: 'glucose', value: 95 + Math.floor(Math.random() * 20), unit: 'mg/dL', timestamp: now, source: 'mock' },
    oxygenSaturation: { type: 'oxygenSaturation', value: 97 + Math.floor(Math.random() * 3), unit: '%', timestamp: now, source: 'mock' },
    bloodPressure: { type: 'bloodPressure', value: 120, systolic: 118 + Math.floor(Math.random() * 8), diastolic: 75 + Math.floor(Math.random() * 8), unit: 'mmHg', timestamp: now, source: 'mock' },
  };
}

interface HealthContextValue {
  snapshot: HealthSnapshot;
  isConnected: boolean;
  lastSynced: string | null;
  requestConnection: () => Promise<void>;
  manualUpdate: (type: HealthMetricType, value: number, extra?: { systolic?: number; diastolic?: number }) => void;
  refresh: () => void;
}

const HealthContext = createContext<HealthContextValue | null>(null);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<HealthSnapshot>({
    metrics: generateMockMetrics(),
    lastSynced: null,
    connected: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(HEALTH_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as HealthSnapshot;
          setSnapshot(parsed);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const persist = useCallback((updated: HealthSnapshot) => {
    setSnapshot(updated);
    AsyncStorage.setItem(HEALTH_KEY, JSON.stringify(updated)).catch(() => {});
  }, []);

  // Simulates connecting to Apple Health / Google Health
  const requestConnection = useCallback(async () => {
    if (Platform.OS === 'web') {
      const now = new Date().toISOString();
      const updated: HealthSnapshot = {
        metrics: generateMockMetrics(),
        lastSynced: now,
        connected: true,
      };
      persist(updated);
      return;
    }
    // On native, this is where we'd call HealthKit / Health Connect APIs.
    // In Expo Go (managed workflow), native health APIs require a custom dev build.
    // For this demo, we use simulated data.
    const now = new Date().toISOString();
    const updated: HealthSnapshot = {
      metrics: generateMockMetrics(),
      lastSynced: now,
      connected: true,
    };
    persist(updated);
  }, [persist]);

  const manualUpdate = useCallback(
    (type: HealthMetricType, value: number, extra?: { systolic?: number; diastolic?: number }) => {
      const UNITS: Record<HealthMetricType, string> = {
        heartRate: 'bpm',
        steps: 'steps',
        glucose: 'mg/dL',
        bloodPressure: 'mmHg',
        oxygenSaturation: '%',
      };
      const metric: HealthMetric = {
        type,
        value,
        unit: UNITS[type],
        timestamp: new Date().toISOString(),
        source: 'manual',
        ...extra,
      };
      const updated: HealthSnapshot = {
        ...snapshot,
        metrics: { ...snapshot.metrics, [type]: metric },
        lastSynced: new Date().toISOString(),
      };
      persist(updated);
    },
    [snapshot, persist],
  );

  const refresh = useCallback(() => {
    if (snapshot.connected) {
      const updated: HealthSnapshot = {
        metrics: generateMockMetrics(),
        lastSynced: new Date().toISOString(),
        connected: true,
      };
      persist(updated);
    }
  }, [snapshot.connected, persist]);

  return (
    <HealthContext.Provider
      value={{
        snapshot,
        isConnected: snapshot.connected,
        lastSynced: snapshot.lastSynced,
        requestConnection,
        manualUpdate,
        refresh,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth(): HealthContextValue {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealth must be used within HealthProvider');
  return ctx;
}
