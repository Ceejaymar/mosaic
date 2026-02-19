import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { EMOTION_PALETTES } from '../palettes';
import type { EmotionNode } from '../types';
import { muteColor } from '../utils/color';

type Props = {
  selectedNode: EmotionNode | null;
  onPress?: () => void;
  style?: object;
};

export function SelectionModal({ selectedNode, onPress, style }: Props) {
  if (!selectedNode) return null;

  const groupPalette =
    EMOTION_PALETTES.default[selectedNode.groupId as keyof (typeof EMOTION_PALETTES)['default']];
  const rawColor = groupPalette?.[selectedNode.colorIndex] ?? '#808080';
  const color = muteColor(rawColor);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.wrapper, style, pressed && !!onPress && { opacity: 0.82 }]}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={onPress ? `Continue with ${selectedNode.label}` : undefined}
    >
      <View style={styles.container}>
        <Text style={[styles.value, { color }]}>{selectedNode.label}</Text>
        <Text style={styles.synonyms}>{selectedNode.synonyms.join(' · ')}</Text>

        {selectedNode.description && (
          <Text style={styles.description}>{selectedNode.description}</Text>
        )}
      </View>
      <View style={[styles.arrowContainer, onPress && { backgroundColor: `${color}22` }]}>
        <Ionicons name="arrow-forward" size={onPress ? 28 : 42} color={color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    bottom: 100,
    left: 20,
    right: 20,
    padding: 20,
    backgroundColor: '#0e0e0e',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  container: {
    flex: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Fraunces',
  },
  synonyms: {
    fontSize: 11,
    color: '#999',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#ccc',
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
});
