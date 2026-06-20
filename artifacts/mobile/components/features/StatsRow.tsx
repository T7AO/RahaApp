import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

export interface StatItem {
  icon?: keyof typeof Feather.glyphMap;
  value: string | number;
  label: string;
  color?: string;
}

interface StatsRowProps {
  items: StatItem[];
  divided?: boolean;
}

export function StatsRow({ items, divided }: StatsRowProps) {
  const colors = useColors();

  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {divided && index > 0 ? <View style={[styles.divider, { backgroundColor: colors.border }]} /> : null}
          <View style={styles.item}>
            {item.icon ? <Feather name={item.icon} size={15} color={item.color ?? colors.primary} /> : null}
            <Text style={[styles.value, { color: colors.foreground }]} numberOfLines={1}>
              {item.value}
            </Text>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{item.label}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 12 },
  value: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  label: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  divider: { width: 1, height: 36 },
});
