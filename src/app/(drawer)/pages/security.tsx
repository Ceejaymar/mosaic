import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { deleteAllData } from '@/src/db/repos/moodRepo';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { useAppStore } from '@/src/store/useApp';
import { exportDataToCSV } from '@/src/utils/export-data';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SecurityScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();

  const isAppLockEnabled = useAppStore((s) => s.isAppLockEnabled);
  const toggleAppLock = useAppStore((s) => s.toggleAppLock);

  const [biometricName, setBiometricName] = useState('Authentication');

  useEffect(() => {
    (async () => {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (hasHardware && supportedTypes.length > 0) {
        if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricName('Face ID');
        } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricName('Touch ID');
        } else {
          setBiometricName('Biometrics');
        }
      } else {
        setBiometricName('Passcode');
      }
    })();
  }, []);

  const handleBackToDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  const handleExport = () => {
    hapticLight();
    exportDataToCSV();
  };
  const handleDelete = () => {
    Alert.alert(
      'Delete All Data',
      'Are you absolutely sure? This will permanently erase all your journal entries and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllData();
              Alert.alert('Data Deleted', 'Your journal has been completely erased.');
            } catch (error) {
              console.error('Failed to delete data:', error);
              Alert.alert('Error', 'Could not delete data. Please try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ─── Header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={handleBackToDrawer} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.typography} />
          </Pressable>
          <Pressable onPress={() => router.navigate('/(tabs)/' as Href)} style={styles.iconBtn}>
            <Ionicons name="home-outline" size={24} color={theme.colors.typography} />
          </Pressable>
        </View>
        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          Security & Data
        </AppText>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* ── App Access Card ── */}
        <AppText colorVariant="muted" style={styles.sectionLabel}>
          App Access
        </AppText>
        <View style={[styles.flatCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText style={[styles.rowLabel, { color: theme.colors.typography }]}>
                Require {biometricName}
              </AppText>
              <AppText colorVariant="muted" style={styles.rowSub}>
                Use {biometricName} or device passcode to unlock Mosaic.
              </AppText>
            </View>
            <Switch
              value={isAppLockEnabled}
              onValueChange={toggleAppLock}
              trackColor={{ false: colors.divider, true: theme.colors.mosaicGold }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* ── Data Management Card ── */}
        <AppText colorVariant="muted" style={styles.sectionLabel}>
          Data Management
        </AppText>
        <View style={[styles.flatCard, { backgroundColor: theme.colors.surface }]}>
          <Pressable
            onPress={handleExport}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.rowText}>
              <AppText style={[styles.rowLabel, { color: theme.colors.typography }]}>
                Download my data
              </AppText>
              <AppText colorVariant="muted" style={styles.rowSub}>
                Download your data as a CSV file.
              </AppText>
            </View>
            <Ionicons name="download-outline" size={20} color={theme.colors.typography} />
          </Pressable>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
          >
            <View style={styles.rowText}>
              <AppText style={[styles.rowLabel, { color: theme.colors.destructive }]}>
                Delete all data
              </AppText>
              <AppText colorVariant="muted" style={styles.rowSub}>
                Permanently erase your journal entries.
              </AppText>
            </View>
            <Ionicons name="trash-outline" size={20} color={theme.colors.destructive} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },
  header: { paddingHorizontal: theme.spacing[4], paddingBottom: theme.spacing[3] },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  iconBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  content: { paddingHorizontal: theme.spacing[4], paddingTop: 8 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  flatCard: {
    borderRadius: theme.radius.card,
    paddingHorizontal: theme.spacing[4],
    overflow: 'hidden',
    marginBottom: 24,
  },
  divider: { height: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowText: { flex: 1, paddingRight: 16 },
  rowLabel: { fontSize: theme.fontSize.base, fontWeight: '600', marginBottom: 2 },
  rowSub: { fontSize: theme.fontSize.sm, lineHeight: 18 },
}));
