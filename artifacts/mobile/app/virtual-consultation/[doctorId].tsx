import React, { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { BookingFooter } from '@/components/features/BookingFooter';
import { DatePickerRow } from '@/components/features/DatePickerRow';
import { ResultSheet } from '@/components/features/ResultSheet';
import { StatsRow } from '@/components/features/StatsRow';
import { TimeSlotPicker } from '@/components/features/TimeSlotPicker';
import { MOCK_DOCTORS, TIME_SLOTS } from '@/data/mockData';
import { TimeSlot } from '@/types';
import { t } from '@/i18n';
import { createVirtualAppointment } from '@/utils/appointments';
import { buildNextDays, formatTimeRangeLabel } from '@/utils/dateTime';

export default function DoctorDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { doctorId } = useLocalSearchParams<{ doctorId: string }>();
  const { addAppointment } = useApp();

  const doctor = MOCK_DOCTORS.find(d => d.id === doctorId);
  const days = buildNextDays(7);

  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [booking, setBooking] = useState(false);
  const [result, setResult] = useState<{ title: string; message: string } | null>(null);

  if (!doctor) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ErrorState
          title="Doctor not found"
          message="This doctor profile is not available anymore."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const handleBook = async () => {
    if (!selectedSlot) {
      Alert.alert('Select a Time', 'Please pick an available time slot.');
      return;
    }
    setBooking(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const appointment = createVirtualAppointment(doctor, days[selectedDay], selectedSlot);

    addAppointment(appointment);
    setBooking(false);
    setResult({
      title: 'Appointment Booked',
      message: `Virtual consultation with ${doctor.name} confirmed for ${formatTimeRangeLabel(days[selectedDay].full, selectedSlot.time)}.`,
    });
  };

  const STAT_ITEMS = [
    { icon: 'star' as const, value: `${doctor.rating}`, label: 'Rating' },
    { icon: 'users' as const, value: `${doctor.reviewCount}+`, label: 'Reviews' },
    { icon: 'briefcase' as const, value: `${doctor.experienceYears}yr`, label: 'Experience' },
  ];

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Doctor Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard} padding={0}>
          <View style={styles.profileTop}>
            <View style={styles.avatarWrap}>
              <Avatar initials={doctor.avatarInitials} color={doctor.avatarColor} size={64} />
              {doctor.isAvailable ? (
                <View
                  style={[styles.onlineDot, { backgroundColor: colors.online, borderColor: colors.card }]}
                />
              ) : null}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.doctorName, { color: colors.foreground }]}>{doctor.name}</Text>
              <Text style={[styles.specialty, { color: colors.mutedForeground }]}>{doctor.specialty}</Text>
              <Badge
                label={doctor.isAvailable ? 'Available Now' : 'Unavailable'}
                variant={doctor.isAvailable ? 'success' : 'muted'}
              />
            </View>
          </View>

          <View style={[styles.statsWrap, { borderTopColor: colors.border }]}>
            <StatsRow items={STAT_ITEMS} />
          </View>
        </Card>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About</Text>
          <Text style={[styles.bio, { color: colors.mutedForeground }]}>{doctor.bio}</Text>
        </View>

        {/* Fee */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Consultation Fee</Text>
          <Text style={[styles.fee, { color: colors.primary }]}>
            SAR {doctor.consultationFee}
            {'  '}
            <Text style={[styles.feeSub, { color: colors.mutedForeground }]}>/ session</Text>
          </Text>
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
        label={booking ? t('booking') : `Book · SAR ${doctor.consultationFee}`}
        onPress={handleBook}
        loading={booking}
        disabled={!selectedSlot || !doctor.isAvailable}
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
  profileCard: { overflow: 'hidden', marginBottom: 4 },
  profileTop: { flexDirection: 'row', gap: 14, padding: 16, alignItems: 'flex-start' },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  profileInfo: { flex: 1, gap: 6 },
  doctorName: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  specialty: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  statsWrap: { borderTopWidth: 1 },
  section: { marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginBottom: 10 },
  bio: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 22 },
  fee: { fontSize: 26, fontFamily: 'Inter_700Bold' },
  feeSub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});
