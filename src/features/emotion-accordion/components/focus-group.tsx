import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  useAnimatedProps,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useAppStore } from '@/src/store/useApp';

import type { EmotionGroup, EmotionNode } from '../types';
import { muteColor } from '../utils/color';
import { getGroupPalette } from '../utils/emotion-utils';
import { Emotion } from './emotion';
import { SkiaAura } from './skia-aura';

const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

type Props = {
  group: EmotionGroup;
  childrenNodes: EmotionNode[];
  isFocused: boolean;
  selectedNodeId: string | null;
  onToggle: () => void;
  onSelectNode: (nodeId: string) => void;
};

export function FocusGroup({
  group,
  childrenNodes,
  isFocused,
  selectedNodeId,
  onToggle,
  onSelectNode,
}: Props) {
  const groupPalette = getGroupPalette(group.id);
  const mutedBackground = muteColor(group.color);
  const reduceMotion = useAppStore((s) => s.accessibility.reduceMotion);
  const rm = reduceMotion ? ReduceMotion.Always : ReduceMotion.System;

  const headerAnimStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isFocused ? group.color : mutedBackground, {
      duration: 250,
      reduceMotion: rm,
    }),
    transform: [
      {
        scale: withSpring(isFocused ? 1.02 : 1, { damping: 15, stiffness: 200, reduceMotion: rm }),
      },
    ],
  }));

  const textAnimStyle = useAnimatedStyle(() => ({
    color: withTiming(isFocused ? '#000000' : '#FFFFFF', { duration: 250, reduceMotion: rm }),
    opacity: withTiming(isFocused ? 1 : 0.95, { duration: 250, reduceMotion: rm }),
  }));

  const iconAnimProps = useAnimatedProps(() => ({
    color: withTiming(isFocused ? '#000000' : '#FFFFFF', { duration: 250, reduceMotion: rm }),
    opacity: withTiming(isFocused ? 1 : 0.8, { duration: 250, reduceMotion: rm }),
  }));

  return (
    <View style={styles.container}>
      <Pressable onPress={onToggle} style={({ pressed }) => [pressed && { opacity: 0.9 }]}>
        <Animated.View style={[styles.header, headerAnimStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(0,0,0,0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <AnimatedText style={[styles.headerText, textAnimStyle]}>{group.label}</AnimatedText>

          <AnimatedIcon
            name={isFocused ? 'close' : 'chevron-down'}
            size={20}
            animatedProps={iconAnimProps}
          />
        </Animated.View>
      </Pressable>

      {isFocused && (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(400)}
          exiting={reduceMotion ? undefined : FadeOut.duration(200)}
          style={styles.gridContainer}
        >
          <SkiaAura color={group.color} />
          {childrenNodes.map((node) => {
            const rawColor = groupPalette?.[node.colorIndex] ?? group.color;
            return (
              <Emotion
                key={node.id}
                label={node.label}
                color={rawColor}
                isSelected={selectedNodeId === node.id}
                onPress={() => onSelectNode(node.id)}
              />
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerText: {
    fontSize: 19,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    letterSpacing: -0.3,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 4,
    minHeight: 300,
  },
});
