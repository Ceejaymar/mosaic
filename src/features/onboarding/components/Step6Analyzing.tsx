import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { hapticMedium } from '@/src/lib/haptics/haptics';

// ─── Types ────────────────────────────────────────────────────────────────────

type Feature = {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
};

// ─── Constants ────────────────────────────────────────────────────────────────

// 35 cells — 7 columns × 5 rows, shaped like a real monthly calendar.
// First row starts on Thursday (3 leading empties) like a real month.
const CELL_CONFIGS = [
  { id: 'c0', color: null },
  { id: 'c1', color: null },
  { id: 'c2', color: null },
  { id: 'c3', color: '#C5A059' },
  { id: 'c4', color: '#E2BC62' },
  { id: 'c5', color: null },
  { id: 'c6', color: '#B8924A' },
  { id: 'c7', color: '#E2BC62' },
  { id: 'c8', color: 'rgba(226, 188, 98, 0.55)' },
  { id: 'c9', color: '#C5A059' },
  { id: 'c10', color: '#E2BC62' },
  { id: 'c11', color: null },
  { id: 'c12', color: '#B8924A' },
  { id: 'c13', color: 'rgba(197, 160, 89, 0.72)' },
  { id: 'c14', color: '#C5A059' },
  { id: 'c15', color: null },
  { id: 'c16', color: '#E2BC62' },
  { id: 'c17', color: '#C5A059' },
  { id: 'c18', color: '#B8924A' },
  { id: 'c19', color: 'rgba(226, 188, 98, 0.8)' },
  { id: 'c20', color: '#C5A059' },
  { id: 'c21', color: '#E2BC62' },
  { id: 'c22', color: null },
  { id: 'c23', color: '#E2BC62' },
  { id: 'c24', color: 'rgba(197, 160, 89, 0.5)' },
  { id: 'c25', color: '#B8924A' },
  { id: 'c26', color: '#C5A059' },
  { id: 'c27', color: null },
  { id: 'c28', color: '#E2BC62' },
  { id: 'c29', color: '#C5A059' },
  { id: 'c30', color: '#B8924A' },
  { id: 'c31', color: '#E2BC62' },
  { id: 'c32', color: null },
  { id: 'c33', color: null },
  { id: 'c34', color: null },
];

// 5 rows of 7 columns
const CELL_ROWS = [
  CELL_CONFIGS.slice(0, 7),
  CELL_CONFIGS.slice(7, 14),
  CELL_CONFIGS.slice(14, 21),
  CELL_CONFIGS.slice(21, 28),
  CELL_CONFIGS.slice(28, 35),
];

// Stable intent IDs — must match INTENT_OPTIONS in Step2Intent.tsx
export type IntentId = 'mood_patterns' | 'stress_triggers' | 'therapy_tracking' | 'private_vent';

// Targeted features keyed by stable ID, not display copy
const INTENT_FEATURES: Record<IntentId, Feature> = {
  mood_patterns: {
    title: 'AI Pattern Recognition',
    subtitle: 'Automatically detect invisible mood trends over time.',
    icon: 'analytics-outline',
  },
  stress_triggers: {
    title: 'Trigger Mapping',
    subtitle: 'Identify exactly what drains or gives you energy.',
    icon: 'flash-outline',
  },
  therapy_tracking: {
    title: 'Exportable Insights',
    subtitle: 'Generate therapist-ready reports of your emotional history.',
    icon: 'document-text-outline',
  },
  private_vent: {
    title: '100% Private Vault',
    subtitle: 'Secured by device biometrics. No cloud sharing.',
    icon: 'lock-closed-outline',
  },
};

// Core features that everyone gets to bulk up the value proposition
const CORE_FEATURES: Feature[] = [
  {
    title: 'Frictionless Logging',
    subtitle: 'Capture your authentic feelings in seconds, without the chore.',
    icon: 'sparkles-outline',
  },
  {
    title: 'Gentle Reminders',
    subtitle: 'Custom check-ins that work around your actual schedule.',
    icon: 'notifications-outline',
  },
];

const GRID_START = 400;
const GRID_STAGGER = 38;
const FEATURE_START = GRID_START + 35 * GRID_STAGGER + 300;
const FEATURE_STAGGER = 120;

function buildFeatures(selectedIntents: string[]): Feature[] {
  const dynamicFeatures = selectedIntents
    .map((id) => INTENT_FEATURES[id as IntentId])
    .filter(Boolean) as Feature[];

  if (dynamicFeatures.length === 0) {
    return [
      INTENT_FEATURES.mood_patterns,
      INTENT_FEATURES.stress_triggers,
      INTENT_FEATURES.private_vent,
      ...CORE_FEATURES,
    ];
  }

  return [...dynamicFeatures, ...CORE_FEATURES];
}

// ─── CalendarCell ─────────────────────────────────────────────────────────────

