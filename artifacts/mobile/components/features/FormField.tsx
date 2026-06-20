import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface FormFieldProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  multilineField?: boolean;
}

export function FormField({ label, icon, multilineField, style, ...props }: FormFieldProps) {
  const colors = useColors();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          multilineField && styles.textareaRow,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {icon ? <Feather name={icon} size={16} color={colors.mutedForeground} /> : null}
        <TextInput
          placeholderTextColor={colors.mutedForeground}
          textAlignVertical={multilineField ? 'top' : props.textAlignVertical}
          multiline={multilineField || props.multiline}
          style={[styles.input, multilineField && styles.textarea, { color: colors.foreground }, style]}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 20 },
  label: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  textareaRow: { height: 100, alignItems: 'flex-start', paddingVertical: 12 },
  input: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  textarea: { height: 80 },
});
