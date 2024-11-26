import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import React from 'react';

const AIAnimation = ({ size = 120 }: { size?: number }) => {
  const sizeStyles = { width: size, height: size };
  return (
    <View
      style={[styles.container, sizeStyles]}
      className="items-center justify-center animate-fly-ai"
    >
      <Image
        style={[styles.image, styles.imageMonochrome, sizeStyles]}
        source={require('@/assets/images/icon_anim_inactive.png')}
        contentFit="fill"
      />
      <View
        className="animate-pulse-ai"
        style={[styles.imageContainer, sizeStyles]}
      >
        <Image
          style={[styles.image, styles.imageColored, sizeStyles]}
          source={require('@/assets/images/icon_anim_active.png')}
          contentFit="fill"
          transition={2000}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    position: 'absolute',
  },
  imageMonochrome: {
    zIndex: 20,
  },
  imageContainer: {
    zIndex: 10,
  },
  imageColored: {},
});

export default AIAnimation;
