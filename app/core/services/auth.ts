import { API_BASE_URL } from '@/core/constants';
import { BASE_HEADERS } from '@/core/constants';
import { AuthCredentials, UserAuthData } from '@/core/types/auth';
import { Response } from '@/core/types/common';

export const postSignUp = async ({
  name,
  email,
  password,
}: AuthCredentials): Promise<Response<UserAuthData> | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: BASE_HEADERS,
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });
    const resData = await response.json();
    if (!resData) {
      return {
        data: null,
        error: { message: 'Server error. Please try again later.' },
      };
    }
    if (resData.error) {
      return {
        data: null,
        error: { message: resData.error.message },
      };
    }
    const { token, user } = resData.data;
    if (!token || !user) {
      return {
        data: null,
        error: {
          message:
            'Could not register. Failed to retrieve data from the server.',
        },
      };
    }
    return {
      data: { token, user },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message:
          err?.response?.data?.msg ||
          'Something went wrong. Please try again later.',
      },
    };
  }
};

export const postSignIn = async ({
  email,
  password,
}: AuthCredentials): Promise<Response<UserAuthData> | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: BASE_HEADERS,
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const resData = await response.json();
    if (!resData) {
      return {
        data: null,
        error: { message: 'Server error. Please try again later.' },
      };
    }
    if (resData.error) {
      return {
        data: null,
        error: { message: resData.error.message },
      };
    }
    const { token, user } = resData.data;
    if (!token || !user) {
      return {
        data: null,
        error: {
          message: 'Could not log in. Failed to retrieve data from the server.',
        },
      };
    }
    return {
      data: { token, user },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message:
          err?.response?.data?.msg ||
          'Something went wrong. Please try again later.',
      },
    };
  }
};
