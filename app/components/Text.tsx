import { Text as ReactNativeText, type TextProps } from 'react-native';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { colors } from '@/core/constants/colors';

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

// import { Text as ReactText, type TextProps } from 'react-native';

// import { useThemeColor } from '@/core/hooks/useThemeColor';

// export type Props = TextProps & {
//   colorName?: string;
//   lightColor?: string;
//   darkColor?: string;
//   className?: string;
//   type?: 'default' | 'title' | 'subtitle' | 'muted';
// };

// export function Text({
//   colorName,
//   style,
//   lightColor,
//   darkColor,
//   type = 'default',
//   className,
//   ...rest
// }: Props) {
//   let color = useThemeColor(colorName ?? 'text', { light: lightColor, dark: darkColor });
//   let baseClassName = '';

//   switch (type) {
//     case 'default':
//       baseClassName = 'font-plight text-lg/8';
//       break;
//     case 'title':
//       baseClassName = 'font-pbold text-4xl';
//       color = useThemeColor('title', { light: lightColor, dark: darkColor });
//       break;
//     case 'subtitle':
//       baseClassName = 'font-pmedium text-2xl';
//       color = useThemeColor('title', { light: lightColor, dark: darkColor });
//       break;
//     case 'muted':
//       baseClassName = 'font-pregular text-lg';
//       color = useThemeColor('muted', { light: lightColor, dark: darkColor });
//       break;
//   }

//   return (
//     <ReactText
//       className={`${baseClassName} ${className}`}
//       style={[{ color }, style]}
//       {...rest}
//     />
//   );
// }
