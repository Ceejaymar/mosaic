import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
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
import { hapticLight, hapticMedium } from '@/src/lib/haptics/haptics';

type Props = { onNext: () => void };

export function Step4Notifications({ onNext }: Props) {
  const { theme } = useUnistyles();

  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    return () => cancelAnimation(translateY);
  }, [translateY]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleEnable = () => {
    hapticMedium();
    onNext();
  };

  const handleSkip = () => {
    hapticLight();
    onNext();
  };

  return (
    <View style={styles.container}>
      {/* ── Floating notification mockup ── */}
      <View style={styles.notifZone}>
        {/* Ambient gold halo behind the card */}
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.24)', 'rgba(197, 160, 89, 0.08)', 'transparent']}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.notifGlow}
        />

        <Animated.View style={[styles.notifCard, floatStyle]}>
          {/* Glassmorphism blur fill */}
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

          {/* Hair-thin gold shimmer along the top edge */}
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.55)', 'rgba(197, 160, 89, 0.18)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.notifTopEdge}
          />

          <View style={styles.notifContent}>
            {/* Header: app icon + name + timestamp */}
            <View style={styles.notifHeader}>
              <View style={styles.notifIconWrap}>
                <View
                  style={[styles.notifIconDiamond, { backgroundColor: theme.colors.mosaicGold }]}
                />
              </View>
              <AppText style={[styles.notifAppName, { color: theme.colors.typography }]}>
                Mosaic
              </AppText>
              <AppText style={styles.notifTime}>now</AppText>
            </View>

            {/* Message body */}
            <AppText style={[styles.notifMessage, { color: theme.colors.typography }]}>
              Take a deep breath.{'\n'}How are you feeling right now?
            </AppText>
          </View>
        </Animated.View>
      </View>

      {/* ── Copy ── */}
      <View style={styles.copy}>
        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          Gentle check-ins.
        </AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.typography }]}>
          Let Mosaic occasionally remind you to pause and capture authentic moments. No pressure,
          just a gentle nudge.
        </AppText>
      </View>

      {/* ── CTAs ── */}
      <View style={styles.ctas}>
        <Pressable
          onPress={handleEnable}
          style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
        >
          <LinearGradient
            colors={['#E2BC62', '#C5A059', '#B8924A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <AppText font="mono" style={styles.primaryBtnText}>
              Enable "Surprise Me"
            </AppText>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [styles.secondaryBtn, { opacity: pressed ? 0.45 : 0.5 }]}
        >
          <AppText style={[styles.secondaryBtnText, { color: theme.colors.typography }]}>
            Not right now
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, gap: theme.spacing[5] },

  // ── Notification zone
  notifZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifGlow: {
    position: 'absolute',
    width: 340,
    height: 260,
    borderRadius: 80,
  },
  notifCard: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.22)',
    backgroundColor: 'rgba(16, 12, 7, 0.55)',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  notifTopEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  notifContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: 4,
  },
  notifIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(197, 160, 89, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.28)',
  },
  notifIconDiamond: {
    width: 8,
    height: 8,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  notifAppName: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    flex: 1,
    opacity: 0.85,
  },
  notifTime: {
    fontSize: 11,
    opacity: 0.35,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'SpaceMono',
  },
  notifMessage: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.88,
  },

  // ── Copy
  copy: { gap: theme.spacing[3] },
  title: { fontSize: 36, fontWeight: '700', letterSpacing: -0.8, lineHeight: 42 },
  subtitle: { fontSize: theme.fontSize.base, opacity: 0.48, lineHeight: 24 },

  // ── CTAs
  ctas: { gap: theme.spacing[2] },
  primaryBtn: {
    paddingVertical: 17,
    borderRadius: theme.radius.tight,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: '#1A1208',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing[3],
  },
  secondaryBtnText: {
    fontSize: theme.fontSize.sm,
    letterSpacing: 0.2,
  },
}));
