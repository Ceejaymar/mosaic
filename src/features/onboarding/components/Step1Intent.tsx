import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';

// ─── Config ───────────────────────────────────────────────────────────────────

const INTENT_OPTIONS = [
  'Spot patterns in my mood',
  'Understand my stress triggers',
  'Track emotions for therapy',
  'A private space to vent',
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  selectedIntents: string[];
  onToggle: (intent: string) => void;
  onNext: () => void;
};

export function Step1Intent({ selectedIntents, onToggle, onNext }: Props) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          What brings you{'\n'}to Mosaic?
        </AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.typography }]}>
          Pick everything that applies.
        </AppText>
      </View>

      {/* Option cards */}
      <View style={styles.options}>
        {INTENT_OPTIONS.map((intent) => {
          const isSelected = selectedIntents.includes(intent);
          return (
            <Pressable
              key={intent}
              onPress={() => onToggle(intent)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: isSelected ? 'rgba(197, 160, 89, 0.12)' : theme.colors.surface,
                  borderColor: isSelected ? '#C5A059' : 'transparent',
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              {/* Selection dot */}
              <View
                style={[
                  styles.dot,
                  {
                    borderColor: isSelected ? '#C5A059' : 'rgba(255,255,255,0.2)',
                    backgroundColor: isSelected ? '#C5A059' : 'transparent',
                  },
                ]}
              />
              <AppText
                style={[
                  styles.optionLabel,
                  {
                    color: isSelected ? '#C5A059' : theme.colors.typography,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {intent}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* CTA */}
      <Pressable
        onPress={onNext}
        disabled={selectedIntents.length === 0}
        style={({ pressed }) => [
          styles.btn,
          {
            backgroundColor: selectedIntents.length > 0 ? '#C5A059' : 'rgba(197, 160, 89, 0.25)',
            opacity: pressed ? 0.75 : 1,
          },
        ]}
      >
        <AppText font="mono" style={styles.btnText}>
          Continue
        </AppText>
      </Pressable>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    gap: theme.spacing[6],
  },
  header: {
    gap: theme.spacing[2],
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: theme.fontSize.base,
    opacity: 0.5,
    lineHeight: 22,
  },
  options: {
    gap: theme.spacing[3],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingVertical: 16,
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.card,
    borderWidth: 1,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  optionLabel: {
    fontSize: theme.fontSize.base,
    flex: 1,
    lineHeight: 22,
  },
  btn: {
    paddingVertical: 16,
    borderRadius: theme.radius.tight,
    alignItems: 'center',
    marginTop: theme.spacing[2],
  },
  btnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    color: '#1A1208',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
}));
