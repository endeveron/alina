import { Text as ReactNativeText, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { colors } from '@/constants/colors';

export function Text({
  style,
  lightColor,
  darkColor,
  colorName,
  ...rest
}: TextProps & {
  lightColor?: string;
  darkColor?: string;
  colorName?: keyof typeof colors.light & keyof typeof colors.dark;
}) {
  const color = useThemeColor(colorName ?? 'text', {
    light: lightColor,
    dark: darkColor,
  });

  return <ReactNativeText style={[{ color }, style]} {...rest} />;
}
