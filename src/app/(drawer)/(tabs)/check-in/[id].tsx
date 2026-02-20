import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

export default function EditCheckInScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: 24 },
  backBtn: { marginBottom: 24 },
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
}));
