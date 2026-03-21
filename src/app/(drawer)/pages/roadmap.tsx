import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { ROADMAP_DATA } from '@/src/constants/roadmap-data';

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
}));
