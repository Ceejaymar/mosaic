import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { hapticMedium, hapticSelection } from '@/src/lib/haptics/haptics';

// IDs must match IntentId in Step6Analyzing.tsx
const INTENT_OPTIONS = [
  { id: 'mood_patterns', label: 'Spot patterns in my mood', icon: 'color-filter-outline' as const },
  { id: 'stress_triggers', label: 'Understand my stress triggers', icon: 'flash-outline' as const },
  { id: 'therapy_tracking', label: 'Track emotions for therapy', icon: 'medical-outline' as const },
  { id: 'private_vent', label: 'A private space to vent', icon: 'journal-outline' as const },
];

type Props = {
  selectedIntents: string[];
  onToggle: (intent: string) => void;
  onNext: () => void;
};

export function Step2Intent({ selectedIntents, onToggle, onNext }: Props) {
  const { theme } = useUnistyles();

  const handleToggle = (id: string) => {
    hapticSelection();
    onToggle(id);
  };

  const handleContinue = () => {
    hapticMedium();
    onNext();
  };

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
        {INTENT_OPTIONS.map(({ id, label, icon }) => {
          const isSelected = selectedIntents.includes(id);
          return (
            <Pressable
              key={id}
              onPress={() => handleToggle(id)}
              style={({ pressed }) => [styles.optionWrap, { opacity: pressed ? 0.82 : 1 }]}
            >
              {/* Selected state: warm gradient fill */}
              {isSelected && (
                <LinearGradient
                  colors={[
                    'rgba(212, 175, 55, 0.14)',
                    'rgba(197, 160, 89, 0.06)',
                    'rgba(184, 146, 74, 0.04)',
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: 16 }]}
                />
              )}

              <View
                style={[
                  styles.optionInner,
                  {
                    borderColor: isSelected ? 'rgba(197, 160, 89, 0.5)' : 'rgba(255,255,255,0.07)',
                    backgroundColor: isSelected ? 'transparent' : 'rgba(255,255,255,0.03)',
                  },
                ]}
              >
                {/* Icon container */}
                <View
                  style={[
                    styles.iconWrap,
                    {
                      backgroundColor: isSelected
                        ? 'rgba(197, 160, 89, 0.15)'
                        : 'rgba(255,255,255,0.05)',
                      borderColor: isSelected
                        ? 'rgba(197, 160, 89, 0.3)'
                        : 'rgba(255,255,255,0.06)',
                    },
                  ]}
                >
                  <Ionicons
                    name={icon}
                    size={18}
                    color={isSelected ? '#C5A059' : theme.colors.typography}
                    style={{ opacity: isSelected ? 1 : 0.4 }}
                  />
                </View>

                <AppText
                  style={[
                    styles.optionLabel,
                    {
                      color: isSelected ? '#D4AF37' : theme.colors.typography,
                      fontWeight: isSelected ? '600' : '400',
                      opacity: isSelected ? 1 : 0.7,
                    },
                  ]}
                >
                  {label}
                </AppText>

                {/* Check indicator */}
                <View
                  style={[
                    styles.checkWrap,
                    {
                      borderColor: isSelected ? '#C5A059' : 'rgba(255,255,255,0.15)',
                      backgroundColor: isSelected ? '#C5A059' : 'transparent',
                    },
                  ]}
                >
                  {isSelected && <Ionicons name="checkmark" size={11} color="#1A1208" />}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={handleContinue}
        disabled={selectedIntents.length === 0}
        style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
      >
        <LinearGradient
          colors={
            selectedIntents.length > 0
              ? ['#E2BC62', '#C5A059', '#B8924A']
              : ['rgba(197,160,89,0.2)', 'rgba(197,160,89,0.15)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.btn}
        >
          <AppText
            font="mono"
            style={[
              styles.btnText,
              { color: selectedIntents.length > 0 ? '#1A1208' : 'rgba(197,160,89,0.6)' },
            ]}
          >
            Continue
          </AppText>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { flex: 1, gap: theme.spacing[5] },
  header: { gap: theme.spacing[2] },
  title: { fontSize: 36, fontWeight: '700', letterSpacing: -0.8, lineHeight: 42 },
  subtitle: { fontSize: theme.fontSize.base, opacity: 0.45, lineHeight: 22 },
  options: { gap: theme.spacing[2] },
  optionWrap: { borderRadius: 16 },
  optionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingVertical: 16,
    paddingHorizontal: theme.spacing[4],
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  optionLabel: { fontSize: theme.fontSize.base, flex: 1, lineHeight: 22 },
  checkWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    paddingVertical: 17,
    borderRadius: theme.radius.tight,
    alignItems: 'center',
    marginTop: theme.spacing[1],
  },
  btnText: {
    fontSize: theme.fontSize.base,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
}));
