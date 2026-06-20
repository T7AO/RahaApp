import React from 'react';
import {
  Alert,
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
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { useMedications } from '@/context/MedicationContext';
import { useHealth } from '@/context/HealthContext';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { AppointmentCard } from '@/components/features/AppointmentCard';
import { HomeBlog } from '@/components/features/home/HomeBlog';
import { HomeServices } from '@/components/features/home/HomeServices';
import colors from '@/constants/colors';

const METRIC_SUMMARY = [
  { key: 'heartRate' as const,        icon: 'heart' as const,    color: '#E74C3C', label: 'Heart Rate',    unit: 'bpm' },
  { key: 'steps' as const,            icon: 'activity' as const, color: '#1A73E8', label: 'Steps',         unit: '' },
  { key: 'oxygenSaturation' as const, icon: 'wind' as const,     color: '#27AE60', label: 'SpO₂',         unit: '%' },
];

export default function HomeScreen() {
  const appColors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { appointments, userProfile } = useApp();
  const { getTodayDoses, logDose, snoozeNotification } = useMedications();
  const { snapshot, isConnected, requestConnection } = useHealth();

  const nextAppointment = appointments.find(a => a.status === 'upcoming');
  const firstName = userProfile.name.split(' ')[0];
  const todayDoses = getTodayDoses();
  const pendingCount = todayDoses.reduce((acc, { log }) => acc + log.doses.filter(d => d.status === 'pending').length, 0);
  const takenCount = todayDoses.reduce((acc, { log }) => acc + log.doses.filter(d => d.status === 'taken').length, 0);

  const handleDoseTap = (medId: string, scheduledTime: string, medName: string) => {
    Alert.alert(
      `${medName} – ${scheduledTime}`,
      'What would you like to do?',
      [
        { text: '✅ Mark Taken', onPress: () => logDose(medId, scheduledTime, 'taken') },
        { text: '⏰ Snooze 20 min', onPress: () => snoozeNotification(medId, scheduledTime) },
        { text: '❌ Mark Missed', style: 'destructive', onPress: () => logDose(medId, scheduledTime, 'missed') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleConnect = async () => {
    await requestConnection();
    Alert.alert(
      Platform.OS === 'ios' ? '✅ Apple Health Connected' : '✅ Google Health Connected',
      'Your health metrics are now syncing.',
    );
  };

  const formatMetricValue = (key: typeof METRIC_SUMMARY[0]['key']) => {
    const m = snapshot.metrics[key];
    if (!m) return '—';
    if (key === 'steps') return m.value.toLocaleString();
    return String(m.value);
  };

  const renderMetricValue = (key: typeof METRIC_SUMMARY[0]['key']) => {
    if (!snapshot.metrics[key]) return '-';
    return formatMetricValue(key);
  };

  const renderMetricLabel = (metric: typeof METRIC_SUMMARY[number]) =>
    metric.key === 'oxygenSaturation' ? 'SpO2' : metric.label;

  return (
    <View style={[styles.root, { backgroundColor: appColors.background }]}>
      {/* ─── Fixed Header ─── */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            backgroundColor: appColors.background,
            borderBottomColor: appColors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.brandDot, { backgroundColor: colors.roles.patient }]} />
          <Text style={[styles.brandText, { color: appColors.foreground }]}>Raha Health</Text>
        </View>
        <Pressable
          style={[styles.notifBtn, { backgroundColor: appColors.card, borderColor: appColors.border }]}
        >
          <Feather name="bell" size={18} color={appColors.foreground} />
        </Pressable>
      </View>

      {/* ─── Scrollable Body ─── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.greetSub, { color: appColors.mutedForeground }]}>Good morning,</Text>
          <Text style={[styles.greetName, { color: appColors.foreground }]}>{firstName} 👋</Text>
        </View>

        {/* ── Our Services (vertical) ── */}
        <View style={styles.section}>
          <HomeServices />
        </View>

        {/* ── Health Indicators Overview ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Health Indicators"
            actionLabel="Details"
            onAction={() => router.push('/(tabs)/health')}
          />

          {!isConnected ? (
            <Pressable
              onPress={handleConnect}
              style={({ pressed }) => [
                styles.connectBanner,
                { backgroundColor: `${colors.roles.patient}08`, borderColor: `${colors.roles.patient}25` },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={[styles.connectIcon, { backgroundColor: `${colors.roles.patient}15` }]}>
                <Feather name="heart" size={18} color={colors.roles.patient} />
              </View>
              <View style={styles.connectText}>
                <Text style={[styles.connectTitle, { color: appColors.foreground }]}>
                  {Platform.OS === 'ios' ? 'Connect Apple Health' : 'Connect Google Health'}
                </Text>
                <Text style={[styles.connectSub, { color: appColors.mutedForeground }]}>
                  Sync your heart rate, steps & more
                </Text>
              </View>
              <Feather name="arrow-right" size={16} color={colors.roles.patient} />
            </Pressable>
          ) : null}

          <View style={styles.metricsRow}>
            {METRIC_SUMMARY.map(m => (
              <View
                key={m.key}
                style={[styles.miniMetric, { backgroundColor: appColors.card, borderColor: appColors.border }]}
              >
                <View style={[styles.miniMetricIcon, { backgroundColor: `${m.color}14` }]}>
                  <Feather name={m.icon} size={16} color={m.color} />
                </View>
                <Text style={[styles.miniMetricValue, { color: appColors.foreground }]}>
                  {renderMetricValue(m.key)}
                </Text>
                <Text style={[styles.miniMetricLabel, { color: appColors.mutedForeground }]}>
                  {renderMetricLabel(m)}{m.unit ? ` · ${m.unit}` : ''}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Medication Tracking ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Today's Medicines"
            actionLabel="Manage"
            onAction={() => router.push('/(tabs)/health')}
          />

          {todayDoses.length === 0 ? (
            <Card style={styles.medEmptyCard}>
              <View style={[styles.medEmptyIcon, { backgroundColor: `${colors.roles.patient}12` }]}>
                <Feather name="package" size={22} color={colors.roles.patient} />
              </View>
              <View style={styles.medEmptyText}>
                <Text style={[styles.medEmptyTitle, { color: appColors.foreground }]}>
                  No medicines added yet
                </Text>
                <Text style={[styles.medEmptySub, { color: appColors.mutedForeground }]}>
                  Add your medicines in My Health to track daily doses
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/health')}
                style={[styles.medEmptyBtn, { backgroundColor: colors.roles.patient }]}
              >
                <Feather name="plus" size={14} color="#fff" />
              </Pressable>
            </Card>
          ) : (
            <>
              {/* Summary row */}
              <View style={styles.medSummaryRow}>
                {[
                  { label: 'Pending', count: pendingCount, color: colors.roles.patient },
                  { label: 'Taken', count: takenCount, color: '#27AE60' },
                  { label: 'Total', count: todayDoses.reduce((a, { log }) => a + log.doses.length, 0), color: appColors.mutedForeground },
                ].map(s => (
                  <View key={s.label} style={[styles.medSummaryChip, { backgroundColor: `${s.color}10`, borderColor: `${s.color}20` }]}>
                    <Text style={[styles.medSummaryCount, { color: s.color }]}>{s.count}</Text>
                    <Text style={[styles.medSummaryLabel, { color: appColors.mutedForeground }]}>{s.label}</Text>
                  </View>
                ))}
              </View>

              {/* Dose chips */}
              {todayDoses.map(({ medication: med, log }) => {
                const pending = log.doses.filter(d => d.status === 'pending');
                if (pending.length === 0) return null;
                return (
                  <Card key={med.id} style={styles.medTrackCard}>
                    <View style={styles.medTrackHeader}>
                      <View style={[styles.medDot, { backgroundColor: med.color }]} />
                      <Text style={[styles.medTrackName, { color: appColors.foreground }]}>{med.name}</Text>
                      <Text style={[styles.medTrackConc, { color: appColors.mutedForeground }]}>
                        {med.concentration}
                      </Text>
                    </View>
                    <View style={styles.dosesRow}>
                      {pending.map(dose => (
                        <Pressable
                          key={dose.scheduledTime}
                          onPress={() => handleDoseTap(med.id, dose.scheduledTime, med.name)}
                          style={({ pressed }) => [
                            styles.doseChip,
                            {
                              backgroundColor: `${colors.roles.patient}12`,
                              borderColor: colors.roles.patient,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                        >
                          <Feather name="circle" size={10} color={colors.roles.patient} />
                          <Text style={[styles.doseTime, { color: colors.roles.patient }]}>
                            {dose.scheduledTime}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </Card>
                );
              })}
            </>
          )}
        </View>

        {/* ── Next Appointment ── */}
        {nextAppointment ? (
          <View style={styles.section}>
            <SectionHeader
              title="Next Appointment"
              actionLabel="All"
              onAction={() => router.push('/(tabs)/appointments')}
            />
            <AppointmentCard appointment={nextAppointment} />
          </View>
        ) : null}

        {/* ── Blog ── */}
        <View style={styles.section}>
          <HomeBlog />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandDot: { width: 8, height: 8, borderRadius: 4 },
  brandText: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  greeting: { marginBottom: 28 },
  greetSub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  greetName: { fontSize: 26, fontFamily: 'Inter_700Bold', marginTop: 2 },
  section: { marginBottom: 28 },
  connectBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  connectIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  connectText: { flex: 1 },
  connectTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  connectSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  metricsRow: { flexDirection: 'row', gap: 10 },
  miniMetric: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
    alignItems: 'center',
  },
  miniMetricIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  miniMetricValue: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  miniMetricLabel: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  medEmptyCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  medEmptyIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  medEmptyText: { flex: 1, gap: 3 },
  medEmptyTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  medEmptySub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  medEmptyBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  medSummaryRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  medSummaryChip: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 3 },
  medSummaryCount: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  medSummaryLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  medTrackCard: { gap: 10, marginBottom: 8 },
  medTrackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  medDot: { width: 10, height: 10, borderRadius: 5 },
  medTrackName: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  medTrackConc: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  dosesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  doseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  doseTime: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});
