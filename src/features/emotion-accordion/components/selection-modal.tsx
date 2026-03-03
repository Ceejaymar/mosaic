import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, type StyleProp, Text, View, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';

import type { EmotionNode } from '../types';
import { getEmotionColor } from '../utils/emotion-utils';

type Props = {
  selectedNode: EmotionNode | null;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function SelectionModal({ selectedNode, onPress, style }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useAccessibleColors();

  if (!selectedNode) return null;

  const color = getEmotionColor(selectedNode) ?? '#808080';
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

          <Text style={[styles.synonyms, { color: colors.textMuted }]}>
            {selectedNode.synonyms.join(' · ')}
          </Text>

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
    borderRadius: 16,
    shadowColor: '#000',
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
    gap: 12,
    padding: 20,
  },
  container: { flex: 1 },
  value: { fontSize: 28, fontWeight: '700', fontFamily: 'Fraunces' },
  synonyms: { fontSize: 11, textTransform: 'capitalize' },
  description: {
    fontSize: 14,
    color: theme.colors.typography,
    fontWeight: '600',
    marginTop: 8,
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
