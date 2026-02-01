import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';

export default function Analytics() {
  return (
    <ThemedView variant="background" style={styles.container}>
      <ThemedText style={styles.title}>Reflections</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.typography,
  },
}));
