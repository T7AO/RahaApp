import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

interface FixedHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  roleColor?: string;
  large?: boolean;
}

export function FixedHeader({ title, subtitle, showBack, rightAction, roleColor, large }: FixedHeaderProps) {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accentColor = roleColor ?? colors.primary;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === 'web' ? 12 : 8),
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      {/* Role accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />

      <View style={styles.row}>
        {/* Left */}
        <View style={styles.leftSlot}>
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
            >
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </Pressable>
          ) : (
            <View style={[styles.roleIndicator, { backgroundColor: `${accentColor}18` }]}>
              <View style={[styles.roleCircle, { backgroundColor: accentColor }]} />
            </View>
          )}
        </View>

        {/* Center */}
        <View style={styles.center}>
          <Text
            style={[styles.title, { color: colors.foreground, fontSize: large ? 22 : 17 }]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Right */}
        <View style={styles.rightSlot}>{rightAction ?? <View style={styles.iconBtn} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 100,
  },
  accentStrip: {
    height: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 6,
  },
  leftSlot: { width: 44, alignItems: 'flex-start' },
  rightSlot: { width: 44, alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIndicator: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  title: {
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
});
