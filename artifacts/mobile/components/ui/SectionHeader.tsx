import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  rightElement?: React.ReactNode;
  style?: import('react-native').ViewStyle;
}

export function SectionHeader({ title, actionLabel, onAction, rightElement, style }: SectionHeaderProps) {
  const colors = useColors();
  return (
    <View style={[styles.row, style]}>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {rightElement ?? null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text style={[styles.action, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  action: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
});
