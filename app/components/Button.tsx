import { useThemeColor } from '@/core/hooks/useThemeColor';

import { Text, TouchableOpacity, View } from 'react-native';

export const Button = ({
  title,
  handlePress,
  variant = 'primary',
  containerClassName,
  textClassName,
  isLoading,
}: {
  title: string;
  handlePress: () => void;
  variant?: 'primary' | 'secondary' | 'brand';
  containerClassName?: string;
  textClassName?: string;
  isLoading?: boolean;
}) => {
  const btnPrimaryText = useThemeColor('btnPrimaryText');
  const btnPrimaryBg = useThemeColor('btnPrimaryBackground');
  const btnSecondaryText = useThemeColor('btnSecondaryText');
  const btnSecondaryBg = useThemeColor('btnSecondaryBackground');
  const btnBrandText = useThemeColor('btnBrandText');
  const btnBrandBg = useThemeColor('btnBrandBackground');

  const containerOpacity = isLoading ? 'opacity-50' : '';
  let textStyle = { color: btnPrimaryText };
  let bgStyle = { backgroundColor: btnPrimaryBg };

  switch (variant) {
    case 'brand':
      {
        textStyle = { color: btnBrandText };
        bgStyle = { backgroundColor: btnBrandBg };
      }
      break;
    case 'secondary': {
      textStyle = { color: btnSecondaryText };
      bgStyle = { backgroundColor: btnSecondaryBg };
    }
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={`relative overflow-hidden rounded-full min-h-[60px] flex flex-row justify-center items-center px-8 transition-opacity ${containerClassName} ${containerOpacity}`}
      disabled={isLoading}
    >
      <Text
        style={textStyle}
        className={`relative z-10  text-xl font-pbold ${textClassName}`}
      >
        {title}
      </Text>
      <View
        style={bgStyle}
        className="absolute inset-x-0 inset-y-0 h-full z-0"
      ></View>
    </TouchableOpacity>
  );
};
