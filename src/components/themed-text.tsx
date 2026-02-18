import { Text, type TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type ThemedText = TextProps & {
  variant?: 'default' | 'title' | 'subtitle';
};

export function ThemedText({ variant = 'default', style, ...rest }: ThemedText) {
  return <Text style={[styles[variant], style]} {...rest} />;
}

const styles = StyleSheet.create((theme) => ({
  default: {
    fontSize: 16,
    color: theme.colors.typography,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.typography,
    fontFamily: 'Fraunces',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.lightGrey,
  },
}));
