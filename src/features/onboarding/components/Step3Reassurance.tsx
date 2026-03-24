import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';

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

  return (
    <View style={styles.container}>
      <View style={styles.cardWrap}>
        <LinearGradient
          colors={['rgba(197, 160, 89, 0.15)', 'rgba(197, 160, 89, 0.02)']}
          style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
        />
        <View style={styles.cardInner}>
          <View style={[styles.accentLine, { backgroundColor: '#C5A059' }]} />
          <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
            You're in the{'\n'}right place.
          </AppText>
          <AppText style={[styles.subtitle, { color: theme.colors.typography }]}>
            {subtitle}
          </AppText>
        </View>
      </View>

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

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, gap: theme.spacing[8], justifyContent: 'center' },
  cardWrap: { borderRadius: 24, borderWidth: 1, borderColor: 'rgba(197, 160, 89, 0.1)' },
  cardInner: { padding: theme.spacing[6], gap: theme.spacing[5] },
  accentLine: { width: 40, height: 3, borderRadius: 2 },
  title: { fontSize: 36, fontWeight: '700', letterSpacing: -1, lineHeight: 42 },
  subtitle: { fontSize: theme.fontSize.lg, lineHeight: 28, opacity: 0.8 },
  btn: { paddingVertical: 16, borderRadius: theme.radius.tight, alignItems: 'center' },
  btnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: '#1A1208',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
}));
