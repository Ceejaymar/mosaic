import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function page() {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text style={styles.text}>page {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  text: { color: theme.colors.typography },
}));
