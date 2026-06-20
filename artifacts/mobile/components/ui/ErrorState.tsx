import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Button } from './Button';

interface ErrorStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({ title, message, actionLabel, onAction }: ErrorStateProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.icon, { backgroundColor: `${colors.destructive}12` }]}>
        <Feather name="alert-circle" size={32} color={colors.destructive} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text> : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} variant="outline" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  message: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 21 },
});
