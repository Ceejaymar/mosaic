import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { formatDate } from '@/src/utils/format-date';
import { ThemedText } from './themed-text';

export default function CurrentDate() {
  return (
    <View style={styles.container}>
      <ThemedText variant="subtitle">{formatDate(new Date())}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
}));
