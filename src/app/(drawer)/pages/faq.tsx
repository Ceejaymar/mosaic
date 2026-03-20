import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerActions } from '@react-navigation/native';
import { type Href, useNavigation, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { FAQ_DATA } from '@/src/constants/faq-data';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { useAppStore } from '@/src/store/useApp';

// ─── Accordion Item ───────────────────────────────────────────────────────────

function FaqItem({ item, isLast }: { item: (typeof FAQ_DATA)[0]; isLast: boolean }) {
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();
  const reduceMotion = useAppStore((s) => s.accessibility.reduceMotion);
  const [expanded, setExpanded] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const nextState = !expanded;
    if (!reduceMotion) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      Animated.timing(rotation, {
        toValue: nextState ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      rotation.setValue(nextState ? 1 : 0);
    }
    setExpanded(nextState);
  };

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View>
      <Pressable onPress={toggleExpand} style={styles.faqRow}>
        <AppText font="heading" style={[styles.questionText, { color: theme.colors.typography }]}>
          {item.question}
        </AppText>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="chevron-down" size={24} color={colors.textMuted} />
        </Animated.View>
      </Pressable>
      {expanded && (
        <Pressable onPress={toggleExpand} style={styles.answerWrapper}>
          <AppText colorVariant="muted" style={styles.answerText}>
            {item.answer}
          </AppText>
        </Pressable>
      )}
      {!isLast && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function FaqScreen() {
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
          FAQs
        </AppText>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {FAQ_DATA.map((item, index) => (
          <FaqItem key={item.id} item={item} isLast={index === FAQ_DATA.length - 1} />
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
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  questionText: { fontSize: 22, lineHeight: 28, flex: 1, paddingRight: 16 },
  answerWrapper: { paddingBottom: 24, paddingRight: 16 },
  answerText: { fontSize: 16, lineHeight: 24 },
  divider: { height: 1 },
}));
