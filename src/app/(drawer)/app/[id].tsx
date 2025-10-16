import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function page() {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text style={styles.text}>page {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { color: '#dde3fe' },
});
