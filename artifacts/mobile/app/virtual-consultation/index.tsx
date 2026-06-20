import React, { useState } from 'react';
import {
  FlatList,
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
import { DoctorCard } from '@/components/features/DoctorCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_DOCTORS, SPECIALTIES, SpecialtyFilter } from '@/data/mockData';
import { Doctor } from '@/types';

export default function VirtualConsultationScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState<SpecialtyFilter>('All');

  const filtered = MOCK_DOCTORS.filter(doctor => {
    const term = search.toLowerCase();
    const matchesSearch =
      doctor.name.toLowerCase().includes(term) ||
      doctor.specialty.toLowerCase().includes(term);
    const matchesSpecialty =
      activeSpecialty === 'All' || doctor.specialty === activeSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16) },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Virtual Consultation</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View
        style={[
          styles.searchRow,
          { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
      >
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search doctor or specialty..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </Pressable>
        ) : null}
      </View>

      {/* Specialty Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {SPECIALTIES.map(spec => {
          const isActive = spec === activeSpecialty;
          return (
            <Pressable
              key={spec}
              onPress={() => setActiveSpecialty(spec)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? colors.primary : colors.card,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: isActive ? '#fff' : colors.mutedForeground },
                ]}
              >
                {spec}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Doctor List */}
      <FlatList<Doctor>
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 24 },
          filtered.length === 0 && styles.listEmpty,
        ]}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <DoctorCard
            doctor={item}
            onPress={() => router.push(`/virtual-consultation/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="user-x"
            title="No doctors found"
            subtitle="Try adjusting your search or specialty filter."
          />
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  filterScroll: { maxHeight: 44, marginBottom: 12 },
  filterRow: { paddingHorizontal: 20, gap: 8, alignItems: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  listEmpty: { flex: 1 },
});
