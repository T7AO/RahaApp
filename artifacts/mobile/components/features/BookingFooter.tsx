import React from 'react';
import { StyleSheet, View } from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Button } from '@/components/ui/Button';

interface BookingFooterProps {
  insets: EdgeInsets;
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function BookingFooter({ insets, label, onPress, loading, disabled }: BookingFooterProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.footer,
        {
          paddingBottom: insets.bottom + 16,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      ]}
    >
      <Button label={label} onPress={onPress} loading={loading} disabled={disabled} fullWidth size="lg" />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1 },
});
