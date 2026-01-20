import { Text, View } from 'react-native';
import { EmotionWheel } from '@/src/features/emotion-wheel/components/emotion-wheel';

export default function WheelScreen() {
  try {
    return <EmotionWheel />;
  } catch (e) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Wheel failed to render.</Text>
        <Text>{String(e)}</Text>
      </View>
    );
  }
}
