import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { BlurHeader } from '@/src/components/blur-header';
import { DemoBadge } from '@/src/components/demo-badge';
import { Screen } from '@/src/components/screen';
import { Surface } from '@/src/components/surface';
import { LAYOUT } from '@/src/constants/layout';
import { fetchMoodEntriesPage, type MoodEntry } from '@/src/db/repos/moodRepo';
import { parseStoredTags } from '@/src/features/check-in/utils/parse-tags';
import { getDemoEntriesPage } from '@/src/features/demo/generateDemoData';
import { getMoodDisplayInfo } from '@/src/features/emotion-accordion/utils/mood-display';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { useAppStore } from '@/src/store/useApp';
import { formatDayLabel, formatEntryTime } from '@/src/utils/format-date';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 30;

// ─── Types ────────────────────────────────────────────────────────────────────

type DayHeader = { type: 'header'; id: string; label: string };
type EntryItem = { type: 'entry'; id: string; entry: MoodEntry };
type ListItem = DayHeader | EntryItem;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexAlpha(hex: string, a: number): string {
  return `${hex}${Math.round(a * 255)
    .toString(16)
    .padStart(2, '0')}`;
}

function buildListItems(entries: MoodEntry[], notesOnly: boolean): ListItem[] {
  const src = notesOnly ? entries.filter((e) => (e.note ?? '').trim().length > 0) : entries;
  const items: ListItem[] = [];
  let lastKey = '';
  for (const entry of src) {
    if (entry.dateKey !== lastKey) {
      lastKey = entry.dateKey;
      items.push({
        type: 'header',
        id: `h-${entry.dateKey}`,
        label: formatDayLabel(entry.dateKey),
      });
    }
    items.push({ type: 'entry', id: entry.id, entry });
  }
  return items;
}

// ─── DayHeaderRow ─────────────────────────────────────────────────────────────

function DayHeaderRow({ label }: { label: string }) {
  return (
    <AppText font="heading" variant="xl" colorVariant="primary" style={dhStyles.label}>
      {label}
    </AppText>
  );
}

const dhStyles = StyleSheet.create((theme) => ({
  label: {
    fontWeight: '600' as const,
    paddingHorizontal: theme.spacing[5],
    paddingTop: 28,
    paddingBottom: theme.spacing[2],
  },
}));

// ─── EntryCard ────────────────────────────────────────────────────────────────

type EntryCardProps = {
  entry: MoodEntry;
  onPress: (id: string) => void;
};

const EntryCard = memo(function EntryCard({ entry, onPress }: EntryCardProps) {
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();
  const { t } = useTranslation();
  const info = getMoodDisplayInfo(entry.primaryMood);
  const accentColor = info?.color ?? theme.colors.mosaicGold;
  const label = info?.label ?? entry.primaryMood;
  const tags = parseStoredTags(entry.tags);

  const handlePress = useCallback(() => onPress(entry.id), [entry.id, onPress]);

  const gradientColors = [hexAlpha(accentColor, 0.1), hexAlpha(accentColor, 0)] as const;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        cardStyles.pressable,
        { shadowColor: theme.colors.tileShadowColor, opacity: pressed ? 0.78 : 1 },
      ]}
    >
      <Surface
        variant="sheet"
        bordered={false}
        style={{ backgroundColor: theme.colors.tileBackground }}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={cardStyles.body}>
          <View style={cardStyles.headlineRow}>
            <AppText font="heading" colorVariant="muted" style={cardStyles.iAmFeeling}>
              {t('journal.im_feeling')}
            </AppText>
            <AppText font="heading" style={[cardStyles.emotion, { color: accentColor }]}>
              {label}
            </AppText>
          </View>

          {entry.note ? (
            <AppText
              font="heading"
              colorVariant="primary"
              style={cardStyles.note}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {entry.note}
            </AppText>
          ) : null}

          {tags.length > 0 && (
            <View style={cardStyles.tagRow}>
              {tags.map((tag) => (
                <View key={tag} style={[cardStyles.tag, { borderColor: colors.divider }]}>
                  <AppText colorVariant="muted" style={cardStyles.tagText}>
                    {tag}
                  </AppText>
                </View>
              ))}
            </View>
          )}

          <AppText colorVariant="muted" style={cardStyles.time}>
            {formatEntryTime(entry.occurredAt)}
          </AppText>
        </View>
      </Surface>
    </Pressable>
  );
});

const cardStyles = StyleSheet.create((theme) => ({
  pressable: {
    marginHorizontal: theme.spacing[4],
    marginVertical: theme.spacing[2],
    borderRadius: theme.radius.sheet,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },
  body: {
    padding: theme.spacing[5],
    gap: theme.spacing[2],
  },
  headlineRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'baseline' as const,
  },
  iAmFeeling: {
    fontSize: 14,
    fontStyle: 'italic' as const,
  },
  emotion: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  note: {
    fontSize: theme.fontSize.lg,
    lineHeight: 28,
    fontWeight: '400' as const,
    letterSpacing: -0.2,
  },
  tagRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing[2],
  },
  tag: {
    borderWidth: 1,
    borderRadius: theme.radius.sheet,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  time: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    marginTop: theme.spacing[1],
  },
}));

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  const { t } = useTranslation();
  return (
    <View style={emptyStyles.container}>
      <AppText font="heading" colorVariant="primary" style={emptyStyles.title}>
        {t('journal.empty_title')}
      </AppText>
      <AppText colorVariant="muted" style={emptyStyles.subtitle}>
        {t('journal.empty_subtitle')}
      </AppText>
    </View>
  );
}

