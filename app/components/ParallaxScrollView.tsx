import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { colors } from '@/core/constants/colors';
import { useThemeColor } from '@/core/hooks/useThemeColor';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage?: ReactElement;
  headerContent?: ReactElement;
  headerBackgroundColor?: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerContent,
  headerBackgroundColor = {
    light: colors.light.background,
    dark: colors.dark.background,
  },
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const contentBackgroundColor = useThemeColor('card');

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        // {
        //   scale: interpolate(
        //     scrollOffset.value,
        //     [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
        //     [2, 1, 1]
        //   ),
        // },
      ],
    };
  });

  return (
    <ThemedView style={{ flex: 1 }}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        <Animated.View
          style={[
            styles.header,
            headerAnimatedStyle,
            { backgroundColor: headerBackgroundColor[colorScheme] },
          ]}
        >
          {headerContent ? headerContent : null}
          {headerImage ? headerImage : null}
        </Animated.View>
        <View
          style={{
            flex: 1,
            padding: 24,
            borderRadius: 32,
            marginBottom: 64,
            backgroundColor: contentBackgroundColor,
          }}
        >
          {children}
        </View>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 250,
    overflow: 'hidden',
  },
});
