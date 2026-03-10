import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, type StyleProp, Text, View, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';

import type { EmotionNode } from '../types';
import { getEmotionColor } from '../utils/emotion-utils';

type Props = {
  selectedNode: EmotionNode | null;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function SelectionModal({ selectedNode, onPress, style }: Props) {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  if (!selectedNode) return null;

  const color = getEmotionColor(selectedNode) ?? theme.colors.lightGrey;
  const bottom = Math.max(insets.bottom, 16) + 8;

  return (
    <Animated.View
      // Faster, more aggressive spring entrance
      entering={FadeInDown.springify().mass(1.5).damping(25).stiffness(200)}
      // Rapid exit
      exiting={FadeOutDown.duration(150)}
      style={[styles.wrapper, { bottom }, style]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.pressable, pressed && { opacity: 0.82 }]}
        accessibilityRole="button"
        accessibilityLabel={`Continue with ${selectedNode.label}`}
      >
        <View style={styles.container}>
          <Text style={[styles.value, { color }]}>{selectedNode.label}</Text>

          <AppText colorVariant="muted" style={styles.synonyms}>
            {selectedNode.synonyms.join(' · ')}
          </AppText>

          {selectedNode.description && (
            <Text style={styles.description}>{selectedNode.description}</Text>
          )}
        </View>

        <View style={[styles.arrowContainer, { backgroundColor: `${color}22` }]}>
          <Ionicons name="arrow-forward" size={28} color={color} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    shadowColor: theme.colors.typography,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing[3],
    padding: theme.spacing[5],
  },
  container: { flex: 1 },
  value: { fontSize: theme.fontSize['2xl'], fontWeight: '700', fontFamily: 'Fraunces' },
  synonyms: { fontSize: theme.fontSize.xs, textTransform: 'capitalize' },
  description: {
    fontSize: 14,
    color: theme.colors.typography,
    fontWeight: '600',
    marginTop: theme.spacing[2],
    textTransform: 'lowercase',
    minHeight: 34,
  },
  arrowContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
