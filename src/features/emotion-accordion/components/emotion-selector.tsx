import { useMemo, useState } from 'react';
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { FEELINGS_CONTENT } from '../emotions.content';
import type { FeelingGroupId, FeelingNode } from '../types';
import { AccordionGroup } from './accordion-group';
import { SelectionModal } from './selection-modal';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function EmotionSelector() {
  const [activeGroupId, setActiveGroupId] = useState<FeelingGroupId | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 1. Get Selected Node Object
  const selectedNode = useMemo(
    () => FEELINGS_CONTENT.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [selectedNodeId],
  );

  // 2. Group Data
  const nodesByGroup = useMemo(() => {
    const map: Record<string, FeelingNode[]> = {};
    FEELINGS_CONTENT.nodes.forEach((node) => {
      // Filter out headers (Level 0), keep children
      if (node.level > 0) {
        if (!map[node.groupId]) map[node.groupId] = [];
        map[node.groupId].push(node);
      }
    });
    return map;
  }, []);

  // 3. Handlers
  const handleToggleGroup = (groupId: FeelingGroupId) => {
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>How are you feeling?</Text>

        {FEELINGS_CONTENT.groups.map((group) => (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 50,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
  },
});
