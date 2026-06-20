import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { TimeSlot } from '@/types';
import { useColors } from '@/hooks/useColors';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotPicker({ slots, selectedSlotId, onSelect }: TimeSlotPickerProps) {
  const colors = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {slots.map(slot => {
        const isSelected = slot.id === selectedSlotId;
        const isUnavailable = !slot.isAvailable;

        return (
          <Pressable
            key={slot.id}
            onPress={() => !isUnavailable && onSelect(slot)}
            disabled={isUnavailable}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? colors.primary
                  : isUnavailable
                    ? colors.muted
                    : colors.card,
                borderColor: isSelected ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isSelected ? '#fff' : isUnavailable ? colors.mutedForeground : colors.foreground,
                  textDecorationLine: isUnavailable ? 'line-through' : 'none',
                },
              ]}
            >
              {slot.time}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  label: { fontSize: 14, fontFamily: 'Inter_500Medium' },
});
