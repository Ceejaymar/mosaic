import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { useAppStore } from '@/src/store/useApp';

let disabled = false;
let lastSelectionAt = 0;
let lastImpactAt = 0;

function canAttemptHaptics() {
  if (disabled) return false;
  if (Platform.OS === 'web') return false;
  if (useAppStore.getState().accessibility.disableHaptics) return false;
  return true;
}

async function safeCall<T>(fn: () => Promise<T>, label: string) {
  if (!canAttemptHaptics()) return;

  try {
    await fn();
  } catch (err) {
    // If it throws once (simulator/web/unsupported), stop trying to avoid spam.
    disabled = true;
    if (__DEV__) console.warn(`[haptics] disabled after failure (${label})`, err);
  }
}

// Light impact (e.g. on press)
export async function hapticLight() {
  const now = Date.now();
  if (now - lastImpactAt < 50) return;
  lastImpactAt = now;

  return safeCall(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 'light');
}

// Medium impact
export async function hapticMedium() {
  const now = Date.now();
  if (now - lastImpactAt < 50) return;
  lastImpactAt = now;

  return safeCall(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 'medium');
}

// Heavy impact
export async function hapticHeavy() {
  const now = Date.now();
  if (now - lastImpactAt < 50) return;
  lastImpactAt = now;

  return safeCall(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 'heavy');
}

// Success notification (e.g. save confirmed)
export async function hapticSuccess() {
  return safeCall(
    () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    'success',
  );
}

// Selection tick (e.g. on hover change)
export async function hapticSelection() {
  const now = Date.now();
  if (now - lastSelectionAt < 35) return;
  lastSelectionAt = now;

  return safeCall(() => Haptics.selectionAsync(), 'selection');
}

// Optional: let a settings screen re-enable attempts
export function resetHapticsDisabledFlag() {
  disabled = false;
}
