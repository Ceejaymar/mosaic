import { TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text, View } from '@/src/components/Themed';
import type { FeelingGroup, FeelingNode } from '../types';
import { Emotion } from './emotion';

type Props = {
  group: FeelingGroup;
  childrenNodes: FeelingNode[];
  isOpen: boolean;
  selectedNodeId: string | null;
  onToggle: () => void;
  onSelectNode: (nodeId: string) => void;
};

export function AccordionGroup({
  group,
  childrenNodes,
  isOpen,
  selectedNodeId,
  onToggle,
  onSelectNode,
}: Props) {
  const isCoreSelected = selectedNodeId === group.id;

  return (
    <View style={styles.container}>
      {/* 1. The Header (Core Emotion) */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onToggle}
        style={[
          styles.header,
          {
            backgroundColor: group.color,
            borderWidth: isCoreSelected ? 4 : 0,
            borderColor: 'rgba(255,255,255,0.8)',
          },
        ]}
      >
        <Text style={styles.headerText}>{group.label}</Text>
        <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* 2. The Dropdown List */}
      {isOpen && (
        <View style={styles.listContainer}>
          {childrenNodes.map((node) => (
            <Emotion
              key={node.id}
              label={node.label}
              baseColor={group.color}
              isSelected={selectedNodeId === node.id}
              onPress={() => onSelectNode(node.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  chevron: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
});
