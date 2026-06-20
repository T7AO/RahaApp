import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useRole } from '@/context/RoleContext';
import { useMedications } from '@/context/MedicationContext';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { MedicationForm } from '@/types';
import colors from '@/constants/colors';

const ROLE_COLOR = colors.roles.doctor;

const FORMS: MedicationForm[] = ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'drops', 'patch', 'inhaler'];
const FREQ_OPTIONS = [1, 2, 3, 4];
const DEFAULT_TIMES: Record<number, string[]> = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
  4: ['08:00', '12:00', '16:00', '20:00'],
};

const MOCK_PATIENTS = ['Ahmed Al-Sayed', 'Nora Al-Zahrani', 'Khalid Al-Mutairi', 'Hana Al-Ghamdi'];

export default function PrescribeScreen() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const { currentStaff } = useRole();
  const { addMedication } = useMedications();

  const [patient, setPatient] = useState(MOCK_PATIENTS[0]);
  const [name, setName] = useState('');
  const [form, setForm] = useState<MedicationForm>('tablet');
  const [concentration, setConcentration] = useState('');
  const [freq, setFreq] = useState(1);
  const [duration, setDuration] = useState('7');
  const [instructions, setInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const doctorName = currentStaff?.name.replace('Dr. ', '') ?? 'Unknown';

  const handlePrescribe = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Enter a medication name.'); return; }
    if (!concentration.trim()) { Alert.alert('Required', 'Enter the concentration.'); return; }

    setSaving(true);
    await addMedication({
      name: name.trim(),
      form,
      concentration: concentration.trim(),
      frequencyPerDay: freq,
      scheduledTimes: DEFAULT_TIMES[freq],
      durationDays: duration === '0' || duration === '' ? -1 : parseInt(duration, 10),
      instructions: instructions.trim() || undefined,
      prescribedBy: doctorName,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(false);

    Alert.alert(
      '✅ Prescription Sent',
      `${name} has been prescribed for ${patient}. The patient will receive medication reminders.`,
      [{ text: 'OK', onPress: () => { setName(''); setConcentration(''); setInstructions(''); setFreq(1); setDuration('7'); } }],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader title="New Prescription" subtitle="Prescribe medication to a patient" roleColor={ROLE_COLOR} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Patient selector */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: appColors.foreground }]}>Patient</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {MOCK_PATIENTS.map(p => (
              <Pressable
                key={p}
                onPress={() => setPatient(p)}
                style={[styles.chip, { backgroundColor: patient === p ? ROLE_COLOR : appColors.muted, borderColor: patient === p ? ROLE_COLOR : appColors.border }]}
              >
                <Text style={[styles.chipText, { color: patient === p ? '#fff' : appColors.foreground }]}>{p.split(' ')[0]}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Medication Name */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: appColors.foreground }]}>Medication Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Amoxicillin"
            placeholderTextColor={appColors.mutedForeground}
            style={[styles.input, { backgroundColor: appColors.card, borderColor: appColors.border, color: appColors.foreground }]}
          />
        </View>

        {/* Form */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: appColors.foreground }]}>Form</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {FORMS.map(f => (
              <Pressable
                key={f}
                onPress={() => setForm(f)}
                style={[styles.chip, { backgroundColor: form === f ? ROLE_COLOR : appColors.muted, borderColor: form === f ? ROLE_COLOR : appColors.border }]}
              >
                <Text style={[styles.chipText, { color: form === f ? '#fff' : appColors.foreground }]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Concentration */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: appColors.foreground }]}>Concentration</Text>
          <TextInput
            value={concentration}
            onChangeText={setConcentration}
            placeholder="e.g. 500mg, 250mg/5ml"
            placeholderTextColor={appColors.mutedForeground}
            style={[styles.input, { backgroundColor: appColors.card, borderColor: appColors.border, color: appColors.foreground }]}
          />
        </View>

        {/* Frequency */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: appColors.foreground }]}>Frequency (times/day)</Text>
          <View style={styles.freqRow}>
            {FREQ_OPTIONS.map(f => (
              <Pressable
                key={f}
                onPress={() => setFreq(f)}
                style={[styles.freqBtn, { backgroundColor: freq === f ? ROLE_COLOR : appColors.muted, borderColor: freq === f ? ROLE_COLOR : appColors.border }]}
              >
                <Text style={[styles.freqText, { color: freq === f ? '#fff' : appColors.foreground }]}>{f}×</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.hint, { color: appColors.mutedForeground }]}>
            Times: {DEFAULT_TIMES[freq].join(', ')}
          </Text>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: appColors.foreground }]}>Duration (days, 0 = ongoing)</Text>
          <TextInput
            value={duration}
            onChangeText={setDuration}
            placeholder="7"
            placeholderTextColor={appColors.mutedForeground}
            keyboardType="number-pad"
            style={[styles.input, { backgroundColor: appColors.card, borderColor: appColors.border, color: appColors.foreground }]}
          />
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: appColors.foreground }]}>Instructions (optional)</Text>
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            placeholder="e.g. Take after meals, avoid grapefruit"
            placeholderTextColor={appColors.mutedForeground}
            style={[styles.input, { backgroundColor: appColors.card, borderColor: appColors.border, color: appColors.foreground, height: 80 }]}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Summary */}
        <View style={[styles.summaryBox, { backgroundColor: `${ROLE_COLOR}08`, borderColor: `${ROLE_COLOR}30` }]}>
          <Feather name="info" size={14} color={ROLE_COLOR} />
          <Text style={[styles.summaryText, { color: ROLE_COLOR }]}>
            {name || '[Medication]'} · {concentration || '[Dose]'} · {freq}× daily · {duration === '0' ? 'Ongoing' : `${duration} days`}
            {'\n'}Prescribed by Dr. {doctorName} → {patient}
          </Text>
        </View>

        <Pressable
          onPress={handlePrescribe}
          disabled={saving}
          style={[styles.submitBtn, { backgroundColor: ROLE_COLOR }, saving && { opacity: 0.6 }]}
        >
          <Feather name="send" size={18} color="#fff" />
          <Text style={styles.submitText}>{saving ? 'Prescribing…' : 'Send Prescription to Patient'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 4 },
  section: { marginBottom: 18 },
  label: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  input: { height: 48, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  freqRow: { flexDirection: 'row', gap: 10 },
  freqBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  freqText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  hint: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 6 },
  summaryBox: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'flex-start', marginBottom: 8 },
  summaryText: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 14 },
  submitText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});
