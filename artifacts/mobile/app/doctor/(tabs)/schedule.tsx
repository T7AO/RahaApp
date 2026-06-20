import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import colors from '@/constants/colors';

const ROLE_COLOR = colors.roles.doctor;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MOCK_SCHEDULE = [
  { id: 's1', patient: 'Ahmed Al-Sayed',    time: '09:00 AM', type: 'virtual',    duration: '30 min', status: 'upcoming' },
  { id: 's2', patient: 'Nora Al-Zahrani',   time: '10:30 AM', type: 'clinic',     duration: '45 min', status: 'upcoming' },
  { id: 's3', patient: 'Khalid Al-Mutairi', time: '12:00 PM', type: 'home_visit', duration: '60 min', status: 'upcoming' },
  { id: 's4', patient: 'Hana Al-Ghamdi',    time: '02:00 PM', type: 'virtual',    duration: '30 min', status: 'completed' },
  { id: 's5', patient: 'Omar Al-Rashid',    time: '03:30 PM', type: 'clinic',     duration: '30 min', status: 'upcoming' },
];

const TYPE_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  virtual: 'video', clinic: 'map-pin', home_visit: 'home',
};
const TYPE_LABEL: Record<string, string> = {
  virtual: 'Virtual', clinic: 'Clinic', home_visit: 'Home Visit',
};

export default function DoctorSchedule() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const today = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(today === 0 ? 6 : today - 1);

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader title="Schedule" subtitle="Today's appointments" roleColor={ROLE_COLOR} />

      {/* Day selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayScroll}
        contentContainerStyle={styles.dayRow}
      >
        {DAYS.map((day, idx) => {
          const isActive = selectedDay === idx;
          return (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(idx)}
              style={[
                styles.dayChip,
                { backgroundColor: isActive ? ROLE_COLOR : appColors.card, borderColor: isActive ? ROLE_COLOR : appColors.border },
              ]}
            >
              <Text style={[styles.dayLabel, { color: isActive ? '#fff' : appColors.mutedForeground }]}>{day}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Stats row */}
      <View style={[styles.statsRow, { backgroundColor: appColors.card, borderBottomColor: appColors.border }]}>
        {[
          { label: 'Scheduled', value: MOCK_SCHEDULE.filter(s => s.status === 'upcoming').length },
          { label: 'Completed', value: MOCK_SCHEDULE.filter(s => s.status === 'completed').length },
          { label: 'Total',     value: MOCK_SCHEDULE.length },
        ].map(stat => (
          <View key={stat.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: ROLE_COLOR }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: appColors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_SCHEDULE.map((appt, idx) => (
          <View key={appt.id} style={styles.timelineRow}>
            {/* Time column */}
            <View style={styles.timeCol}>
              <Text style={[styles.time, { color: appColors.foreground }]}>{appt.time}</Text>
              {idx < MOCK_SCHEDULE.length - 1 && (
                <View style={[styles.timeline, { backgroundColor: appColors.border }]} />
              )}
            </View>

            {/* Card */}
            <Card style={[styles.apptCard, appt.status === 'completed' && { opacity: 0.6 }]} padding={12}>
              <View style={styles.apptTop}>
                <View style={[styles.typeIcon, { backgroundColor: `${ROLE_COLOR}14` }]}>
                  <Feather name={TYPE_ICON[appt.type]} size={16} color={ROLE_COLOR} />
                </View>
                <View style={styles.apptInfo}>
                  <Text style={[styles.patientName, { color: appColors.foreground }]}>{appt.patient}</Text>
                  <Text style={[styles.apptMeta, { color: appColors.mutedForeground }]}>
                    {TYPE_LABEL[appt.type]} · {appt.duration}
                  </Text>
                </View>
                <Badge
                  label={appt.status === 'completed' ? 'Done' : 'Upcoming'}
                  variant={appt.status === 'completed' ? 'success' : 'primary'}
                />
              </View>
            </Card>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dayScroll: { maxHeight: 56 },
  dayRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: 'center' },
  dayChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  dayLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  statsRow: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  list: { padding: 16, gap: 4 },
  timelineRow: { flexDirection: 'row', gap: 12, minHeight: 80 },
  timeCol: { width: 70, alignItems: 'flex-end', paddingTop: 12 },
  time: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  timeline: { width: 2, flex: 1, alignSelf: 'center', marginTop: 8 },
  apptCard: { flex: 1, marginBottom: 10 },
  apptTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  apptInfo: { flex: 1 },
  patientName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  apptMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
