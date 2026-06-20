import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { DayOption } from '@/utils/dateTime';

interface DatePickerRowProps {
  days: DayOption[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function DatePickerRow({ days, selectedIndex, onSelect }: DatePickerRowProps) {
  const colors = useColors();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {days.map((day, index) => {
        const isActive = selectedIndex === index;
        return (
          <Pressable
            key={day.iso}
            onPress={() => onSelect(index)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? colors.primary : colors.card,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
          >
            <Text style={[styles.label, { color: isActive ? '#fff' : colors.mutedForeground }]}>
              {day.label}
            </Text>
            <Text style={[styles.date, { color: isActive ? 'rgba(255,255,255,0.75)' : colors.mutedForeground }]}>
              {day.short}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
    minWidth: 72,
  },
  label: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  date: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
