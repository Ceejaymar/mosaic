import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { openPrivacyPolicy, openTermsOfService } from '@/src/utils/support-links';

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  onNext: () => void;
};

export function Step1Welcome({ onNext }: Props) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      {/* ── Brand mark ── */}
      <View style={[styles.mark, { backgroundColor: 'rgba(197, 160, 89, 0.1)' }]}>
        <View style={[styles.markInner, { backgroundColor: theme.colors.mosaicGold }]} />
      </View>

      {/* ── Hero copy ── */}
      <View style={styles.hero}>
        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          Welcome to{'\n'}Mosaic.
        </AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.typography }]}>
          Your private emotional space.{'\n'}Track trends, understand your triggers,{'\n'}and
          visualize your story.
        </AppText>
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
            <AppText style={[styles.legalLink, { color: theme.colors.mosaicGold }]}>
              Terms of Service
            </AppText>
          </Pressable>
          <AppText style={[styles.legalText, { color: theme.colors.typography }]}> and </AppText>
          <Pressable onPress={openPrivacyPolicy}>
            <AppText style={[styles.legalLink, { color: theme.colors.mosaicGold }]}>
              Privacy Policy
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: theme.spacing[6],
    gap: theme.spacing[5],
  },

  mark: {
    position: 'absolute',
    top: '15%',
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markInner: {
    width: 20,
    height: 20,
    borderRadius: 6,
    transform: [{ rotate: '45deg' }],
  },

  hero: {
    gap: theme.spacing[4],
  },
  title: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 50,
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    lineHeight: 28,
    opacity: 0.55,
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

  legal: {
    alignItems: 'center',
    gap: 2,
  },
  legalLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legalText: {
    fontSize: theme.fontSize.xs,
    opacity: 0.4,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    fontSize: theme.fontSize.xs,
    lineHeight: 18,
    textDecorationLine: 'underline',
  },
}));
