import Ionicons from '@expo/vector-icons/Ionicons';
import {
  type DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import * as Application from 'expo-application';
import { type Href, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { usePostHog } from 'posthog-react-native';
import { useRef, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { DrawerRow } from '@/src/components/drawer-row';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { useAppStore } from '@/src/store/useApp';
import {
  openPrivacyPolicy,
  openSupportEmail,
  openSurvey,
  openTermsOfService,
  rateApp,
  shareApp,
} from '@/src/utils/support-links';

// ─── Custom Drawer Content ────────────────────────────────────────────────────

const TAP_TARGET = 7;
const TAP_RESET_MS = 5000;

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();
  const posthog = usePostHog();

  const isDeveloperModeEnabled = useAppStore((s) => s.isDeveloperModeEnabled);
  const setDeveloperMode = useAppStore((s) => s.setDeveloperMode);
  const isDemoMode = useAppStore((s) => s.isDemoMode);
  const toggleDemoMode = useAppStore((s) => s.toggleDemoMode);

  const [tapCount, setTapCount] = useState(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVersionTap = () => {
    const next = tapCount + 1;

    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

    if (next >= TAP_TARGET) {
      setTapCount(0);
      setDeveloperMode(true);
      Alert.alert('Developer Mode Enabled', 'You now have access to debug tools.');
    } else {
      setTapCount(next);
      resetTimerRef.current = setTimeout(() => setTapCount(0), TAP_RESET_MS);
    }
  };

  const handleHomePress = () => {
    props.navigation.closeDrawer();
    router.navigate('/(tabs)/' as Href);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View
        style={[styles.innerContainer, { borderRightWidth: 1, borderRightColor: colors.divider }]}
      >
        {/* 1. HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: theme.colors.typography }]}>Settings</Text>
          </View>
          <Pressable onPress={handleHomePress} style={styles.iconBtn}>
            <Ionicons name="home-outline" size={24} color={theme.colors.typography} />
          </Pressable>
        </View>

        {/* 2. SCROLLING LINKS */}
        <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
          {/* Group 1: Preferences */}
          <DrawerRow
            icon="options-outline"
            label="Preferences"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/pages/preferences');
            }}
          />
          <DrawerRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/pages/notifications');
            }}
          />
          <DrawerRow
            icon="lock-closed-outline"
            label="Security & Data"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/pages/security');
            }}
          />
          <DrawerRow
            icon="accessibility-outline"
            label="Accessibility"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/pages/accessibility');
            }}
          />

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Group 2: About */}
          <AppText colorVariant="muted" style={styles.sectionTitle}>
            About Mosaic
          </AppText>
          <DrawerRow
            icon="rocket-outline"
            label="Upcoming features"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/pages/roadmap');
            }}
          />
          <DrawerRow
            icon="help-circle-outline"
            label="FAQs"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push('/pages/faq');
            }}
          />

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Group 3: Resources */}
          <AppText colorVariant="muted" style={styles.sectionTitle}>
            Support & feedback
          </AppText>
          <DrawerRow
            icon="chatbubble-ellipses-outline"
            label="Share your feedback"
            onPress={() => {
              props.navigation.closeDrawer();
              posthog.capture('feedback_opened');
              openSurvey();
            }}
          />
          <DrawerRow
            icon="mail-outline"
            label="Contact support"
            onPress={() => {
              props.navigation.closeDrawer();
              openSupportEmail();
            }}
          />

          <DrawerRow
            icon="star-outline"
            label="Rate Mosaic"
            onPress={() => {
              props.navigation.closeDrawer();
              posthog.capture('app_rated');
              rateApp();
            }}
          />
          <DrawerRow
            icon="share-outline"
            label="Share with a friend"
            onPress={() => {
              props.navigation.closeDrawer();
              posthog.capture('app_shared');
              shareApp();
            }}
          />

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Developer tools — only visible when developer mode is unlocked */}
          {isDeveloperModeEnabled && (
            <>
              <AppText colorVariant="muted" style={styles.sectionTitle}>
                Developer
              </AppText>
              <DrawerRow
                icon="flask-outline"
                label={isDemoMode ? 'Clear Demo Data' : 'Generate Demo Data'}
                onPress={() => {
                  props.navigation.closeDrawer();
                  toggleDemoMode();
                }}
              />
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            </>
          )}

          {/* Group 4: Legal */}
          <AppText colorVariant="muted" style={styles.sectionTitle}>
            Legal
          </AppText>
          <DrawerRow
            icon="shield-checkmark-outline"
            label="Privacy policy"
            onPress={() => {
              props.navigation.closeDrawer();
              openPrivacyPolicy();
            }}
          />
          <DrawerRow
            icon="document-text-outline"
            label="Terms of service"
            onPress={() => {
              props.navigation.closeDrawer();
              openTermsOfService();
            }}
          />
        </DrawerContentScrollView>

        {/* 3. FOOTER */}
        <View
          style={[styles.footer, { paddingBottom: insets.bottom, borderTopColor: colors.divider }]}
        >
          <AppText colorVariant="muted" style={styles.versionText}>
            Mosaic
          </AppText>
          <Pressable onPress={handleVersionTap} hitSlop={12}>
            <AppText colorVariant="muted" style={styles.versionText}>
              v{Application.nativeApplicationVersion || '1.0.0'}
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function Layout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: { width: '85%' },
      }}
    >
      <Drawer.Screen name="(tabs)" />
    </Drawer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },
  innerContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingLeft: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  iconBtn: { padding: 16 },
  headerTitle: {
    fontSize: theme.fontSize['2xl'],
    fontFamily: 'Fraunces',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: theme.spacing[6] },
  divider: { height: 0.5, marginVertical: 8 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    borderTopWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  versionText: { fontSize: 12, fontFamily: 'SpaceMono' },
}));