const emptyStyles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: theme.spacing[20],
    alignItems: 'center' as const,
    gap: theme.spacing[2],
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  subtitle: {
    fontSize: 14,
  },
}));

// ─── FilterToggle ─────────────────────────────────────────────────────────────

type FilterToggleProps = { notesOnly: boolean; onToggle: () => void };

function FilterToggle({ notesOnly, onToggle }: FilterToggleProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({ opacity: pressed ? 0.4 : 1 })}
      accessibilityRole="button"
      accessibilityLabel={
        notesOnly ? t('journal.filter_a11y_show_all') : t('journal.filter_a11y_with_notes')
      }
    >
      <AppText variant="md" style={{ fontWeight: '500' as const, color: theme.colors.mosaicGold }}>
        {notesOnly ? t('journal.filter_with_notes') : t('journal.filter_show_all')}
      </AppText>
    </Pressable>
  );
}

// ─── List utils ───────────────────────────────────────────────────────────────

const getItemType = (item: ListItem) => item.type;
const keyExtractor = (item: ListItem) => item.id;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Journal() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const isDemoMode = useAppStore((s) => s.isDemoMode);

  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [notesOnly, setNotesOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);
  const entriesRef = useRef<MoodEntry[]>([]);

  const scrollY = useSharedValue(0);

  const toggleNotesOnly = useCallback(() => setNotesOnly((v) => !v), []);

  const refreshEntries = useCallback(async () => {
    if (isDemoMode) {
      const page = getDemoEntriesPage(0, PAGE_SIZE);
      entriesRef.current = page;
      hasMoreRef.current = true;
      offsetRef.current = page.length;
      setEntries(page);
      setIsLoading(false);
      setError(false);
      return;
    }

    const current = entriesRef.current;
    const hasData = current.length > 0;

    isLoadingRef.current = false;
    hasMoreRef.current = true;
    offsetRef.current = 0;

    if (!hasData) {
      setError(false);
      setIsLoading(true);
    }

    isLoadingRef.current = true;
    try {
      const page = await fetchMoodEntriesPage(0, PAGE_SIZE);
      if (page.length < PAGE_SIZE) hasMoreRef.current = false;
      offsetRef.current = page.length;

      const changed =
        !hasData || page.length !== current.length || page.some((e, i) => e.id !== current[i]?.id);

      if (changed) {
        entriesRef.current = page;
        setEntries(page);
      }
    } catch {
      setError(true);
    } finally {
      isLoadingRef.current = false;
      if (!hasData) setIsLoading(false);
    }
  }, [isDemoMode]);

  const loadNextPage = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;
    try {
      let addedVisible = false;
      while (!addedVisible && hasMoreRef.current) {
        const fetchPage = isDemoMode ? getDemoEntriesPage : fetchMoodEntriesPage;
        const page = await fetchPage(offsetRef.current, PAGE_SIZE);
        if (page.length < PAGE_SIZE) hasMoreRef.current = false;
        offsetRef.current += page.length;
        setEntries((prev) => {
          const next = [...prev, ...page];
          entriesRef.current = next;
          return next;
        });
        addedVisible = notesOnly
          ? page.some((e) => (e.note ?? '').trim().length > 0)
          : page.length > 0;
        if (page.length === 0) break;
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, [notesOnly, isDemoMode]);

  useFocusEffect(
    useCallback(() => {
      refreshEntries();
    }, [refreshEntries]),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: language re-runs formatDayLabel (reads i18n.language internally)
  const listItems = useMemo(
    () => buildListItems(entries, notesOnly),
    [entries, notesOnly, language],
  );

  const handleEntryPress = useCallback((id: string) => {
    // biome-ignore lint/suspicious/noExplicitAny: expo-router typed routes
    router.push(`/check-in/${id}` as any);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'header') return <DayHeaderRow label={item.label} />;
      return <EntryCard entry={item.entry} onPress={handleEntryPress} />;
    },
    [handleEntryPress],
  );

  const paddingBottom = LAYOUT.TAB_BAR_HEIGHT + insets.bottom + 16;

  if (isLoading) {
    return (
      <Screen style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={theme.colors.mosaicGold} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen style={[styles.centered, { paddingTop: insets.top }]}>
        <AppText colorVariant="muted" style={styles.errorText}>
          {t('journal.error_message')}
        </AppText>
        <Pressable
          onPress={refreshEntries}
          style={({ pressed }) => [styles.retryBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <AppText
            variant="md"
            style={{ color: theme.colors.mosaicGold, fontWeight: '600' as const }}
          >
            {t('journal.error_retry')}
          </AppText>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      <BlurHeader scrollY={scrollY}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <AppText font="heading" variant="2xl" colorVariant="primary" style={styles.pageTitle}>
              {t('journal.title', 'Journal')}
            </AppText>
            <DemoBadge />
          </View>
          <FilterToggle notesOnly={notesOnly} onToggle={toggleNotesOnly} />
        </View>
      </BlurHeader>

      <FlashList
        data={listItems}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        renderItem={renderItem}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={EmptyState}
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom,
          paddingTop: insets.top + 60,
        }}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create((theme) => ({
  centered: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing[4],
  },
  retryBtn: {
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[2],
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  pageTitle: {
    fontWeight: '700' as const,
  },
}));
