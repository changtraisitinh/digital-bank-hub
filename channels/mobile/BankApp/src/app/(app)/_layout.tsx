/* eslint-disable react/no-unstable-nested-components */
import { Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import {
  Cards as CardsIcon,
  Home as HomeIcon,
  Insights as InsightsIcon,
  Settings as SettingsIcon,
  Transfer as TransferIcon,
} from '@/components/ui/icons';
import { useAuth, useIsFirstTime } from '@/lib';

export default function TabLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);
  useEffect(() => {
    if (status !== 'idle') {
      setTimeout(() => {
        hideSplash();
      }, 1000);
    }
  }, [hideSplash, status]);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          tabBarButtonTestID: 'home-tab',
        }}
      />
      <Tabs.Screen
        name="transfer"
        options={{
          title: 'Transfer',
          headerShown: false,
          tabBarIcon: ({ color }) => <TransferIcon color={color} />,
          tabBarButtonTestID: 'transfer-tab',
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'Cards',
          headerShown: false,
          tabBarIcon: ({ color }) => <CardsIcon color={color} />,
          tabBarButtonTestID: 'cards-tab',
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          headerShown: false,
          tabBarIcon: ({ color }) => <InsightsIcon color={color} />,
          tabBarButtonTestID: 'insights-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}

// const CreateNewPostLink = () => {
//   return (
//     <Link href="/feed/add-post" asChild>
//       <Pressable>
//         <Text className="px-3 text-primary-300">Create</Text>
//       </Pressable>
//     </Link>
//   );
// };
