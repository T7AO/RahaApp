import React, { useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { AppointmentCard } from '@/components/features/AppointmentCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Appointment, AppointmentStatus } from '@/types';

const FILTERS: { label: string; value: AppointmentStatus }[] = [
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function AppointmentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { appointments } = useApp();
  const [activeFilter, setActiveFilter] = useState<AppointmentStatus>('upcoming');

  const filtered = appointments.filter(a => a.status === activeFilter);

  const emptySubtitles: Record<AppointmentStatus, string> = {
    upcoming: 'Book a virtual consultation, home visit, or clinic appointment to get started.',
    completed: 'Your completed appointment history will appear here.',
    cancelled: 'You have no cancelled appointments.',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Appointments</Text>

        <View style={[styles.filterRow, { backgroundColor: colors.muted }]}>
          {FILTERS.map(f => {
            const isActive = f.value === activeFilter;
            return (
              <Pressable
                key={f.value}
                onPress={() => setActiveFilter(f.value)}
                style={[
                  styles.filterBtn,
                  isActive && {
                    backgroundColor: colors.card,
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    { color: isActive ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList<Appointment>
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
          filtered.length === 0 && styles.listEmpty,
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title={`No ${activeFilter} appointments`}
            subtitle={emptySubtitles[activeFilter]}
          />
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={filtered.length > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, gap: 16 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  filterRow: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  filterLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  listEmpty: { flex: 1 },
});
