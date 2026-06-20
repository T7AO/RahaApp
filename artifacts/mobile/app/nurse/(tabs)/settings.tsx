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

const ROLE_COLOR = colors.roles.nurse;

export default function NurseSettings() {
  const appColors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentStaff, setRole } = useRole();

  const handleBack = async () => {
    Alert.alert('Return to Patient View', 'Switch back to the patient interface?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Switch', onPress: async () => { await setRole('patient', null); router.replace('/'); } },
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
          <Avatar initials={currentStaff?.name.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'NR'} color={ROLE_COLOR} size={60} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: appColors.foreground }]}>{currentStaff?.name ?? 'Nurse'}</Text>
            <Text style={[styles.profileSub, { color: appColors.mutedForeground }]}>{currentStaff?.clinicName ?? '—'}</Text>
          </View>
        </Card>

        {[
          { icon: 'user' as const,       label: 'Profile Details',  onPress: () => Alert.alert('Coming Soon') },
          { icon: 'bell' as const,       label: 'Notifications',    onPress: () => Alert.alert('Coming Soon') },
          { icon: 'refresh-cw' as const, label: 'Switch Interface', onPress: () => router.push('/role-select') },
          { icon: 'log-out' as const,    label: 'Back to Patient',  onPress: handleBack, destructive: true },
        ].map((item, i) => (
          <RoleSettingsRow
            key={i}
            icon={item.icon}
            label={item.label}
            onPress={item.onPress}
            color={ROLE_COLOR}
            destructive={item.destructive}
            card
          />
        ))}
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
});
