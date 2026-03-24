import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export function DrawerRow({
  icon,
  label,
  onPress,
  iconColor,
  textColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  iconColor?: string;
  textColor?: string;
}) {
  const { theme } = useUnistyles();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.5 }]}>
      <View style={styles.rowLeft}>
        <Ionicons
          name={icon}
          size={20}
          color={iconColor ?? theme.colors.typography}
          style={iconColor ? undefined : { opacity: 0.5 }}
        />
        <Text style={[styles.rowLabel, { color: textColor ?? theme.colors.typography }]}>
          {label}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={14}
        color={theme.colors.typography}
        style={{ opacity: 0.25 }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create(() => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowLabel: { fontSize: 18, fontWeight: '500', letterSpacing: -0.1 },
}));
