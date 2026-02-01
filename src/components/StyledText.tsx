import type { TextProps } from 'react-native';
import { ThemedText } from './themed-text';

export function MonoText(props: TextProps) {
  return <ThemedText {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}
