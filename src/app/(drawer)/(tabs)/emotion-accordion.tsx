import { StyleSheet } from 'react-native-unistyles';

import { ThemedView } from '@/src/components/themed-view';
import { EmotionSelector } from '@/src/features/emotion-accordion/components/emotion-selector';

export default function EmotionsScreen() {
  return (
    <ThemedView variant="background" style={styles.container}>
      <EmotionSelector />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
