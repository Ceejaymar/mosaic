import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useNavigation } from 'expo-router';
import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { LAYOUT } from '@/src/constants/layout';
import { fetchMoodEntriesPage, type MoodEntry } from '@/src/db/repos/moodRepo';
import { parseStoredTags } from '@/src/features/check-in/utils/parse-tags';
import { getMoodDisplayInfo } from '@/src/features/emotion-accordion/utils/mood-display';
import { formatDayLabel, formatEntryTime } from '@/src/utils/format-date';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 30;
const NAV_BAR_HEIGHT = 44;

// ─── Types ────────────────────────────────────────────────────────────────────

type DayHeader = { type: 'header'; id: string; label: string };
type EntryItem = { type: 'entry'; id: string; entry: MoodEntry };
type ListItem = DayHeader | EntryItem;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Appends a 2-digit hex alpha to a #RRGGBB color string. */
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
  return <Text style={dhStyles.label}>{label}</Text>;
}

const dhStyles = StyleSheet.create((theme) => ({
  label: {
    fontSize: 22,
    fontFamily: 'Fraunces',
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    color: theme.colors.typography,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
}));

// ─── EntryCard ────────────────────────────────────────────────────────────────

type EntryCardProps = {
  entry: MoodEntry;
  onPress: (id: string) => void;
};

const EntryCard = memo(function EntryCard({ entry, onPress }: EntryCardProps) {
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const info = getMoodDisplayInfo(entry.primaryMood);
  const accentColor = info?.color ?? theme.colors.mosaicGold;
  const label = info?.label ?? entry.primaryMood;
  const tags = parseStoredTags(entry.tags);

  const handlePress = useCallback(() => onPress(entry.id), [entry.id, onPress]);

  // Gradient: subtle emotion-color wash from top-left to transparent
  const gradientColors = [hexAlpha(accentColor, 0.1), hexAlpha(accentColor, 0)] as const;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        cardStyles.card,
        {
          backgroundColor: theme.colors.tileBackground,
          shadowColor: theme.colors.tileShadowColor,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      {/* Emotion-tinted gradient overlay, borderRadius matches card */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
      />

      <View style={cardStyles.body}>
        {/* Emotion headline */}
        <View style={cardStyles.headlineRow}>
          <Text style={[cardStyles.iAmFeeling, { color: theme.colors.textMuted }]}>
            {t('journal.im_feeling')}
          </Text>
          <Text style={[cardStyles.emotion, { color: accentColor }]}>{label}</Text>
        </View>

        {/* Note — visual priority */}
        {entry.note ? (
          <Text
            style={[cardStyles.note, { color: theme.colors.typography }]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {entry.note}
          </Text>
        ) : null}

        {/* Tags */}
        {tags.length > 0 && (
          <View style={cardStyles.tagRow}>
            {tags.map((tag) => (
              <View key={tag} style={[cardStyles.tag, { borderColor: theme.colors.divider }]}>
                <Text style={[cardStyles.tagText, { color: theme.colors.textMuted }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Time at bottom */}
        <Text style={[cardStyles.time, { color: theme.colors.textMuted }]}>
          {formatEntryTime(entry.occurredAt)}
        </Text>
      </View>
    </Pressable>
  );
});

const cardStyles = StyleSheet.create((_theme) => ({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 3,
  },
  body: {
    padding: 20,
    gap: 8,
  },
  headlineRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'baseline' as const,
  },
  iAmFeeling: {
    fontSize: 14,
    fontFamily: 'Fraunces',
    fontStyle: 'italic' as const,
  },
  emotion: {
    fontSize: 14,
    fontFamily: 'Fraunces',
    fontWeight: '700' as const,
  },
  note: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: 'Fraunces',
    fontWeight: '400' as const,
    letterSpacing: -0.2,
  },
  tagRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 6,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  time: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    marginTop: 2,
  },
}));

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  const { t } = useTranslation();
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.title}>{t('journal.empty_title')}</Text>
      <Text style={emptyStyles.subtitle}>{t('journal.empty_subtitle')}</Text>
    </View>
  );
}

const emptyStyles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: 80,
    alignItems: 'center' as const,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Fraunces',
    fontWeight: '600' as const,
    color: theme.colors.typography,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
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
      style={({ pressed }) => ({ marginRight: 16, opacity: pressed ? 0.4 : 1 })}
      accessibilityRole="button"
      accessibilityLabel={
        notesOnly ? t('journal.filter_a11y_show_all') : t('journal.filter_a11y_with_notes')
      }
    >
      <Text style={{ fontSize: 15, fontWeight: '500', color: theme.colors.mosaicGold }}>
        {notesOnly ? t('journal.filter_with_notes') : t('journal.filter_show_all')}
      </Text>
    </Pressable>
  );
}

// ─── List utils ───────────────────────────────────────────────────────────────

const getItemType = (item: ListItem) => item.type;
const keyExtractor = (item: ListItem) => item.id;

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Journal() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { t } = useTranslation();

  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [notesOnly, setNotesOnly] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);

  const toggleNotesOnly = useCallback(() => setNotesOnly((v) => !v), []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <FilterToggle notesOnly={notesOnly} onToggle={toggleNotesOnly} />,
    });
  }, [navigation, notesOnly, toggleNotesOnly]);

  // Full reset + first page — called on focus and for retry
  const refreshEntries = useCallback(async () => {
    isLoadingRef.current = false;
    hasMoreRef.current = true;
    offsetRef.current = 0;
    setEntries([]);
    setError(null);
    setIsLoading(true);
    isLoadingRef.current = true;
    try {
      const page = await fetchMoodEntriesPage(0, PAGE_SIZE);
      if (page.length < PAGE_SIZE) hasMoreRef.current = false;
      offsetRef.current = page.length;
      setEntries(page);
    } catch {
      setError('Could not load entries');
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // Pagination — appends the next page; errors are silent (list already visible)
  const loadNextPage = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;
    isLoadingRef.current = true;
    try {
      const page = await fetchMoodEntriesPage(offsetRef.current, PAGE_SIZE);
      if (page.length < PAGE_SIZE) hasMoreRef.current = false;
      offsetRef.current += page.length;
      setEntries((prev) => [...prev, ...page]);
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  // Refresh whenever the screen comes into focus (picks up new check-ins)
  useFocusEffect(
    useCallback(() => {
      refreshEntries();
    }, [refreshEntries]),
  );

  const listItems = useMemo(() => buildListItems(entries, notesOnly), [entries, notesOnly]);

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

  const paddingTop = insets.top + NAV_BAR_HEIGHT;
  const paddingBottom = LAYOUT.TAB_BAR_HEIGHT + insets.bottom + 16;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.mosaicGold} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.errorText, { color: theme.colors.textMuted }]}>
          {t('journal.error_message')}
        </Text>
        <Pressable
          onPress={refreshEntries}
          style={({ pressed }) => [styles.retryBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={{ color: theme.colors.mosaicGold, fontWeight: '600', fontSize: 15 }}>
            {t('journal.error_retry')}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={listItems}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        renderItem={renderItem}
        onEndReached={loadNextPage}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={{ paddingTop, paddingBottom }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  errorText: {
    fontSize: 15,
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
}));
