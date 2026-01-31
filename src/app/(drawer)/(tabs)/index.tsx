import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';

import { Text, View } from '@/src/components/Themed';

export default function TabOneScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 110,
          paddingBottom: 100,
        }}
      >
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
        <Text style={styles.title}>How are you feeling {t('dashboard.time_of_day.morning')}?</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    textAlign: 'center',
  },
}));
