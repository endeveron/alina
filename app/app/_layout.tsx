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

import { colors } from '@/core/constants/colors';
import SessionProvider from '@/core/context/SessionProvider';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { Screen } from '@/core/types/common';

import '@/core/styles/global.css';

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
    'MontserratAlt-Thin': require('../assets/fonts/MontserratAlt-Thin.ttf'), // 100
    'MontserratAlt-ExtraLight': require('../assets/fonts/MontserratAlt-ExtraLight.ttf'), // 200
    'MontserratAlt-Light': require('../assets/fonts/MontserratAlt-Light.ttf'), // 300
    'MontserratAlt-Regular': require('../assets/fonts/MontserratAlt-Regular.ttf'), // 400
    'MontserratAlt-Medium': require('../assets/fonts/MontserratAlt-Medium.ttf'), // 500
    'MontserratAlt-SemiBold': require('../assets/fonts/MontserratAlt-SemiBold.ttf'), // 600
    'MontserratAlt-Bold': require('../assets/fonts/MontserratAlt-Bold.ttf'), // 700
    'MontserratAlt-ExtraBold': require('../assets/fonts/MontserratAlt-ExtraBold.ttf'), // 800
    'MontserratAlt-Black': require('../assets/fonts/MontserratAlt-Black.ttf'), // 900
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
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </SessionProvider>
    </GestureHandlerRootView>
  );
}
