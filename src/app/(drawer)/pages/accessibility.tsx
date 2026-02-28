import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { hapticLight } from '@/src/lib/haptics/haptics';
import { useAppStore } from '@/src/store/useApp';
import { getFontFamily } from '@/src/utils/typography';

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

  const accessibility = useAppStore((s) => s.accessibility);
  const setAccessibilitySetting = useAppStore((s) => s.setAccessibilitySetting);

  const isDyslexic = accessibility.isDyslexicFont;

  const handleBackToDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleToggle = (key: (typeof TOGGLES)[number]['key'], value: boolean) => {
    hapticLight();
    setAccessibilitySetting(key, value);
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

        <Text
          style={[
            styles.title,
            { color: theme.colors.typography, fontFamily: getFontFamily('heading', isDyslexic) },
          ]}
        >
          Accessibility
        </Text>
      </View>

      {/* ─── Toggle List ─── */}
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.listBlock, { borderColor: theme.colors.divider }]}>
          {TOGGLES.map((item, index) => (
            <View key={item.key}>
              {index > 0 && (
                <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />
              )}
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text
                    style={[
                      styles.rowLabel,
                      {
                        color: theme.colors.typography,
                        fontFamily: getFontFamily('body', isDyslexic),
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={[
                      styles.rowSub,
                      {
                        color: theme.colors.textMuted,
                        fontFamily: getFontFamily('mono', isDyslexic),
                      },
                    ]}
                  >
                    {item.sub}
                  </Text>
                </View>
                <Switch
                  value={accessibility[item.key]}
                  onValueChange={(val) => handleToggle(item.key, val)}
                  trackColor={{ false: theme.colors.divider, true: theme.colors.mosaicGold }}
                  thumbColor="#ffffff"
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
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listBlock: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  divider: { height: 1 },
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
