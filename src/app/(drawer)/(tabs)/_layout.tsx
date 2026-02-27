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

// 1. STABLE REFERENCE: Spacer Button
// By moving this outside, React never unmounts/remounts it during tab switches.
const SpacerButton = () => <View style={{ width: LAYOUT.TAB_SPACER_WIDTH }} pointerEvents="none" />;

// 2. STABLE REFERENCE: Tab Bar Background
// Prevents the gradient bridge from recalculating on every render.
function TabBarOverlay({ height, colors }: { height: number; colors: [string, string, string] }) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height,
      }}
      pointerEvents="none"
    >
      <LinearGradient colors={colors} locations={[0, 0.6, 1]} style={StyleSheet.absoluteFill} />
    </View>
  );
}

// 3. STABLE REFERENCE: Drawer Button
// Avoids rebuilding the header on every state change.
const CustomDrawerButton = ({ tintColor }: { tintColor?: string }) => (
  <DrawerToggleButton tintColor={tintColor} />
);

export default function TabLayout() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const safeBottom = Math.max(insets.bottom, 12);
  const tabBarHeight = LAYOUT.TAB_BAR_HEIGHT + safeBottom;

  return (
    <View style={styles.root}>
      <Tabs
        detachInactiveScreens={false}
        screenListeners={{ tabPress: () => hapticLight() }}
        screenOptions={{
          animation: 'shift',
          headerShown: false,
          headerLeft: CustomDrawerButton, // Using stable reference
          headerTransparent: true,
          tabBarActiveTintColor: theme.colors.mosaicGold,
          tabBarInactiveTintColor: theme.colors.tabInactive,
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
            <TabBarOverlay
              height={tabBarHeight + 20}
              colors={['transparent', theme.colors.background, theme.colors.background]}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            headerShown: false,
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

        {/* THE GHOST TAB: Now heavily optimized */}
        <Tabs.Screen
          name="spacer"
          options={{
            title: '',
            tabBarIcon: () => null,
            tabBarLabel: () => null,
            tabBarItemStyle: {
              width: LAYOUT.TAB_SPACER_WIDTH,
              flexBasis: LAYOUT.TAB_SPACER_WIDTH,
              flexGrow: 0,
              flexShrink: 0,
            },
            tabBarButton: SpacerButton, // Using stable reference
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
