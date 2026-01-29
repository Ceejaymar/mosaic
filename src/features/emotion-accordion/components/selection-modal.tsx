import { StyleSheet, Text, View } from 'react-native';

import { CORE_COLORS } from '../emotion-core-colors';
import type { FeelingNode } from '../types';

type Props = {
  selectedNode: FeelingNode | null;
};

export function SelectionModal({ selectedNode }: Props) {
  if (!selectedNode) return null;

  const color = CORE_COLORS[selectedNode.groupId];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Text style={styles.label}>Selected Emotion</Text>
        <Text style={[styles.value, { color }]}>{selectedNode.label}</Text>
        {selectedNode.description && (
          <Text style={styles.description}>{selectedNode.description}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#665',
    textAlign: 'center',
  },
});
