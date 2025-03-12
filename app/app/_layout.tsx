import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

import { colors } from '@/src/constants/colors';
import SessionProvider from '@/src/context/SessionProvider';
import { useColorScheme } from '@/src/hooks/useColorScheme';
import { Screen } from '@/src/types/common';

import '@/src/styles/global.css';

configureReanimatedLogger({
  level: ReanimatedLogLevel.error,
  strict: false,
});

const screens: Screen[] = [
  { name: '(app)' },
  { name: '+not-found' },
  { name: 'sign-in' },
  { name: 'sign-up' },
];

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Set the animation options. Doesn't work in Expo Go
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  const [loaded] = useFonts({
    'Montserrat-Thin': require('../assets/fonts/Montserrat-Thin.ttf'), // 100
    'Montserrat-ExtraLight': require('../assets/fonts/Montserrat-ExtraLight.ttf'), // 200
    'Montserrat-Light': require('../assets/fonts/Montserrat-Light.ttf'), // 300
    'Montserrat-Regular': require('../assets/fonts/Montserrat-Regular.ttf'), // 400
    'Montserrat-Medium': require('../assets/fonts/Montserrat-Medium.ttf'), // 500
    'Montserrat-SemiBold': require('../assets/fonts/Montserrat-SemiBold.ttf'), // 600
    'Montserrat-Bold': require('../assets/fonts/Montserrat-Bold.ttf'), // 700
    'Montserrat-ExtraBold': require('../assets/fonts/Montserrat-ExtraBold.ttf'), // 800
    'Montserrat-Black': require('../assets/fonts/Montserrat-Black.ttf'), // 900
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <Stack
          screenOptions={{
            // presentation: 'modal',
            headerShown: false,
            contentStyle: {
              backgroundColor: colors[colorScheme].background,
            },
          }}
        >
          {screens.map((screen: Screen) => (
            <Stack.Screen name={screen.name} key={screen.name} />
          ))}
        </Stack>
        <StatusBar style={'light'} />
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
