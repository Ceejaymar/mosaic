import SquircleView from 'react-native-fast-squircle';
import { StyleSheet } from 'react-native-unistyles';

export default function MosaicContainer() {
  return <SquircleView cornerSmoothing={0.6} style={styles.container}></SquircleView>;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.lightGrey,
    width: 300,
    height: 300,
    borderRadius: 30,
  },
}));
