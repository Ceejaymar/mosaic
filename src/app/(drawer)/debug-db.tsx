import { useCallback, useMemo, useState } from 'react';
import { Alert, Button, FlatList, Pressable, Text, View } from 'react-native';

import type { MoodEntry } from '@/src/db/repos/moodRepo';
import {
  clearAllMoodEntries,
  deleteMoodEntry,
  fetchMoodEntriesForDate,
  insertTestMoodEntry,
} from '@/src/db/repos/moodRepo';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(iso: string) {
  // Cheap/OK for debug UI
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function DebugDbScreen() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [rows, setRows] = useState<MoodEntry[]>([]);
  const dateKey = useMemo(() => todayKey(), []);

  const fetchRows = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await fetchMoodEntriesForDate(dateKey, 200);
      setRows(result);
      setStatus('success');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, [dateKey]);

  const seedOne = useCallback(async () => {
    setStatus('loading');
    try {
      await insertTestMoodEntry();
      await fetchRows();
      setStatus('success');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, [fetchRows]);

  const seedMany = useCallback(async () => {
    setStatus('loading');
    try {
      // add a few entries with different moods/times for testing
      const base = new Date();
      const moods = ['happy', 'calm', 'anxious', 'tired'] as const;

      for (let i = 0; i < moods.length; i++) {
        const d = new Date(base);
        d.setMinutes(base.getMinutes() - i * 30);

        const iso = d.toISOString();
        await insertTestMoodEntry({
          primaryMood: moods[i],
          note: `seed ${i + 1}`,
          occurredAt: iso,
          dateKey: iso.slice(0, 10),
          createdAt: iso,
          updatedAt: iso,
        });
      }

      await fetchRows();
      setStatus('success');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }, [fetchRows]);

  const onDelete = useCallback(
    (id: string) => {
      Alert.alert('Delete entry?', 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setStatus('loading');
              await deleteMoodEntry(id);
              // Optimistic update
              setRows((prev) => prev.filter((r) => r.id !== id));
              setStatus('success');
            } catch (e) {
              console.error(e);
              setStatus('error');
              // re-fetch in case state got out of sync
              await fetchRows();
            }
          },
        },
      ]);
    },
    [fetchRows],
  );

  const onClearAll = useCallback(() => {
    Alert.alert('Clear all entries?', 'This deletes all rows in mood_entries.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            setStatus('loading');
            await clearAllMoodEntries();
            setRows([]);
            setStatus('success');
          } catch (e) {
            console.error(e);
            setStatus('error');
          }
        },
      },
    ]);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: MoodEntry }) => (
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderWidth: 1,
          borderRadius: 12,
          gap: 6,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
          <Text style={{ fontWeight: '700' }}>
            {formatTime(item.occurredAt)} • {item.primaryMood}
          </Text>

          <Pressable onPress={() => onDelete(item.id)} hitSlop={10}>
            <Text style={{ fontWeight: '700' }}>Delete</Text>
          </Pressable>
        </View>

        {!!item.note && <Text>{item.note}</Text>}

        <Text style={{ opacity: 0.6, fontSize: 12 }} numberOfLines={1}>
          {item.id}
        </Text>
      </View>
    ),
    [onDelete],
  );

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontWeight: '800', fontSize: 18 }}>DB Debug</Text>
      <Text style={{ opacity: 0.7 }}>
        status: {status} • dateKey: {dateKey} • rows: {rows.length}
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Button title="Fetch" onPress={fetchRows} />
        <Button title="Insert 1" onPress={seedOne} />
        <Button title="Seed 4" onPress={seedMany} />
        <Button title="Clear All" onPress={onClearAll} />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ gap: 10, paddingTop: 8, paddingBottom: 24 }}
        ListEmptyComponent={<Text style={{ opacity: 0.7 }}>No entries yet.</Text>}
      />
    </View>
  );
}
