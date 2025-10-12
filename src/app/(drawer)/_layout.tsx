import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="(tabs)"
        options={{ headerShown: false, drawerLabel: 'Home', title: 'Home' }}
      />
      <Drawer.Screen name="support" options={{ drawerLabel: 'Support', title: 'Support' }} />
    </Drawer>
  );
}
