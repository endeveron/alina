import React, { PropsWithChildren } from 'react';

import { Text } from '@/src/components/Text';

export const FormErrorMessage = ({ children }: PropsWithChildren) => {
  return (
    <Text className="mt-2 text-base font-pmedium" colorName="red">
      {children}
    </Text>
  );
};
