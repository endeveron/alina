import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type Props = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: Props) {
  const backgroundColor = useThemeColor('background', {
    light: lightColor,
    dark: darkColor,
  });

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
