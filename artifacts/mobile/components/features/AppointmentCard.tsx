import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Appointment, AppointmentType } from '@/types';
import { Badge, BadgeVariant } from '@/components/ui/Badge';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';

const TYPE_LABELS: Record<AppointmentType, string> = {
  virtual: 'Virtual Consult',
  home_visit: 'Home Visit',
  clinic: 'Clinic Visit',
};

const TYPE_ICONS: Record<AppointmentType, keyof typeof Feather.glyphMap> = {
  virtual: 'video',
  home_visit: 'home',
  clinic: 'map-pin',
};

const STATUS_VARIANT: Record<Appointment['status'], BadgeVariant> = {
  upcoming: 'primary',
  completed: 'success',
  cancelled: 'error',
};

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const colors = useColors();
  const { cancelAppointment } = useApp();

  const handleCancel = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel Appointment',
          style: 'destructive',
          onPress: () => cancelAppointment(appointment.id),
        },
      ],
    );
  };

  const statusLabel =
    appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Feather name={TYPE_ICONS[appointment.type]} size={18} color={colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.typeLabel, { color: colors.mutedForeground }]}>
            {TYPE_LABELS[appointment.type]}
          </Text>
          <Text style={[styles.doctorName, { color: colors.foreground }]}>{appointment.doctorName}</Text>
          <Text style={[styles.specialty, { color: colors.mutedForeground }]}>{appointment.specialty}</Text>
        </View>
        <Badge label={statusLabel} variant={STATUS_VARIANT[appointment.status]} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.footer}>
        <View style={styles.detailRow}>
          <Feather name="calendar" size={13} color={colors.mutedForeground} />
          <Text style={[styles.detail, { color: colors.mutedForeground }]}>{appointment.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="clock" size={13} color={colors.mutedForeground} />
          <Text style={[styles.detail, { color: colors.mutedForeground }]}>{appointment.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Feather name="map-pin" size={13} color={colors.mutedForeground} />
          <Text style={[styles.detail, { color: colors.mutedForeground }]}>{appointment.locationOrMode}</Text>
        </View>
        {appointment.status === 'upcoming' ? (
          <Pressable
            onPress={handleCancel}
            style={[styles.cancelBtn, { borderColor: colors.destructive }]}
          >
            <Text style={[styles.cancelLabel, { color: colors.destructive }]}>Cancel</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1, gap: 2 },
  typeLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  doctorName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  specialty: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  divider: { height: 1 },
  footer: {
    padding: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  detail: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  cancelBtn: {
    marginLeft: 'auto',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cancelLabel: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
});
