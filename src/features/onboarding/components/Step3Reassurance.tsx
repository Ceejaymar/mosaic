import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { hapticMedium } from '@/src/lib/haptics/haptics';

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

type Props = { primaryIntent: string; onNext: () => void };

export function Step3Reassurance({ primaryIntent, onNext }: Props) {
  const { theme } = useUnistyles();
  const subtitle = getDynamicSubtitle(primaryIntent.toLowerCase());

  const handleNext = () => {
    hapticMedium();
    onNext();
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardWrap}>
        {/* Diagonal warm gradient fill */}
        <LinearGradient
          colors={[
            'rgba(212, 175, 55, 0.16)',
            'rgba(197, 160, 89, 0.07)',
            'rgba(184, 146, 74, 0.02)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
        />

        <View style={styles.cardInner}>
          {/* Brand motif — small rotated diamond echoing the app icon */}
          <View style={styles.motifRow}>
            <LinearGradient
              colors={['#E2BC62', '#C5A059']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.accentGradientLine}
            />
            <View style={[styles.motifDiamond, { backgroundColor: theme.colors.mosaicGold }]} />
          </View>

          <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
            You're in the{'\n'}right place.
          </AppText>
          <AppText style={[styles.subtitle, { color: theme.colors.typography }]}>
            {subtitle}
          </AppText>
        </View>
      </View>

      {/* Gradient CTA */}
      <Pressable onPress={handleNext} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}>
        <LinearGradient
          colors={['#E2BC62', '#C5A059', '#B8924A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btn}
        >
          <AppText font="mono" style={styles.btnText}>
            Set up my space
          </AppText>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, gap: theme.spacing[6], justifyContent: 'center' },
  cardWrap: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.18)',
    overflow: 'hidden',
  },
  cardInner: { padding: theme.spacing[6], gap: theme.spacing[5] },
  motifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  accentGradientLine: {
    width: 36,
    height: 3,
    borderRadius: 2,
  },
  motifDiamond: {
    width: 8,
    height: 8,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    opacity: 0.8,
  },
  title: { fontSize: 36, fontWeight: '700', letterSpacing: -1, lineHeight: 42 },
  subtitle: { fontSize: theme.fontSize.lg, lineHeight: 28, opacity: 0.75 },
  btn: {
    paddingVertical: 17,
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
