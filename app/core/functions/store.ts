import * as SecureStore from 'expo-secure-store';

import { KEY_AUTH_DATA } from '@/core/constants';

import { StoreAuthData, UserAuthData } from '@/core/types/auth';
import { Result, Status } from '@/core/types/common';

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
