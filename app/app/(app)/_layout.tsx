import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { Screen } from '@/core/types/common';
import { useSession } from '@/core/context/SessionProvider';

const screens: Screen[] = [{ name: 'index', title: 'Speech-to-Text' }];

export default function AppLayout() {
  const { session } = useSession();
  const background = useThemeColor('background');

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {screens.map((screen: Screen) => (
        <Stack.Screen
          name={screen.name}
          options={{
            presentation: 'modal',
            title: screen.title,
            headerShown: false,
            contentStyle: { backgroundColor: background },
          }}
          key={screen.name}
        />
      ))}
    </Stack>
  );
}
