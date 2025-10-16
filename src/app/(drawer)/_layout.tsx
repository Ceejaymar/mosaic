import {
  type DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { usePathname, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO_IMAGE = 'https://los-project-images.s3.us-east-1.amazonaws.com/mosaic/mosaic-logo.webp';

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const links = [
    { id: 1, name: 'account' },
    { id: 2, name: 'settings' },
    { id: 3, name: 'help' },
  ];
  const pathName = usePathname();

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView>
        <Image source={{ uri: LOGO_IMAGE }} />
        <DrawerItemList {...props} />
        {links.map((link) => {
          const isActive = pathName === `/app/${link.id}`;
          return (
            <DrawerItem
              key={link.id}
              label={link.name}
              onPress={() => router.push(`/app/${link.id}`)}
              focused={isActive}
              activeTintColor="#f2a310"
              inactiveTintColor="#333"
            />
          );
        })}
      </DrawerContentScrollView>
      <View
        style={{
          paddingBottom: 20 + bottom,
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: '#dde3fe',
        }}
      >
        <Text style={{ color: '#dde3fe' }}>© Mosaic 2025</Text>
      </View>
    </View>
  );
}

export default function Layout() {
  return (
    <Drawer drawerContent={CustomDrawerContent}>
      <Drawer.Screen
        name="(tabs)"
        options={{ headerShown: false, drawerLabel: 'Home', title: 'Home' }}
      />
      <Drawer.Screen
        name="support"
        options={{
          drawerLabel: 'Support',
          title: 'Support',
        }}
      />
      <Drawer.Screen
        name="app"
        options={{
          drawerItemStyle: {
            display: 'none',
          },
        }}
      />
    </Drawer>
  );
}
