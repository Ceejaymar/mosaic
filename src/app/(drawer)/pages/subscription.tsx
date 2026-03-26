import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { PRO_ENTITLEMENT_ID, presentPaywall } from '@/src/services/purchases';
import { usePurchasesStore } from '@/src/store/usePurchases';

// ─── Constants ────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: 'trending-up-outline' as const, label: 'Yearly emotional trends' },
  { icon: 'calendar-outline' as const, label: 'Unlimited history' },
  { icon: 'stats-chart-outline' as const, label: 'Advanced insights & patterns' },
  { icon: 'heart-outline' as const, label: 'Priority support' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubscriptionScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const isPro = usePurchasesStore((s) => s.isPro);
  const customerInfo = usePurchasesStore((s) => s.customerInfo);

  const [loading, setLoading] = useState(false);

  // ── Renewal / expiration label ──
  let renewalLabel: string | null = null;
  if (isPro && customerInfo) {
    const entitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID];
    if (entitlement?.expirationDate) {
      const formatted = new Date(entitlement.expirationDate).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      renewalLabel = entitlement.willRenew ? `Renews on ${formatted}` : `Expires on ${formatted}`;
    }
  }

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await presentPaywall();
    } catch {
      Alert.alert(
        'Something went wrong',
        'Unable to open the subscription page. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManage = () => {
    const url =
      Platform.OS === 'android'
        ? 'https://play.google.com/store/account/subscriptions'
        : 'https://apps.apple.com/account/subscriptions';
    Linking.openURL(url);
  };

  const handleBack = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ─── Header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={handleBack} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.typography} />
          </Pressable>
          <Pressable onPress={() => router.navigate('/(tabs)/' as Href)} style={styles.iconBtn}>
            <Ionicons name="home-outline" size={24} color={theme.colors.typography} />
          </Pressable>
        </View>
        <AppText font="heading" style={[styles.headerTitle, { color: theme.colors.typography }]}>
          Mosaic Pro
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {isPro ? (
          <ProView
            renewalLabel={renewalLabel}
            onManage={handleManage}
            goldColor={theme.colors.mosaicGold}
            surfaceColor={theme.colors.surface}
            typographyColor={theme.colors.typography}
          />
        ) : (
          <FreeView
            loading={loading}
            onUpgrade={handleUpgrade}
            goldColor={theme.colors.mosaicGold}
            surfaceColor={theme.colors.surface}
            typographyColor={theme.colors.typography}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ─── Free View ────────────────────────────────────────────────────────────────

function FreeView({
  loading,
  onUpgrade,
  goldColor,
  surfaceColor,
  typographyColor,
}: {
  loading: boolean;
  onUpgrade: () => void;
  goldColor: string;
  surfaceColor: string;
  typographyColor: string;
}) {
  return (
    <View style={styles.body}>
      {/* Icon medallion */}
      <View style={[styles.medallion, { backgroundColor: surfaceColor }]}>
        <Ionicons name="star" size={40} color={goldColor} />
      </View>

      {/* Title + description */}
      <AppText font="heading" style={[styles.title, { color: typographyColor }]}>
        Unlock Mosaic Pro
      </AppText>
      <AppText style={[styles.subtitle, { color: typographyColor }]}>
        Go deeper into your emotional story. Pro gives you the full picture — trends over years,
        unlimited history, and insights that evolve as you do.
      </AppText>

      {/* Feature list */}
      <View style={[styles.featureCard, { backgroundColor: surfaceColor }]}>
        {FEATURES.map((f, i) => (
          <View key={f.label} style={[styles.featureRow, i > 0 && styles.featureRowBorder]}>
            <Ionicons name={f.icon} size={18} color={goldColor} />
            <AppText style={[styles.featureLabel, { color: typographyColor }]}>{f.label}</AppText>
          </View>
        ))}
      </View>

      {/* CTA */}
      <Pressable
        onPress={onUpgrade}
        disabled={loading}
        style={({ pressed }) => [
          styles.primaryBtn,
          { backgroundColor: goldColor, opacity: pressed || loading ? 0.75 : 1 },
        ]}
      >
        <AppText font="mono" style={styles.primaryBtnText}>
          {loading ? 'Loading…' : 'Upgrade Now'}
        </AppText>
      </Pressable>

      <AppText style={[styles.legalNote, { color: typographyColor }]}>
        Subscriptions auto-renew unless cancelled. Cancel anytime.
      </AppText>
    </View>
  );
}

// ─── Pro View ─────────────────────────────────────────────────────────────────

function ProView({
  renewalLabel,
  onManage,
  goldColor,
  surfaceColor,
  typographyColor,
}: {
  renewalLabel: string | null;
  onManage: () => void;
  goldColor: string;
  surfaceColor: string;
  typographyColor: string;
}) {
  return (
    <View style={styles.body}>
      {/* Icon medallion */}
      <View style={[styles.medallion, { backgroundColor: surfaceColor, borderColor: goldColor }]}>
        <Ionicons name="star" size={40} color={goldColor} />
      </View>

      {/* Title */}
      <AppText font="heading" style={[styles.title, { color: typographyColor }]}>
        You're a Pro Member
      </AppText>
      <AppText style={[styles.subtitle, { color: typographyColor }]}>
        Thank you for supporting Mosaic. All Pro features are active on your account.
      </AppText>

      {/* Status card */}
      <View style={[styles.featureCard, { backgroundColor: surfaceColor }]}>
        <View style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={18} color={goldColor} />
          <AppText style={[styles.featureLabel, { color: typographyColor }]}>
            Mosaic Pro — Active
          </AppText>
        </View>
        {renewalLabel !== null && (
          <View style={[styles.featureRow, styles.featureRowBorder]}>
            <Ionicons name="calendar-outline" size={18} color={goldColor} />
            <AppText style={[styles.featureLabel, { color: typographyColor }]}>
              {renewalLabel}
            </AppText>
          </View>
        )}
      </View>

      {/* Manage button */}
      <Pressable
        onPress={onManage}
        style={({ pressed }) => [
          styles.secondaryBtn,
          { borderColor: goldColor, opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <AppText font="mono" style={[styles.secondaryBtnText, { color: goldColor }]}>
          Manage Subscription
        </AppText>
        <Ionicons name="open-outline" size={14} color={goldColor} />
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },

  header: {
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[3],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  iconBtn: { padding: 8, marginLeft: -8 },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  scroll: {
    paddingHorizontal: theme.spacing[4],
  },

  body: {
    alignItems: 'center',
    paddingTop: theme.spacing[6],
    gap: theme.spacing[5],
  },

  medallion: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(197, 160, 89, 0.25)',
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: theme.fontSize.base,
    lineHeight: 24,
    textAlign: 'center',
    opacity: 0.65,
    maxWidth: 320,
  },

  featureCard: {
    width: '100%',
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    paddingHorizontal: theme.spacing[4],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingVertical: 14,
  },
  featureRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  featureLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: '500',
  },

  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: theme.radius.tight,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: '#1A1208',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  secondaryBtn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: theme.radius.tight,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  secondaryBtnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  legalNote: {
    fontSize: theme.fontSize.xs,
    textAlign: 'center',
    opacity: 0.35,
    maxWidth: 280,
    lineHeight: 18,
  },
}));
