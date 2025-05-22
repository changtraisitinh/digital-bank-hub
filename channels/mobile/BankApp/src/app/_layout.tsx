// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import { hydrateAuth, loadSelectedTheme } from '@/lib';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

hydrateAuth();
loadSelectedTheme();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

const firebaseConfig = {
  // Your Firebase configuration object
  // This should come from your Firebase Console
  apiKey: 'AIzaSyCRFCyt9_G6_NimvmvaFy1KA6IX62fS_4c',
  authDomain: 'dibankapp.firebaseapp.com',
  projectId: 'dibankapp',
  storageBucket: 'dibankapp.firebasestorage.app',
  messagingSenderId: '173595877623',
  appId: '1:173595877623:web:eb0fbcb68d1756256a33f2',
  measurementId: 'G-2X367W6YBM',
};

// Initialize Firebase at the app startup using the new modular API
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const messaging = getMessaging(app);

export default function RootLayout() {
  // useEffect(() => {
  //   // Request permission for notifications
  //   const requestUserPermission = async () => {
  //     const authStatus = await requestPermission();
  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  //     if (enabled) {
  //       // Get FCM token using the new modular API
  //       const token = await getToken(messaging);
  //       console.log('FCM Token:', token);
  //       // Here you would typically send this token to your backend
  //     }
  //   };

  //   // Handle notifications when app is in foreground using the new modular API
  //   const unsubscribe = onMessage(messaging, async (remoteMessage) => {
  //     Alert.alert(
  //       remoteMessage.notification?.title || 'New Message',
  //       remoteMessage.notification?.body
  //     );
  //   });

  //   requestUserPermission();

  //   return unsubscribe;
  // }, []);

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
