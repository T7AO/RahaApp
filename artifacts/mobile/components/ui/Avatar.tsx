import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
}

export function Avatar({ initials, color, size = 48 }: AvatarProps) {
  return (
    <View
      style={[
        styles.avatar,
        { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.33 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
  },
});
