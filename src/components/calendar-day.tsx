import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from './Themed';

type CalendarDay = {
  day: number;
};

export default function CalendarDay({ day }: CalendarDay) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{day}</Text>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: 50,
    height: 50,
    backgroundColor: theme.colors.background,
    borderWidth: 0.5,
    borderColor: '#d3d3d330',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Fraunces',
    color: 'white',
  },
}));
