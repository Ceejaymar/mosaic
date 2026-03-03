import { DrawerToggleButton } from '@react-navigation/drawer';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { DemoBadge } from '@/src/components/demo-badge';
import { PillButton } from '@/src/components/pill-button';
import { TopFade } from '@/src/components/top-fade';
import { LAYOUT } from '@/src/constants/layout';
import { onOpenCheckInSheet } from '@/src/features/check-in/check-in-sheet-events';
import { CheckInHistory } from '@/src/features/check-in/components/check-in-history';
import { CheckInSheet } from '@/src/features/check-in/components/check-in-sheet';
import { DailyStatsRow } from '@/src/features/check-in/components/daily-stats';
import {
  MosaicDisplay,
  type MosaicTileData,
} from '@/src/features/check-in/components/mosaic-display';
import { CHECK_IN_CONSTANTS } from '@/src/features/check-in/constants/check-in';
import { useTodayCheckIns } from '@/src/features/check-in/hooks/useCheckIns';
import { getMoodDisplayInfo } from '@/src/features/check-in/utils/mood-helpers';
import { getCurrentTimeSlot } from '@/src/features/check-in/utils/time-of-day';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { enableAndroidLayoutAnimations } from '@/src/utils/animations';
import { getFormattedDateLabel } from '@/src/utils/format-date';

export default function CheckInScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const router = useRouter();

  useEffect(() => {
    enableAndroidLayoutAnimations();
  }, []);

  const [sheetVisible, setSheetVisible] = useState(false);
  const { todayEntries, isLoading, loadError, saveEntry, refresh } = useTodayCheckIns();

  const currentSlot = getCurrentTimeSlot();
  const atLimit = todayEntries.length >= CHECK_IN_CONSTANTS.MAX_DAILY_ENTRIES;

  const handleOpenSheet = useCallback(() => {
    if (atLimit) return;
    hapticLight();
    setSheetVisible(true);
  }, [atLimit]);

  const handleCloseSheet = useCallback(() => setSheetVisible(false), []);

  const handleSave = useCallback(
    async (nodeId: string, note?: string, tags?: string[]) => {
      setSheetVisible(false);
      await saveEntry(nodeId, note, tags);
    },
    [saveEntry],
  );

  const handleTilePress = useCallback(
    (tile: MosaicTileData) => {
      router.push(`/check-in/${tile.id}`);
    },
    [router],
  );

  const handleEntryPress = useCallback((id: string) => router.push(`/check-in/${id}`), [router]);

  useEffect(() => {
    return onOpenCheckInSheet(handleOpenSheet);
  }, [handleOpenSheet]);

  const mosaicTiles = useMemo<MosaicTileData[]>(() => {
    return todayEntries
      .slice()
      .reverse()
      .slice(0, CHECK_IN_CONSTANTS.MAX_DAILY_ENTRIES)
      .flatMap((entry) => {
        const display = getMoodDisplayInfo(entry.primaryMood);
        if (!display) return [];
        return [
          {
            id: entry.id,
            color: display.color,
            label: display.label,
            occurredAt: entry.occurredAt,
          },
        ];
      });
  }, [todayEntries]);

  // --- Scroll Tracking for the Hamburger Background ---
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const hamburgerBgStyle = useAnimatedStyle(() => {
    // Fades in between 20px and 70px of scrolling
    const opacity = interpolate(scrollY.value, [20, 70], [0, 1], Extrapolation.CLAMP);
    return { opacity };
  });

  return (
    <View style={styles.container}>
      {/* 1. THE TOP FADE */}
      <TopFade height={insets.top + 60} />

      {/* 2. THE FLOATING HAMBURGER MENU */}
      <View style={[styles.floatingMenu, { top: insets.top + 8 }]}>
        <Animated.View style={[styles.hamburgerSquircle, hamburgerBgStyle]}>
          <BlurView intensity={75} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
        <DrawerToggleButton tintColor={theme.colors.typography} />
      </View>

      {/* 3. SCROLL CONTENT */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: insets.top + 72,
          paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom + 20,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>
          How are you feeling{'\n'}
          {t(`dashboard.time_of_day.${currentSlot}`)}?
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AppText variant="mono" colorVariant="muted" style={styles.dateLabel}>
            {getFormattedDateLabel()}
          </AppText>
          <DemoBadge />
        </View>

        <View style={styles.mosaicWrapper}>
          {isLoading && todayEntries.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.mosaicGold} />
            </View>
          ) : loadError && todayEntries.length === 0 ? (
            <View style={styles.errorContainer}>
              <AppText colorVariant="muted" style={styles.errorText}>
                Could not load today's check-ins.
              </AppText>
              <PillButton
                label="Try again"
                onPress={refresh}
                size="sm"
                accessibilityLabel="Retry loading check-ins"
              />
            </View>
          ) : (
            <MosaicDisplay
              tiles={mosaicTiles}
              onAddPress={handleOpenSheet}
              onTilePress={handleTilePress}
            />
          )}
        </View>

        <DailyStatsRow entriesCount={todayEntries.length} streakCount={1} />
        <CheckInHistory entries={todayEntries} onEntryPress={handleEntryPress} />
      </Animated.ScrollView>

      <CheckInSheet visible={sheetVisible} onClose={handleCloseSheet} onSave={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
  floatingMenu: {
    position: 'absolute',
    left: 8,
    zIndex: 100,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerSquircle: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  greeting: {
    fontSize: 34,
    fontFamily: 'Fraunces',
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: -0.5,
    marginBottom: 8,
    color: theme.colors.typography,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  mosaicWrapper: { marginBottom: 24 },
  loadingContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
  },
  errorContainer: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
  },
  errorText: { fontSize: 14, textAlign: 'center' },
}));
