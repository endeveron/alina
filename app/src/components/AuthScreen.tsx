import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';

import { SafeAreaView } from '@/src/components/SafeAreaView';

const AuthScreen = ({ children }: PropsWithChildren) => {
  // const theme = useColorScheme() ?? 'light';
  // const opacity = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   Animated.timing(opacity, {
  //     toValue: 1,
  //     duration: 200,
  //     useNativeDriver: true,
  //     delay: 300,
  //   }).start();

  //   return () => {
  //     Animated.timing(opacity, {
  //       toValue: 0,
  //       duration: 500,
  //       useNativeDriver: true,
  //     }).start();
  //   };
  // }, []);

  // const renderBgImage = (theme: 'light' | 'dark') => {
  //   const imgSource =
  //     theme === 'light'
  //       ? require('@/assets/images/backgrounds/starwars-light.png')
  //       : require('@/assets/images/backgrounds/starwars-dark.png');
  //   return (
  //     <View className="absolute inset-x-0 inset-y-0 z-0">
  //       <Image
  //         className="w-full h-full"
  //         source={imgSource}
  //         resizeMode="cover"
  //       />
  //     </View>
  //   );
  // };

  // const bgImage = renderBgImage(theme);

  return (
    <SafeAreaView className="h-full">
      <ScrollView
        style={{ zIndex: 10 }}
        contentContainerStyle={{
          height: '100%',
        }}
      >
        {/* <Animated.View
          className="h-full flex justify-center p-4"
          style={{ opacity }}
        > */}
        <View className="h-full flex justify-center p-4">{children}</View>
        {/* </Animated.View> */}
      </ScrollView>
      {/* {bgImage} */}
    </SafeAreaView>
  );
};

export default AuthScreen;
