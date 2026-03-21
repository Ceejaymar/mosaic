import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';

type Option = { label: string; value: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
};

export function PreferenceSheet({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}: Props) {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Backdrop */}
        <Pressable
          style={[styles.backdrop, { backgroundColor: theme.colors.modalOverlay }]}
          onPress={onClose}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />

        {/* Sheet */}
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 16 },
          ]}
        >
          {/* Drag handle */}
          <View style={[styles.handle, { backgroundColor: theme.colors.divider }]} />

          {/* Title */}
          <AppText style={[styles.sheetTitle, { color: theme.colors.typography }]}>{title}</AppText>

          {/* Options */}
          {options.map((option, index) => {
            const isSelected = option.value === selectedValue;
            const isLast = index === options.length - 1;

            return (
              <Pressable
                key={option.value}
                onPress={() => onSelect(option.value)}
                style={({ pressed }) => [
                  styles.optionRow,
                  !isLast && { borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
                  pressed && { opacity: 0.6 },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={option.label}
              >
                <AppText
                  style={[
                    styles.optionLabel,
                    { color: isSelected ? theme.colors.mosaicGold : theme.colors.typography },
                  ]}
                >
                  {option.label}
                </AppText>
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.mosaicGold} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: theme.spacing[5],
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionLabel: {
    fontSize: theme.fontSize.base,
    fontWeight: '500',
  },
}));
