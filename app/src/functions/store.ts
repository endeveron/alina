import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';

import {
  KEY_AUDIO_PERMISSION,
  KEY_AUTH_DATA,
  KEY_CHAT_LANG_CODE,
  KEY_CHAT_TRANSCRIPT,
  KEY_GREET,
} from '@/constants/store';

import { StoreAuthData, UserAuthData } from '@/types/auth';
import { Result, Status } from '@/types/common';

/** MMKV Storage */
const storage = new MMKV();

/**
 * Checks whether the MMKV storage contains the item with the provided key.
 * @returns a boolean
 */
export const checkStorageItem = (key: string): boolean => {
  return storage.contains(key);
};

/**
 * Retrieves a number by the provided key from the MMKV storage.
 * @returns a boolean
 */
export const getStorageNumber = (key: string): number | undefined => {
  return storage.getNumber(key);
};

/**
 * Stores a number with the provided key in the MMKV storage.
 */
export const setStorageNumber = (key: string, number: number): void => {
  storage.set(key, number);
};

/** Secure Store */

/**
 * Retrieves authentication data including token and user information from SecureStore.
 * @returns a Promise that resolves to an object of type `Result` { token, user }
 */
export const getAuthDataFromSecureStore = async (): Promise<
  Result<StoreAuthData>
> => {
  try {
    const authDataStr = await SecureStore.getItemAsync(KEY_AUTH_DATA);
    if (!authDataStr)
      return {
        data: null,
        error: null,
      };
    const data = JSON.parse(authDataStr as string);
    return {
      data,
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message ?? 'Could not get auth data from store' },
    };
  }
};

/**
 * Stores authentication data in SecureStore
 * @param authData StoreAuthData
 * @returns a Promise that resolves to an object of type
 * `Result` Status indicating success or failure.
 */
export const saveAuthDataInSecureStore = async (
  authData: UserAuthData
): Promise<Result<Status>> => {
  try {
    const data = {
      ...authData,
      timestamp: Date.now(),
    };
    const authDataStr = JSON.stringify(data);
    await SecureStore.setItemAsync(KEY_AUTH_DATA, authDataStr);
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: 'Could not save auth data in store' },
    };
  }
};

/**
 * Deletes authentication data from SecureStore.
 * @returns a Promise that resolves to an object of type
 * `Result` Status indicating success or failure.
 */
export const deleteAuthDataFromSecureStore = async (): Promise<
  Result<Status>
> => {
  try {
    await SecureStore.deleteItemAsync(KEY_AUTH_DATA);
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: 'Could not clear auth data' },
    };
  }
};

/** Async Storage */

/**
 * Saves audio permission status in AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `Result` Status indicating success or failure.
 */
export const saveAudioPermissionStatusInAsyncStorage = async (): Promise<
  Result<Status>
> => {
  try {
    await AsyncStorage.setItem(KEY_AUDIO_PERMISSION, '1');
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message:
          err.message ?? 'unable to save audio permission status in storage',
      },
    };
  }
};

/**
 * Retrieves audio permission status from AsyncStorage.
 * @returns a Promise that resolves to an object of type `Result` boolean
 */
export const getAudioPermissionStatusFromAsyncStorage = async (): Promise<
  Result<boolean>
> => {
  try {
    const item = await AsyncStorage.getItem(KEY_AUDIO_PERMISSION);
    return {
      data: !!item,
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message:
          err.message ?? 'unable to get audio permission status from storage',
      },
    };
  }
};

/**
 * Saves chat transcript status in AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `Result` Status indicating success or failure.
 */
export const setAIMsgTranscrStatusInAsyncStorage = async (
  showTranscript: boolean
): Promise<Result<Status>> => {
  try {
    await AsyncStorage.setItem(KEY_CHAT_TRANSCRIPT, showTranscript.toString());
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message:
          err.message ?? 'unable to save chat transcript status in storage',
      },
    };
  }
};

/**
 * Retrieves chat transcript status from AsyncStorage.
 * @returns a Promise that resolves to an object of type `Result` boolean
 */
export const getAIMsgTranscrStatusFromAsyncStorage = async (): Promise<
  Result<boolean>
> => {
  try {
    const item = await AsyncStorage.getItem(KEY_CHAT_TRANSCRIPT);
    if (!item) {
      return {
        data: null,
        error: null,
      };
    }
    return {
      data: item === 'true',
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message:
          err.message ?? `unable to get chat transcript status from storage`,
      },
    };
  }
};

/**
 * Saves chat transcript status in AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `Result` Status indicating success or failure.
 */
export const saveChatLangCodeInAsyncStorage = async (
  langCode: string
): Promise<Result<Status>> => {
  try {
    await AsyncStorage.setItem(KEY_CHAT_LANG_CODE, langCode);
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message:
          err.message ?? 'unable to save audio permission status in storage',
      },
    };
  }
};

/**
 * Retrieves chat language code from AsyncStorage.
 * @returns a Promise that resolves to an object of type `Result` boolean
 */

export const getChatLangCodeFromAsyncStorage = async (): Promise<
  Result<string>
> => {
  try {
    const langCode = await AsyncStorage.getItem(KEY_CHAT_LANG_CODE);
    if (!langCode) {
      return {
        data: null,
        error: null,
      };
    }
    return {
      data: langCode,
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message: err.message ?? `unable to get chat language code from storage`,
      },
    };
  }
};

/**
 * Saves greet status in AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `Result` Status indicating success or failure.
 */
export const setGreetStatusInAsyncStorage = async (
  showGreet: boolean
): Promise<Result<Status>> => {
  try {
    await AsyncStorage.setItem(KEY_GREET, showGreet.toString());
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message: err.message ?? 'unable to save greet status in storage',
      },
    };
  }
};

/**
 * Retrieves greet status from AsyncStorage.
 * @returns a Promise that resolves to an object of type `Result` boolean
 */
export const getGreetStatusFromAsyncStorage = async (): Promise<
  Result<boolean>
> => {
  try {
    const item = await AsyncStorage.getItem(KEY_GREET);
    if (!item) {
      return {
        data: null,
        error: null,
      };
    }
    return {
      data: item === 'true',
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message: err.message ?? `unable to get greet status from storage`,
      },
    };
  }
};
