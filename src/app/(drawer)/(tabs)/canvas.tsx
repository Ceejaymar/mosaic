import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { LAYOUT } from '@/src/constants/layout';

export default function CanvasScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom },
      ]}
    >
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
