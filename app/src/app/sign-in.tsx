import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { View } from 'react-native';

import AIAnimation from '@/components/AIAnimation';
import AuthScreen from '@/components/AuthScreen';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Text } from '@/components/Text';
import { AUTH_EMAIL, AUTH_PASSWORD, DEFAULT_REDIRECT_URL } from '@/constants';
import { useSession } from '@/context/SessionProvider';
import { logMessage } from '@/functions/helpers';
import { useToast } from '@/hooks/useToast';
import { SignInFormData, signInSchema } from '@/utils/validation';

const SignIn = () => {
  const { isLoading, signIn, signOut } = useSession();
  const { showToast } = useToast();
  const { control, handleSubmit, setValue } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  // fill out the form
  useEffect(() => {
    setValue('email', AUTH_EMAIL);
    setValue('password', AUTH_PASSWORD);
  }, []);

  const onSubmit: SubmitHandler<SignInFormData> = async (
    data: SignInFormData
  ) => {
    // signOut();
    try {
      const loggedIn = await signIn({
        email: data.email,
        password: data.password,
      });
      if (loggedIn) {
        await logMessage('[ AU ] signed in', 'success');
        router.replace(DEFAULT_REDIRECT_URL);
      }
    } catch (error: any) {
      console.error(`SignIn: ${error}`);
      showToast('Unable to login');
      await logMessage(
        `[ AU ] sign in error: ${error.message || JSON.stringify(error)}`,
        'error'
      );
    }
  };

  return (
    <AuthScreen>
      <View className="flex-row justify-center">
        <AIAnimation />
      </View>
      <Text className="text-3xl font-pbold text-center">Sign In</Text>
      <Controller
        control={control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <FormField
            name="email"
            label="Email"
            value={value}
            onBlur={onBlur}
            handleChangeText={onChange}
            containerClassName="mt-8"
            error={error}
            keyboardType="email-address"
          />
        )}
        name="email"
      />
      <Controller
        control={control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <FormField
            name="password"
            label="Password"
            value={value}
            onBlur={onBlur}
            handleChangeText={onChange}
            containerClassName="mt-4"
            error={error}
          />
        )}
        name="password"
      />

      <Button
        title="Sign In"
        handlePress={handleSubmit(onSubmit)}
        containerClassName="mt-8"
        isLoading={isLoading}
      />
      <View className="flex items-center justify-center py-8 flex-row gap-3">
        <Text colorName="muted" className="font-pmedium py-4">
          Don't have an account?
        </Text>
        <Link href="/sign-up" className="ml-4 py-4 pr-4">
          <Text className="font-pmedium text-lg">Sign Up</Text>
        </Link>
      </View>
    </AuthScreen>
  );
};

export default SignIn;
