import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { type Href, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Linking, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

// Make sure you have this component, or we can build it next!
// import ThemeToggle from '@/src/components/theme-toggle';

// ─── Reusable Drawer Row Component ────────────────────────────────────────────

function DrawerRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color={theme.colors.typography} />
        <Text style={[styles.rowLabel, { color: theme.colors.typography }]}>{label}</Text>
      </View>
      <Ionicons name="arrow-forward" size={20} color={theme.colors.textMuted} />
    </Pressable>
  );
}

// ─── Custom Drawer Content ────────────────────────────────────────────────────

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const handleHomePress = () => {
    props.navigation.closeDrawer();
    router.navigate('/(tabs)/today' as Href);
  };

  const openSurvey = () => {
    props.navigation.closeDrawer();

    const SURVEY_URL = 'https://tally.so/r/your-custom-link';

    Linking.openURL(SURVEY_URL).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 1. HEADER */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <Pressable onPress={() => props.navigation.closeDrawer()} style={styles.iconBtn}>
          <Ionicons name="close" size={28} color={theme.colors.typography} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.typography }]}>Settings</Text>
        <Pressable onPress={handleHomePress} style={styles.iconBtn}>
          <Ionicons name="home-outline" size={24} color={theme.colors.typography} />
        </Pressable>
      </View>

      {/* 2. SCROLLING LINKS */}
      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Group 1: Preferences */}
        <DrawerRow
          icon="person-outline"
          label="Account"
          onPress={() => router.push('/pages/account')}
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

        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

        {/* Group 2: About */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>About Mosaic</Text>
        <DrawerRow
          icon="rocket-outline"
          label="Upcoming features"
          onPress={() => router.push('/pages/roadmap')}
        />
        <DrawerRow
          icon="document-text-outline"
          label="Change log"
          onPress={() => router.push('/pages/changelog')}
        />
        <DrawerRow
          icon="help-circle-outline"
          label="FAQs"
          onPress={() => router.push('/pages/faq')}
        />

        <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />

        {/* Group 3: Resources */}
        <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Resources</Text>
        <DrawerRow
          icon="heart-half-outline"
          label="Mental health hotlines"
          onPress={() => router.push('/pages/resources')}
        />
        <DrawerRow
          icon="chatbubble-ellipses-outline"
          label="Share your feedback"
          onPress={openSurvey}
        />

        <DrawerRow icon="star-outline" label="Rate Mosaic" onPress={() => {}} />
        <DrawerRow icon="share-outline" label="Share with a friend" onPress={() => {}} />
      </DrawerContentScrollView>

      {/* 3. FOOTER */}
      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 20, borderTopColor: theme.colors.divider },
        ]}
      >
        {/* <ThemeToggle /> */}
        <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>v1.0.0</Text>
      </View>
    </View>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function Layout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent} // <-- FIX: Pass the reference directly! No arrow function.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // paddingHorizontal: 16,
    paddingBottom: 16,
  },
  iconBtn: { padding: 8 },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Fraunces',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scrollContent: { paddingTop: 8, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  rowLabel: { fontSize: 16, fontFamily: 'SpaceMono', fontWeight: '500' },
  divider: { height: 1, marginHorizontal: 24, marginVertical: 12, opacity: 0.5 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'SpaceMono',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  versionText: { fontSize: 12, fontFamily: 'SpaceMono' },
}));
