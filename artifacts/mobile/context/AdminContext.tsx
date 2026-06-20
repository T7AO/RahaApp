import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeHealthcareOrder, HomeHealthcareOrderStatus, StaffUser } from '@/types';

const STAFF_KEY = '@raha:staff';
const ORDERS_KEY = '@raha:hc_orders';

const DEMO_STAFF: StaffUser[] = [
  {
    id: 'staff-1',
    role: 'doctor',
    name: 'Dr. Layla Al-Hassan',
    phone: '0501234567',
    specialty: 'General Practitioner',
    clinicId: 'c1',
    clinicName: 'Raha Medical Center',
    addedAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'staff-2',
    role: 'doctor',
    name: 'Dr. Omar Khalid',
    phone: '0507654321',
    specialty: 'Cardiologist',
    clinicId: 'c2',
    clinicName: 'Raha Wellness Clinic',
    addedAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'staff-3',
    role: 'nurse',
    name: 'Nurse Fatima Al-Rashid',
    phone: '0509876543',
    specialty: undefined,
    clinicId: 'c1',
    clinicName: 'Raha Medical Center',
    addedAt: new Date().toISOString(),
    active: true,
  },
  {
    id: 'staff-4',
    role: 'nurse',
    name: 'Nurse Sara Mahmoud',
    phone: '0501112233',
    specialty: undefined,
    clinicId: 'c2',
    clinicName: 'Raha Wellness Clinic',
    addedAt: new Date().toISOString(),
    active: true,
  },
];

const today = new Date().toISOString().split('T')[0];

