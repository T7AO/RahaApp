import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { useMedications } from '@/context/MedicationContext';
import { useHealth } from '@/context/HealthContext';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { HealthMetricCard } from '@/components/features/HealthMetricCard';
import { MOCK_CLINICS } from '@/data/mockData';
import { Clinic, HealthMetricType, Medication, MedicationForm } from '@/types';
import colors from '@/constants/colors';

const FORM_ICONS: Record<MedicationForm, keyof typeof Feather.glyphMap> = {
  tablet: 'circle', capsule: 'box', liquid: 'droplet', injection: 'activity',
  cream: 'wind', drops: 'droplet', patch: 'square', inhaler: 'cloud',
};
void FORM_ICONS;

const FREQ_TIMES: Record<number, string[]> = {
  1: ['08:00'],
  2: ['08:00', '20:00'],
  3: ['08:00', '14:00', '20:00'],
  4: ['08:00', '12:00', '16:00', '20:00'],
};

const FORMS: MedicationForm[] = ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'drops', 'patch', 'inhaler'];
const DURATIONS = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: 'Ongoing', value: -1 },
];

const METRIC_TYPES: HealthMetricType[] = ['heartRate', 'steps', 'glucose', 'oxygenSaturation', 'bloodPressure'];

function getStatusColor(status: string, c: ReturnType<typeof useColors>) {
  if (status === 'taken') return c.success;
  if (status === 'missed') return c.destructive;
  if (status === 'snoozed') return c.warning;
  return c.mutedForeground;
}

function getStatusIcon(status: string): keyof typeof Feather.glyphMap {
  if (status === 'taken') return 'check-circle';
  if (status === 'missed') return 'x-circle';
  if (status === 'snoozed') return 'clock';
  return 'circle';
}

interface MedFormState {
  name: string; form: MedicationForm; concentration: string;
  frequencyPerDay: number; durationDays: number; instructions: string;
}
const EMPTY_FORM: MedFormState = {
  name: '', form: 'tablet', concentration: '', frequencyPerDay: 1, durationDays: 7, instructions: '',
};

