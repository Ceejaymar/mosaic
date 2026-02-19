import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { EMOTION_PALETTES } from '../palettes';
import type { EmotionNode } from '../types';

type Props = {
  selectedNode: EmotionNode | null;
};

export function SelectionModal({ selectedNode }: Props) {
  if (!selectedNode) return null;

  const groupPalette =
    EMOTION_PALETTES.default[selectedNode.groupId as keyof (typeof EMOTION_PALETTES)['default']];
  const color = groupPalette[selectedNode.colorIndex];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={[styles.value, { color }]}>{selectedNode.label}</Text>
        <Text style={styles.synonyms}>{selectedNode.synonyms.join(' · ')}</Text>

        {selectedNode.description && (
          <Text style={styles.description}>{selectedNode.description}</Text>
        )}
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="arrow-forward" size={42} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    display: 'flex',
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
    textAlignVertical: 'top',
  },
  arrowContainer: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
