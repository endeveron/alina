import { Redirect, Stack } from 'expo-router';
import React from 'react';

import { useThemeColor } from '@/hooks/useThemeColor';
import { useSession } from '@/context/SessionProvider';

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
        contentStyle: {
          backgroundColor: background,
        },
      }}
    />
  );
}
