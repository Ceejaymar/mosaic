import { useRef } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { EMOTIONS_CONTENT } from '../content';
import type { EmotionGroupId, EmotionNode } from '../types';
import { getEmotionNode } from '../utils/emotion-utils';
import { FocusGroup } from './focus-group';
import SelectionModal from './selection-modal';

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
  onToggleGroup: (groupId: EmotionGroupId | null) => void;
  onSelectionPress: () => void;
  scrollPaddingBottom?: number;
};

export function EmotionSelector({
  selectedNodeId,
  activeGroupId,
  onSelectNode,
  onToggleGroup,
  onSelectionPress,
  scrollPaddingBottom = 180,
}: Props) {
  const selectedNode = getEmotionNode(selectedNodeId);
  const scrollRef = useRef<ScrollView>(null);

  const handleToggle = (groupId: EmotionGroupId, isOpening: boolean) => {
    onToggleGroup(isOpening ? groupId : null);

    if (isOpening) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {EMOTIONS_CONTENT.groups.map((group) => {
          const isFocused = activeGroupId === group.id;
          const isOtherFocused = activeGroupId !== null && activeGroupId !== group.id;

          if (isOtherFocused) return null;

          return (
            <Animated.View
              key={group.id}
              // MAGIC UX: Tuned physics for a faster, tighter, strictly-damped slide
              layout={LinearTransition.springify().mass(0.8).damping(28).stiffness(250)}
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(150)}
              style={styles.groupWrapper}
            >
              <FocusGroup
                group={group}
                childrenNodes={nodesByGroup[group.id] || []}
                isFocused={isFocused}
                selectedNodeId={selectedNodeId}
                onToggle={() => handleToggle(group.id as EmotionGroupId, !isFocused)}
                onSelectNode={onSelectNode}
              />
            </Animated.View>
          );
        })}
      </ScrollView>

      {selectedNode && <SelectionModal selectedNode={selectedNode} onPress={onSelectionPress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4 },
  groupWrapper: { width: '100%' },
});
