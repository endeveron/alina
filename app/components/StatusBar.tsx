import { StatusBar as ExpoStatusBar, StatusBarProps } from 'expo-status-bar';
// import { useColorScheme } from 'react-native';

export function StatusBar(props: StatusBarProps) {
  // const theme = useColorScheme() ?? 'light';

  return (
    <ExpoStatusBar
      // style={theme === 'light' ? 'dark' : 'light'}
      style="light"
      backgroundColor="transparent"
      {...props}
    />
  );
}
