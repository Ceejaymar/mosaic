import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { hapticLight, hapticMedium } from '@/src/lib/haptics/haptics';
import { openPrivacyPolicy, openTermsOfService } from '@/src/utils/support-links';

const FEATURES = [
  { icon: 'analytics-outline' as const, text: 'Visualize your emotional trends' },
  { icon: 'flash-outline' as const, text: 'Identify hidden stress triggers' },
  { icon: 'lock-closed-outline' as const, text: '100% private, on-device data' },
];

type Props = { onNext: () => void };

export function Step1Welcome({ onNext }: Props) {
  const { theme } = useUnistyles();

  const handleGetStarted = () => {
    hapticMedium();
    onNext();
  };

  return (
    <View style={styles.container}>
      {/* ── Brand mark with layered radial glow ── */}
      <View style={styles.markContainer}>
        {/* Outer ambient glow */}
        <LinearGradient
          colors={['rgba(197, 160, 89, 0.18)', 'rgba(197, 160, 89, 0.06)', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.markGlowOuter}
        />
        {/* Inner warm halo */}
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.22)', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.markGlowInner}
        />
        <View style={[styles.mark, { backgroundColor: 'rgba(197, 160, 89, 0.12)' }]}>
          <View style={[styles.markInner, { backgroundColor: theme.colors.mosaicGold }]} />
        </View>
      </View>

      {/* ── Hero copy ── */}
      <View style={styles.hero}>
        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          Welcome to{'\n'}Mosaic.
        </AppText>

        {/* Feature list */}
        <View style={styles.featureList}>
          {FEATURES.map((feat) => (
            <View key={feat.text} style={styles.featureRow}>
              <View style={styles.iconContainer}>
                <Ionicons name={feat.icon} size={16} color={theme.colors.mosaicGold} />
              </View>
              <AppText style={[styles.featureText, { color: theme.colors.typography }]}>
                {feat.text}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      {/* ── Gradient CTA ── */}
      <Pressable
        onPress={handleGetStarted}
        style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
      >
        <LinearGradient
          colors={['#E2BC62', '#C5A059', '#B8924A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btn}
        >
          <AppText font="mono" style={styles.btnText}>
            Get Started
          </AppText>
        </LinearGradient>
      </Pressable>

      {/* ── Legal footer ── */}
      <View style={styles.legal}>
        <AppText style={[styles.legalText, { color: theme.colors.typography }]}>
          By continuing, you agree to our{' '}
        </AppText>
        <View style={styles.legalLinks}>
          <Pressable
            onPress={() => {
              hapticLight();
              openTermsOfService();
            }}
          >
            <AppText style={[styles.legalLink, { color: theme.colors.mosaicGold }]}>Terms</AppText>
          </Pressable>
          <AppText style={[styles.legalText, { color: theme.colors.typography }]}> and </AppText>
          <Pressable
            onPress={() => {
              hapticLight();
              openPrivacyPolicy();
            }}
          >
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
  markGlowOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  markGlowInner: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  mark: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.2)',
  },
  markInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    transform: [{ rotate: '45deg' }],
  },
  hero: { gap: theme.spacing[5] },
  title: { fontSize: 44, fontWeight: '700', letterSpacing: -1.2, lineHeight: 50 },
  featureList: { gap: theme.spacing[3] },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.15)',
  },
  featureText: { fontSize: theme.fontSize.base, opacity: 0.75, flex: 1 },
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
  legal: { alignItems: 'center', gap: 2 },
  legalLinks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  legalText: { fontSize: theme.fontSize.xs, opacity: 0.35, textAlign: 'center', lineHeight: 18 },
  legalLink: {
    fontSize: theme.fontSize.xs,
    lineHeight: 18,
    textDecorationLine: 'underline',
    opacity: 0.6,
  },
}));