function CalendarCell({ color, index }: { color: string | null; index: number }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      GRID_START + index * GRID_STAGGER,
      withTiming(1, { duration: 380, easing: Easing.out(Easing.ease) }),
    );
    return () => cancelAnimation(opacity);
  }, [opacity, index]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={cellStyles.cell}>
      <View style={cellStyles.base} />
      {color != null && (
        <Animated.View
          style={[StyleSheet.absoluteFill, { borderRadius: 6, backgroundColor: color }, animStyle]}
        />
      )}
    </View>
  );
}

const cellStyles = StyleSheet.create({
  cell: { flex: 1, aspectRatio: 1, borderRadius: 6, overflow: 'hidden' },
  base: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
});

// ─── FeatureRow ───────────────────────────────────────────────────────────────

function FeatureRow({ feature, index }: { feature: Feature; index: number }) {
  const { theme } = useUnistyles();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    const delay = FEATURE_START + index * FEATURE_STAGGER;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 22, stiffness: 160 }));
  }, [opacity, translateY, index]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[featureStyles.row, animStyle]}>
      <View
        style={[
          featureStyles.iconWrap,
          {
            backgroundColor: 'rgba(197, 160, 89, 0.1)',
            borderColor: 'rgba(197, 160, 89, 0.22)',
          },
        ]}
      >
        <Ionicons name={feature.icon} size={18} color={theme.colors.mosaicGold} />
      </View>
      <View style={featureStyles.textBlock}>
        <AppText style={[featureStyles.title, { color: theme.colors.typography }]}>
          {feature.title}
        </AppText>
        <AppText style={[featureStyles.subtitle, { color: theme.colors.typography }]}>
          {feature.subtitle}
        </AppText>
      </View>
    </Animated.View>
  );
}

const featureStyles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  textBlock: { flex: 1, gap: 2 },
  title: { fontSize: 17, fontWeight: '600', letterSpacing: 0.1 },
  subtitle: { fontSize: 15, opacity: 0.55, lineHeight: 21 },
}));

// ─── Step6Analyzing ───────────────────────────────────────────────────────────

type Props = {
  selectedIntents: string[];
  onNext: () => void;
};

export function Step6Analyzing({ selectedIntents, onNext }: Props) {
  const { theme } = useUnistyles();

  const features = useMemo(() => buildFeatures(selectedIntents), [selectedIntents]);

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(10);
  const ctaOpacity = useSharedValue(0);
  const [ctaEnabled, setCtaEnabled] = useState(false);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    headerTranslateY.value = withSpring(0, { damping: 20, stiffness: 140 });
  }, [headerOpacity, headerTranslateY]);

  useEffect(() => {
    const ctaDelay = FEATURE_START + features.length * FEATURE_STAGGER + 300;
    ctaOpacity.value = withDelay(ctaDelay, withTiming(1, { duration: 400 }));
    const timer = setTimeout(() => setCtaEnabled(true), ctaDelay + 400);
    return () => clearTimeout(timer);
  }, [ctaOpacity, features.length]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({ opacity: ctaOpacity.value }));

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <Animated.View style={[styles.headerZone, headerStyle]}>
        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          Your Mosaic{'\n'}is ready.
        </AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.typography }]}>
          Here is how we will help you build better days.
        </AppText>
      </Animated.View>

      {/* ── Calendar grid ── */}
      <View style={styles.visualZone}>
        {CELL_ROWS.map((row, rowIndex) => (
          <View key={row[0].id} style={styles.gridRow}>
            {row.map((cell, colIndex) => (
              <CalendarCell key={cell.id} color={cell.color} index={rowIndex * 7 + colIndex} />
            ))}
          </View>
        ))}
      </View>

      {/* ── Features ── */}
      <View style={styles.featuresZone}>
        {features.map((feature, index) => (
          <FeatureRow key={feature.title} feature={feature} index={index} />
        ))}
      </View>

      {/* ── CTA ── */}
      <Animated.View
        style={[styles.ctaZone, ctaStyle]}
        pointerEvents={ctaEnabled ? 'auto' : 'none'}
      >
        <Pressable
          onPress={() => {
            hapticMedium();
            onNext();
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
        >
          <LinearGradient
            colors={['#E2BC62', '#C5A059', '#B8924A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            <AppText font="mono" style={styles.btnText}>
              Unlock Mosaic
            </AppText>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingBottom: theme.spacing[8],
  },

  // ── Header
  headerZone: { gap: theme.spacing[2], marginBottom: theme.spacing[6] },
  title: { fontSize: 36, fontWeight: '700', letterSpacing: -0.8, lineHeight: 42 },
  subtitle: { fontSize: theme.fontSize.base, opacity: 0.48, lineHeight: 24 },

  // ── Calendar grid
  visualZone: {
    gap: 4,
    marginBottom: theme.spacing[6],
    paddingHorizontal: theme.spacing[8],
  },
  gridRow: { flexDirection: 'row', gap: 4 },

  // ── Features
  featuresZone: { flex: 1 },

  // ── CTA
  ctaZone: { marginTop: theme.spacing[4] },
  btn: {
    paddingVertical: 16,
    borderRadius: theme.radius.tight,
    alignItems: 'center',
  },
  btnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: '#1A1208',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
}));
