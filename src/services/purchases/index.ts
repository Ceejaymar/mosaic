import { Platform } from 'react-native';
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

// ─── Config ───────────────────────────────────────────────────────────────────

// Production: replace with separate appl_... / goog_... keys per platform
const API_KEY = {
  ios: 'test_ZmIhebKKHwfsuIWJauMoZIulnPD',
  android: 'test_ZmIhebKKHwfsuIWJauMoZIulnPD',
};

export const PRO_ENTITLEMENT_ID = 'Mosaic Pro';

// ─── Init ─────────────────────────────────────────────────────────────────────

export function configurePurchases(): void {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
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
  const sub = Purchases.addCustomerInfoUpdateListener(listener);
  return () => sub.remove();
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
