import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  const colors = useColors();

  const bgMap: Record<BadgeVariant, string> = {
    primary: colors.primaryLight,
    success: colors.successLight,
    warning: colors.warningLight,
    error: '#FDEDED',
    muted: colors.muted,
  };

  const textMap: Record<BadgeVariant, string> = {
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    error: colors.destructive,
    muted: colors.mutedForeground,
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgMap[variant] }]}>
      <Text style={[styles.label, { color: textMap[variant] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
