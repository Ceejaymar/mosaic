import { StyleSheet } from 'react-native-unistyles';

import NativeHeader from '@/src/components/native-header';
import { View } from '@/src/components/Themed';
import { EmotionSelector } from '@/src/features/emotion-accordion/components/emotion-selector';

export default function EmotionsScreen() {
  return (
    <View style={styles.container}>
      <NativeHeader />
      <EmotionSelector />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
