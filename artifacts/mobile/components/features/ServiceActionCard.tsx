import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface ServiceActionCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

export function ServiceActionCard({ icon, title, subtitle, color, onPress }: ServiceActionCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.88 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${color}14` }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
      </View>
      <View style={[styles.arrow, { backgroundColor: color }]}>
        <Feather name="arrow-right" size={14} color="#fff" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1, gap: 3 },
  title: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  subtitle: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  arrow: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
