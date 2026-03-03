import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { useAppStore } from '@/src/store/useApp';

// ─── Toggle Row Data ──────────────────────────────────────────────────────────

const TOGGLES = [
  {
    key: 'isDyslexicFont' as const,
    label: 'Dyslexia-friendly font',
    sub: 'Changes all text to OpenDyslexic.',
  },
  {
    key: 'disableItalics' as const,
    label: 'Disable italics',
    sub: 'Removes italic styling to improve readability.',
  },
  {
    key: 'highContrastText' as const,
    label: 'High contrast text',
    sub: 'Darkens muted text and thickens borders.',
  },
  {
    key: 'reduceMotion' as const,
    label: 'Reduce motion',
    sub: 'Disables screen transitions and heavy animations.',
  },
  {
    key: 'disableHaptics' as const,
    label: 'Disable haptic feedback',
    sub: 'Turns off all physical device vibrations.',
  },
] as const;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AccessibilityScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();

  const accessibility = useAppStore((s) => s.accessibility);
  const setAccessibilitySetting = useAppStore((s) => s.setAccessibilitySetting);

  const handleBackToDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleToggle = (key: (typeof TOGGLES)[number]['key'], value: boolean) => {
    if (key === 'disableHaptics') {
      if (value === false) hapticLight(); // re-enabling — confirm with a tap
    } else if (!accessibility.disableHaptics) {
      hapticLight();
    }
    setAccessibilitySetting(key, value);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ─── Header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={handleBackToDrawer}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Open navigation drawer"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.typography} />
          </Pressable>

          <Pressable
            onPress={() => router.navigate('/(tabs)/' as Href)}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Go to home"
          >
            <Ionicons name="home-outline" size={24} color={theme.colors.typography} />
          </Pressable>
        </View>

        <AppText variant="heading" style={[styles.title, { color: theme.colors.typography }]}>
          Accessibility
        </AppText>
      </View>

      {/* ─── Toggle List ─── */}
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.listBlock}>
          {TOGGLES.map((item, index) => (
            <View key={item.key}>
              {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <AppText style={[styles.rowLabel, { color: theme.colors.typography }]}>
                    {item.label}
                  </AppText>
                  <AppText colorVariant="muted" style={styles.rowSub}>
                    {item.sub}
                  </AppText>
                </View>
                <Switch
                  value={accessibility[item.key]}
                  onValueChange={(val) => handleToggle(item.key, val)}
                  trackColor={{ false: colors.divider, true: theme.colors.mosaicGold }}
                  thumbColor="#ffffff"
                  accessibilityLabel={item.label}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
  },
  iconBtnPressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  content: {
    paddingTop: 8,
  },
  listBlock: {},
  divider: { height: 1, marginHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowText: { flex: 1, paddingRight: 16 },
  rowLabel: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
  rowSub: { fontSize: 13, lineHeight: 18 },
});
