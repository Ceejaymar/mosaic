import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { deleteMoodEntry, fetchMoodEntryById } from '@/src/db/repos/moodRepo';
import { invalidateMonthCache } from '@/src/features/canvas/hooks/useCanvasDbData';
export default function EditCheckInScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!id) router.replace('/');
  }, [id, router]);

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = useCallback(() => {
    Alert.alert('Remove check-in', 'This will permanently delete this mood entry.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleteError(null);
            const entry = await fetchMoodEntryById(id as string);
            await deleteMoodEntry(id as string);
            if (entry) {
              const [yearStr, monthStr] = entry.dateKey.split('-');
              invalidateMonthCache(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1);
            }
            router.replace('/');
          } catch (err) {
            console.error('Failed to delete mood entry', err);
            setDeleteError('Could not delete this check-in. Please try again.');
          }
        },
      },
    ]);
  }, [id, router]);

  if (!id) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <AppText style={styles.backText}>← Back</AppText>
      </Pressable>

      <AppText font="heading" style={styles.title}>
        Edit Check-in
      </AppText>
      <AppText font="mono" colorVariant="muted" style={styles.meta}>
        Entry {id}
      </AppText>
      <AppText colorVariant="muted" style={styles.body}>
        Edit flow coming soon.
      </AppText>

      <View style={styles.spacer} />

      {deleteError && <AppText style={styles.deleteError}>{deleteError}</AppText>}
      <Pressable
        onPress={handleDelete}
        style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
        accessibilityRole="button"
        accessibilityLabel="Delete this check-in"
      >
        <AppText style={styles.deleteBtnText}>Delete check-in</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 24 },
  backBtn: { marginBottom: 24, paddingVertical: 8 },
  backText: { fontSize: 15, fontWeight: '500', color: theme.colors.mosaicGold },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.typography,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  meta: { fontSize: 13, marginBottom: 24 },
  body: { fontSize: 15, lineHeight: 22 },
  spacer: { flex: 1 },
  deleteError: {
    fontSize: 13,
    color: theme.colors.destructive,
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.destructive,
  },
}));
