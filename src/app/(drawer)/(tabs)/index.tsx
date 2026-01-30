import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';

import NativeHeader from '@/src/components/native-header';
import { Text, View } from '@/src/components/Themed';

export default function TabOneScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <NativeHeader />
      <ScrollView>
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
