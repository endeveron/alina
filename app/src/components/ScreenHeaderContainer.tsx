import React, { PropsWithChildren, ReactNode } from 'react';
import { View } from 'react-native';

type Props = PropsWithChildren & {
  bgImage?: ReactNode;
};

const ScreenHeaderContainer = ({ children, bgImage }: Props) => {
  return (
    <View className="relative flex-1">
      <View className="relative flex-1 flex-col-reverse p-6 pt-16 z-10">
        {children}
      </View>
      {bgImage ? (
        <View className="absolute inset-x-0 inset-y-0 overflow-hidden z-0">
          {bgImage}
        </View>
      ) : null}
    </View>
  );
};

export default ScreenHeaderContainer;
