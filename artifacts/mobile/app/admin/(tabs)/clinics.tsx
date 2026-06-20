import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAdmin } from '@/context/AdminContext';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { MOCK_CLINICS } from '@/data/mockData';
import colors from '@/constants/colors';

const ROLE_COLOR = colors.roles.admin;

export default function AdminClinics() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const { getStaffByClinic } = useAdmin();

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader title="Clinic Assignments" subtitle="Staff allocation by clinic" roleColor={ROLE_COLOR} />

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_CLINICS.map(clinic => {
          const staff = getStaffByClinic(clinic.id);
          const docs = staff.filter(s => s.role === 'doctor');
          const nurses = staff.filter(s => s.role === 'nurse');

          return (
            <View key={clinic.id} style={styles.clinicSection}>
              {/* Clinic header */}
              <View style={[styles.clinicHeader, { backgroundColor: `${ROLE_COLOR}08`, borderColor: `${ROLE_COLOR}20` }]}>
                <View style={[styles.clinicIcon, { backgroundColor: `${ROLE_COLOR}14` }]}>
                  <Feather name="plus-circle" size={20} color={ROLE_COLOR} />
                </View>
                <View style={styles.clinicInfo}>
                  <Text style={[styles.clinicName, { color: appColors.foreground }]}>{clinic.name}</Text>
                  <Text style={[styles.clinicAddress, { color: appColors.mutedForeground }]}>{clinic.address}</Text>
                  <Text style={[styles.clinicHours, { color: appColors.mutedForeground }]}>
                    {clinic.openingHours}
                  </Text>
                </View>
                <Badge label={clinic.isOpen ? 'Open' : 'Closed'} variant={clinic.isOpen ? 'success' : 'error'} />
              </View>

              {/* Staff list */}
              {staff.length === 0 ? (
                <View style={[styles.emptyStaff, { borderColor: appColors.border }]}>
                  <Feather name="user-x" size={16} color={appColors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: appColors.mutedForeground }]}>No staff assigned</Text>
                </View>
              ) : (
                <Card padding={0}>
                  {staff.map((member, idx) => (
                    <View key={member.id}>
                      <View style={styles.memberRow}>
                        <Avatar
                          initials={member.name.replace('Dr. ', '').replace('Nurse ', '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                          color={member.role === 'doctor' ? colors.roles.doctor : colors.roles.nurse}
                          size={40}
                        />
                        <View style={styles.memberInfo}>
                          <Text style={[styles.memberName, { color: appColors.foreground }]}>{member.name}</Text>
                          <Text style={[styles.memberPhone, { color: appColors.mutedForeground }]}>
                            {member.specialty ? `${member.specialty} · ` : ''}{member.phone}
                          </Text>
                        </View>
                        <View style={[
                          styles.roleTag,
                          { backgroundColor: member.role === 'doctor' ? `${colors.roles.doctor}14` : `${colors.roles.nurse}14` },
                        ]}>
                          <Text style={[styles.roleTagText, { color: member.role === 'doctor' ? colors.roles.doctor : colors.roles.nurse }]}>
                            {member.role === 'doctor' ? 'Dr' : 'RN'}
                          </Text>
                        </View>
                      </View>
                      {idx < staff.length - 1 && <View style={[styles.divider, { backgroundColor: appColors.border }]} />}
                    </View>
                  ))}
                </Card>
              )}

              {/* Totals */}
              <View style={styles.totals}>
                <Text style={[styles.total, { color: appColors.mutedForeground }]}>
                  {docs.length} doctor{docs.length !== 1 ? 's' : ''} · {nurses.length} nurse{nurses.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 20 },
  clinicSection: { gap: 8 },
  clinicHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  clinicIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  clinicInfo: { flex: 1, gap: 3 },
  clinicName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  clinicAddress: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  clinicHours: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  emptyStaff: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed' },
  emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  memberPhone: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  roleTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  roleTagText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  divider: { height: 1, marginHorizontal: 12 },
  totals: { paddingLeft: 4 },
  total: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
