import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAdmin } from '@/context/AdminContext';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { MOCK_CLINICS } from '@/data/mockData';
import { DoctorSpecialty, StaffUser } from '@/types';
import colors from '@/constants/colors';

const ROLE_COLOR = colors.roles.admin;

const SPECIALTIES: DoctorSpecialty[] = [
  'General Practitioner', 'Cardiologist', 'Dermatologist',
  'Pediatrician', 'Neurologist', 'Orthopedic', 'Gynecologist', 'Psychiatrist',
];

function AddStaffSheet({ onClose }: { onClose: () => void }) {
  const appColors = useColors();
  const { addStaff } = useAdmin();

  const [role, setRole] = useState<'doctor' | 'nurse'>('doctor');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState<DoctorSpecialty>('General Practitioner');
  const [clinicId, setClinicId] = useState(MOCK_CLINICS[0].id);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Enter a name.'); return; }
    if (!phone.trim()) { Alert.alert('Required', 'Enter a phone number.'); return; }
    setSaving(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const clinic = MOCK_CLINICS.find(c => c.id === clinicId)!;
    addStaff({
      role,
      name: `${role === 'doctor' ? 'Dr. ' : 'Nurse '}${name.trim()}`,
      phone: phone.replace(/\s/g, ''),
      specialty: role === 'doctor' ? specialty : undefined,
      clinicId,
      clinicName: clinic.name,
      active: true,
    });
    setSaving(false);
    onClose();
  };

  return (
    <View style={[styles.sheet, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
      <View style={[styles.handle, { backgroundColor: appColors.border }]} />
      <Text style={[styles.sheetTitle, { color: appColors.foreground }]}>Add Staff Member</Text>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Role */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: appColors.foreground }]}>Role</Text>
          <View style={styles.roleRow}>
            {(['doctor', 'nurse'] as const).map(r => (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleBtn, { backgroundColor: role === r ? (r === 'doctor' ? colors.roles.doctor : colors.roles.nurse) : appColors.muted, borderColor: role === r ? 'transparent' : appColors.border }]}
              >
                <Text style={[styles.roleBtnText, { color: role === r ? '#fff' : appColors.foreground }]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Name */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: appColors.foreground }]}>Full Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Layla Al-Hassan" placeholderTextColor={appColors.mutedForeground}
            style={[styles.input, { backgroundColor: appColors.muted, borderColor: appColors.border, color: appColors.foreground }]} />
        </View>

        {/* Phone */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: appColors.foreground }]}>Mobile Phone</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder="e.g. 0501234567" placeholderTextColor={appColors.mutedForeground} keyboardType="phone-pad"
            style={[styles.input, { backgroundColor: appColors.muted, borderColor: appColors.border, color: appColors.foreground }]} />
        </View>

        {/* Specialty (doctor only) */}
        {role === 'doctor' && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: appColors.foreground }]}>Specialty</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {SPECIALTIES.map(s => (
                <Pressable key={s} onPress={() => setSpecialty(s)}
                  style={[styles.chip, { backgroundColor: specialty === s ? ROLE_COLOR : appColors.muted, borderColor: specialty === s ? ROLE_COLOR : appColors.border }]}>
                  <Text style={[styles.chipText, { color: specialty === s ? '#fff' : appColors.foreground }]}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Clinic */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: appColors.foreground }]}>Assign to Clinic</Text>
          {MOCK_CLINICS.map(c => (
            <Pressable key={c.id} onPress={() => setClinicId(c.id)}
              style={[styles.clinicBtn, { backgroundColor: clinicId === c.id ? `${ROLE_COLOR}14` : appColors.muted, borderColor: clinicId === c.id ? ROLE_COLOR : appColors.border }]}>
              <Feather name="plus-circle" size={14} color={ROLE_COLOR} />
              <Text style={[styles.clinicText, { color: appColors.foreground }]}>{c.name}</Text>
              {clinicId === c.id && <Feather name="check" size={14} color={ROLE_COLOR} />}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable onPress={onClose} style={[styles.cancelBtn, { borderColor: appColors.border }]}>
          <Text style={[styles.cancelText, { color: appColors.mutedForeground }]}>Cancel</Text>
        </Pressable>
        <Pressable onPress={handleSave} disabled={saving} style={[styles.saveBtn, { backgroundColor: ROLE_COLOR }]}>
          <Text style={styles.saveBtnText}>{saving ? 'Adding…' : 'Add Staff'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function AdminUsers() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const { staffMembers, removeStaff, getDoctors, getNurses } = useAdmin();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'doctor' | 'nurse'>('all');

  const displayed = filter === 'all' ? staffMembers : filter === 'doctor' ? getDoctors() : getNurses();

  const handleRemove = (staff: StaffUser) => {
    Alert.alert(`Remove ${staff.name}?`, 'They will no longer have access to their role interface.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeStaff(staff.id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader
        title="Staff Management"
        subtitle={`${getDoctors().length} doctors · ${getNurses().length} nurses`}
        roleColor={ROLE_COLOR}
        rightAction={
          <Pressable onPress={() => setShowAdd(true)} style={[styles.addBtn, { backgroundColor: `${ROLE_COLOR}18` }]}>
            <Feather name="plus" size={18} color={ROLE_COLOR} />
          </Pressable>
        }
      />

      {showAdd ? (
        <AddStaffSheet onClose={() => setShowAdd(false)} />
      ) : (
        <>
          {/* Filter tabs */}
          <View style={[styles.filterRow, { backgroundColor: appColors.muted }]}>
            {(['all', 'doctor', 'nurse'] as const).map(f => (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterBtn, filter === f && { backgroundColor: appColors.card }]}
              >
                <Text style={[styles.filterLabel, { color: filter === f ? ROLE_COLOR : appColors.mutedForeground }]}>
                  {f === 'all' ? 'All Staff' : f === 'doctor' ? 'Doctors' : 'Nurses'}
                </Text>
              </Pressable>
            ))}
          </View>

          <ScrollView
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
            showsVerticalScrollIndicator={false}
          >
            {displayed.map(staff => (
              <Card key={staff.id} style={styles.staffCard} padding={14}>
                <View style={styles.staffRow}>
                  <Avatar
                    initials={staff.name.replace('Dr. ', '').replace('Nurse ', '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    color={staff.role === 'doctor' ? colors.roles.doctor : colors.roles.nurse}
                    size={48}
                  />
                  <View style={styles.staffInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.staffName, { color: appColors.foreground }]}>{staff.name}</Text>
                      <Badge label={staff.role} variant={staff.role === 'doctor' ? 'primary' : 'muted'} />
                    </View>
                    {staff.specialty && <Text style={[styles.staffMeta, { color: appColors.mutedForeground }]}>{staff.specialty}</Text>}
                    <View style={styles.metaRow}>
                      <Feather name="phone" size={11} color={appColors.mutedForeground} />
                      <Text style={[styles.staffMeta, { color: appColors.mutedForeground }]}>{staff.phone}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Feather name="map-pin" size={11} color={appColors.mutedForeground} />
                      <Text style={[styles.staffMeta, { color: appColors.mutedForeground }]}>{staff.clinicName}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => handleRemove(staff)} style={styles.removeBtn}>
                    <Feather name="trash-2" size={16} color={appColors.destructive} />
                  </Pressable>
                </View>
              </Card>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  addBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  filterRow: { flexDirection: 'row', margin: 16, borderRadius: 10, padding: 3 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  filterLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  list: { paddingHorizontal: 16, paddingTop: 4, gap: 10 },
  staffCard: {},
  staffRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  staffInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  staffName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  staffMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  removeBtn: { padding: 6 },
  // Sheet
  sheet: { flex: 1, borderTopWidth: 1, padding: 20, gap: 4 },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 8 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  input: { height: 46, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  roleBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  clinicBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  clinicText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  saveBtn: { flex: 2, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
