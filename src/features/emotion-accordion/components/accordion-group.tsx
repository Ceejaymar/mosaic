import { TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedText } from '@/src/components/themed-text';
import { EMOTION_PALETTES } from '../palettes';
import type { EmotionGroup, EmotionNode } from '../types';
import { Emotion } from './emotion';

type Props = {
  group: EmotionGroup;
  childrenNodes: EmotionNode[];
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
  const groupPalette =
    EMOTION_PALETTES.default[group.id as keyof (typeof EMOTION_PALETTES)['default']];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onToggle}
        style={[
          styles.header,
          {
            backgroundColor: group.color,
          },
        ]}
      >
        <ThemedText style={styles.headerText}>{group.label}</ThemedText>
        <ThemedText style={styles.chevron}>{isOpen ? '▲' : '▼'}</ThemedText>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.listContainer}>
          {childrenNodes.map((node) => {
            const color = groupPalette[node.colorIndex];

            return (
              <Emotion
                key={node.id}
                label={node.label}
                color={color}
                isSelected={selectedNodeId === node.id}
                onPress={() => onSelectNode(node.id)}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
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
    fontFamily: 'Fraunces',
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
}));
