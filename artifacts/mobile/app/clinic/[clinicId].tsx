import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { BookingFooter } from '@/components/features/BookingFooter';
import { DatePickerRow } from '@/components/features/DatePickerRow';
import { ResultSheet } from '@/components/features/ResultSheet';
import { StatsRow } from '@/components/features/StatsRow';
import { TimeSlotPicker } from '@/components/features/TimeSlotPicker';
import { MOCK_CLINICS, TIME_SLOTS } from '@/data/mockData';
import { DoctorSpecialty, TimeSlot } from '@/types';
import { t } from '@/i18n';
import { createClinicAppointment } from '@/utils/appointments';
import { buildNextDays, formatTimeRangeLabel } from '@/utils/dateTime';

export default function ClinicDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clinicId } = useLocalSearchParams<{ clinicId: string }>();
  const { addAppointment } = useApp();

  const clinic = MOCK_CLINICS.find(c => c.id === clinicId);
  const days = buildNextDays(7);

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedSpecialty, setSelectedSpecialty] = useState<DoctorSpecialty | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; message: string } | null>(null);

  if (!clinic) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ErrorState
          title="Clinic not found"
          message="This clinic is not available anymore."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const handleBook = async () => {
    if (!selectedSpecialty) {
      Alert.alert('Select Specialty', 'Please select the specialty you need.');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Select Time', 'Please select an available time slot.');
      return;
    }

    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const appointment = createClinicAppointment(clinic, selectedSpecialty, days[selectedDay], selectedSlot);

    addAppointment(appointment);
    setLoading(false);
    setResult({
      title: 'Appointment Confirmed',
      message: `Your ${selectedSpecialty} appointment at ${clinic.name} is booked for ${formatTimeRangeLabel(days[selectedDay].full, selectedSlot.time)}.`,
    });
  };

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Clinic Info Card */}
        <Card style={styles.clinicCard}>
          <View style={styles.clinicTop}>
            <View style={[styles.clinicIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="plus-circle" size={26} color={colors.primary} />
            </View>
            <View style={styles.clinicInfo}>
              <Text style={[styles.clinicName, { color: colors.foreground }]}>{clinic.name}</Text>
              <View style={styles.infoRow}>
                <Feather name="map-pin" size={12} color={colors.mutedForeground} />
                <Text style={[styles.infoText, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {clinic.address}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Feather name="clock" size={12} color={colors.mutedForeground} />
                <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                  {clinic.openingHours}
                </Text>
              </View>
            </View>
            <Badge label={clinic.isOpen ? 'Open' : 'Closed'} variant={clinic.isOpen ? 'success' : 'error'} />
          </View>

          <View style={[styles.clinicStats, { borderTopColor: colors.border }]}>
            <StatsRow
              divided
              items={[
                { icon: 'star', value: clinic.rating, label: 'Rating', color: '#F59E0B' },
                { icon: 'navigation', value: `${clinic.distanceKm} km`, label: 'Distance' },
                { icon: 'phone', value: clinic.phone, label: 'Phone' },
              ]}
            />
          </View>
        </Card>

        {/* Specialty Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Select Specialty</Text>
          <View style={styles.specialtyGrid}>
            {clinic.specialties.map(spec => {
              const isActive = selectedSpecialty === spec;
              return (
                <Pressable
                  key={spec}
                  onPress={() => setSelectedSpecialty(spec)}
                  style={[
                    styles.specChip,
                    {
                      backgroundColor: isActive ? colors.primary : colors.card,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.specLabel, { color: isActive ? '#fff' : colors.foreground }]}>
                    {spec}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Date Picker */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t('selectDate')}</Text>
          <DatePickerRow
            days={days}
            selectedIndex={selectedDay}
            onSelect={index => {
              setSelectedDay(index);
              setSelectedSlot(null);
            }}
          />
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t('availableTimes')}</Text>
          <TimeSlotPicker
            slots={TIME_SLOTS}
            selectedSlotId={selectedSlot?.id ?? null}
            onSelect={setSelectedSlot}
          />
        </View>
      </ScrollView>

      <BookingFooter
        insets={insets}
        label={loading ? t('booking') : t('confirmAppointment')}
        onPress={handleBook}
        loading={loading}
        disabled={!selectedSpecialty || !selectedSlot}
      />
      <ResultSheet
        visible={!!result}
        title={result?.title ?? ''}
        message={result?.message ?? ''}
        actionLabel={t('viewAppointments')}
        onAction={() => router.push('/(tabs)/appointments')}
        onClose={() => setResult(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  content: { paddingHorizontal: 20, gap: 8 },
  clinicCard: { gap: 0, padding: 0, overflow: 'hidden', marginBottom: 4 },
  clinicTop: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  clinicIcon: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  clinicInfo: { flex: 1, gap: 4 },
  clinicName: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
  clinicStats: { borderTopWidth: 1 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  specialtyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  specLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
});
