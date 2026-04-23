import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { hapticLight, hapticMedium, hapticSelection } from '@/src/lib/haptics/haptics';
import { getOfferings } from '@/src/services/purchases';
import { useAppStore } from '@/src/store/useApp';
import { openPrivacyPolicy, openTermsOfService } from '@/src/utils/support-links';

// ─── Types & Data ─────────────────────────────────────────────────────────────

type PlanType = 'annual' | 'monthly';

type Plan = {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  subtext: string;
  badge: string | null;
  cta: string;
  cancelNote: string;
};

// Fallback plans just in case RevenueCat fails to load
const FALLBACK_PLANS: Plan[] = [
  {
    id: 'annual',
    name: 'Annual',
    price: '$39.99',
    period: '/ year',
    subtext: 'Just $3.33 / mo',
    badge: 'BEST VALUE',
    cta: 'Start 7-Day Free Trial',
    cancelNote: "Cancel before the trial ends and you won't be charged.",
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$3.99',
    period: '/ month',
    subtext: 'Auto-renews monthly until canceled',
    badge: null,
    cta: 'Start 7-Day Free Trial',
    cancelNote: "Cancel before the trial ends and you won't be charged.",
  },
];

type FeatureItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const FEATURES: FeatureItem[] = [
  { icon: 'flash-outline', label: 'Automatic stress trigger identification' },
  { icon: 'document-text-outline', label: 'Therapist-ready emotional reports' },
  { icon: 'lock-closed-outline', label: '100% private — biometric vault, no cloud' },
  { icon: 'notifications-outline', label: 'Gentle check-ins built around your schedule' },
];

// ─── PlanCard ─────────────────────────────────────────────────────────────────

type PlanCardProps = {
  plan: Plan;
  isSelected: boolean;
  onSelect: (id: PlanType) => void;
};

const PlanCard = memo(function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  const { theme } = useUnistyles();
  const fillOpacity = useSharedValue(isSelected ? 1 : 0);
  const shimmerOpacity = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    fillOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 280 });
    shimmerOpacity.value = withTiming(isSelected ? 1 : 0, { duration: 280 });
  }, [isSelected, fillOpacity, shimmerOpacity]);

  const fillStyle = useAnimatedStyle(() => ({ opacity: fillOpacity.value }));
  const shimmerStyle = useAnimatedStyle(() => ({ opacity: shimmerOpacity.value }));

  return (
    <Pressable
      onPress={() => onSelect(plan.id)}
      style={({ pressed }) => [cardStyles.pressable, { opacity: pressed ? 0.88 : 1 }]}
    >
      <View style={[cardStyles.card, isSelected ? cardStyles.cardOn : cardStyles.cardOff]}>
        <Animated.View style={[StyleSheet.absoluteFill, fillStyle]} pointerEvents="none">
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.1)', 'rgba(197, 160, 89, 0.04)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
          />
        </Animated.View>

        <Animated.View style={[cardStyles.topEdge, shimmerStyle]} pointerEvents="none">
          <LinearGradient
            colors={['rgba(226, 188, 98, 0.65)', 'rgba(197, 160, 89, 0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View style={cardStyles.badgeRow}>
          {plan.badge !== null ? (
            <LinearGradient
              colors={['#E2BC62', '#C5A059']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[cardStyles.badge, { borderRadius: 4 }]}
            >
              <AppText font="mono" style={cardStyles.badgeText}>
                {plan.badge}
              </AppText>
            </LinearGradient>
          ) : null}
        </View>

        <View style={cardStyles.mainRow}>
          <View style={cardStyles.nameCol}>
            <AppText style={[cardStyles.planName, { color: theme.colors.typography }]}>
              {plan.name}
            </AppText>
            <AppText style={cardStyles.subtext}>{plan.subtext}</AppText>
          </View>
          <View style={cardStyles.priceCol}>
            <AppText style={[cardStyles.price, { color: theme.colors.typography }]}>
              {plan.price}
            </AppText>
            <AppText style={cardStyles.period}>{plan.period}</AppText>
          </View>
        </View>

        <View style={[cardStyles.radio, isSelected ? cardStyles.radioOn : cardStyles.radioOff]}>
          {isSelected ? <View style={cardStyles.radioDot} /> : null}
        </View>
      </View>
    </Pressable>
  );
});

