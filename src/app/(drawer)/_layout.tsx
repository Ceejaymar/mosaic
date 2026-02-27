import Ionicons from '@expo/vector-icons/Ionicons';
import {
  type DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Fragment } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

import { version } from '@/package.json';
import { ThemedText } from '@/src/components/themed-text';
import { trackFunnelStep } from '@/src/services/telemetry';
import { useAppStore } from '@/src/store/useApp';
import type { Theme } from '@/src/types/types';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface DrawerLinkProps {
  icon: IoniconsName;
  label: string;
  route: string;
  navigation: DrawerContentComponentProps['navigation'];
}

function DrawerLink({ icon, label, route, navigation }: DrawerLinkProps) {
  const router = useRouter();

  return (
    <>
      <Pressable
        onPress={() => {
          trackFunnelStep(label.toLowerCase());
          router.push(route as never);
          navigation.closeDrawer();
        }}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <Ionicons name={icon} size={22} style={styles.rowIcon} />
        <ThemedText style={styles.rowLabel}>{label}</ThemedText>
        <Ionicons name="chevron-forward" size={18} style={styles.rowChevron} />
      </Pressable>
      <View style={styles.rowDivider} />
    </>
  );
}

const THEME_OPTIONS: { label: string; value: Theme }[] = [
  { label: 'Light', value: 'light' },
  { label: 'System', value: 'system' },
  { label: 'Dark', value: 'dark' },
];

function SegmentedThemeControl() {
  const { theme, setTheme } = useAppStore();

  const handleChange = (value: Theme) => {
    setTheme(value);
    if (value === 'system') {
      UnistylesRuntime.setAdaptiveThemes(true);
    } else {
      UnistylesRuntime.setAdaptiveThemes(false);
      UnistylesRuntime.setTheme(value);
    }
  };

  return (
    <View style={styles.segmentedContainer}>
      <View style={styles.segmentedTrack}>
        {THEME_OPTIONS.map((option) => {
          const isActive = theme === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleChange(option.value)}
              style={[styles.segmentedOption, isActive && styles.segmentedOptionActive]}
            >
              <ThemedText style={[styles.segmentedLabel, isActive && styles.segmentedLabelActive]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const NAV_LINKS: { icon: IoniconsName; label: string; route: string }[] = [
  { icon: 'home-outline', label: 'Home', route: '/' },
  { icon: 'notifications-outline', label: 'Notifications', route: '/app/notifications' },
  { icon: 'lock-closed-outline', label: 'Security', route: '/app/security' },
  { icon: 'accessibility-outline', label: 'Accessibility', route: '/app/accessibility' },
  { icon: 'rocket-outline', label: 'Features to Come', route: '/app/features' },
];

const QUICK_ACTIONS: { icon: IoniconsName; label: string }[] = [
  { icon: 'share-outline', label: 'Export Data' },
  { icon: 'heart-outline', label: 'Share Mosaic' },
];

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Close button */}
        <Pressable
          onPress={() => props.navigation.closeDrawer()}
          style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.5 }]}
          hitSlop={12}
        >
          <Ionicons name="close" size={24} style={styles.closeIcon} />
        </Pressable>

        {/* Header */}
        <ThemedText style={styles.header}>Settings</ThemedText>

        {/* Top divider below header */}
        <View style={styles.rowDivider} />

        {/* Navigation Links */}
        {NAV_LINKS.map((link) => (
          <DrawerLink
            key={link.label}
            icon={link.icon}
            label={link.label}
            route={link.route}
            navigation={props.navigation}
          />
        ))}

        {/* Quick Actions section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
        </View>
        <View style={styles.rowDivider} />

        {QUICK_ACTIONS.map((action) => (
          <Fragment key={action.label}>
            <Pressable
              onPress={() => trackFunnelStep(action.label.toLowerCase())}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <Ionicons name={action.icon} size={22} style={styles.rowIcon} />
              <ThemedText style={styles.rowLabel}>{action.label}</ThemedText>
              <Ionicons name="chevron-forward" size={18} style={styles.rowChevron} />
            </Pressable>
            <View style={styles.rowDivider} />
          </Fragment>
        ))}

        {/* Appearance section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
        </View>
        <View style={styles.rowDivider} />
        <SegmentedThemeControl />
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: 16 + bottom }]}>
        <ThemedText style={styles.footerText}>&copy; 2026 Mosaic | v{version}</ThemedText>
      </View>
    </View>
  );
}

export default function Layout() {
  return (
    <Drawer drawerContent={CustomDrawerContent}>
      <Drawer.Screen
        name="(tabs)"
        options={{ headerShown: false, drawerLabel: 'Home', title: 'Home' }}
      />
      <Drawer.Screen
        name="support"
        options={{
          drawerLabel: 'Support',
          title: 'Support',
        }}
      />
      <Drawer.Screen
        name="app"
        options={{
          drawerItemStyle: {
            display: 'none',
          },
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  closeIcon: {
    color: theme.colors.typography,
  },
  header: {
    fontSize: 34,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    letterSpacing: -1.02,
    marginBottom: 20,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowIcon: {
    color: theme.colors.typography,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '400',
    color: theme.colors.typography,
  },
  rowChevron: {
    color: theme.colors.textMuted,
  },
  segmentedContainer: {
    marginTop: 16,
  },
  segmentedTrack: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 4,
  },
  segmentedOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 20,
  },
  segmentedOptionActive: {
    backgroundColor: theme.colors.mosaicGold,
    shadowColor: theme.colors.mosaicGold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentedLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  segmentedLabelActive: {
    color: theme.colors.onAccent,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.divider,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
}));
