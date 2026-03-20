import Ionicons from '@expo/vector-icons/Ionicons';
import {
  type DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { type Href, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { DrawerRow } from '@/src/components/drawer-row';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import {
  openPrivacyPolicy,
  openSupportEmail,
  openSurvey,
  openTermsOfService,
} from '@/src/utils/support-links';

// ─── Custom Drawer Content ────────────────────────────────────────────────────

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();

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
            onPress={() => router.push('/pages/preferences')}
          />
          <DrawerRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.push('/pages/notifications')}
          />
          <DrawerRow
            icon="lock-closed-outline"
            label="Security & data"
            onPress={() => router.push('/pages/security')}
          />
          <DrawerRow
            icon="accessibility-outline"
            label="Accessibility"
            onPress={() => router.push('/pages/accessibility')}
          />

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Group 2: About */}
          <AppText colorVariant="muted" style={styles.sectionTitle}>
            About Mosaic
          </AppText>
          <DrawerRow
            icon="rocket-outline"
            label="Upcoming features"
            onPress={() => router.push('/pages/roadmap')}
          />
          <DrawerRow
            icon="help-circle-outline"
            label="FAQs"
            onPress={() => router.push('/pages/faq')}
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

          <DrawerRow icon="star-outline" label="Rate Mosaic" onPress={() => {}} />
          <DrawerRow icon="share-outline" label="Share with a friend" onPress={() => {}} />

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

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
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + 20, borderTopColor: colors.divider },
          ]}
        >
          <AppText colorVariant="muted" style={styles.versionText}>
            Mosaic
          </AppText>
          <AppText colorVariant="muted" style={styles.versionText}>
            v1.0.0
          </AppText>
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
  scrollContent: { paddingTop: 8, paddingBottom: theme.spacing[6] },
  divider: { height: 1, marginRight: 16, marginVertical: 12 },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  versionText: { fontSize: 12, fontFamily: 'SpaceMono' },
}));
