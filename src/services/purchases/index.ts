import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

// ─── Config ───────────────────────────────────────────────────────────────────

const API_KEY = __DEV__
  ? {
      ios: process.env.EXPO_PUBLIC_RC_IOS_TEST_KEY ?? '',
      android: process.env.EXPO_PUBLIC_RC_ANDROID_TEST_KEY ?? '',
    }
  : {
      ios: process.env.EXPO_PUBLIC_RC_IOS_PROD_KEY ?? '',
      android: process.env.EXPO_PUBLIC_RC_ANDROID_PROD_KEY ?? '',
    };

export const PRO_ENTITLEMENT_ID = 'Mosaic Pro';

// ─── Init ─────────────────────────────────────────────────────────────────────

export function configurePurchases(): void {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  }

  const key = Platform.OS === 'ios' ? API_KEY.ios : API_KEY.android;

  if (!__DEV__ && !key) {
    console.error(
      '[Purchases] CRITICAL: RevenueCat production API key is missing. Set EXPO_PUBLIC_RC_IOS_PROD_KEY / EXPO_PUBLIC_RC_ANDROID_PROD_KEY.',
    );
  }

  if (Platform.OS === 'ios') {
    Purchases.configure({ apiKey: API_KEY.ios });
  } else if (Platform.OS === 'android') {
    Purchases.configure({ apiKey: API_KEY.android });
  }
}

// ─── Customer Info ────────────────────────────────────────────────────────────

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

export function isProActive(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined;
}

export function addCustomerInfoListener(listener: (info: CustomerInfo) => void): () => void {
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}

// ─── Offerings ────────────────────────────────────────────────────────────────

export async function getOfferings(): Promise<PurchasesOfferings> {
  return Purchases.getOfferings();
}

// ─── Purchases ────────────────────────────────────────────────────────────────

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  return Purchases.restorePurchases();
}

// ─── Paywall UI ───────────────────────────────────────────────────────────────

export type PaywallResult = 'purchased' | 'restored' | 'not_presented' | 'cancelled' | 'error';

function mapPaywallResult(result: PAYWALL_RESULT): PaywallResult {
  switch (result) {
    case PAYWALL_RESULT.PURCHASED:
      return 'purchased';
    case PAYWALL_RESULT.RESTORED:
      return 'restored';
    case PAYWALL_RESULT.NOT_PRESENTED:
      return 'not_presented';
    case PAYWALL_RESULT.CANCELLED:
      return 'cancelled';
    default:
      return 'error';
  }
}

export async function presentPaywall(): Promise<PaywallResult> {
  const result = await RevenueCatUI.presentPaywall();
  return mapPaywallResult(result);
}

export async function presentPaywallIfNeeded(): Promise<PaywallResult> {
  const result = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: PRO_ENTITLEMENT_ID,
  });
  return mapPaywallResult(result);
}

// ─── Customer Center ──────────────────────────────────────────────────────────

export async function presentCustomerCenter(): Promise<void> {
  await RevenueCatUI.presentCustomerCenter();
}
