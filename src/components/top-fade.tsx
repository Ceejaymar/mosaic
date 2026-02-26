import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUnistyles } from 'react-native-unistyles';

export function TopFade({ height }: { height?: number }) {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const fadeHeight = height ?? insets.top + 90;

  return (
    <View style={[styles.topFade, { height: fadeHeight }]} pointerEvents="none">
      <LinearGradient
        colors={[theme.colors.background, theme.colors.background, 'transparent']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
});
