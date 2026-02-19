import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
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
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.header,
          { backgroundColor: group.color },
          pressed && { opacity: 0.88 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={group.label}
      >
        <Text style={styles.headerText}>{group.label}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="rgba(255,255,255,0.85)"
        />
      </Pressable>

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

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Fraunces',
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 14,
    paddingTop: 12,
  },
});
