import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface RoleSettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  value?: string;
  color?: string;
  destructive?: boolean;
  card?: boolean;
}

export function RoleSettingsRow({ icon, label, value, onPress, color, destructive, card }: RoleSettingsRowProps) {
  const colors = useColors();
  const accent = destructive ? colors.destructive : color ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        card && { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 14 },
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: `${accent}15` }]}>
        <Feather name={icon} size={16} color={accent} />
      </View>
      <Text style={[styles.label, { color: destructive ? colors.destructive : colors.foreground }]}>{label}</Text>
      {value ? <Text style={[styles.value, { color: colors.mutedForeground }]}>{value}</Text> : null}
      {!destructive ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  icon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  value: { fontSize: 13, fontFamily: 'Inter_400Regular' },
});
