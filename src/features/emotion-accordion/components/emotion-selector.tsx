import type { StyleProp, ViewStyle } from 'react-native';
import { Platform, ScrollView, UIManager, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { EMOTIONS_CONTENT } from '../content';
import type { EmotionGroupId, EmotionNode } from '../types';
import { getEmotionNode } from '../utils/emotion-utils';
import { AccordionGroup } from './accordion-group';
import { SelectionModal } from './selection-modal';

// One-time Android layout animation setup
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Static — derived from immutable content, never changes at runtime
const nodesByGroup = EMOTIONS_CONTENT.nodes.reduce<Record<string, EmotionNode[]>>((acc, node) => {
  if (node.level === 0) return acc;
  if (!acc[node.groupId]) acc[node.groupId] = [];
  acc[node.groupId].push(node);
  return acc;
}, {});

type Props = {
  selectedNodeId: string | null;
  activeGroupId: EmotionGroupId | null;
  onSelectNode: (nodeId: string) => void;
  onToggleGroup: (groupId: EmotionGroupId) => void;
  onSelectionPress?: () => void;
  selectionModalStyle?: StyleProp<ViewStyle>;
  scrollPaddingBottom?: number;
};

export function EmotionSelector({
  selectedNodeId,
  activeGroupId,
  onSelectNode,
  onToggleGroup,
  onSelectionPress,
  selectionModalStyle,
  scrollPaddingBottom = 180,
}: Props) {
  const selectedNode = getEmotionNode(selectedNodeId);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {EMOTIONS_CONTENT.groups.map((group) => (
          <AccordionGroup
            key={group.id}
            group={group}
            childrenNodes={nodesByGroup[group.id] || []}
            isOpen={activeGroupId === group.id}
            selectedNodeId={selectedNodeId}
            onToggle={() => onToggleGroup(group.id)}
            onSelectNode={onSelectNode}
          />
        ))}
      </ScrollView>

      <SelectionModal
        selectedNode={selectedNode}
        onPress={onSelectionPress}
        style={selectionModalStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
});
