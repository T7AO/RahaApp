import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAdmin } from '@/context/AdminContext';
import { useApp } from '@/context/AppContext';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { Card } from '@/components/ui/Card';
import colors from '@/constants/colors';
import { MOCK_CLINICS } from '@/data/mockData';

const ROLE_COLOR = colors.roles.admin;

export default function AdminDashboard() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const { getDoctors, getNurses, staffMembers } = useAdmin();
  const { appointments } = useApp();

  const stats = [
    { icon: 'briefcase' as const, label: 'Doctors',      value: getDoctors().length,    color: colors.roles.doctor },
    { icon: 'heart' as const,     label: 'Nurses',       value: getNurses().length,     color: colors.roles.nurse },
    { icon: 'map-pin' as const,   label: 'Clinics',      value: MOCK_CLINICS.length,    color: ROLE_COLOR },
    { icon: 'calendar' as const,  label: 'Appointments', value: appointments.length,    color: colors.roles.patient },
  ];

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader
        title="Administration"
        subtitle="Raha Health Management"
        roleColor={ROLE_COLOR}
        rightAction={
          <View style={[styles.notifBtn, { backgroundColor: `${ROLE_COLOR}14` }]}>
            <Feather name="bell" size={18} color={ROLE_COLOR} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.welcome, { color: appColors.foreground }]}>System Overview</Text>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {stats.map(stat => (
            <Card key={stat.label} style={styles.statCard} padding={16}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}14` }]}>
                <Feather name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: appColors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: appColors.mutedForeground }]}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Clinics overview */}
        <Text style={[styles.sectionTitle, { color: appColors.foreground }]}>Clinic Overview</Text>
        {MOCK_CLINICS.map(clinic => {
          const clinicStaff = staffMembers.filter(s => s.clinicId === clinic.id && s.active);
          const docs = clinicStaff.filter(s => s.role === 'doctor').length;
          const nurses = clinicStaff.filter(s => s.role === 'nurse').length;
          return (
            <Card key={clinic.id} style={styles.clinicCard} padding={14}>
              <View style={styles.clinicRow}>
                <View style={[styles.clinicIcon, { backgroundColor: `${ROLE_COLOR}14` }]}>
                  <Feather name="plus-circle" size={20} color={ROLE_COLOR} />
                </View>
                <View style={styles.clinicInfo}>
                  <Text style={[styles.clinicName, { color: appColors.foreground }]}>{clinic.name}</Text>
                  <Text style={[styles.clinicAddress, { color: appColors.mutedForeground }]}>{clinic.address}</Text>
                </View>
                <View style={[styles.statusDot, { backgroundColor: clinic.isOpen ? appColors.success : appColors.destructive }]} />
              </View>
              <View style={styles.staffPills}>
                <View style={[styles.pill, { backgroundColor: `${colors.roles.doctor}14` }]}>
                  <Feather name="briefcase" size={12} color={colors.roles.doctor} />
                  <Text style={[styles.pillText, { color: colors.roles.doctor }]}>{docs} doctors</Text>
                </View>
                <View style={[styles.pill, { backgroundColor: `${colors.roles.nurse}14` }]}>
                  <Feather name="heart" size={12} color={colors.roles.nurse} />
                  <Text style={[styles.pillText, { color: colors.roles.nurse }]}>{nurses} nurses</Text>
                </View>
              </View>
            </Card>
          );
        })}

        {/* Recent activity */}
        <Text style={[styles.sectionTitle, { color: appColors.foreground }]}>Recent Activity</Text>
        {[
          { action: 'New appointment booked',     time: '5 min ago',  icon: 'calendar' as const },
          { action: 'Staff assignment updated',   time: '1 hour ago', icon: 'users' as const },
          { action: 'Clinic hours modified',      time: '2 hours ago',icon: 'clock' as const },
        ].map((item, i) => (
          <Pressable key={i} style={[styles.activityRow, { backgroundColor: appColors.card, borderColor: appColors.border }]}>
            <View style={[styles.activityIcon, { backgroundColor: `${ROLE_COLOR}14` }]}>
              <Feather name={item.icon} size={16} color={ROLE_COLOR} />
            </View>
            <Text style={[styles.activityText, { color: appColors.foreground }]}>{item.action}</Text>
            <Text style={[styles.activityTime, { color: appColors.mutedForeground }]}>{item.time}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14 },
  welcome: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', gap: 6 },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', marginTop: 4 },
  clinicCard: { gap: 10 },
  clinicRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  clinicIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  clinicInfo: { flex: 1 },
  clinicName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  clinicAddress: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  staffPills: { flexDirection: 'row', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pillText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  activityIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  activityText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  activityTime: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  notifBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
