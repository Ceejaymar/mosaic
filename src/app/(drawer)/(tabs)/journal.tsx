import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Text } from '@/src/components/Themed';

export default function Journal() {
  return (
    <View style={styles.container}>
      <Text>Journal</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    textAlign: 'center',
  },
}));
