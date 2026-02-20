import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { EMOTION_PALETTES } from '../palettes';
import type { EmotionGroup, EmotionNode } from '../types';
import { muteColor } from '../utils/color';
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
  const mutedGroupColor = muteColor(group.color);

  const isCoreSelected = selectedNodeId === group.id;

  return (
    <View
      style={[styles.container, isCoreSelected && { borderWidth: 2, borderColor: mutedGroupColor }]}
    >
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.header,
          { backgroundColor: mutedGroupColor },
          pressed && { opacity: 0.88 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen, selected: isCoreSelected }}
        accessibilityLabel={group.label}
      >
        {/* Noise/depth gradient overlay */}
        <LinearGradient
          colors={['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.18)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientFill}
          pointerEvents="none"
        />
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
            const rawColor = groupPalette?.[node.colorIndex] ?? group.color;
            return (
              <Emotion
                key={node.id}
                label={node.label}
                color={muteColor(rawColor)}
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
    overflow: 'hidden',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Fraunces',
  },
  gradientFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 14,
    paddingTop: 12,
  },
});
