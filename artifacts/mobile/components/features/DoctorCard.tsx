import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Doctor } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useColors } from '@/hooks/useColors';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
}

export function DoctorCard({ doctor, onPress }: DoctorCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          <Avatar initials={doctor.avatarInitials} color={doctor.avatarColor} size={52} />
          {doctor.isAvailable ? (
            <View
              style={[styles.onlineDot, { backgroundColor: colors.online, borderColor: colors.card }]}
            />
          ) : null}
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{doctor.name}</Text>
          <Text style={[styles.specialty, { color: colors.mutedForeground }]}>{doctor.specialty}</Text>
          <View style={styles.metaRow}>
            <Feather name="star" size={12} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.foreground }]}>{doctor.rating}</Text>
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>({doctor.reviewCount})</Text>
            <Text style={[styles.dot, { color: colors.border }]}>·</Text>
            <Text style={[styles.muted, { color: colors.mutedForeground }]}>
              {doctor.experienceYears}yr exp
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <Badge
            label={doctor.isAvailable ? 'Available' : 'Busy'}
            variant={doctor.isAvailable ? 'success' : 'muted'}
          />
          <Text style={[styles.fee, { color: colors.primary }]}>SAR {doctor.consultationFee}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  specialty: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  rating: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  muted: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  dot: { fontSize: 12 },
  right: { alignItems: 'flex-end', gap: 8 },
  fee: { fontSize: 13, fontFamily: 'Inter_700Bold' },
});
