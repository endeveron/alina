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
  variant?: 'primary' | 'secondary';
  containerClassName?: string;
  textClassName?: string;
  isLoading?: boolean;
}) => {
  const brand = useThemeColor('brand');
  const btnSecondary = useThemeColor('btnSecondary');

  const containerOpacity = isLoading ? 'opacity-50' : '';
  const textOpacity = variant === 'secondary' ? 'opacity-70' : '';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      className={`relative overflow-hidden rounded-full min-h-[56px] flex flex-row justify-center items-center transition-opacity ${containerClassName} ${containerOpacity}`}
      disabled={isLoading}
    >
      <Text
        className={`relative z-10 text-white text-base font-psemibold ${textClassName} ${textOpacity}`}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: variant === 'primary' ? brand : btnSecondary,
        }}
        className="absolute inset-x-0 inset-y-0 h-full z-0"
      ></View>
    </TouchableOpacity>
  );
};
