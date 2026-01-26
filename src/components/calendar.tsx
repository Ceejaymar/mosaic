import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import CalendarDay from './calendar-day';

export default function Calendar() {
  const days = Array.from({ length: 31 }, (_, index) => index + 1);
  return (
    <View style={styles.container}>
      {days.map((day) => (
        <CalendarDay key={day} day={day} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'center',
    // justifyContent: 'space-between',
    gap: 0,
  },
}));