const cardStyles = StyleSheet.create((theme) => ({
  pressable: { borderRadius: 16 },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },
  cardOff: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
  },
  cardOn: {
    borderColor: 'rgba(197, 160, 89, 0.65)',
    backgroundColor: 'rgba(16, 12, 7, 0.55)',
  },
  topEdge: { position: 'absolute', top: 0, left: 0, right: 0, height: 1 },
  badgeRow: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  badge: { paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#1A1208', letterSpacing: 0.9 },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingRight: theme.spacing[6],
  },
  nameCol: { flex: 1, gap: 4 },
  priceCol: { alignItems: 'flex-end', gap: 2 },
  planName: { fontSize: 18, fontWeight: '600', letterSpacing: -0.2 },
  subtext: { fontSize: 12, color: 'rgba(255, 255, 255, 0.42)', lineHeight: 17 },
  price: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5 },
  period: { fontSize: 11, color: 'rgba(255, 255, 255, 0.38)', letterSpacing: 0.2 },
  radio: {
    position: 'absolute',
    bottom: theme.spacing[4],
    right: theme.spacing[4],
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOff: { borderColor: 'rgba(255, 255, 255, 0.18)' },
  radioOn: { borderColor: '#C5A059' },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#C5A059' },
}));

// ─── Step7Paywall ─────────────────────────────────────────────────────────────

type Props = {
  onClose: () => void;
  // Note: Added pkg to safely pass the RevenueCat object up without breaking typescript
  onSubscribe: (plan: PlanType, pkg?: PurchasesPackage) => Promise<void> | void;
  onRestore: () => void;
};

