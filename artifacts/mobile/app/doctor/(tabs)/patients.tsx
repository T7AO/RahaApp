import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import colors from '@/constants/colors';

const ROLE_COLOR = colors.roles.doctor;

const MOCK_PATIENTS = [
  { id: 'p1', name: 'Ahmed Al-Sayed',   dob: '1990-04-15', bloodType: 'O+', lastVisit: '2 days ago', status: 'Stable',   initials: 'AS', color: '#0D8A7A' },
  { id: 'p2', name: 'Nora Al-Zahrani',  dob: '1985-08-22', bloodType: 'A+', lastVisit: '1 week ago', status: 'Follow-up',initials: 'NZ', color: '#2E86AB' },
  { id: 'p3', name: 'Khalid Al-Mutairi',dob: '1978-01-10', bloodType: 'B-', lastVisit: 'Today',      status: 'Critical', initials: 'KM', color: '#E74C3C' },
  { id: 'p4', name: 'Hana Al-Ghamdi',   dob: '1995-11-30', bloodType: 'AB+',lastVisit: '3 days ago', status: 'Stable',   initials: 'HG', color: '#8B5CF6' },
];

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'muted'> = {
  Stable: 'success', 'Follow-up': 'warning', Critical: 'error',
};

export default function DoctorPatients() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = MOCK_PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader title="My Patients" subtitle={`${MOCK_PATIENTS.length} assigned`} roleColor={ROLE_COLOR} />

      <View style={[styles.searchRow, { backgroundColor: appColors.muted, borderColor: appColors.border }]}>
        <Feather name="search" size={15} color={appColors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search patients..."
          placeholderTextColor={appColors.mutedForeground}
          style={[styles.searchInput, { color: appColors.foreground }]}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map(patient => (
          <Card key={patient.id} style={styles.patientCard} padding={14}>
            <View style={styles.row}>
              <Avatar initials={patient.initials} color={patient.color} size={48} />
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: appColors.foreground }]}>{patient.name}</Text>
                  <Badge label={patient.status} variant={STATUS_VARIANT[patient.status] ?? 'muted'} />
                </View>
                <View style={styles.meta}>
                  <Feather name="droplet" size={12} color={appColors.mutedForeground} />
                  <Text style={[styles.metaText, { color: appColors.mutedForeground }]}>{patient.bloodType}</Text>
                  <Text style={[styles.dot, { color: appColors.border }]}>·</Text>
                  <Feather name="clock" size={12} color={appColors.mutedForeground} />
                  <Text style={[styles.metaText, { color: appColors.mutedForeground }]}>Last: {patient.lastVisit}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={appColors.mutedForeground} />
            </View>

            <View style={styles.actions}>
              {[
                { icon: 'file-text' as const, label: 'Prescribe' },
                { icon: 'clipboard' as const, label: 'Notes' },
                { icon: 'video' as const,     label: 'Call' },
              ].map(a => (
                <Pressable
                  key={a.label}
                  style={[styles.actionBtn, { backgroundColor: `${ROLE_COLOR}10`, borderColor: `${ROLE_COLOR}30` }]}
                >
                  <Feather name={a.icon} size={14} color={ROLE_COLOR} />
                  <Text style={[styles.actionLabel, { color: ROLE_COLOR }]}>{a.label}</Text>
                </Pressable>
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
  searchRow: { flexDirection: 'row', alignItems: 'center', margin: 16, paddingHorizontal: 14, height: 44, borderRadius: 12, borderWidth: 1, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  list: { paddingHorizontal: 16, gap: 10 },
  patientCard: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  dot: { fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  actionLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
