import { StyleSheet } from 'react-native-unistyles';

import { View } from '@/src/components/Themed';
import { EmotionSelector } from '@/src/features/emotion-accordion/components/emotion-selector';

export default function EmotionsScreen() {
  return (
    <View style={styles.container}>
      <EmotionSelector />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