export function Step7Paywall({ onClose, onSubscribe, onRestore }: Props) {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { hardPaywall } = useLocalSearchParams();
  const isHardPaywall = hardPaywall === 'true';

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [rcPackages, setRcPackages] = useState<Record<string, PurchasesPackage>>({});

  // ── Fetch dynamic localized prices from RevenueCat ──
  useEffect(() => {
    async function loadOfferings() {
      try {
        const offerings = await getOfferings();
        if (offerings.current && offerings.current.availablePackages.length > 0) {
          const dynamicPlans: Plan[] = [];
          const packagesMap: Record<string, PurchasesPackage> = {};

          offerings.current.availablePackages.forEach((pkg) => {
            if (pkg.packageType === PACKAGE_TYPE.ANNUAL) {
              dynamicPlans.push({
                id: 'annual',
                name: 'Annual',
                price: pkg.product.priceString, // Dynamically set localized price
                period: '/ year',
                subtext: 'Billed annually',
                badge: 'BEST VALUE',
                cta: 'Start Free Trial',
                cancelNote: "Cancel before the trial ends and you won't be charged.",
              });
              packagesMap['annual'] = pkg;
            } else if (pkg.packageType === PACKAGE_TYPE.MONTHLY) {
              dynamicPlans.push({
                id: 'monthly',
                name: 'Monthly',
                price: pkg.product.priceString, // Dynamically set localized price
                period: '/ month',
                subtext: 'Auto-renews monthly until canceled',
                badge: null,
                cta: 'Subscribe',
                cancelNote: 'Cancel anytime.',
              });
              packagesMap['monthly'] = pkg;
            }
          });

          if (dynamicPlans.length > 0) {
            setPlans(dynamicPlans);
            setRcPackages(packagesMap);
          }
        }
      } catch (e) {
        console.warn('Failed to load RevenueCat offerings, falling back to static plans.', e);
      }
    }
    loadOfferings();
  }, []);

  const handleSelectPlan = useCallback((id: PlanType) => {
    hapticSelection();
    setSelectedPlan(id);
  }, []);

  const handleSubscribe = useCallback(async () => {
    hapticMedium();
    // Pass both the ID and the raw RevenueCat package to your parent screen
    const pkgToBuy = rcPackages[selectedPlan];
    await onSubscribe(selectedPlan, pkgToBuy);

    const persisted = await useAppStore.getState().completeOnboarding();
    if (persisted) router.replace('/');
  }, [onSubscribe, router, selectedPlan, rcPackages]);

  const activePlan = plans.find((p) => p.id === selectedPlan) ?? plans[0];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.22)', 'rgba(197, 160, 89, 0.07)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 0.7 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {!isHardPaywall ? (
        <Animated.View
          entering={FadeInUp.delay(150).springify()}
          style={[styles.topBar, { paddingTop: insets.top }]}
        >
          <Pressable
            onPress={async () => {
              hapticLight();
              onClose();
              const persisted = await useAppStore.getState().completeOnboarding();
              if (persisted) router.replace('/');
            }}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={20} color={theme.colors.typography} opacity={0.4} />
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View style={[styles.topBar, { paddingTop: insets.top }]} />
      )}

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.header}>
          <View style={styles.iconWrap}>
            <View style={styles.iconGlowSquircle}>
              <LinearGradient
                colors={['rgba(212, 175, 55, 0.3)', 'transparent']}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <Ionicons name="diamond-outline" size={28} color="#E2BC62" />
          </View>
          <View style={styles.rule} />
          <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
            Unlock your mind.
          </AppText>
          <AppText style={[styles.subtitle, { color: theme.colors.typography }]}>
            Everything you need to understand your emotional patterns and build better days.
          </AppText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).springify()} style={styles.featuresZone}>
          {FEATURES.map((feature) => (
            <View key={feature.label} style={styles.featureRow}>
              <View style={[styles.featureIcon, { borderColor: 'rgba(197, 160, 89, 0.22)' }]}>
                <Ionicons name={feature.icon} size={14} color={theme.colors.mosaicGold} />
              </View>
              <AppText style={[styles.featureLabel, { color: theme.colors.typography }]}>
                {feature.label}
              </AppText>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(470).springify()} style={styles.plansZone}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onSelect={handleSelectPlan}
            />
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(580).springify()} style={styles.footerZone}>
          <Pressable
            onPress={handleSubscribe}
            style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
          >
            <LinearGradient
              colors={['#E2BC62', '#C5A059', '#B8924A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <AppText font="mono" style={styles.ctaBtnText}>
                {activePlan.cta}
              </AppText>
            </LinearGradient>
          </Pressable>

          {!isHardPaywall ? (
            <AppText style={styles.cancelText}>{activePlan.cancelNote}</AppText>
          ) : null}

          <Pressable
            onPress={() => {
              hapticLight();
              onRestore();
            }}
            style={({ pressed }) => [styles.restoreBtn, pressed && styles.pressed]}
          >
            <AppText style={styles.restoreText}>Restore Purchases</AppText>
          </Pressable>

          <View style={styles.legalLinks}>
            <Pressable
              onPress={() => {
                hapticLight();
                openTermsOfService();
              }}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <AppText style={styles.legalText}>Terms & Conditions</AppText>
            </Pressable>
            <AppText style={styles.legalDot}>·</AppText>
            <Pressable
              onPress={() => {
                hapticLight();
                openPrivacyPolicy();
              }}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <AppText style={styles.legalText}>Privacy Policy</AppText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: 0,
    alignItems: 'flex-end',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[8],
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center', gap: theme.spacing[3] },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  iconGlowSquircle: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 18,
    overflow: 'hidden',
  },
  rule: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(197, 160, 89, 0.35)',
  },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.8, textAlign: 'center' },
  subtitle: {
    fontSize: theme.fontSize.base,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: theme.spacing[3],
  },
  featuresZone: { gap: theme.spacing[3], paddingHorizontal: theme.spacing[4] },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(197, 160, 89, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureLabel: { fontSize: theme.fontSize.sm, opacity: 0.72, lineHeight: 20, flex: 1 },
  plansZone: { gap: theme.spacing[3] },
  footerZone: { gap: theme.spacing[2] },
  ctaBtn: {
    paddingVertical: 18,
    borderRadius: theme.radius.tight,
    alignItems: 'center',
  },
  ctaBtnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: '#1A1208',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  cancelText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.35)',
    lineHeight: 18,
    paddingHorizontal: theme.spacing[4],
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C5A059',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: theme.spacing[2],
  },
  legalText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.42)',
    textDecorationLine: 'underline',
  },
  legalDot: { fontSize: 12, color: 'rgba(255, 255, 255, 0.18)' },
  pressed: { opacity: 0.5 },
}));
