import React from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { useAdmin } from '@/context/AdminContext';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import colors from '@/constants/colors';

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
  iconColor?: string;
}

function SettingsRow({ icon, label, value, onPress, destructive = false, iconColor }: SettingsRowProps) {
  const c = useColors();
  const resolvedIconColor = iconColor ?? (destructive ? c.destructive : c.primary);
  const labelColor = destructive ? c.destructive : c.foreground;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${resolvedIconColor}15` }]}>
        <Feather name={icon} size={16} color={resolvedIconColor} />
      </View>
      <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
      {value ? <Text style={[styles.rowValue, { color: c.mutedForeground }]}>{value}</Text> : null}
      {!destructive && <Feather name="chevron-right" size={16} color={c.mutedForeground} />}
    </Pressable>
  );
}

function Divider() {
  const c = useColors();
  return <View style={[styles.divider, { backgroundColor: c.border }]} />;
}

export default function SettingsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile } = useApp();
  const { isRegisteredStaff } = useAdmin();

  const isStaff = isRegisteredStaff(userProfile.phone);
  const notImpl = () => Alert.alert('Coming Soon', 'This feature will be available in the next update.');
  const initials = userProfile.name.split(' ').map((n: string) => n[0]).join('');

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 100, paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: c.foreground }]}>Settings</Text>

      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <Avatar initials={initials} color={c.primary} size={60} />
        <View style={styles.profileMeta}>
          <Text style={[styles.profileName, { color: c.foreground }]}>{userProfile.name}</Text>
          <Text style={[styles.profileSub, { color: c.mutedForeground }]}>{userProfile.phone}</Text>
          <Text style={[styles.profileSub, { color: c.mutedForeground }]}>{userProfile.email}</Text>
        </View>
        <Pressable onPress={notImpl} style={[styles.editBtn, { backgroundColor: c.primaryLight }]}>
          <Feather name="edit-2" size={14} color={c.primary} />
        </Pressable>
      </Card>

      {/* Switch Interface — only for registered staff */}
      {isStaff ? (
        <Pressable
          onPress={() => router.push('/role-select')}
          style={({ pressed }) => [
            styles.roleBanner,
            { backgroundColor: `${colors.roles.doctor}08`, borderColor: `${colors.roles.doctor}25` },
            pressed && { opacity: 0.82 },
          ]}
        >
          <View style={[styles.roleIconRow, { backgroundColor: `${colors.roles.doctor}14` }]}>
            <Feather name="users" size={18} color={colors.roles.doctor} />
          </View>
          <View style={styles.roleBannerText}>
            <Text style={[styles.roleBannerTitle, { color: c.foreground }]}>Switch Interface</Text>
            <Text style={[styles.roleBannerSub, { color: c.mutedForeground }]}>
              Access doctor, nurse, or admin portal
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.roles.doctor} />
        </Pressable>
      ) : null}

      {/* Account */}
      <Text style={[styles.groupLabel, { color: c.mutedForeground }]}>ACCOUNT</Text>
      <Card padding={0} style={styles.group}>
        <SettingsRow icon="user" label="Personal Information" onPress={notImpl} />
        <Divider />
        <SettingsRow icon="phone" label="Emergency Contact" value={userProfile.emergencyContact} onPress={notImpl} />
        <Divider />
        <SettingsRow icon="shield" label="Privacy & Security" onPress={notImpl} />
      </Card>

      {/* Preferences */}
      <Text style={[styles.groupLabel, { color: c.mutedForeground }]}>PREFERENCES</Text>
      <Card padding={0} style={styles.group}>
        <SettingsRow icon="bell" label="Notifications" onPress={notImpl} />
        <Divider />
        <SettingsRow icon="globe" label="Language" value="English" onPress={notImpl} />
      </Card>

      {/* Support */}
      <Text style={[styles.groupLabel, { color: c.mutedForeground }]}>SUPPORT</Text>
      <Card padding={0} style={styles.group}>
        <SettingsRow icon="help-circle" label="Help & Support" onPress={notImpl} />
        <Divider />
        <SettingsRow icon="file-text" label="Terms & Privacy Policy" onPress={notImpl} />
        <Divider />
        {/* Long-press version to reveal hidden admin access */}
        <Pressable
          onLongPress={() => router.push('/role-select')}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
        >
          <View style={[styles.rowIcon, { backgroundColor: `${c.primary}15` }]}>
            <Feather name="info" size={16} color={c.primary} />
          </View>
          <Text style={[styles.rowLabel, { color: c.foreground }]}>App Version</Text>
          <Text style={[styles.rowValue, { color: c.mutedForeground }]}>2.0.0</Text>
          <Feather name="chevron-right" size={16} color={c.mutedForeground} />
        </Pressable>
      </Card>

      <Card padding={0} style={[styles.group, { marginTop: 8 }]}>
        <SettingsRow icon="log-out" label="Sign Out" onPress={notImpl} destructive />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 8 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', marginBottom: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  profileMeta: { flex: 1, gap: 2 },
  profileName: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  profileSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  editBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  roleBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  roleIconRow: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  roleBannerText: { flex: 1 },
  roleBannerTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  roleBannerSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  groupLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8, marginTop: 8, marginLeft: 4 },
  group: {},
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  rowValue: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  divider: { height: 1, marginHorizontal: 14 },
});
