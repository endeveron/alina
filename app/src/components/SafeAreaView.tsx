import { type ViewProps } from 'react-native';
import { SafeAreaView as ReactNativeSafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/useThemeColor';

export function SafeAreaView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ViewProps & {
  lightColor?: string;
  darkColor?: string;
}) {
  const backgroundColor = useThemeColor('background');

  return (
    <ReactNativeSafeAreaView
      style={[{ backgroundColor }, style]}
      {...otherProps}
    />
  );
}
