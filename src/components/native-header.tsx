import { DrawerToggleButton } from '@react-navigation/drawer';
import { type BlurTint, BlurView } from 'expo-blur';
import { Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

type NativeHeader = {
  title?: string;
};

export default function NativeHeader({ title }: NativeHeader) {
  const HeaderContainer = Platform.OS === 'ios' ? BlurView : View;
  const headerProps =
    Platform.OS === 'ios'
      ? { intensity: 80, tint: 'default' as BlurTint, pointerEvents: 'none' as const }
      : {};

  return (
    <View style={styles.wrapper}>
      <HeaderContainer style={StyleSheet.absoluteFill} {...headerProps} />

      <SafeAreaView edges={['top']}>
        <View style={styles.content}>
          <View style={styles.leftContainer}>
            <DrawerToggleButton tintColor="#f2b949" />
          </View>

          {title && <Text style={styles.title}>{title}</Text>}
          <View style={styles.rightContainer} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 100,
    backgroundColor: Platform.OS === 'android' ? '#fff' : 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    width: 50,
    alignItems: 'flex-start',
    paddingLeft: 8,
  },
  rightContainer: {
    width: 50,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
});
