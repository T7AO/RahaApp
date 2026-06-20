import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  fullWidth = false,
}: ButtonProps) {
  const colors = useColors();

  const bg =
    variant === 'primary' ? colors.primary
    : variant === 'secondary' ? colors.secondary
    : variant === 'destructive' ? colors.destructive
    : 'transparent';

  const borderColor = variant === 'outline' ? colors.primary : 'transparent';
  const textColor = variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF';
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 16 : 15;
  const paddingH = size === 'sm' ? 14 : size === 'lg' ? 24 : 20;
  const paddingV = size === 'sm' ? 8 : size === 'lg' ? 16 : 14;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingHorizontal: paddingH,
          paddingVertical: paddingV,
          opacity: disabled || loading ? 0.5 : pressed ? 0.82 : 1,
          transform: pressed ? [{ scale: 0.98 }] : [],
          alignSelf: fullWidth ? ('stretch' as const) : ('flex-start' as const),
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={textColor} /> : icon ?? null}
      <Text style={[styles.label, { color: textColor, fontSize }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
  },
  label: { fontFamily: 'Inter_600SemiBold' },
});
