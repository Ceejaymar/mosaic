import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { openPrivacyPolicy, openTermsOfService } from '@/src/utils/support-links';

const FEATURES = [
  { icon: 'analytics-outline' as const, text: 'Visualize your emotional trends' },
  { icon: 'flash-outline' as const, text: 'Identify hidden stress triggers' },
  { icon: 'lock-closed-outline' as const, text: '100% private, on-device data' },
];

type Props = { onNext: () => void };

export function Step1Welcome({ onNext }: Props) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      {/* ── Brand mark with subtle glow ── */}
      <View style={styles.markContainer}>
        <LinearGradient
          colors={['rgba(197, 160, 89, 0.2)', 'rgba(197, 160, 89, 0)']}
          style={styles.markGlow}
        />
        <View style={[styles.mark, { backgroundColor: 'rgba(197, 160, 89, 0.15)' }]}>
          <View style={[styles.markInner, { backgroundColor: theme.colors.mosaicGold }]} />
        </View>
      </View>

      {/* ── Hero copy ── */}
      <View style={styles.hero}>
        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          Welcome to{'\n'}Mosaic.
        </AppText>

        {/* Value List */}
        <View style={styles.featureList}>
          {FEATURES.map((feat) => (
            <View key={feat.text} style={styles.featureRow}>
              <Ionicons name={feat.icon} size={20} color={theme.colors.mosaicGold} />
              <AppText style={[styles.featureText, { color: theme.colors.typography }]}>
                {feat.text}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      {/* ── CTA ── */}
      <Pressable
        onPress={onNext}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: theme.colors.mosaicGold, opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <AppText font="mono" style={styles.btnText}>
          Get Started
        </AppText>
      </Pressable>

      {/* ── Legal footer ── */}
      <View style={styles.legal}>
        <AppText style={[styles.legalText, { color: theme.colors.typography }]}>
          By continuing, you agree to our{' '}
        </AppText>
        <View style={styles.legalLinks}>
          <Pressable onPress={openTermsOfService}>
            <AppText style={[styles.legalLink, { color: theme.colors.mosaicGold }]}>Terms</AppText>
          </Pressable>
          <AppText style={[styles.legalText, { color: theme.colors.typography }]}> and </AppText>
          <Pressable onPress={openPrivacyPolicy}>
            <AppText style={[styles.legalLink, { color: theme.colors.mosaicGold }]}>
              Privacy
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: theme.spacing[6],
    gap: theme.spacing[6],
  },
  markContainer: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70 },
  mark: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  markInner: { width: 20, height: 20, borderRadius: 6, transform: [{ rotate: '45deg' }] },
  hero: { gap: theme.spacing[6] },
  title: { fontSize: 44, fontWeight: '700', letterSpacing: -1.2, lineHeight: 50 },
  featureList: { gap: theme.spacing[4], marginTop: theme.spacing[2] },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
  featureText: { fontSize: theme.fontSize.base, opacity: 0.8 },
  btn: { paddingVertical: 16, borderRadius: theme.radius.tight, alignItems: 'center' },
  btnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: '#1A1208',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  legal: { alignItems: 'center', gap: 2 },
  legalLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  legalText: { fontSize: theme.fontSize.xs, opacity: 0.4, textAlign: 'center', lineHeight: 18 },
  legalLink: { fontSize: theme.fontSize.xs, lineHeight: 18, textDecorationLine: 'underline' },
}));
