import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { hapticLight, hapticMedium, hapticSuccess } from '@/src/lib/haptics/haptics';
import { useAppStore } from '@/src/store/useApp';

type Props = { onNext: (enabled: boolean) => void };

export function Step5Biometrics({ onNext }: Props) {
  const { theme } = useUnistyles();
  const scale = useSharedValue(1);

  const didFinish = useRef(false);

  const [ctaLabel, setCtaLabel] = useState('Enable Biometrics');
  const [ctaSubtext, setCtaSubtext] = useState('Uses your device authentication');
  const [canUseBiometrics, setCanUseBiometrics] = useState(false);

  useEffect(() => {
    async function detectBiometrics() {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        setCanUseBiometrics(false);
        setCtaLabel('Continue');
        setCtaSubtext('Biometrics not available or not enrolled');
        return;
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      setCanUseBiometrics(true);

      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setCtaLabel(Platform.OS === 'ios' ? 'Enable Face ID' : 'Enable Face Unlock');
        setCtaSubtext(
          Platform.OS === 'ios'
            ? 'Instant access with a glance'
            : 'Quick access with face recognition',
        );
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setCtaLabel(Platform.OS === 'ios' ? 'Enable Touch ID' : 'Enable Fingerprint');
        setCtaSubtext(
          Platform.OS === 'ios'
            ? 'Quick access with your fingerprint'
            : 'Quick access with your fingerprint',
        );
      } else {
        setCtaSubtext('Secured by your device');
      }
    }
    detectBiometrics();
  }, []);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    return () => cancelAnimation(scale);
  }, [scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleEnable = async () => {
    if (didFinish.current) return;
    didFinish.current = true;

    hapticMedium();
    try {
      if (!canUseBiometrics) {
        useAppStore.setState({ isAppLockEnabled: false });
        onNext(false);
        return;
      }
      useAppStore.setState({ isAuthenticating: true });
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Secure your Mosaic journal',
        fallbackLabel: 'Use Passcode',
      });
      useAppStore.setState({ isAuthenticating: false });

      if (result.success) {
        hapticSuccess();
        useAppStore.setState({ isAppLockEnabled: true, justEnabledBiometrics: true });
        onNext(true);
      } else {
        useAppStore.setState({ isAppLockEnabled: false });
        onNext(false);
      }
    } catch {
      useAppStore.setState({ isAuthenticating: false, isAppLockEnabled: false });
      onNext(false);
    }
  };

  const handleSkip = () => {
    if (didFinish.current) return;
    didFinish.current = true;
    hapticLight();
    useAppStore.setState({ isAppLockEnabled: false });
    onNext(false);
  };

  return (
    <View style={styles.container}>
      {/* ── Top group: visual + copy ── */}
      <View style={styles.topGroup}>
        <View style={styles.visualZone}>
          {/* Ambient gold halo — square */}
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.24)', 'rgba(197, 160, 89, 0.08)', 'transparent']}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
            style={styles.ambientGlow}
          />

          <Animated.View style={[styles.lockCard, pulseStyle]}>
            {/* Glassmorphism fill */}
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

            {/* Gold shimmer top edge */}
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.55)', 'rgba(197, 160, 89, 0.18)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.cardTopEdge}
            />

            {/* Handcrafted lock icon */}
            <View style={styles.lockIconWrap}>
              <View style={[styles.lockShackle, { borderColor: theme.colors.mosaicGold }]} />
              <View style={styles.lockBody}>
                <View style={styles.keyholeWrap}>
                  <View
                    style={[styles.keyholeCircle, { backgroundColor: theme.colors.mosaicGold }]}
                  />
                  <View
                    style={[styles.keyholeSlot, { backgroundColor: theme.colors.mosaicGold }]}
                  />
                </View>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* ── Copy ── */}
        <View style={styles.copy}>
          <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
            Your space.
          </AppText>
          <AppText style={[styles.subtitle, { color: theme.colors.typography }]}>
            Your mood history stays completely private, secured by your device's built-in
            authentication. No passwords. No cloud.
          </AppText>
        </View>
      </View>

      {/* ── CTAs pinned to bottom ── */}
      <View style={styles.ctas}>
        <Pressable
          onPress={handleEnable}
          style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
        >
          <LinearGradient
            colors={['#E2BC62', '#C5A059', '#B8924A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionBtn}
          >
            <AppText font="mono" style={styles.primaryBtnText}>
              {ctaLabel}
            </AppText>
            <AppText style={styles.btnSubtextDark}>{ctaSubtext}</AppText>
          </LinearGradient>
        </Pressable>

        {/* Secondary link */}
        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <AppText style={[styles.skipBtnText, { color: theme.colors.typography }]}>
            Setup later in settings
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, justifyContent: 'space-between' },

  // ── Top group
  topGroup: { gap: theme.spacing[6] },
  visualZone: {
    marginTop: theme.spacing[8],
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 70,
  },
  lockCard: {
    width: 200,
    height: 180,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.22)',
    backgroundColor: 'rgba(16, 12, 7, 0.55)',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopEdge: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },

  // ── Lock icon
  lockIconWrap: { alignItems: 'center' },
  lockShackle: {
    width: 36,
    height: 26,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomWidth: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginBottom: -2,
  },
  lockBody: {
    width: 58,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(197, 160, 89, 0.45)',
    backgroundColor: 'rgba(197, 160, 89, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyholeWrap: { alignItems: 'center', gap: 2 },
  keyholeCircle: { width: 12, height: 12, borderRadius: 6, opacity: 0.85 },
  keyholeSlot: {
    width: 5,
    height: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    opacity: 0.6,
  },

  // ── Copy
  copy: { gap: theme.spacing[3] },
  title: { fontSize: 36, fontWeight: '700', letterSpacing: -0.8, lineHeight: 42 },
  subtitle: { fontSize: theme.fontSize.base, opacity: 0.48, lineHeight: 24 },

  // ── CTAs
  ctas: {
    gap: theme.spacing[3],
    paddingBottom: theme.spacing[8],
  },
  actionBtn: {
    paddingVertical: 16,
    borderRadius: theme.radius.tight,
    alignItems: 'center',
    gap: 4,
  },
  primaryBtnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: '#1A1208',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  btnSubtextDark: {
    fontSize: 12,
    color: 'rgba(26, 18, 8, 0.65)',
    letterSpacing: 0.2,
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
  },
  skipBtnText: {
    fontSize: theme.fontSize.sm,
    letterSpacing: 0.2,
    opacity: 0.45,
  },
}));
