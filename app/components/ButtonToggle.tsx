import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useThemeColor } from '@/core/hooks/useThemeColor';

type TButtonToggleProps = {
  onChange: (isToggled: boolean) => void;
  isActive?: boolean;
  isLoading?: boolean;
};

const OPACITY_FROM_VALUE = 1;
const OPACITY_TO_VALUE = 0.25;
const ANIM_DURATION = 500; // ms

export const ButtonToggle = ({
  onChange,
  isActive,
  isLoading,
}: TButtonToggleProps) => {
  const textColor = useThemeColor('text');
  const mutedColor = useThemeColor('muted');
  const backgroundColor = useThemeColor('background');
  const opacity = useSharedValue(OPACITY_FROM_VALUE);

  const [isToggled, setToggled] = useState(!!isActive);

  const handlePress = () => {
    onChange(!isToggled);
    // setToggled((prev) => !prev);
  };

  useEffect(() => {
    if (isActive !== undefined) setToggled(isActive);
  }, [isActive]);

  useEffect(() => {
    if (isLoading) {
      // start the infinite fade animation
      opacity.value = withRepeat(
        withTiming(OPACITY_TO_VALUE, { duration: ANIM_DURATION }), // fade in to full opacity
        -1, // repeat indefinitely
        true // reverse on each repeat
      );
    } else {
      opacity.value = 1;
    }
  }, [isLoading]);

  return (
    <Animated.View style={{ opacity }}>
      <View
        onTouchEnd={handlePress}
        style={{
          borderWidth: 2,
          borderColor: mutedColor,
          backgroundColor,
        }}
        className={`rounded-full w-16 p-1 items-center opacity-80 ${
          isToggled ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <View
          style={{ backgroundColor: isToggled ? textColor : mutedColor }}
          className="h-6 w-6 rounded-full"
        ></View>
      </View>
    </Animated.View>
  );
};
