import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';

const INTENT_OPTIONS = [
  { label: 'Spot patterns in my mood', icon: 'color-filter-outline' as const },
  { label: 'Understand my stress triggers', icon: 'flash-outline' as const },
  { label: 'Track emotions for therapy', icon: 'medical-outline' as const },
  { label: 'A private space to vent', icon: 'journal-outline' as const },
];

type Props = {
  selectedIntents: string[];
  onToggle: (intent: string) => void;
  onNext: () => void;
};

export function Step2Intent({ selectedIntents, onToggle, onNext }: Props) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText font="heading" style={[styles.title, { color: theme.colors.typography }]}>
          What brings you{'\n'}to Mosaic?
        </AppText>
        <AppText style={[styles.subtitle, { color: theme.colors.typography }]}>
          Pick everything that applies.
        </AppText>
      </View>

      <View style={styles.options}>
        {INTENT_OPTIONS.map(({ label, icon }) => {
          const isSelected = selectedIntents.includes(label);
          return (
            <Pressable
              key={label}
              onPress={() => onToggle(label)}
              style={({ pressed }) => [styles.optionWrap, { opacity: pressed ? 0.8 : 1 }]}
            >
              {isSelected && (
                <LinearGradient
                  colors={['rgba(197, 160, 89, 0.15)', 'rgba(197, 160, 89, 0.05)']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                />
              )}
              <View
                style={[
                  styles.optionInner,
                  { borderColor: isSelected ? '#C5A059' : 'rgba(255,255,255,0.08)' },
                ]}
              >
                <Ionicons
                  name={icon}
                  size={22}
                  color={isSelected ? '#C5A059' : theme.colors.typography}
                  style={{ opacity: isSelected ? 1 : 0.5 }}
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
                  {label}
                </AppText>
                <View
                  style={[
                    styles.dot,
                    {
                      borderColor: isSelected ? '#C5A059' : 'rgba(255,255,255,0.2)',
                      backgroundColor: isSelected ? '#C5A059' : 'transparent',
                    },
                  ]}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

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

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, gap: theme.spacing[6] },
  header: { gap: theme.spacing[2] },
  title: { fontSize: 36, fontWeight: '700', letterSpacing: -0.8, lineHeight: 42 },
  subtitle: { fontSize: theme.fontSize.base, opacity: 0.5, lineHeight: 22 },
  options: { gap: theme.spacing[3] },
  optionWrap: { borderRadius: theme.radius.card },
  optionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingVertical: 18,
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.radius.card,
    borderWidth: 1,
  },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, marginLeft: 'auto' },
  optionLabel: { fontSize: theme.fontSize.base, flex: 1, lineHeight: 22 },
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
