import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useThemeColor } from '@/src/hooks/useThemeColor';
import { Screen } from '@/src/types/common';
import { useSession } from '@/src/context/SessionProvider';

const screens: Screen[] = [{ name: 'index' }];

export default function AppLayout() {
  const { session } = useSession();
  const background = useThemeColor('background');

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        // presentation: 'modal',
        headerShown: false,
        contentStyle: {
          backgroundColor: background,
        },
      }}
    >
      {screens.map((screen: Screen) => (
        <Stack.Screen name={screen.name} key={screen.name} />
      ))}
    </Stack>
  );
}
