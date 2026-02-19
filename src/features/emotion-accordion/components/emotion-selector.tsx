import { useMemo, useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, UIManager } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedView } from '@/src/components/themed-view';
import { EMOTIONS_CONTENT } from '../content';
import type { EmotionGroupId, EmotionNode } from '../types';
import { AccordionGroup } from './accordion-group';
import { SelectionModal } from './selection-modal';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function EmotionSelector() {
  const [activeGroupId, setActiveGroupId] = useState<EmotionGroupId | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 1. Get Selected Node Object
  const selectedNode = useMemo(
    () => EMOTIONS_CONTENT.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [selectedNodeId],
  );

  // 2. Group Data
  const nodesByGroup = useMemo(() => {
    const map: Record<string, EmotionNode[]> = {};
    EMOTIONS_CONTENT.nodes.forEach((node) => {
      // Filter out headers (Level 0), keep children
      if (node.level > 0) {
        if (!map[node.groupId]) map[node.groupId] = [];
        map[node.groupId].push(node);
      }
    });
    return map;
  }, []);

  // 3. Handlers
  const handleToggleGroup = (groupId: EmotionGroupId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeGroupId === groupId) {
      setActiveGroupId(null);
    } else {
      setActiveGroupId(groupId);
      setSelectedNodeId(groupId); // Auto-select core emotion
    }
  };

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  return (
    <ThemedView variant="background" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {EMOTIONS_CONTENT.groups.map((group) => (
          <AccordionGroup
            key={group.id}
            group={group}
            childrenNodes={nodesByGroup[group.id] || []}
            isOpen={activeGroupId === group.id}
            selectedNodeId={selectedNodeId}
            onToggle={() => handleToggleGroup(group.id)}
            onSelectNode={handleSelectNode}
          />
        ))}
      </ScrollView>

      <SelectionModal selectedNode={selectedNode} />
    </ThemedView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    paddingTop: 120,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.typography,
    marginBottom: 20,
  },
}));
