import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS } from 'react-native';

export default function _layout() {
  return (
    <NativeTabs
      labelStyle={{
        color: DynamicColorIOS({
          dark: 'white',
          light: 'black',
        }),
      }}
      tintColor={DynamicColorIOS({
        dark: '#f2b949',
        light: '#f2b949',
      })}
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
