import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';
import CurrentDate from '@/src/components/current-date';
import MosaicContainer from '@/src/components/mosaic-container';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';

const HEADER_HEIGHT = 110;
const TAB_BAR_HEIGHT = 100;

export default function TabOneScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT,
          paddingBottom: TAB_BAR_HEIGHT,
        }}
      >
        <ThemedText variant="title" style={styles.title}>
          How are you feeling {t('dashboard.time_of_day.morning')}?
        </ThemedText>
        <View style={styles.currentDateContainer}>
          <CurrentDate />
        </View>
        <View style={styles.mosaicContainer}>
          <MosaicContainer></MosaicContainer>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentDateContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  mosaicContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
  },
});
