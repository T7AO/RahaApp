import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { BookingFooter } from '@/components/features/BookingFooter';
import { DatePickerRow } from '@/components/features/DatePickerRow';
import { FormField } from '@/components/features/FormField';
import { ResultSheet } from '@/components/features/ResultSheet';
import { TimeSlotPicker } from '@/components/features/TimeSlotPicker';
import { TIME_SLOTS } from '@/data/mockData';
import { TimeSlot } from '@/types';
import { t } from '@/i18n';
import { createHomeVisitAppointment } from '@/utils/appointments';
import { buildNextDays, formatTimeRangeLabel } from '@/utils/dateTime';

export default function HomeVisitScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addAppointment } = useApp();

  const days = buildNextDays(7);
  const [address, setAddress] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; message: string } | null>(null);

  const handleSubmit = async () => {
    if (!address.trim()) {
      Alert.alert('Address Required', 'Please enter your home address.');
      return;
    }
    if (!symptoms.trim()) {
      Alert.alert('Symptoms Required', 'Please describe your symptoms or reason for the visit.');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Select Time', 'Please select a preferred time slot.');
      return;
    }

    setLoading(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const appointment = createHomeVisitAppointment(days[selectedDay], selectedSlot, symptoms);

    addAppointment(appointment);
    setLoading(false);
    setResult({
      title: 'Visit Requested',
      message: `A Raha doctor will visit you ${formatTimeRangeLabel(days[selectedDay].full, selectedSlot.time)}. Address: ${address}`,
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
        <Text style={[styles.title, { color: colors.foreground }]}>Home Visit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Banner */}
        <View style={[styles.banner, { backgroundColor: colors.primaryLight }]}>
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[styles.bannerText, { color: colors.primary }]}>
            A licensed Raha doctor will visit you at home within the requested time window.
          </Text>
        </View>

        <FormField
          label="Home Address"
          icon="map-pin"
          value={address}
          onChangeText={setAddress}
          placeholder="Enter your full home address"
        />

        <FormField
          label="Symptoms / Reason for Visit"
          value={symptoms}
          onChangeText={setSymptoms}
          placeholder="Describe your symptoms or reason for the visit..."
          multilineField
        />

        {/* Date Picker */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Preferred Date</Text>
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
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Preferred Time</Text>
          <TimeSlotPicker
            slots={TIME_SLOTS}
            selectedSlotId={selectedSlot?.id ?? null}
            onSelect={setSelectedSlot}
          />
        </View>
      </ScrollView>

      <BookingFooter
        insets={insets}
        label={loading ? t('requesting') : t('requestHomeVisit')}
        onPress={handleSubmit}
        loading={loading}
      />
      <ResultSheet
        visible={!!result}
        title={result?.title ?? ''}
        message={result?.message ?? ''}
        actionLabel={t('viewAppointments')}
        onAction={() => router.push('/(tabs)/appointments')}
        onClose={() => setResult(null)}
      />
    </KeyboardAvoidingView>
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
  content: { paddingHorizontal: 20 },
  banner: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  bannerText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  field: { marginBottom: 20 },
  label: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
});