function MedFormSheet({ visible, initial, onSave, onClose }: {
  visible: boolean; initial: MedFormState; onSave: (d: MedFormState) => void; onClose: () => void;
}) {
  const c = useColors();
  const [form, setForm] = useState<MedFormState>(initial);
  React.useEffect(() => { if (visible) setForm(initial); }, [visible]);
  const set = <K extends keyof MedFormState>(k: K, v: MedFormState[K]) => setForm(p => ({ ...p, [k]: v }));
  const handleSave = () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Enter the medicine name.'); return; }
    if (!form.concentration.trim()) { Alert.alert('Required', 'Enter the concentration.'); return; }
    onSave(form);
  };
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[fs.sheet, { backgroundColor: c.background }]}>
        <View style={[fs.header, { borderBottomColor: c.border }]}>
          <Pressable onPress={onClose}><Text style={[fs.cancel, { color: c.mutedForeground }]}>Cancel</Text></Pressable>
          <Text style={[fs.title, { color: c.foreground }]}>{initial.name ? 'Edit Medicine' : 'Add Medicine'}</Text>
          <Pressable onPress={handleSave} style={[fs.saveBtn, { backgroundColor: c.primary }]}>
            <Text style={fs.saveTxt}>Save</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={fs.body} showsVerticalScrollIndicator={false}>
          <Text style={[fs.label, { color: c.mutedForeground }]}>MEDICINE NAME</Text>
          <TextInput value={form.name} onChangeText={v => set('name', v)} placeholder="e.g. Paracetamol"
            placeholderTextColor={c.mutedForeground}
            style={[fs.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} />
          <Text style={[fs.label, { color: c.mutedForeground }]}>CONCENTRATION</Text>
          <TextInput value={form.concentration} onChangeText={v => set('concentration', v)} placeholder="e.g. 500mg"
            placeholderTextColor={c.mutedForeground}
            style={[fs.input, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} />
          <Text style={[fs.label, { color: c.mutedForeground }]}>FORM</Text>
          <View style={fs.chipRow}>
            {FORMS.map(f => (
              <Pressable key={f} onPress={() => set('form', f)}
                style={[fs.chip, { backgroundColor: form.form === f ? c.primary : c.card, borderColor: form.form === f ? c.primary : c.border }]}>
                <Text style={[fs.chipTxt, { color: form.form === f ? '#fff' : c.foreground }]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={[fs.label, { color: c.mutedForeground }]}>TIMES PER DAY</Text>
          <View style={fs.chipRow}>
            {[1, 2, 3, 4].map(n => (
              <Pressable key={n} onPress={() => set('frequencyPerDay', n)}
                style={[fs.chip, { backgroundColor: form.frequencyPerDay === n ? c.primary : c.card, borderColor: form.frequencyPerDay === n ? c.primary : c.border }]}>
                <Text style={[fs.chipTxt, { color: form.frequencyPerDay === n ? '#fff' : c.foreground }]}>{n}×</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[fs.hint, { color: c.mutedForeground }]}>Schedule: {FREQ_TIMES[form.frequencyPerDay].join(', ')}</Text>
          <Text style={[fs.label, { color: c.mutedForeground }]}>DURATION</Text>
          <View style={fs.chipRow}>
            {DURATIONS.map(d => (
              <Pressable key={d.value} onPress={() => set('durationDays', d.value)}
                style={[fs.chip, { backgroundColor: form.durationDays === d.value ? c.primary : c.card, borderColor: form.durationDays === d.value ? c.primary : c.border }]}>
                <Text style={[fs.chipTxt, { color: form.durationDays === d.value ? '#fff' : c.foreground }]}>{d.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[fs.label, { color: c.mutedForeground }]}>INSTRUCTIONS (optional)</Text>
          <TextInput value={form.instructions} onChangeText={v => set('instructions', v)}
            placeholder="e.g. Take with food" placeholderTextColor={c.mutedForeground} multiline numberOfLines={3}
            style={[fs.input, fs.inputMulti, { backgroundColor: c.card, borderColor: c.border, color: c.foreground }]} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function MedDetailModal({ med, onClose, onEdit, onDelete }: {
  med: Medication; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const c = useColors();
  const handleDelete = () => Alert.alert('Remove Medicine', `Remove ${med.name}?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove', style: 'destructive', onPress: onDelete },
  ]);
  const rows = [
    { label: 'Form', value: med.form.charAt(0).toUpperCase() + med.form.slice(1) },
    { label: 'Concentration', value: med.concentration },
    { label: 'Frequency', value: `${med.frequencyPerDay}× per day` },
    { label: 'Schedule', value: med.scheduledTimes.join(', ') },
    { label: 'Duration', value: med.durationDays === -1 ? 'Ongoing' : `${med.durationDays} days` },
    { label: 'Start Date', value: med.startDate },
    ...(med.instructions ? [{ label: 'Instructions', value: med.instructions }] : []),
    ...(med.prescribedBy ? [{ label: 'Prescribed by', value: med.prescribedBy }] : []),
  ];
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[fd.sheet, { backgroundColor: c.background }]}>
        <View style={[fd.header, { borderBottomColor: c.border }]}>
          <Pressable onPress={onClose} style={fd.closeBtn}><Feather name="x" size={20} color={c.foreground} /></Pressable>
          <Text style={[fd.title, { color: c.foreground }]}>{med.name}</Text>
          <Pressable onPress={onEdit} style={[fd.editBtn, { backgroundColor: c.primaryLight }]}>
            <Feather name="edit-2" size={14} color={c.primary} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={fd.body} showsVerticalScrollIndicator={false}>
          <View style={[fd.dot, { backgroundColor: med.color }]} />
          <View style={[fd.infoCard, { backgroundColor: c.card, borderColor: c.border }]}>
            {rows.map((row, i) => (
              <View key={row.label}>
                <View style={fd.row}>
                  <Text style={[fd.rowLabel, { color: c.mutedForeground }]}>{row.label}</Text>
                  <Text style={[fd.rowValue, { color: c.foreground, flex: 1, textAlign: 'right' }]}>{row.value}</Text>
                </View>
                {i < rows.length - 1 && <View style={[fd.divider, { backgroundColor: c.border }]} />}
              </View>
            ))}
          </View>
          <Pressable onPress={handleDelete}
            style={[fd.deleteBtn, { backgroundColor: `${c.destructive}10`, borderColor: `${c.destructive}30` }]}>
            <Feather name="trash-2" size={15} color={c.destructive} />
            <Text style={[fd.deleteTxt, { color: c.destructive }]}>Remove Medicine</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

function formatSyncTime(iso: string | null): string {
  if (!iso) return 'Not synced';
  const diffMins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  return `${Math.floor(diffMins / 60)}h ago`;
}

export default function HealthScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile } = useApp();
  const { medications, addMedication, updateMedication, deleteMedication, logDose, snoozeNotification, getTodayDoses, getActiveMedications } = useMedications();
  const { snapshot, isConnected, lastSynced, requestConnection, manualUpdate, refresh } = useHealth();

  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInit, setFormInit] = useState<MedFormState>(EMPTY_FORM);
  const [editingMetric, setEditingMetric] = useState<HealthMetricType | null>(null);
  const [editValue, setEditValue] = useState('');

  const activeMeds = getActiveMedications();
  const todayDoses = getTodayDoses();

  const [dobDay, dobMonth, dobYear] = userProfile.dateOfBirth.split('-').reverse();
  const initials = userProfile.name.split(' ').map((n: string) => n[0]).join('');

  const openAdd = () => { setEditingId(null); setFormInit(EMPTY_FORM); setShowForm(true); };
  const openEdit = (med: Medication) => {
    setShowDetail(false);
    setEditingId(med.id);
    setFormInit({ name: med.name, form: med.form, concentration: med.concentration, frequencyPerDay: med.frequencyPerDay, durationDays: med.durationDays, instructions: med.instructions ?? '' });
    setShowForm(true);
  };
  const handleSave = async (data: MedFormState) => {
    const payload = { name: data.name.trim(), form: data.form, concentration: data.concentration.trim(), frequencyPerDay: data.frequencyPerDay, scheduledTimes: FREQ_TIMES[data.frequencyPerDay], durationDays: data.durationDays, instructions: data.instructions.trim() || undefined };
    if (editingId) await updateMedication(editingId, payload); else await addMedication(payload);
    setShowForm(false); setSelectedMed(null);
  };
  const handleDelete = async (id: string) => { await deleteMedication(id); setShowDetail(false); setSelectedMed(null); };

  const handleDoseTap = (medId: string, scheduledTime: string, status: string) => {
    if (status === 'taken') return;
    const med = medications.find(m => m.id === medId);
    if (!med) return;
    Alert.alert(`${med.name} – ${scheduledTime}`, 'What would you like to do?', [
      { text: '✅ Mark Taken', onPress: () => logDose(medId, scheduledTime, 'taken') },
      { text: '⏰ Snooze 20 min', onPress: () => snoozeNotification(medId, scheduledTime) },
      { text: '❌ Mark Missed', style: 'destructive', onPress: () => logDose(medId, scheduledTime, 'missed') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleMetricPress = (type: HealthMetricType) => {
    setEditingMetric(type);
    setEditValue(String(snapshot.metrics[type]?.value ?? ''));
  };
  const handleManualSave = () => {
    if (!editingMetric) return;
    const val = parseFloat(editValue);
    if (isNaN(val)) { Alert.alert('Invalid', 'Enter a valid number.'); return; }
    manualUpdate(editingMetric, val);
    setEditingMetric(null); setEditValue('');
  };

  const handleConnect = async () => {
    await requestConnection();
    Alert.alert(Platform.OS === 'ios' ? '✅ Apple Health Connected' : '✅ Google Health Connected',
      'Your health metrics are now syncing.');
  };

  const openMaps = (clinic: Clinic) => {
    const url = clinic.lat && clinic.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ' ' + clinic.address)}`;
    Linking.openURL(url).catch(() => Alert.alert('Could not open Maps'));
  };

  return (
    <>
      {/* ─── Fixed Header ─── */}
      <View style={[sh.fixedHeader, { paddingTop: insets.top + 12, backgroundColor: c.background, borderBottomColor: c.border }]}>
        <View style={sh.headerLeft}>
          <View style={[sh.brandDot, { backgroundColor: colors.roles.patient }]} />
          <Text style={[sh.headerTitle, { color: c.foreground }]}>My Health</Text>
        </View>
        <Pressable onPress={refresh} style={[sh.refreshBtn, { backgroundColor: c.primaryLight }]}>
          <Feather name="refresh-cw" size={14} color={c.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: c.background }]}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Patient Card ─── */}
        <Card style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: c.primaryLight }]}>
            <Text style={[styles.avatarText, { color: c.primary }]}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: c.foreground }]}>{userProfile.name}</Text>
            <Text style={[styles.profileSub, { color: c.mutedForeground }]}>
              {userProfile.bloodType} · Born {dobDay}/{dobMonth}/{dobYear}
            </Text>
          </View>
        </Card>

        {/* ─── Health Indicators ─── */}
        <SectionHeader
          title="Health Indicators"
          rightElement={
            <Pressable onPress={refresh} style={[styles.refreshSmall, { backgroundColor: c.primaryLight }]}>
              <Feather name="refresh-cw" size={12} color={c.primary} />
            </Pressable>
          }
        />

        {/* Connect Banner */}
        <Pressable
          onPress={isConnected ? refresh : handleConnect}
          style={({ pressed }) => [
            styles.connectBanner,
            {
              backgroundColor: isConnected ? c.successLight : `${colors.roles.patient}08`,
              borderColor: isConnected ? `${c.success}40` : `${colors.roles.patient}25`,
            },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Feather
            name={isConnected ? 'check-circle' : 'heart'}
            size={18}
            color={isConnected ? c.success : colors.roles.patient}
          />
          <View style={styles.connectText}>
            <Text style={[styles.connectTitle, { color: isConnected ? c.success : colors.roles.patient }]}>
              {isConnected
                ? (Platform.OS === 'ios' ? 'Apple Health Connected' : 'Google Health Connected')
                : (Platform.OS === 'ios' ? 'Connect Apple Health' : 'Connect Google Health')}
            </Text>
            <Text style={[styles.connectSub, { color: c.mutedForeground }]}>
              {isConnected ? `Synced ${formatSyncTime(lastSynced)}` : 'Tap to sync heart rate, steps, glucose & more'}
            </Text>
          </View>
          <Feather name={isConnected ? 'refresh-cw' : 'arrow-right'} size={14} color={isConnected ? c.success : colors.roles.patient} />
        </Pressable>

        {/* Manual entry box */}
        {editingMetric ? (
          <View style={[styles.editBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.editTitle, { color: c.foreground }]}>Manual entry: {editingMetric}</Text>
            <View style={styles.editRow}>
              <TextInput value={editValue} onChangeText={setEditValue} keyboardType="decimal-pad"
                placeholder="Enter value" placeholderTextColor={c.mutedForeground} autoFocus
                style={[styles.editInput, { backgroundColor: c.muted, color: c.foreground, borderColor: c.border }]} />
              <Pressable onPress={handleManualSave} style={[styles.editSave, { backgroundColor: c.primary }]}>
                <Text style={styles.editSaveTxt}>Save</Text>
              </Pressable>
              <Pressable onPress={() => setEditingMetric(null)} style={[styles.editCancel, { borderColor: c.border }]}>
                <Feather name="x" size={14} color={c.mutedForeground} />
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.metricsGrid}>
          {METRIC_TYPES.map(type => (
            <View key={type} style={styles.metricCell}>
              <HealthMetricCard type={type} metric={snapshot.metrics[type]} onPress={() => handleMetricPress(type)} />
            </View>
          ))}
        </View>
        <Text style={[styles.tapHint, { color: c.mutedForeground }]}>Tap a card to enter a value manually</Text>

        {/* ─── My Medicines ─── */}
        <SectionHeader
          title="My Medicines"
          style={{ marginTop: 8 }}
          rightElement={
            <Pressable onPress={openAdd} style={[styles.addBtn, { backgroundColor: c.primary }]}>
              <Feather name="plus" size={14} color="#fff" />
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          }
        />

        {activeMeds.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Feather name="package" size={26} color={c.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: c.foreground }]}>No medicines yet</Text>
            <Text style={[styles.emptySub, { color: c.mutedForeground }]}>Tap "+ Add" to track your medicines</Text>
          </Card>
        ) : (
          <View style={styles.medList}>
            {activeMeds.map(med => (
              <Pressable key={med.id}
                onPress={() => { setSelectedMed(med); setShowDetail(true); }}
                style={({ pressed }) => [styles.medCard, { backgroundColor: c.card, borderColor: c.border }, pressed && { opacity: 0.82 }]}>
                <View style={[styles.medDot, { backgroundColor: med.color }]} />
                <View style={styles.medMeta}>
                  <Text style={[styles.medName, { color: c.foreground }]}>{med.name}</Text>
                  <Text style={[styles.medSub, { color: c.mutedForeground }]}>{med.concentration} · {med.form}</Text>
                </View>
                <View style={styles.medRight}>
                  <Badge label={`${med.frequencyPerDay}× daily`} variant="primary" />
                  <Feather name="chevron-right" size={16} color={c.mutedForeground} />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* ─── Today's Tracking ─── */}
        <SectionHeader title="Today's Tracking" style={{ marginTop: 8 }} />
        {todayDoses.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptySub, { color: c.mutedForeground }]}>No medicines scheduled for today</Text>
          </Card>
        ) : (
          <View style={styles.trackingList}>
            {todayDoses.map(({ medication: med, log }) => (
              <Card key={med.id} style={styles.trackCard}>
                <View style={styles.trackHeader}>
                  <View style={[styles.trackDot, { backgroundColor: med.color }]} />
                  <Text style={[styles.trackName, { color: c.foreground }]}>{med.name}</Text>
                  <Text style={[styles.trackConc, { color: c.mutedForeground }]}>{med.concentration}</Text>
                </View>
                <View style={styles.dosesRow}>
                  {log.doses.map(dose => {
                    const sc = getStatusColor(dose.status, c);
                    const si = getStatusIcon(dose.status);
                    const isPending = dose.status === 'pending';
                    return (
                      <Pressable key={dose.scheduledTime}
                        onPress={() => handleDoseTap(med.id, dose.scheduledTime, dose.status)}
                        style={({ pressed }) => [styles.doseChip, { backgroundColor: isPending ? c.primaryLight : `${sc}15`, borderColor: isPending ? c.primary : sc, opacity: pressed ? 0.8 : 1 }]}>
                        <Feather name={si} size={12} color={sc} />
                        <Text style={[styles.doseTime, { color: isPending ? c.primary : sc }]}>{dose.scheduledTime}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ─── Our Clinics ─── */}
        <SectionHeader title="Our Clinics" style={{ marginTop: 8 }} />
        <View style={styles.clinicList}>
          {MOCK_CLINICS.map(clinic => (
            <Card key={clinic.id} style={styles.clinicCard}>
              <View style={styles.clinicNameRow}>
                <Text style={[styles.clinicName, { color: c.foreground }]}>{clinic.name}</Text>
                <Badge label={clinic.isOpen ? 'Open' : 'Closed'} variant={clinic.isOpen ? 'success' : 'muted'} />
              </View>
              {[
                { icon: 'map-pin' as const, text: `${clinic.address} · ${clinic.distanceKm} km` },
                { icon: 'clock' as const, text: clinic.openingHours },
                { icon: 'phone' as const, text: clinic.phone },
              ].map(row => (
                <View key={row.icon} style={styles.clinicRow}>
                  <Feather name={row.icon} size={12} color={c.mutedForeground} />
                  <Text style={[styles.clinicMeta, { color: c.mutedForeground }]}>{row.text}</Text>
                </View>
              ))}
              <View style={styles.clinicSpecialties}>
                {clinic.specialties.slice(0, 3).map(s => (
                  <View key={s} style={[styles.specChip, { backgroundColor: c.primaryLight }]}>
                    <Text style={[styles.specText, { color: c.primary }]}>{s}</Text>
                  </View>
                ))}
              </View>
              <Pressable onPress={() => openMaps(clinic)}
                style={({ pressed }) => [styles.directionsBtn, { backgroundColor: c.primary, opacity: pressed ? 0.85 : 1 }]}>
                <Feather name="navigation" size={14} color="#fff" />
                <Text style={styles.directionsTxt}>Get Directions</Text>
              </Pressable>
            </Card>
          ))}
        </View>
      </ScrollView>

      {showDetail && selectedMed ? (
        <MedDetailModal
          med={selectedMed}
          onClose={() => { setShowDetail(false); setSelectedMed(null); }}
          onEdit={() => openEdit(selectedMed)}
          onDelete={() => handleDelete(selectedMed.id)}
        />
      ) : null}
      <MedFormSheet visible={showForm} initial={formInit} onSave={handleSave} onClose={() => setShowForm(false)} />
    </>
  );
}

const sh = StyleSheet.create({
  fixedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: { width: 8, height: 8, borderRadius: 4 },
  headerTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  refreshBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  profileSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  refreshSmall: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  connectBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 14, marginTop: 8 },
  connectText: { flex: 1 },
  connectTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  connectSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  editBox: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10, marginBottom: 10 },
  editTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  editRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  editInput: { flex: 1, height: 42, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  editSave: { height: 42, paddingHorizontal: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  editSaveTxt: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  editCancel: { width: 42, height: 42, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6, marginTop: 4 },
  metricCell: { width: '47%' },
  tapHint: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', marginBottom: 24 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  addBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  emptyCard: { alignItems: 'center', gap: 8, paddingVertical: 24, marginBottom: 24 },
  emptyTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  emptySub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  medList: { gap: 8, marginBottom: 24 },
  medCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  medDot: { width: 12, height: 12, borderRadius: 6 },
  medMeta: { flex: 1, gap: 3 },
  medName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  medSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  medRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackingList: { gap: 10, marginBottom: 24 },
  trackCard: { gap: 10 },
  trackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackDot: { width: 10, height: 10, borderRadius: 5 },
  trackName: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  trackConc: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  dosesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  doseChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  doseTime: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  clinicList: { gap: 12, marginBottom: 24 },
  clinicCard: { gap: 10 },
  clinicNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clinicName: { fontSize: 15, fontFamily: 'Inter_700Bold', flex: 1, marginRight: 8 },
  clinicRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clinicMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
  clinicSpecialties: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  specChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  specText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  directionsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 12 },
  directionsTxt: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
});

const fs = StyleSheet.create({
  sheet: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  cancel: { fontSize: 14, fontFamily: 'Inter_400Regular', width: 60 },
  title: { fontSize: 16, fontFamily: 'Inter_700Bold', textAlign: 'center', flex: 1 },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, width: 60, alignItems: 'center' },
  saveTxt: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  body: { padding: 20, gap: 6 },
  label: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, fontFamily: 'Inter_400Regular', marginTop: 6 },
  inputMulti: { minHeight: 72, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipTxt: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  hint: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 4 },
});

const fd = StyleSheet.create({
  sheet: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontSize: 17, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  editBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  body: { padding: 20, gap: 16, alignItems: 'center' },
  dot: { width: 40, height: 40, borderRadius: 20 },
  infoCard: { width: '100%', borderRadius: 14, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  rowLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  rowValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  divider: { height: 1, marginHorizontal: 14 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  deleteTxt: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
