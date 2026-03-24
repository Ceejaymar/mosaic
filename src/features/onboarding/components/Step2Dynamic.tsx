import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';

// ─── Dynamic subtitle map ─────────────────────────────────────────────────────

function getDynamicSubtitle(intent: string): string {
  if (intent.includes('therapy')) {
    return 'Mosaic makes it easy to share your authentic emotional history with your therapist. No summaries needed, just the truth.';
  }
  if (intent.includes('stress') || intent.includes('trigger')) {
    return "Track what surrounds each mood. Over time, Mosaic reveals exactly what's wearing you down so you can do something about it.";
  }
  if (intent.includes('patterns')) {
    return "Mosaic helps you see the threads connecting your emotions over weeks, months, and years. Patterns you'd never notice in the moment.";
  }
  if (intent.includes('vent') || intent.includes('private')) {
    return 'Everything you write stays on your device. No cloud syncing, no data selling. Your thoughts are yours alone.';
  }
  return 'Mosaic is your personal space to feel, reflect, and grow. You made the right call being here.';
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  primaryIntent: string;
  onNext: () => void;
};

export function Step2Dynamic({ primaryIntent, onNext }: Props) {
  const { theme } = useUnistyles();
  const subtitle = getDynamicSubtitle(primaryIntent.toLowerCase());

  return (
    <View style={styles.container}>
      {/* Accent mark */}
      <View style={styles.accentRow}>
        <View style={[styles.accentLine, { backgroundColor: '#C5A059' }]} />
      </View>

      {/* Copy */}
      <View style={styles.copy}>
        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          You're in the{'\n'}right place.
        </AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.typography }]}>{subtitle}</AppText>
      </View>

      {/* CTA */}
      <Pressable
        onPress={onNext}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: '#C5A059', opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <AppText font="mono" style={styles.btnText}>
          Set up my space
        </AppText>
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: theme.spacing[8],
    justifyContent: 'center',
  },
  accentRow: {
    alignItems: 'flex-start',
  },
  accentLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  copy: {
    gap: theme.spacing[4],
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 46,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    lineHeight: 28,
    opacity: 0.7,
    maxWidth: 340,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: theme.radius.tight,
    alignItems: 'center',
  },
  btnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: '#1A1208',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
}));
