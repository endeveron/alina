import { router } from 'expo-router';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

import { DEFAULT_REDIRECT_URL } from '@/core/constants';
import {
  deleteAuthDataFromSecureStore,
  getAuthDataFromSecureStore,
  saveAuthDataInSecureStore,
} from '@/core/functions/store';
import { useToast } from '@/core/hooks/useToast';
import { postSignIn, postSignUp } from '@/core/services/auth';
import {
  AuthCredentials,
  AuthSession,
  SessionContext as TSessionContext,
  UserAuthData,
} from '@/core/types/auth';
import { logMessage } from '@/core/functions/helpers';

const SessionContext = createContext<TSessionContext>({
  session: null,
  isLoading: false,
  signUp: async (args: AuthCredentials) => false,
  signIn: async (args: AuthCredentials) => false,
  signOut: async () => {},
});

export const useSession = () => {
  const value = useContext(SessionContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }
  return value;
};

const SessionProvider = ({ children }: PropsWithChildren) => {
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<AuthSession>(null);

  const signOut = async () => {
    try {
      // delete auth data from store
      const authRes = await deleteAuthDataFromSecureStore();
      if (authRes?.error) {
        await logMessage(
          `[ CL ] unable to delete auth data from store: ${authRes.error.message}`,
          'error'
        );
      }
      await logMessage('[ CL ] auth data removed from store', 'success');

      // reset auth session
      setSession(null);
      await logMessage('[ AU ] sign out');
      router.replace('/sign-in');
    } catch (error: any) {
      // showToast('Unable to sign out');
      await logMessage(
        `[ CL ] unable to clear data. ${error.message}`,
        'error'
      );
    }
  };

  /** Updates auth state, adds auth data to SecureStore. */
  const saveAuthData = async ({ token, user }: UserAuthData) => {
    setSession({ token, user });

    const result = await saveAuthDataInSecureStore({ token, user });
    if (result.error) {
      showToast(result.error.message);
      return;
    }
  };

  /** Gets auth data from SecureStore, updates auth state. */
  const restoreAuthData = async () => {
    const result = await getAuthDataFromSecureStore();
    if (result.error) {
      showToast(result.error.message);
      return;
    }
    if (result.data) {
      const { timestamp: prevTimestamp, ...authData } = result.data;
      // check if the token is valid
      const currentTimestamp = Date.now();
      const tokenValidityTime = 48 * 60 * 60 * 1000; // 48h
      if (currentTimestamp - prevTimestamp < tokenValidityTime) {
        setSession(authData);
        router.push(DEFAULT_REDIRECT_URL);
      } else {
        signOut();
      }
    }
  };

  // Get auth data from SecureStore
  useEffect(() => {
    restoreAuthData();
  }, []);

  const signUp = async ({
    name,
    email,
    password,
  }: AuthCredentials): Promise<boolean | undefined> => {
    try {
      setIsLoading(true);
      const result = await postSignUp({ name, email, password });
      setIsLoading(false);
      if (result?.error) {
        showToast(result.error.message);
        console.error(result.error.message);
        return false;
      }
      if (result?.data) {
        await saveAuthData(result.data);
        return true;
      }
    } catch (error: any) {
      showToast(error.message);
      console.error(error.message);
      return false;
    }
  };

  const signIn = async ({
    email,
    password,
  }: AuthCredentials): Promise<boolean | undefined> => {
    try {
      setIsLoading(true);
      const result = await postSignIn({ email, password });
      setIsLoading(false);

      if (result?.error) {
        showToast(result.error.message);
        console.error(result.error.message);
        return false;
      }
      if (result?.data) {
        await saveAuthData(result.data);
        return true;
      }
    } catch (error: any) {
      showToast(error.message);
      console.error(error.message);
      return false;
    }
  };

  const value = {
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export default SessionProvider;
