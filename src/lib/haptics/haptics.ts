import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let disabled = false;
let lastSelectionAt = 0;
let lastImpactAt = 0;

function canAttemptHaptics() {
  if (disabled) return false;
  if (Platform.OS === 'web') return false;
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
  if (now - lastImpactAt < 50) return; // small cooldown
  lastImpactAt = now;

  return safeCall(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 'impactAsync');
}

// Selection tick (e.g. on hover change)
export async function hapticSelection() {
  const now = Date.now();
  if (now - lastSelectionAt < 35) return; // hover-safe cooldown
  lastSelectionAt = now;

  return safeCall(() => Haptics.selectionAsync(), 'selectionAsync');
}

// Optional: let a settings screen re-enable attempts
export function resetHapticsDisabledFlag() {
  disabled = false;
}
