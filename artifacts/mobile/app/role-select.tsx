import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useRole } from '@/context/RoleContext';
import { useAdmin } from '@/context/AdminContext';
import { AppRole } from '@/types';
import colors from '@/constants/colors';

const ROLES: {
  role: AppRole;
  label: string;
  subtitle: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}[] = [
  { role: 'patient',  label: 'Patient',        subtitle: 'Book appointments & manage health', icon: 'user',       color: colors.roles.patient },
  { role: 'doctor',   label: 'Doctor',          subtitle: 'Manage patients & prescribe',       icon: 'briefcase',  color: colors.roles.doctor },
  { role: 'nurse',    label: 'Nurse',           subtitle: 'Care tasks & patient monitoring',   icon: 'heart',      color: colors.roles.nurse },
  { role: 'admin',    label: 'Administration',  subtitle: 'Manage staff & clinic assignments', icon: 'settings',   color: colors.roles.admin },
];

const ADMIN_CODE = 'RAHA-ADMIN';

export default function RoleSelectScreen() {
  const appColors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role: currentRole, setRole } = useRole();
  const { getStaffByPhone } = useAdmin();

  const [selected, setSelected] = useState<AppRole | null>(null);
  const [phone, setPhone] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectRole = (r: AppRole) => {
    if (r === 'patient') {
      switchTo('patient');
      return;
    }
    setSelected(r);
    setPhone('');
    setAdminCode('');
  };

  const switchTo = async (r: AppRole, staff?: Parameters<typeof setRole>[1]) => {
    setLoading(true);
    await setRole(r, staff);
    setLoading(false);
    router.replace(
      r === 'patient' ? '/'
      : r === 'doctor' ? '/doctor'
      : r === 'nurse'  ? '/nurse'
      : '/admin',
    );
  };

  const handleVerify = async () => {
    if (!selected) return;

    if (selected === 'admin') {
      if (adminCode.trim() !== ADMIN_CODE) {
        Alert.alert('Incorrect Code', 'Please enter the correct admin access code.');
        return;
      }
      await switchTo('admin');
      return;
    }

    const staff = getStaffByPhone(phone.trim());
    if (!staff) {
      Alert.alert(
        'Not Found',
        `No ${selected} is registered with that phone number.\n\nDemo phones:\n• Doctor: 0501234567 or 0507654321\n• Nurse: 0509876543 or 0501112233`,
      );
      return;
    }
    if (staff.role !== selected) {
      Alert.alert('Role Mismatch', `That phone is registered as a ${staff.role}, not a ${selected}.`);
      return;
    }
    await switchTo(selected, staff);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: appColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={22} color={appColors.foreground} />
        </Pressable>

        <Text style={[styles.heading, { color: appColors.foreground }]}>Switch Interface</Text>
        <Text style={[styles.sub, { color: appColors.mutedForeground }]}>
          Select your role to access the right tools
        </Text>

        <View style={styles.roles}>
          {ROLES.map(r => {
            const isActive = r.role === currentRole;
            const isSelected = r.role === selected;
            return (
              <Pressable
                key={r.role}
                onPress={() => handleSelectRole(r.role)}
                style={({ pressed }) => [
                  styles.roleCard,
                  {
                    backgroundColor: appColors.card,
                    borderColor: isSelected ? r.color : isActive ? `${r.color}60` : appColors.border,
                    borderWidth: isSelected || isActive ? 2 : 1,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={[styles.roleIcon, { backgroundColor: `${r.color}14` }]}>
                  <Feather name={r.icon} size={22} color={r.color} />
                </View>
                <View style={styles.roleText}>
                  <View style={styles.roleNameRow}>
                    <Text style={[styles.roleName, { color: appColors.foreground }]}>{r.label}</Text>
                    {isActive && (
                      <View style={[styles.activePill, { backgroundColor: `${r.color}18` }]}>
                        <Text style={[styles.activePillText, { color: r.color }]}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.roleSub, { color: appColors.mutedForeground }]}>{r.subtitle}</Text>
                </View>
                {isSelected && <Feather name="check-circle" size={18} color={r.color} />}
              </Pressable>
            );
          })}
        </View>

        {/* Verification step */}
        {selected && selected !== 'patient' && (
          <View style={[styles.verifyBox, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
            <Text style={[styles.verifyTitle, { color: appColors.foreground }]}>
              {selected === 'admin' ? 'Enter Admin Code' : 'Verify Your Phone Number'}
            </Text>
            <Text style={[styles.verifySub, { color: appColors.mutedForeground }]}>
              {selected === 'admin'
                ? 'Enter the administration access code (Demo: RAHA-ADMIN)'
                : `Enter the mobile number registered to your ${selected} account`}
            </Text>

            <View
              style={[
                styles.inputRow,
                { backgroundColor: appColors.muted, borderColor: appColors.border },
              ]}
            >
              <Feather
                name={selected === 'admin' ? 'lock' : 'phone'}
                size={16}
                color={appColors.mutedForeground}
              />
              <TextInput
                value={selected === 'admin' ? adminCode : phone}
                onChangeText={selected === 'admin' ? setAdminCode : setPhone}
                placeholder={selected === 'admin' ? 'e.g. RAHA-ADMIN' : 'e.g. 0501234567'}
                placeholderTextColor={appColors.mutedForeground}
                keyboardType={selected === 'admin' ? 'default' : 'phone-pad'}
                style={[styles.input, { color: appColors.foreground }]}
                autoFocus
              />
            </View>

            <Pressable
              onPress={handleVerify}
              disabled={loading}
              style={[
                styles.verifyBtn,
                { backgroundColor: colors.roles[selected] },
                loading && { opacity: 0.6 },
              ]}
            >
              <Text style={styles.verifyBtnText}>{loading ? 'Verifying…' : `Enter as ${selected.charAt(0).toUpperCase() + selected.slice(1)}`}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 16 },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { fontSize: 26, fontFamily: 'Inter_700Bold', marginTop: 4 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  roles: { gap: 10, marginTop: 4 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
  },
  roleIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  roleText: { flex: 1, gap: 3 },
  roleNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleName: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  activePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  activePillText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  roleSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  verifyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    marginTop: 4,
  },
  verifyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  verifySub: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  verifyBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  verifyBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
