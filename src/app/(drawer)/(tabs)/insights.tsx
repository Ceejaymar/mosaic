import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { LAYOUT } from '@/src/constants/layout';
import { ContextMatrix } from '@/src/features/insights/components/context-matrix';
import { EmotionalFootprint } from '@/src/features/insights/components/emotional-footprint';
import { MicroGrid } from '@/src/features/insights/components/micro-grid';
import { RhythmBar } from '@/src/features/insights/components/rhythm-bar';
import { useInsightsData } from '@/src/features/insights/hooks/useInsightsMockData';
import type { TimeFrame } from '@/src/features/insights/types';
import { generateObservations } from '@/src/features/insights/utils/observations';
import { hapticLight, hapticSelection } from '@/src/lib/haptics/haptics';

// ─── TimePager Component ──────────────────────────────────────────────────────

function TimePager({
  label,
  onPrev,
  onNext,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { theme } = useUnistyles();
  return (
    <View style={pagerStyles.container}>
      <Pressable
        onPress={() => {
          hapticLight();
          onPrev();
        }}
        style={({ pressed }) => [pagerStyles.btn, pressed && { opacity: 0.5 }]}
      >
        <Text style={[pagerStyles.arrow, { color: theme.colors.textMuted }]}>←</Text>
      </Pressable>
      <Text style={[pagerStyles.label, { color: theme.colors.typography }]}>{label}</Text>
      <Pressable
        onPress={() => {
          hapticLight();
          onNext();
        }}
        style={({ pressed }) => [pagerStyles.btn, pressed && { opacity: 0.5 }]}
      >
        <Text style={[pagerStyles.arrow, { color: theme.colors.textMuted }]}>→</Text>
      </Pressable>
    </View>
  );
}

const pagerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btn: { padding: 8 },
  arrow: { fontSize: 20, fontWeight: '600' },
  label: { fontSize: 16, fontWeight: '600', fontFamily: 'SpaceMono' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');
  const [offset, setOffset] = useState(0); // 0 = current, -1 = previous

  // Handlers
  const handleTimeFrameChange = useCallback((tf: TimeFrame) => {
    hapticSelection();
    setTimeFrame(tf);
    setOffset(0); // Reset to current when changing pivot
  }, []);

  const handlePrev = useCallback(() => setOffset((o) => o - 1), []);
  const handleNext = useCallback(() => setOffset((o) => (o < 0 ? o + 1 : 0)), []);

  // Data & Observations
  const entries = useInsightsData(timeFrame, offset);
  const observations = useMemo(() => generateObservations(entries), [entries]);

  // Mock Date Label based on offset (to be replaced with real date formatting later)
  const dateLabel = offset === 0 ? `Current ${timeFrame}` : `Past ${timeFrame} (${offset})`;

  // Guardrail: Ensure there is enough data to make the math meaningful
  const hasEnoughData = entries.length >= 3;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: LAYOUT.TAB_BAR_HEIGHT + insets.bottom,
        },
      ]}
    >
      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        {(['week', 'month', 'year'] as TimeFrame[]).map((tf) => {
          const isActive = timeFrame === tf;
          return (
            <Pressable
              key={tf}
              onPress={() => handleTimeFrameChange(tf)}
              style={({ pressed }) => [
                styles.segment,
                isActive && { backgroundColor: theme.colors.surface },
                pressed && { opacity: 0.6 },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: isActive ? theme.colors.typography : theme.colors.textMuted },
                ]}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Time Pager */}
      <TimePager label={dateLabel} onPrev={handlePrev} onNext={handleNext} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {hasEnoughData ? (
          <>
            {/* Phase 1: Observations Carousel */}
            {observations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Observations</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.carouselContent}
                >
                  {observations.map((obs) => (
                    <Pressable
                      key={obs.id}
                      onPress={() => router.push(`/insights/observation/${obs.id}` as any)}
                      style={({ pressed }) => [
                        styles.observationCard,
                        {
                          backgroundColor: theme.colors.tileBackground,
                          shadowColor: theme.colors.tileShadowColor,
                        },
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <View
                        style={[
                          styles.colorAccent,
                          { backgroundColor: obs.highlightColor ?? theme.colors.mosaicGold },
                        ]}
                      />
                      <Text style={[styles.observationText, { color: theme.colors.typography }]}>
                        {obs.text}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Phase 2: Skia Data Vis */}
            <EmotionalFootprint entries={entries} />
            <RhythmBar entries={entries} />

            {/* Phase 3: The Who, What, Where Matrix */}
            <ContextMatrix entries={entries} category="people" title="Who you were with" />
            <ContextMatrix entries={entries} category="activities" title="What you were doing" />
            <ContextMatrix entries={entries} category="places" title="Where you were" />

            {timeFrame === 'week' && <MicroGrid entries={entries} />}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.colors.typography }]}>
              Not enough data yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
              Log at least 3 check-ins this {timeFrame} to unlock your emotional patterns.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, backgroundColor: theme.colors.background },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 16,
    padding: 4,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentText: { fontSize: 14, fontWeight: '600', fontFamily: 'SpaceMono' },
  scrollContent: { paddingBottom: 40 },
  section: { marginTop: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    paddingHorizontal: 24,
    marginBottom: 16,
    letterSpacing: -0.4,
  },
  carouselContent: { paddingHorizontal: 24, gap: 12 },
  observationCard: {
    width: 240,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  colorAccent: { width: 12, height: 12, borderRadius: 6, marginBottom: 12 },
  observationText: { fontSize: 16, lineHeight: 22, fontFamily: 'Fraunces', fontWeight: '500' },
  emptyState: { paddingHorizontal: 24, paddingVertical: 64, alignItems: 'center' },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Fraunces',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
}));
