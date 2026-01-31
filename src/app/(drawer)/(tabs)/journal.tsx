import { StyleSheet } from 'react-native-unistyles';

import { Text, View } from '@/src/components/Themed';

export default function Journal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journal</Text>
    </View>
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
