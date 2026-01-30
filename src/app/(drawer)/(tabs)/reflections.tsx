import { StyleSheet } from 'react-native-unistyles';

import NativeHeader from '@/src/components/native-header';
import { Text, View } from '@/src/components/Themed';

export default function Analytics() {
  return (
    <View style={styles.container}>
      <NativeHeader />
      <Text style={styles.title}>Reflections</Text>
    </View>
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
