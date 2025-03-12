/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';

import { colors } from '@/src/constants/colors';

export function useThemeColor(
  colorName: keyof typeof colors.light & keyof typeof colors.dark,
  props?: { light?: string; dark?: string }
) {
  const theme = useColorScheme() ?? 'light';

  if (props && props[theme]) {
    return props[theme];
  } else {
    return colors[theme][colorName];
  }
}
