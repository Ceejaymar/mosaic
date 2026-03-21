import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import {
  deleteMoodEntry,
  fetchMoodEntryById,
  type MoodEntry,
  updateMoodEntry,
} from '@/src/db/repos/moodRepo';
import { invalidateMonthCache } from '@/src/features/canvas/hooks/useCanvasDbData';
import { CheckInFormUI } from '@/src/features/check-in/components/check-in-form-ui';

export default function EditCheckInScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();

  const [entry, setEntry] = useState<MoodEntry | null>(null);

  useEffect(() => {
    if (!id) {
      router.replace('/');
      return;
    }
    let cancelled = false;
    fetchMoodEntryById(id)
      .then((result) => {
        if (cancelled) return;
        if (!result) router.replace('/');
        else setEntry(result);
      })
      .catch(() => {
        if (!cancelled) router.replace('/');
      });
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  const handleSave = useCallback(
    async (nodeId: string, note?: string, tags?: string[]) => {
      if (!id) return;
      try {
        await updateMoodEntry(id, {
          primaryMood: nodeId,
          note: note ?? null,
          tags: tags && tags.length > 0 ? JSON.stringify(tags) : null,
        });
        posthog.capture('check_in_updated', {
          mood: nodeId,
          has_note: !!note,
          tag_count: tags?.length ?? 0,
          date_key: entry?.dateKey ?? null,
        });
        if (entry) {
          const [yearStr, monthStr] = entry.dateKey.split('-');
          invalidateMonthCache(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1);
        }
        router.back();
      } catch (err) {
        console.error('Failed to update mood entry', err);
        Alert.alert('Error', 'Could not save changes. Please try again.');
      }
    },
    [id, entry, posthog, router],
  );

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleDelete = useCallback(() => {
    Alert.alert('Remove check-in', 'This will permanently delete this mood entry.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMoodEntry(id as string);
            posthog.capture('check_in_deleted', {
              mood: entry?.primaryMood ?? null,
              date_key: entry?.dateKey ?? null,
            });
            if (entry) {
              const [yearStr, monthStr] = entry.dateKey.split('-');
              invalidateMonthCache(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1);
            }
            router.replace('/');
          } catch (err) {
            console.error('Failed to delete mood entry', err);
            Alert.alert('Error', 'Could not delete this check-in. Please try again.');
          }
        },
      },
    ]);
  }, [id, entry, posthog, router]);

  if (!id) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {entry && (
        <CheckInFormUI
          initialData={{ existingEntry: entry, targetDate: entry.dateKey }}
          onSave={handleSave}
          onClose={handleClose}
          showDelete
          onDelete={handleDelete}
          onBack={() => router.back()}
          onHome={() => router.replace('/')}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
}));
