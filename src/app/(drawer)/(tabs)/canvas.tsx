import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export default function CanvasScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Canvas</Text>
      <Text style={styles.subtitle}>Your emotional landscape, visualised.</Text>
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
