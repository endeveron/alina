import { StatusBar } from 'expo-status-bar';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { colors } from '@/core/constants/colors';
import SessionProvider from '@/core/context/SessionProvider';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { Screen } from '@/core/types/common';

import '@/core/styles/global.css';

const screens: Screen[] = [
  { name: '(app)', title: '' },
  { name: '+not-found', title: 'Not Found' },
  { name: 'sign-in', title: 'Sign In' },
  { name: 'sign-up', title: 'Sign Up' },
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
    // Heading
    'Merriweather-Light': require('../assets/fonts/Merriweather-Light.ttf'), // 300
    'Merriweather-Regular': require('../assets/fonts/Merriweather-Regular.ttf'), // 400
    'Merriweather-Bold': require('../assets/fonts/Merriweather-Bold.ttf'), // 700
    'Merriweather-Black': require('../assets/fonts/Merriweather-Black.ttf'), // 900
    // Paragraph
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'), // 100
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'), // 200
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'), // 300
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'), // 400
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'), // 500
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'), // 600
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'), // 700
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'), // 800
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'), // 900
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <Stack>
          {screens.map((screen: Screen) => (
            <Stack.Screen
              name={screen.name}
              options={{
                presentation: 'modal',
                title: screen.title,
                headerShown: false,
                contentStyle: {
                  backgroundColor: colors[colorScheme].background,
                },
              }}
              key={screen.name}
            />
          ))}
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </SessionProvider>
    </ThemeProvider>
  );
}
