import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useRole } from '@/context/RoleContext';
import { FixedHeader } from '@/components/ui/FixedHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { RoleSettingsRow } from '@/components/features/RoleSettingsRow';
import colors from '@/constants/colors';

const ROLE_COLOR = colors.roles.admin;

export default function AdminSettings() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setRole } = useRole();

  const handleBack = async () => {
    Alert.alert('Exit Administration', 'Return to patient interface?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit', onPress: async () => { await setRole('patient', null); router.replace('/'); } },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: appColors.background }]}>
      <FixedHeader title="Settings" roleColor={ROLE_COLOR} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.profileCard}>
          <Avatar initials="AD" color={ROLE_COLOR} size={60} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: appColors.foreground }]}>Administrator</Text>
            <Text style={[styles.profileSub, { color: appColors.mutedForeground }]}>Raha Health System</Text>
            <Text style={[styles.profileSub, { color: appColors.mutedForeground }]}>Full system access</Text>
          </View>
        </Card>

        <Text style={[styles.groupLabel, { color: appColors.mutedForeground }]}>SYSTEM</Text>
        {[
          { icon: 'database' as const,   label: 'Data Export',        onPress: () => Alert.alert('Coming Soon') },
          { icon: 'shield' as const,     label: 'Security Settings',  onPress: () => Alert.alert('Coming Soon') },
          { icon: 'bell' as const,       label: 'System Alerts',      onPress: () => Alert.alert('Coming Soon') },
          { icon: 'globe' as const,      label: 'Language & Region',  onPress: () => Alert.alert('Coming Soon') },
        ].map((item, i) => (
          <RoleSettingsRow
            key={i}
            icon={item.icon}
            label={item.label}
            onPress={item.onPress}
            color={ROLE_COLOR}
            card
          />
        ))}

        <Text style={[styles.groupLabel, { color: appColors.mutedForeground }]}>ACCESS</Text>
        <RoleSettingsRow
          icon="refresh-cw"
          label="Switch Interface"
          onPress={() => router.push('/role-select')}
          color={ROLE_COLOR}
          card
        />

        <RoleSettingsRow icon="log-out" label="Exit Administration" onPress={handleBack} destructive card />

        <Text style={[styles.version, { color: appColors.mutedForeground }]}>Raha Health Admin · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  profileSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  groupLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginTop: 8, marginLeft: 4 },
  version: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 16 },
});
