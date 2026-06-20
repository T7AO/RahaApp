import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useRole } from '@/context/RoleContext';
import { useApp } from '@/context/AppContext';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AppointmentCard } from '@/components/features/AppointmentCard';
import colors from '@/constants/colors';

const ROLE_COLOR = colors.roles.doctor;

const MOCK_STATS = [
  { icon: 'users' as const,    label: 'Patients Today', value: '8' },
  { icon: 'calendar' as const, label: 'Appointments',   value: '12' },
  { icon: 'file-text' as const,label: 'Prescriptions',  value: '5' },
  { icon: 'star' as const,     label: 'Avg Rating',     value: '4.9' },
];

export default function DoctorDashboard() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const { currentStaff } = useRole();
  const { appointments } = useApp();

  const todayAppts = appointments.filter(a => a.status === 'upcoming').slice(0, 3);
  const firstName = currentStaff?.name.replace('Dr. ', '').split(' ')[0] ?? 'Doctor';

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader
        title="Doctor Portal"
        subtitle={currentStaff?.clinicName}
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
        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={[styles.greeting, { color: appColors.mutedForeground }]}>Good morning,</Text>
          <Text style={[styles.name, { color: appColors.foreground }]}>Dr. {firstName}</Text>
          <Badge label={currentStaff?.specialty ?? 'Doctor'} variant="primary" />
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {MOCK_STATS.map(stat => (
            <Card key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${ROLE_COLOR}14` }]}>
                <Feather name={stat.icon} size={18} color={ROLE_COLOR} />
              </View>
              <Text style={[styles.statValue, { color: appColors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: appColors.mutedForeground }]}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Today's Queue */}
        <Text style={[styles.sectionTitle, { color: appColors.foreground }]}>Today's Queue</Text>
        {todayAppts.length > 0 ? (
          <View style={styles.cards}>
            {todayAppts.map(a => <AppointmentCard key={a.id} appointment={a} />)}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Feather name="check-circle" size={28} color={appColors.mutedForeground} />
            <Text style={[styles.emptyText, { color: appColors.mutedForeground }]}>
              No appointments booked yet
            </Text>
          </Card>
        )}

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: appColors.foreground }]}>Quick Actions</Text>
        <View style={styles.actions}>
          {[
            { icon: 'file-text' as const, label: 'New Prescription' },
            { icon: 'clipboard' as const, label: 'Patient Notes' },
            { icon: 'video' as const,     label: 'Start Consult' },
          ].map(action => (
            <Pressable
              key={action.label}
              style={[styles.actionBtn, { backgroundColor: appColors.card, borderColor: appColors.border }]}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${ROLE_COLOR}14` }]}>
                <Feather name={action.icon} size={20} color={ROLE_COLOR} />
              </View>
              <Text style={[styles.actionLabel, { color: appColors.foreground }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  welcome: { gap: 4 },
  greeting: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  name: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', gap: 6, alignItems: 'flex-start' },
  statIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', marginTop: 4 },
  cards: { gap: 10 },
  emptyCard: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  notifBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
