import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ThemedViewProps = ViewProps & {
  variant?: 'background' | 'surface'; // Add more as needed
};

export function ThemedView({ variant = 'background', style, ...rest }: ThemedViewProps) {
  return <View style={[styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create((theme) => ({
  background: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  surface: {
    // backgroundColor: theme.colors.surface, // ✅ For cards/modals
  },
}));
