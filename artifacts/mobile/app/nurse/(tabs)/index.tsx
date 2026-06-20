import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useRole } from '@/context/RoleContext';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import colors from '@/constants/colors';

const ROLE_COLOR = colors.roles.nurse;

const MOCK_ALERTS = [
  { id: 'a1', patient: 'Khalid Al-Mutairi', message: 'Blood pressure above normal', severity: 'high' },
  { id: 'a2', patient: 'Ahmed Al-Sayed',    message: 'Medication not confirmed', severity: 'medium' },
  { id: 'a3', patient: 'Nora Al-Zahrani',   message: 'Scheduled vitals check due', severity: 'low' },
];

const MOCK_TASKS = [
  { id: 't1', task: 'Vitals check — Room 3',     time: '09:00 AM', done: true },
  { id: 't2', task: 'Medication round — Ward B',  time: '10:30 AM', done: false },
  { id: 't3', task: 'Wound dressing — Ahmed S.',  time: '11:00 AM', done: false },
  { id: 't4', task: 'IV line check — Khalid M.',  time: '01:00 PM', done: false },
];

export default function NurseDashboard() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const { currentStaff } = useRole();

  const pendingTasks = MOCK_TASKS.filter(t => !t.done).length;
  const firstName = currentStaff?.name.replace('Nurse ', '').split(' ')[0] ?? 'Nurse';

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader
        title="Nurse Portal"
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
        <View style={styles.welcome}>
          <Text style={[styles.greeting, { color: appColors.mutedForeground }]}>Good morning,</Text>
          <Text style={[styles.name, { color: appColors.foreground }]}>{firstName}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'users' as const,       label: 'Patients',    value: '6' },
            { icon: 'check-square' as const, label: 'Tasks Left',  value: String(pendingTasks) },
            { icon: 'alert-circle' as const, label: 'Alerts',      value: String(MOCK_ALERTS.length) },
          ].map(stat => (
            <Card key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${ROLE_COLOR}14` }]}>
                <Feather name={stat.icon} size={18} color={ROLE_COLOR} />
              </View>
              <Text style={[styles.statValue, { color: appColors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: appColors.mutedForeground }]}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Alerts */}
        <Text style={[styles.sectionTitle, { color: appColors.foreground }]}>⚠ Patient Alerts</Text>
        <View style={styles.cards}>
          {MOCK_ALERTS.map(alert => {
            const alertColors: Record<string, string> = { high: '#E74C3C', medium: '#F59E0B', low: '#27AE60' };
            const c = alertColors[alert.severity];
            return (
              <View key={alert.id} style={[styles.alertCard, { backgroundColor: `${c}10`, borderColor: `${c}30`, borderWidth: 1, borderRadius: 12, padding: 12 }]}>
                <View style={styles.alertRow}>
                  <Feather name="alert-circle" size={16} color={c} />
                  <View style={styles.alertInfo}>
                    <Text style={[styles.alertPatient, { color: appColors.foreground }]}>{alert.patient}</Text>
                    <Text style={[styles.alertMsg, { color: appColors.mutedForeground }]}>{alert.message}</Text>
                  </View>
                  <Badge label={alert.severity} variant={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'success'} />
                </View>
              </View>
            );
          })}
        </View>

        {/* Upcoming tasks */}
        <Text style={[styles.sectionTitle, { color: appColors.foreground }]}>Today's Tasks</Text>
        <Card padding={0}>
          {MOCK_TASKS.map((task, idx) => (
            <View key={task.id}>
              <View style={styles.taskRow}>
                <View style={[styles.taskDot, { backgroundColor: task.done ? appColors.success : ROLE_COLOR }]}>
                  {task.done && <Feather name="check" size={10} color="#fff" />}
                </View>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskText, { color: task.done ? appColors.mutedForeground : appColors.foreground, textDecorationLine: task.done ? 'line-through' : 'none' }]}>
                    {task.task}
                  </Text>
                  <Text style={[styles.taskTime, { color: appColors.mutedForeground }]}>{task.time}</Text>
                </View>
              </View>
              {idx < MOCK_TASKS.length - 1 && <View style={[styles.divider, { backgroundColor: appColors.border }]} />}
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14 },
  welcome: { gap: 2 },
  greeting: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  name: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, gap: 6, alignItems: 'center', paddingVertical: 16 },
  statIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  cards: { gap: 8 },
  alertCard: {},
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  alertInfo: { flex: 1 },
  alertPatient: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  alertMsg: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  taskDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  taskInfo: { flex: 1 },
  taskText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  taskTime: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  divider: { height: 1, marginHorizontal: 14 },
  notifBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
