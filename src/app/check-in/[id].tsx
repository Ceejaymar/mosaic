import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { deleteMoodEntry } from '@/src/db/repos/moodRepo';

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
            await deleteMoodEntry(id as string);
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
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Edit Check-in</Text>
      <Text style={styles.meta}>Entry {id}</Text>
      <Text style={styles.body}>Edit flow coming soon.</Text>

      <View style={styles.spacer} />

      {deleteError && <Text style={styles.deleteError}>{deleteError}</Text>}
      <Pressable
        onPress={handleDelete}
        style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
        accessibilityRole="button"
        accessibilityLabel="Delete this check-in"
      >
        <Text style={styles.deleteBtnText}>Delete check-in</Text>
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
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  meta: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 24 },
  body: { fontSize: 15, color: theme.colors.textMuted, lineHeight: 22 },
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
