import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';

export default function Journal() {
  return (
    <ThemedView variant="background" style={styles.container}>
      <ThemedText style={styles.title}>Journal</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    textAlign: 'center',
  },
}));
