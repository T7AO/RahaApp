import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Platform, StyleSheet, View, useColorScheme } from 'react-native';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

const ROLE_COLOR = colors.roles.admin;

export default function AdminTabLayout() {
  const appColors = useColors();
  const isDark = useColorScheme() === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ROLE_COLOR,
        tabBarInactiveTintColor: appColors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : appColors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: appColors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: appColors.background }]} />
          ) : null,
      }}
    >
      <Tabs.Screen name="index"   options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Feather name="grid" size={22} color={color} /> }} />
      <Tabs.Screen name="users"   options={{ title: 'Staff',     tabBarIcon: ({ color }) => <Feather name="users" size={22} color={color} /> }} />
      <Tabs.Screen name="clinics" options={{ title: 'Clinics',   tabBarIcon: ({ color }) => <Feather name="map-pin" size={22} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Feather name="settings" size={22} color={color} /> }} />
    </Tabs>
  );
}
