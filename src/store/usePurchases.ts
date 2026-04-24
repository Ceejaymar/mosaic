import type { CustomerInfo } from 'react-native-purchases';
import { create } from 'zustand';

import { isProActive } from '@/src/services/purchases';

// ─── Types ────────────────────────────────────────────────────────────────────

type PurchasesState = {
  isPro: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
};

type PurchasesActions = {
  setCustomerInfo: (info: CustomerInfo) => void;
  setLoading: (loading: boolean) => void;
};

// ─── Store ────────────────────────────────────────────────────────────────────

// Not persisted — always fetch fresh state from RevenueCat on launch.
// RevenueCat caches locally, so getCustomerInfo() is fast even offline.
export const usePurchasesStore = create<PurchasesState & PurchasesActions>()((set) => ({
  isPro: false,
  isLoading: true,
  customerInfo: null,

  setCustomerInfo: (info) =>
    set({
      customerInfo: info,
      isPro: isProActive(info),
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
