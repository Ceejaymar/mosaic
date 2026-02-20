import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function InsightsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights</Text>
      <Text style={styles.subtitle}>Patterns and trends from your check-ins.</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 15, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 22 },
}));