const DEMO_ORDERS: HomeHealthcareOrder[] = [
  {
    id: 'order-1',
    patientName: 'Khalid Al-Mutairi',
    patientPhone: '0551234567',
    address: 'Villa 12, Street 5, Al Nakheel, Riyadh',
    careType: 'wound_care',
    notes: 'Post-surgical wound dressing change. Use sterile gauze.',
    scheduledDate: today,
    scheduledTime: '09:00',
    assignedNurseId: 'staff-3',
    assignedNurseName: 'Nurse Fatima Al-Rashid',
    priority: 'urgent',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'order-2',
    patientName: 'Nora Al-Zahrani',
    patientPhone: '0559876543',
    address: 'Apt 4B, Al Malaz District, Riyadh',
    careType: 'iv_therapy',
    notes: 'IV saline drip 500ml. Patient is diabetic.',
    scheduledDate: today,
    scheduledTime: '11:30',
    assignedNurseId: 'staff-3',
    assignedNurseName: 'Nurse Fatima Al-Rashid',
    priority: 'routine',
    status: 'in-progress',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'order-3',
    patientName: 'Hana Al-Ghamdi',
    patientPhone: '0551112233',
    address: 'Building 7, Al Olaya, Riyadh',
    careType: 'vitals_monitoring',
    notes: 'Record BP, temperature, O2 sat. Patient recovering from pneumonia.',
    scheduledDate: today,
    scheduledTime: '14:00',
    assignedNurseId: 'staff-3',
    assignedNurseName: 'Nurse Fatima Al-Rashid',
    priority: 'routine',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'order-4',
    patientName: 'Faisal Al-Dosari',
    patientPhone: '0558887766',
    address: 'Villa 33, Hittin District, Riyadh',
    careType: 'medication_administration',
    notes: 'Administer prescribed insulin injection. Educate patient on self-injection.',
    scheduledDate: today,
    scheduledTime: '16:00',
    assignedNurseId: 'staff-4',
    assignedNurseName: 'Nurse Sara Mahmoud',
    priority: 'urgent',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'order-5',
    patientName: 'Layla Bin Saeed',
    patientPhone: '0553334455',
    address: 'Apt 2A, Sulaimaniyah, Riyadh',
    careType: 'post_op_care',
    notes: 'Post knee replacement care. Check swelling, assist mobility exercises.',
    scheduledDate: today,
    scheduledTime: '10:00',
    assignedNurseId: 'staff-4',
    assignedNurseName: 'Nurse Sara Mahmoud',
    priority: 'routine',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

interface AdminContextValue {
  staffMembers: StaffUser[];
  homeOrders: HomeHealthcareOrder[];
  addStaff: (user: Omit<StaffUser, 'id' | 'addedAt'>) => void;
  removeStaff: (id: string) => void;
  updateStaff: (id: string, updates: Partial<StaffUser>) => void;
  getStaffByPhone: (phone: string) => StaffUser | undefined;
  getDoctors: () => StaffUser[];
  getNurses: () => StaffUser[];
  getStaffByClinic: (clinicId: string) => StaffUser[];
  isRegisteredStaff: (phone: string) => boolean;
  addOrder: (order: Omit<HomeHealthcareOrder, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (id: string, status: HomeHealthcareOrderStatus) => void;
  getOrdersForNurse: (nurseId: string) => HomeHealthcareOrder[];
  deleteOrder: (id: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [staffMembers, setStaffMembers] = useState<StaffUser[]>(DEMO_STAFF);
  const [homeOrders, setHomeOrders] = useState<HomeHealthcareOrder[]>(DEMO_ORDERS);

  useEffect(() => {
    (async () => {
      try {
        const savedStaff = await AsyncStorage.getItem(STAFF_KEY);
        if (savedStaff) {
          setStaffMembers(JSON.parse(savedStaff) as StaffUser[]);
        } else {
          await AsyncStorage.setItem(STAFF_KEY, JSON.stringify(DEMO_STAFF));
        }
        const savedOrders = await AsyncStorage.getItem(ORDERS_KEY);
        if (savedOrders) {
          setHomeOrders(JSON.parse(savedOrders) as HomeHealthcareOrder[]);
        } else {
          await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(DEMO_ORDERS));
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const persistStaff = useCallback((updated: StaffUser[]) => {
    setStaffMembers(updated);
    AsyncStorage.setItem(STAFF_KEY, JSON.stringify(updated)).catch(() => {});
  }, []);

  const persistOrders = useCallback((updated: HomeHealthcareOrder[]) => {
    setHomeOrders(updated);
    AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated)).catch(() => {});
  }, []);

  const addStaff = useCallback(
    (user: Omit<StaffUser, 'id' | 'addedAt'>) => {
      const newUser: StaffUser = { ...user, id: `staff-${Date.now()}`, addedAt: new Date().toISOString() };
      persistStaff([...staffMembers, newUser]);
    },
    [staffMembers, persistStaff],
  );

  const removeStaff = useCallback(
    (id: string) => persistStaff(staffMembers.filter(s => s.id !== id)),
    [staffMembers, persistStaff],
  );

  const updateStaff = useCallback(
    (id: string, updates: Partial<StaffUser>) =>
      persistStaff(staffMembers.map(s => (s.id === id ? { ...s, ...updates } : s))),
    [staffMembers, persistStaff],
  );

  const normalizePhone = (p: string) => p.replace(/[\s\-+]/g, '');

  const getStaffByPhone = useCallback(
    (phone: string) => {
      const norm = normalizePhone(phone);
      return staffMembers.find(s => s.active && (normalizePhone(s.phone) === norm || norm.endsWith(normalizePhone(s.phone))));
    },
    [staffMembers],
  );

  const isRegisteredStaff = useCallback(
    (phone: string) => !!getStaffByPhone(phone),
    [getStaffByPhone],
  );

  const getDoctors = useCallback(() => staffMembers.filter(s => s.role === 'doctor' && s.active), [staffMembers]);
  const getNurses = useCallback(() => staffMembers.filter(s => s.role === 'nurse' && s.active), [staffMembers]);
  const getStaffByClinic = useCallback(
    (clinicId: string) => staffMembers.filter(s => s.clinicId === clinicId && s.active),
    [staffMembers],
  );

  const addOrder = useCallback(
    (order: Omit<HomeHealthcareOrder, 'id' | 'createdAt'>) => {
      const newOrder: HomeHealthcareOrder = { ...order, id: `order-${Date.now()}`, createdAt: new Date().toISOString() };
      persistOrders([...homeOrders, newOrder]);
    },
    [homeOrders, persistOrders],
  );

  const updateOrderStatus = useCallback(
    (id: string, status: HomeHealthcareOrderStatus) =>
      persistOrders(homeOrders.map(o => (o.id === id ? { ...o, status } : o))),
    [homeOrders, persistOrders],
  );

  const getOrdersForNurse = useCallback(
    (nurseId: string) => homeOrders.filter(o => o.assignedNurseId === nurseId),
    [homeOrders],
  );

  const deleteOrder = useCallback(
    (id: string) => persistOrders(homeOrders.filter(o => o.id !== id)),
    [homeOrders, persistOrders],
  );

  return (
    <AdminContext.Provider
      value={{
        staffMembers,
        homeOrders,
        addStaff,
        removeStaff,
        updateStaff,
        getStaffByPhone,
        getDoctors,
        getNurses,
        getStaffByClinic,
        isRegisteredStaff,
        addOrder,
        updateOrderStatus,
        getOrdersForNurse,
        deleteOrder,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
}
