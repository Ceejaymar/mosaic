import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { hapticLight } from '@/src/lib/haptics/haptics';

export default function TabLayout() {
  const { theme } = useUnistyles();

  return (
    <Tabs
      screenListeners={{
        tabPress: () => {
          hapticLight();
        },
      }}
      screenOptions={{
        headerShown: true,
        headerLeft: () => <DrawerToggleButton tintColor={theme.colors.typography} />,
        headerTransparent: true,
        tabBarActiveTintColor: '#f2b949',
        tabBarLabelStyle: { fontSize: 12 },
        animation: 'shift',

        headerBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={theme.colors.headerGradient as [string, string]}
              locations={[0.1, 1]}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),

        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
          backgroundColor: 'transparent',
        },

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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Check in',
          headerTitle: '',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          headerTitle: '',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="emotion-accordion"
        options={{
          title: 'Emotions',
          headerTitle: '',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reflections"
        options={{
          title: 'Reflections',
          headerTitle: '',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
