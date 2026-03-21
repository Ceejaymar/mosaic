import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { ROADMAP_DATA } from '@/src/constants/roadmap-data';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { storage } from '@/src/services/storage/mmkv';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Pastel Palette ───────────────────────────────────────────────────────────

const ROADMAP_PASTELS = [
  '#E1F5FE', // Light Blue
  '#F3E5F5', // Light Purple
  '#E8F5E9', // Light Green
  '#FFFDE7', // Light Yellow
  '#FFF3E0', // Light Orange
  '#FFEBEE', // Light Pink
];

const ROADMAP_PASTEL_ICONS = [
  '#0277BD', // Deep Blue
  '#6A1B9A', // Deep Purple
  '#2E7D32', // Deep Green
  '#F57F17', // Deep Amber
  '#E65100', // Deep Orange
  '#B71C1C', // Deep Red
];

// ─── Card ─────────────────────────────────────────────────────────────────────

type RoadmapItem = (typeof ROADMAP_DATA.comingSoon)[0] | (typeof ROADMAP_DATA.future)[0];

function RoadmapCard({
  item,
  bgColor,
  iconColor,
}: {
  item: RoadmapItem;
  bgColor: string;
  iconColor: string;
}) {
  const { theme } = useUnistyles();
  const posthog = usePostHog();

  const storageKey = `upvoted_feature_${item.id}`;
  const [isUpvoted, setIsUpvoted] = useState(() => storage.getBoolean(storageKey) || false);

  // Animation value
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleToggleUpvote = () => {
    hapticLight();
    const newState = !isUpvoted;
    setIsUpvoted(newState);
    storage.set(storageKey, newState);

    // Trigger a fast, immediate pulse — pure timing, no physics tail
    scale.value = withSequence(
      withTiming(0.85, { duration: 60 }),
      withTiming(1, { duration: 100 }),
    );

    // Format the feature name for PostHog (e.g., "Cloud Sync" -> "cloud_sync")
    const formattedName = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    if (newState) {
      posthog.capture(`upvoted_${formattedName}`, {
        feature_id: item.id,
        feature_name: item.title,
      });
    } else {
      posthog.capture(`removed_upvote_${formattedName}`, {
        feature_id: item.id,
        feature_name: item.title,
      });
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.imagePlaceholder, { backgroundColor: bgColor }]}>
        <Ionicons name={item.icon} size={34} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <AppText font="heading" style={[styles.cardTitle, { color: theme.colors.typography }]}>
          {item.title}
        </AppText>
        <AppText colorVariant="muted" style={styles.cardDesc}>
          {item.description}
        </AppText>
      </View>

      {/* Floating Animated Badge */}
      <AnimatedPressable
        onPress={handleToggleUpvote}
        hitSlop={16}
        style={[
          styles.upvoteBadge,
          {
            backgroundColor: isUpvoted ? iconColor : 'rgba(150, 150, 150, 0.9)',
          },
          !isUpvoted && { shadowOpacity: 0, elevation: 0 },
          animatedStyle,
        ]}
      >
        {isUpvoted ? (
          <Text style={{ fontSize: 16 }}>👍</Text>
        ) : (
          <Ionicons name="thumbs-up-outline" size={16} color="#000000" />
        )}
      </AnimatedPressable>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RoadmapScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const handleBackToDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ─── Header ─── */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={handleBackToDrawer} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.typography} />
          </Pressable>
          <Pressable onPress={() => router.navigate('/(tabs)/' as Href)} style={styles.iconBtn}>
            <Ionicons name="home-outline" size={24} color={theme.colors.typography} />
          </Pressable>
        </View>
        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          The path ahead
        </AppText>
        <AppText colorVariant="muted" style={styles.subtitle}>
          Tap 👍 on any feature to let us know what you'd like to see sooner.
        </AppText>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <AppText colorVariant="muted" style={styles.sectionLabel}>
          Coming soon
        </AppText>
        {ROADMAP_DATA.comingSoon.map((item, index) => (
          <RoadmapCard
            key={item.id}
            item={item}
            bgColor={ROADMAP_PASTELS[index % ROADMAP_PASTELS.length]}
            iconColor={ROADMAP_PASTEL_ICONS[index % ROADMAP_PASTEL_ICONS.length]}
          />
        ))}

        <View style={styles.spacer} />

        <AppText colorVariant="muted" style={styles.sectionLabel}>
          Down the road
        </AppText>
        {ROADMAP_DATA.future.map((item, index) => (
          <RoadmapCard
            key={item.id}
            item={item}
            bgColor={
              ROADMAP_PASTELS[(ROADMAP_DATA.comingSoon.length + index) % ROADMAP_PASTELS.length]
            }
            iconColor={
              ROADMAP_PASTEL_ICONS[
                (ROADMAP_DATA.comingSoon.length + index) % ROADMAP_PASTEL_ICONS.length
              ]
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1 },
  header: { paddingHorizontal: theme.spacing[4], paddingBottom: theme.spacing[3] },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  iconBtn: { padding: 8, marginLeft: -8 },
  title: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  content: { paddingHorizontal: theme.spacing[4], paddingTop: 8 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginLeft: 4,
  },
  spacer: { height: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.card,
    padding: 16,
    marginBottom: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: { flex: 1, marginLeft: 16 },
  cardTitle: { fontSize: 18, marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 6 },
  upvoteBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
}));
