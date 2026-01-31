import { StyleSheet } from 'react-native-unistyles';

import { Text, View } from '@/src/components/Themed';

export default function Analytics() {
  return (
    <View style={styles.container}>
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
