import React, { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useRole } from '@/context/RoleContext';
import { useAdmin } from '@/context/AdminContext';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import colors from '@/constants/colors';
import { HomeHealthcareOrder, HomeHealthcareOrderStatus } from '@/types';

const ROLE_COLOR = colors.roles.nurse;

const CARE_LABELS: Record<string, string> = {
  wound_care: 'Wound Care',
  iv_therapy: 'IV Therapy',
  medication_administration: 'Medication Admin',
  vitals_monitoring: 'Vitals Monitoring',
  physiotherapy: 'Physiotherapy',
  post_op_care: 'Post-Op Care',
  other: 'Other',
};

const CARE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  wound_care: 'scissors',
  iv_therapy: 'droplet',
  medication_administration: 'package',
  vitals_monitoring: 'activity',
  physiotherapy: 'zap',
  post_op_care: 'heart',
  other: 'clipboard',
};

const STATUS_NEXT: Record<HomeHealthcareOrderStatus, HomeHealthcareOrderStatus> = {
  pending: 'in-progress',
  'in-progress': 'completed',
  completed: 'completed',
  cancelled: 'cancelled',
};

const STATUS_LABELS: Record<HomeHealthcareOrderStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function NurseOrders() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const { currentStaff } = useRole();
  const { getOrdersForNurse, updateOrderStatus } = useAdmin();
  const [filter, setFilter] = useState<'active' | 'completed'>('active');

  const nurseId = currentStaff?.id ?? 'staff-3';
  const allOrders = getOrdersForNurse(nurseId);
  const activeOrders = allOrders.filter(o => o.status === 'pending' || o.status === 'in-progress');
  const doneOrders = allOrders.filter(o => o.status === 'completed' || o.status === 'cancelled');
  const displayed = filter === 'active' ? activeOrders : doneOrders;
  const sorted = [...displayed].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  const cycleStatus = (order: HomeHealthcareOrder) => {
    if (order.status === 'completed' || order.status === 'cancelled') return;
    const next = STATUS_NEXT[order.status];
    Alert.alert(
      order.patientName,
      next === 'in-progress' ? 'Mark as In Progress (heading to patient now)?' : 'Mark visit as Completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => updateOrderStatus(order.id, next) },
      ],
    );
  };

  const callPatient = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Cannot call', 'Phone calls are not supported on this device.'),
    );
  };

  const navigateToPatient = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Cannot open Maps', 'Please install Google Maps and try again.'),
    );
  };

  const getStatusVariant = (status: HomeHealthcareOrderStatus) => {
    if (status === 'in-progress') return 'warning' as const;
    if (status === 'completed') return 'success' as const;
    if (status === 'cancelled') return 'error' as const;
    return 'muted' as const;
  };

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader
        title="Home Care Orders"
        subtitle={`${activeOrders.length} active · ${doneOrders.length} completed`}
        roleColor={ROLE_COLOR}
      />

      {/* Filter Tabs */}
      <View style={[styles.filterRow, { borderBottomColor: appColors.border }]}>
        {(['active', 'completed'] as const).map(f => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterTab, filter === f && { borderBottomColor: ROLE_COLOR }]}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f ? ROLE_COLOR : appColors.mutedForeground },
              filter === f && { fontFamily: 'Inter_600SemiBold' },
            ]}>
              {f === 'active' ? `Active (${activeOrders.length})` : `Done (${doneOrders.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {sorted.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: `${ROLE_COLOR}12` }]}>
              <Feather name="clipboard" size={32} color={ROLE_COLOR} />
            </View>
            <Text style={[styles.emptyTitle, { color: appColors.foreground }]}>
              {filter === 'active' ? 'No active orders' : 'No completed orders'}
            </Text>
            <Text style={[styles.emptySub, { color: appColors.mutedForeground }]}>
              {filter === 'active'
                ? 'Home care orders assigned by admin will appear here'
                : 'Completed visits will be shown here'}
            </Text>
          </View>
        ) : (
          sorted.map(order => {
            const isDone = order.status === 'completed' || order.status === 'cancelled';
            return (
              <Card key={order.id} style={[styles.orderCard, isDone && { opacity: 0.7 }]}>

                {/* ── Header ── */}
                <View style={styles.orderTop}>
                  <View style={[styles.careIconWrap, { backgroundColor: `${ROLE_COLOR}14` }]}>
                    <Feather name={CARE_ICONS[order.careType]} size={20} color={ROLE_COLOR} />
                  </View>
                  <View style={styles.orderTopMeta}>
                    <Text style={[styles.patientName, { color: appColors.foreground }]}>{order.patientName}</Text>
                    <Text style={[styles.careLabel, { color: ROLE_COLOR }]}>{CARE_LABELS[order.careType]}</Text>
                  </View>
                  <View style={styles.badgeCol}>
                    <Badge
                      label={order.priority === 'urgent' ? '🚨 Urgent' : 'Routine'}
                      variant={order.priority === 'urgent' ? 'error' : 'muted'}
                    />
                    <Badge label={STATUS_LABELS[order.status]} variant={getStatusVariant(order.status)} />
                  </View>
                </View>

                {/* ── Schedule ── */}
                <View style={[styles.scheduleBox, { backgroundColor: `${ROLE_COLOR}08`, borderColor: `${ROLE_COLOR}20` }]}>
                  <Feather name="calendar" size={14} color={ROLE_COLOR} />
                  <Text style={[styles.scheduleText, { color: ROLE_COLOR }]}>
                    {order.scheduledDate}
                  </Text>
                  <View style={[styles.scheduleDivider, { backgroundColor: `${ROLE_COLOR}30` }]} />
                  <Feather name="clock" size={14} color={ROLE_COLOR} />
                  <Text style={[styles.scheduleText, { color: ROLE_COLOR }]}>{order.scheduledTime}</Text>
                </View>

                {/* ── Patient Location ── */}
                <View style={[styles.locationBox, { backgroundColor: appColors.muted, borderColor: appColors.border }]}>
                  <View style={styles.locationHeader}>
                    <Feather name="map-pin" size={14} color={appColors.foreground} />
                    <Text style={[styles.locationLabel, { color: appColors.foreground }]}>Patient Location</Text>
                  </View>
                  <Text style={[styles.locationAddress, { color: appColors.foreground }]}>{order.address}</Text>
                  <Pressable
                    onPress={() => navigateToPatient(order.address)}
                    style={({ pressed }) => [
                      styles.navigateBtn,
                      { backgroundColor: ROLE_COLOR, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Feather name="navigation" size={13} color="#fff" />
                    <Text style={styles.navigateTxt}>Open in Google Maps</Text>
                  </Pressable>
                </View>

                {/* ── Notes ── */}
                {order.notes ? (
                  <View style={[styles.notesBox, { backgroundColor: `${appColors.warning}08`, borderColor: `${appColors.warning}25` }]}>
                    <Feather name="alert-circle" size={13} color={appColors.warning} />
                    <Text style={[styles.notesTxt, { color: appColors.foreground }]}>{order.notes}</Text>
                  </View>
                ) : null}

                {/* ── Actions ── */}
                {!isDone ? (
                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => callPatient(order.patientPhone)}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        { backgroundColor: `${ROLE_COLOR}10`, borderColor: `${ROLE_COLOR}25`, opacity: pressed ? 0.8 : 1 },
                      ]}
                    >
                      <Feather name="phone" size={14} color={ROLE_COLOR} />
                      <Text style={[styles.actionTxt, { color: ROLE_COLOR }]}>Call Patient</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => cycleStatus(order)}
                      style={({ pressed }) => [
                        styles.actionBtn,
                        styles.actionBtnFill,
                        { backgroundColor: ROLE_COLOR, opacity: pressed ? 0.85 : 1 },
                      ]}
                    >
                      <Feather
                        name={order.status === 'pending' ? 'play' : 'check'}
                        size={14}
                        color="#fff"
                      />
                      <Text style={[styles.actionTxt, { color: '#fff' }]}>
                        {order.status === 'pending' ? 'Start Visit' : 'Complete Visit'}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={[styles.completedBadge, { backgroundColor: `${appColors.success}10`, borderColor: `${appColors.success}25` }]}>
                    <Feather name="check-circle" size={14} color={appColors.success} />
                    <Text style={[styles.completedTxt, { color: appColors.success }]}>Visit Completed</Text>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: 'row', borderBottomWidth: 1 },
  filterTab: { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  filterText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  list: { padding: 16, gap: 14 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  emptySub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  orderCard: { gap: 12 },
  orderTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  careIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  orderTopMeta: { flex: 1, gap: 3 },
  patientName: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  careLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  badgeCol: { gap: 5, alignItems: 'flex-end' },
  scheduleBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  scheduleText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  scheduleDivider: { width: 1, height: 14, marginHorizontal: 4 },
  locationBox: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 8 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationLabel: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  locationAddress: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  navigateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 9, borderRadius: 9 },
  navigateTxt: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  notesBox: { flexDirection: 'row', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, alignItems: 'flex-start' },
  notesTxt: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 19 },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 11, borderWidth: 1 },
  actionBtnFill: { borderWidth: 0 },
  actionTxt: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  completedTxt: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
