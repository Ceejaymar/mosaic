import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { LAYOUT } from '@/src/constants/layout';
import { emitOpenCheckInSheet } from '@/src/features/check-in/check-in-sheet-events';
import { hapticLight } from '@/src/lib/haptics/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FAB_SIZE = 60;

export default function TabLayout() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleFabPress = () => {
    hapticLight();
    emitOpenCheckInSheet();
  };

  // Center of the FAB aligns with the top edge of the tab bar content area
  const fabBottom = insets.bottom + LAYOUT.TAB_BAR_HEIGHT - FAB_SIZE / 2;

  return (
    <View style={styles.root}>
      <Tabs
        screenListeners={{ tabPress: () => hapticLight() }}
        screenOptions={{
          headerShown: true,
          headerLeft: () => <DrawerToggleButton tintColor={theme.colors.typography} />,
          headerTransparent: true,
          tabBarActiveTintColor: theme.colors.mosaicGold,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          animation: 'shift',
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0,
            height: LAYOUT.TAB_BAR_HEIGHT + insets.bottom,
            backgroundColor: 'transparent',
          },
          headerBackground: () => (
            <View style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={theme.colors.headerGradient as [string, string]}
                locations={[0.1, 1]}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ),
          tabBarBackground: () => (
            <View style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={theme.colors.tabBarGradient as [string, string]}
                locations={[0, 0.9]}
                style={StyleSheet.absoluteFill}
              />
            </View>
          ),
        }}
      >
        {/* Left of FAB */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            headerTitle: '',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="canvas"
          options={{
            title: 'Canvas',
            headerTitle: '',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
            ),
          }}
        />

        {/* Right of FAB */}
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            headerTitle: '',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'analytics' : 'analytics-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            headerTitle: '',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'book' : 'book-outline'} size={22} color={color} />
            ),
          }}
        />

        {/* Hidden routes */}
        <Tabs.Screen name="check-in/[id]" options={{ href: null, headerShown: false }} />
      </Tabs>

      {/* FAB — rendered as a sibling so it sits above all tab content in z-order */}
      <AnimatedPressable
        onPress={handleFabPress}
        onPressIn={() => {
          fabScale.value = withSpring(0.93, { damping: 12, stiffness: 200 });
        }}
        onPressOut={() => {
          fabScale.value = withSpring(1, { damping: 12, stiffness: 200 });
        }}
        style={[styles.fab, { bottom: fabBottom }, fabAnimatedStyle]}
        accessibilityRole="button"
        accessibilityLabel="Check in"
      >
        <Ionicons name="add" size={32} color={theme.colors.onAccent} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: { flex: 1 },
  fab: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: theme.colors.mosaicGold,
    // Horizontally centered
    left: '50%',
    marginLeft: -(FAB_SIZE / 2),
    alignItems: 'center',
    justifyContent: 'center',
    // Color-tinted shadow
    shadowColor: theme.colors.mosaicGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
}));
