import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import colors from '@/constants/colors';

const ROLE_COLOR = colors.roles.nurse;

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Ahmed Al-Sayed',    room: '1B', bloodType: 'O+',  condition: 'Post-surgery recovery', vitals: { bp: '118/75', hr: '72', temp: '36.8°C' }, status: 'Stable',   initials: 'AS', color: '#0D8A7A', admittedDays: 2 },
  { id: 'p2', name: 'Nora Al-Zahrani',   room: '2C', bloodType: 'A+',  condition: 'Hypertension management', vitals: { bp: '148/92', hr: '85', temp: '37.1°C' }, status: 'Monitor',  initials: 'NZ', color: '#2E86AB', admittedDays: 5 },
  { id: 'p3', name: 'Khalid Al-Mutairi', room: '3A', bloodType: 'B-',  condition: 'Diabetic ketoacidosis', vitals: { bp: '105/68', hr: '98', temp: '37.9°C' }, status: 'Critical', initials: 'KM', color: '#E74C3C', admittedDays: 1 },
  { id: 'p4', name: 'Hana Al-Ghamdi',    room: '4A', bloodType: 'AB+', condition: 'Chest pain evaluation', vitals: { bp: '125/80', hr: '79', temp: '36.6°C' }, status: 'Stable',   initials: 'HG', color: '#8B5CF6', admittedDays: 3 },
];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error'> = {
  Stable: 'success', Monitor: 'warning', Critical: 'error',
};

export default function NursePatients() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader title="Patients" subtitle={`${MOCK_PATIENTS.length} admitted`} roleColor={ROLE_COLOR} />

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_PATIENTS.map(patient => (
          <Card key={patient.id} style={styles.card} padding={14}>
            {/* Header */}
            <View style={styles.row}>
              <Avatar initials={patient.initials} color={patient.color} size={48} />
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: appColors.foreground }]}>{patient.name}</Text>
                  <Badge label={patient.status} variant={STATUS_VARIANT[patient.status]} />
                </View>
                <Text style={[styles.condition, { color: appColors.mutedForeground }]}>{patient.condition}</Text>
                <View style={styles.metaRow}>
                  <Feather name="map-pin" size={11} color={appColors.mutedForeground} />
                  <Text style={[styles.meta, { color: appColors.mutedForeground }]}>Room {patient.room}</Text>
                  <Text style={[styles.dot, { color: appColors.border }]}>·</Text>
                  <Feather name="clock" size={11} color={appColors.mutedForeground} />
                  <Text style={[styles.meta, { color: appColors.mutedForeground }]}>{patient.admittedDays}d admitted</Text>
                </View>
              </View>
            </View>

            {/* Vitals */}
            <View style={[styles.vitalsRow, { backgroundColor: appColors.muted, borderRadius: 10 }]}>
              {[
                { icon: 'trending-up' as const, label: 'BP',   value: patient.vitals.bp   },
                { icon: 'heart' as const,        label: 'HR',   value: `${patient.vitals.hr} bpm` },
                { icon: 'thermometer' as const,  label: 'Temp', value: patient.vitals.temp },
              ].map(v => (
                <View key={v.label} style={styles.vitalItem}>
                  <Feather name={v.icon} size={13} color={ROLE_COLOR} />
                  <Text style={[styles.vitalLabel, { color: appColors.mutedForeground }]}>{v.label}</Text>
                  <Text style={[styles.vitalValue, { color: appColors.foreground }]}>{v.value}</Text>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 12 },
  card: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  condition: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  meta: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  dot: { fontSize: 12 },
  vitalsRow: { flexDirection: 'row', padding: 10 },
  vitalItem: { flex: 1, alignItems: 'center', gap: 3 },
  vitalLabel: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  vitalValue: { fontSize: 13, fontFamily: 'Inter_700Bold' },
});
