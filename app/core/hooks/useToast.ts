import { ToastAndroid } from 'react-native';

export function useToast() {
  const showToast = (message: string, long: boolean = false) => {
    ToastAndroid.show(message, long ? ToastAndroid.LONG : ToastAndroid.SHORT);
  };

  return {
    showToast,
  };
}
