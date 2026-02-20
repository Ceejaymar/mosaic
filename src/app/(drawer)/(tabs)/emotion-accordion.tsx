import { useCallback, useState } from 'react';
import { LayoutAnimation } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { ThemedView } from '@/src/components/themed-view';
import { EmotionSelector } from '@/src/features/emotion-accordion/components/emotion-selector';
import type { EmotionGroupId } from '@/src/features/emotion-accordion/types';

export default function EmotionsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<EmotionGroupId | null>(null);

  const handleToggleGroup = useCallback(
    (groupId: EmotionGroupId) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const isOpening = activeGroupId !== groupId;
      if (isOpening) setSelectedNodeId(groupId);
      setActiveGroupId(isOpening ? groupId : null);
    },
    [activeGroupId],
  );

  return (
    <ThemedView variant="background" style={[styles.container, { paddingTop: insets.top }]}>
      <EmotionSelector
        selectedNodeId={selectedNodeId}
        activeGroupId={activeGroupId}
        onSelectNode={setSelectedNodeId}
        onToggleGroup={handleToggleGroup}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
