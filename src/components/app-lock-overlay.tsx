import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useRef } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';

export function AppLockOverlay({ onUnlock }: { onUnlock: () => void }) {
  const { theme } = useUnistyles();
  const hasAttemptedAuth = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAttemptedAuth.current) {
        hasAttemptedAuth.current = true;
        onUnlock();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [onUnlock]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconRing, { borderColor: theme.colors.mosaicGold }]}>
          <Ionicons name="lock-closed-outline" size={36} color={theme.colors.mosaicGold} />
        </View>

        <AppText font="heading" style={[styles.heading, { color: theme.colors.typography }]}>
          Mosaic is locked
        </AppText>

        <AppText colorVariant="muted" style={styles.sub}>
          Authenticate to continue
        </AppText>

        <Pressable
          onPress={onUnlock}
          style={({ pressed }) => [
            styles.unlockBtn,
            { backgroundColor: theme.colors.mosaicGold, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Ionicons name="finger-print-outline" size={20} color={theme.colors.onAccent} />
          <AppText style={[styles.unlockBtnText, { color: theme.colors.onAccent }]}>
            Unlock Mosaic
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  sub: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 40,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 100,
  },
  unlockBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
}));
