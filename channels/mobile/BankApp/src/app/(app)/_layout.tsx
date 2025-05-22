/* eslint-disable react/no-unstable-nested-components */
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Redirect, router, SplashScreen, Tabs, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui';
import {
  Cards as CardsIcon,
  Home as HomeIcon,
  Insights as InsightsIcon,
  Settings as SettingsIcon,
  Transfer as TransferIcon,
} from '@/components/ui/icons';
import { useAuth, useIsFirstTime } from '@/lib';
import { notificationService } from '@/lib/notification-service';

export default function TabLayout() {
  const router = useRouter();
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();
  const [showChatBot, setShowChatBot] = useState(false);
  const [notificationCount] = useState(3); // Add this state for notification count

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
    <View style={{ flex: 1 }}>
      {/* Notification Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 50,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
        onPress={() => router.push('/notifications/notification-list')}
      >
        <Ionicons name="notifications-outline" size={24} color="#333" />
        {notificationCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -5,
              right: -5,
              backgroundColor: '#e53935',
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarActiveTintColor: '#2e7d32',
          tabBarInactiveTintColor: '#666',
          animation: 'fade',
          animationDuration: 200,
        }}
      >
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

      {/* Chat Bot Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 80,
          right: 20,
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: '#2e7d32',
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: 1000,
        }}
        onPress={() => setShowChatBot(true)}
      >
        <MaterialIcons name="record-voice-over" size={24} color="white" />
      </TouchableOpacity>

      {/* Chat Bot Modal */}
      {showChatBot && (
        <>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              zIndex: 999,
            }}
            activeOpacity={1}
            onPress={() => setShowChatBot(false)}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 140,
              right: 20,
              width: '80%',
              maxWidth: 300,
              backgroundColor: 'white',
              borderRadius: 12,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              zIndex: 1000,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: '#f0f0f0',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                AI Assistant
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={{ marginRight: 16 }}
                  onPress={() => {
                    // Handle voice chat
                  }}
                >
                  <MaterialIcons name="mic" size={24} color="#2e7d32" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowChatBot(false)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ padding: 16, minHeight: 200 }}>
              <Text style={{ fontSize: 14, color: '#666' }}>
                Hello! How can I help you today?
              </Text>
            </View>
          </View>
        </>
      )}

      {/* Chat Bot Button */}
    </View>
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

useEffect(() => {
  // Initialize notifications
  const initNotifications = async () => {
    await notificationService.initialize();

    // Handle notification opened app
    notificationService.onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification caused app to open:', remoteMessage);
      // Handle navigation based on notification
      if (remoteMessage.data?.screen) {
        router.push(remoteMessage.data.screen);
      }
    });

    // Check if app was opened from notification
    notificationService.getInitialNotification((remoteMessage) => {
      console.log('App opened from quit state:', remoteMessage);
      // Handle navigation based on notification
      if (remoteMessage.data?.screen) {
        router.push(remoteMessage.data.screen);
      }
    });
  };

  initNotifications();
}, [router]);
