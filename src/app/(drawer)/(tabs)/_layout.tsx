import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

export default function _layout() {
  const labelColor =
    Platform.OS === 'ios' ? DynamicColorIOS({ dark: 'white', light: 'black' }) : 'black';
  const tabTint =
    Platform.OS === 'ios' ? DynamicColorIOS({ dark: '#f2b949', light: '#f2b949' }) : '#f2b949';

  return (
    <NativeTabs
      labelStyle={{
        color: labelColor,
      }}
      tintColor={tabTint}
    >
      <NativeTabs.Trigger name="index">
        <Label>Check in</Label>
        <Icon sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="journal">
        <Label>Journal</Label>
        <Icon sf={{ default: 'book', selected: 'book.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="emotion-accordion">
        <Label>Emotions</Label>
        <Icon sf={{ default: 'square.split.2x2', selected: 'square.split.2x2.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reflections">
        <Label>Reflections</Label>
        <Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
