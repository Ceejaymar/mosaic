import { ScrollView, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function ThemePreview() {
  return (
    <ScrollView style={styles.container}>
      <View>
        <Text>ThemePreview </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: 'red',
  },
}));
