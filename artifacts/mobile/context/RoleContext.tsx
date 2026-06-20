import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppRole, StaffUser } from '@/types';

const ROLE_KEY = '@raha:role';
const ROLE_USER_KEY = '@raha:role_user';

interface RoleContextValue {
  role: AppRole;
  currentStaff: StaffUser | null;
  setRole: (role: AppRole, staff?: StaffUser | null) => Promise<void>;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<AppRole>('patient');
  const [currentStaff, setCurrentStaff] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [savedRole, savedUser] = await Promise.all([
          AsyncStorage.getItem(ROLE_KEY),
          AsyncStorage.getItem(ROLE_USER_KEY),
        ]);
        if (savedRole) setRoleState(savedRole as AppRole);
        if (savedUser) setCurrentStaff(JSON.parse(savedUser) as StaffUser);
      } catch (e) {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setRole = useCallback(async (newRole: AppRole, staff?: StaffUser | null) => {
    setRoleState(newRole);
    setCurrentStaff(staff ?? null);
    await AsyncStorage.setItem(ROLE_KEY, newRole);
    if (staff) {
      await AsyncStorage.setItem(ROLE_USER_KEY, JSON.stringify(staff));
    } else {
      await AsyncStorage.removeItem(ROLE_USER_KEY);
    }
  }, []);

  return (
    <RoleContext.Provider value={{ role, currentStaff, setRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
