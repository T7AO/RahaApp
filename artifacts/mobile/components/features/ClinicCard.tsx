import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Clinic } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { useColors } from '@/hooks/useColors';

interface ClinicCardProps {
  clinic: Clinic;
  onPress: () => void;
}

export function ClinicCard({ clinic, onPress }: ClinicCardProps) {
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
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Feather name="plus-circle" size={24} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{clinic.name}</Text>
          <View style={styles.row}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} />
            <Text style={[styles.address, { color: colors.mutedForeground }]} numberOfLines={1}>
              {clinic.address}
            </Text>
          </View>
        </View>
        <Badge label={clinic.isOpen ? 'Open' : 'Closed'} variant={clinic.isOpen ? 'success' : 'error'} />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather name="star" size={12} color="#F59E0B" />
          <Text style={[styles.metaStrong, { color: colors.foreground }]}>{clinic.rating}</Text>
          <Text style={[styles.metaMuted, { color: colors.mutedForeground }]}>({clinic.reviewCount})</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="navigation" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaMuted, { color: colors.mutedForeground }]}>{clinic.distanceKm} km</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="clock" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaMuted, { color: colors.mutedForeground }]}>{clinic.openingHours}</Text>
        </View>
      </View>

      <View style={styles.specialties}>
        {clinic.specialties.slice(0, 3).map(s => (
          <View key={s} style={[styles.chip, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.chipText, { color: colors.primary }]}>{s}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  address: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaStrong: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  metaMuted: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  specialties: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  chipText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
});
