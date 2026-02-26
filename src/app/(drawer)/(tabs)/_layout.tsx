import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { MainFab } from '@/src/components/fab';
import { LAYOUT } from '@/src/constants/layout';
import { hapticLight } from '@/src/lib/haptics/haptics';

export default function TabLayout() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const safeBottom = Math.max(insets.bottom, 12);
  const tabBarHeight = LAYOUT.TAB_BAR_HEIGHT + safeBottom;

  return (
    <View style={styles.root}>
      <Tabs
        screenListeners={{ tabPress: () => hapticLight() }}
        screenOptions={{
          animation: 'shift',
          headerShown: false,
          headerLeft: () => <DrawerToggleButton tintColor={theme.colors.typography} />,
          headerTransparent: true,
          tabBarActiveTintColor: theme.colors.mosaicGold,
          tabBarInactiveTintColor: 'rgba(255,255,255,0.45)',
          tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 4 },
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            elevation: 0,
            height: tabBarHeight,
            paddingTop: 12,
            paddingBottom: safeBottom,
          },

          tabBarBackground: () => (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: tabBarHeight + 20,
              }}
              pointerEvents="none"
            >
              <LinearGradient
                colors={['transparent', theme.colors.background, theme.colors.background]}
                locations={[0, 0.6, 1]}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            headerShown: true,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="canvas"
          options={{
            title: 'Canvas',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={26} color={color} />
            ),
          }}
        />

        {/* THE GHOST TAB: Separates the center icons */}
        <Tabs.Screen
          name="spacer"
          options={{
            title: '',
            tabBarIcon: () => null,
            tabBarLabel: () => null,
            tabBarItemStyle: { width: 84, flexBasis: 84, flexGrow: 0, flexShrink: 0 },
            tabBarButton: () => <View style={{ width: 84 }} pointerEvents="none" />,
          }}
        />

        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'analytics' : 'analytics-outline'}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'book' : 'book-outline'} size={26} color={color} />
            ),
          }}
        />
      </Tabs>

      <MainFab />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1, backgroundColor: theme.colors.background },
}));
