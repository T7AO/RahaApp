import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { HealthMetric, HealthMetricType } from '@/types';
import { useColors } from '@/hooks/useColors';

const META: Record<HealthMetricType, { icon: keyof typeof Feather.glyphMap; label: string; color: string; min: number; max: number }> = {
  heartRate:        { icon: 'heart',       label: 'Heart Rate',       color: '#E74C3C', min: 60, max: 100 },
  steps:            { icon: 'activity',    label: 'Steps Today',      color: '#1A73E8', min: 0,  max: 10000 },
  glucose:          { icon: 'droplet',     label: 'Blood Glucose',    color: '#F59E0B', min: 70, max: 140 },
  bloodPressure:    { icon: 'trending-up', label: 'Blood Pressure',   color: '#8B5CF6', min: 0,  max: 0 },
  oxygenSaturation: { icon: 'wind',        label: 'Oxygen Sat.',      color: '#27AE60', min: 95, max: 100 },
};

function statusColor(metric: HealthMetric): string {
  const meta = META[metric.type];
  if (metric.type === 'bloodPressure') return '#8B5CF6';
  if (metric.type === 'steps') return '#1A73E8';
  if (metric.value < meta.min || metric.value > meta.max) return '#E74C3C';
  return '#27AE60';
}

function formatValue(metric: HealthMetric): string {
  if (metric.type === 'bloodPressure') {
    return `${metric.systolic ?? metric.value}/${metric.diastolic ?? 80}`;
  }
  if (metric.type === 'steps') {
    return metric.value.toLocaleString();
  }
  return String(metric.value);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

interface HealthMetricCardProps {
  type: HealthMetricType;
  metric: HealthMetric | undefined;
  onPress?: () => void;
}

export function HealthMetricCard({ type, metric, onPress }: HealthMetricCardProps) {
  const colors = useColors();
  const meta = META[type];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.88 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${meta.color}14` }]}>
        <Feather name={meta.icon} size={20} color={meta.color} />
      </View>

      <Text style={[styles.label, { color: colors.mutedForeground }]}>{meta.label}</Text>

      {metric ? (
        <>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: colors.foreground }]}>{formatValue(metric)}</Text>
            <Text style={[styles.unit, { color: colors.mutedForeground }]}>{metric.unit}</Text>
          </View>
          <View style={styles.footer}>
            <View style={[styles.statusDot, { backgroundColor: statusColor(metric) }]} />
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              {formatTime(metric.timestamp)}
            </Text>
          </View>
        </>
      ) : (
        <Text style={[styles.noData, { color: colors.mutedForeground }]}>—</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  value: { fontSize: 26, fontFamily: 'Inter_700Bold', lineHeight: 30 },
  unit: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 3 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  footerText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  noData: { fontSize: 26, fontFamily: 'Inter_700Bold' },
});
