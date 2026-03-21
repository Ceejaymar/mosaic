import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { DemoBadge } from '@/src/components/demo-badge';
import { EntryCard } from '@/src/components/entry-card';
import { Screen } from '@/src/components/screen';
import { TopFade } from '@/src/components/top-fade';
import { LAYOUT } from '@/src/constants/layout';
import { fetchMoodEntriesPage, type MoodEntry } from '@/src/db/repos/moodRepo';
import { getDemoEntriesPage } from '@/src/features/demo/generateDemoData';
import { useAppStore } from '@/src/store/useApp';
import { LETTER_SPACING } from '@/src/styles/design-tokens';
import { formatDayLabel } from '@/src/utils/format-date';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 30;

// ─── Types ────────────────────────────────────────────────────────────────────

type DayHeader = { type: 'header'; id: string; label: string };
type EntryItem = { type: 'entry'; id: string; entry: MoodEntry };
type ListItem = DayHeader | EntryItem;

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const ORDINAL_RE = /^(.*?\d+)(st|nd|rd|th)(.*)$/;

function DayHeaderRow({ label }: { label: string }) {
  const match = label.match(ORDINAL_RE);

  if (!match) {
    return (
      <AppText
        font="heading"
        variant="xl"
        colorVariant="primary"
        style={dhStyles.label}
        accessibilityRole="header"
      >
        {label}
      </AppText>
    );
  }

  const [, before, suffix, after] = match;
  return (
    <View
      style={dhStyles.row}
      accessible={true}
      accessibilityLabel={label}
      accessibilityRole="header"
    >
      <AppText
        font="heading"
        variant="xl"
        colorVariant="primary"
        style={dhStyles.mainText}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      >
        {before}
      </AppText>
      <AppText
        font="heading"
        colorVariant="primary"
        style={dhStyles.ordinal}
        accessibilityElementsHidden={true}
        importantForAccessibility="no"
      >
        {suffix}
      </AppText>
      {after ? (
        <AppText
          font="heading"
          variant="xl"
          colorVariant="primary"
          style={dhStyles.mainText}
          accessibilityElementsHidden={true}
          importantForAccessibility="no"
        >
          {after}
        </AppText>
      ) : null}
    </View>
  );
}

const dhStyles = StyleSheet.create((theme) => ({
  label: {
    fontWeight: '700' as const,
    paddingHorizontal: theme.spacing[5],
    paddingTop: 28,
    paddingBottom: theme.spacing[2],
  },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    paddingHorizontal: theme.spacing[5],
    paddingTop: 28,
    paddingBottom: theme.spacing[2],
  },
  mainText: {
    fontWeight: '700' as const,
  },
  ordinal: {
    fontSize: 11,
    fontWeight: '700' as const,
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
    letterSpacing: LETTER_SPACING.tight,
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
      style={({ pressed }) => [ftStyles.row, { opacity: pressed ? 0.5 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={
        notesOnly ? t('journal.filter_a11y_show_all') : t('journal.filter_a11y_with_notes')
      }
    >
      <View style={[ftStyles.dot, { backgroundColor: theme.colors.mosaicGold }]} />
      <AppText variant="sm" style={ftStyles.label}>
        {notesOnly ? t('journal.filter_show_all') : t('journal.filter_with_notes')}
      </AppText>
    </Pressable>
  );
}

const ftStyles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing[2],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: '500' as const,
    color: theme.colors.mosaicGold,
    lineHeight: 14,
  },
}));

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
      <TopFade height={insets.top + 80} />

      <View style={[styles.topBar, { top: insets.top }]}>
        <View style={styles.headerLeft}>
          <AppText font="heading" variant="2xl" colorVariant="primary" style={styles.pageTitle}>
            {t('journal.title', 'Journal')}
          </AppText>
          <DemoBadge />
        </View>
        <FilterToggle notesOnly={notesOnly} onToggle={toggleNotesOnly} />
      </View>

      <FlashList
        data={listItems}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        renderItem={renderItem}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={EmptyState}
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
  topBar: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[4],
  },
  headerLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  pageTitle: {
    fontWeight: '800' as const,
  },
}));
