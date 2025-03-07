import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { Text } from '@/components/Text';
import {
  AUTH_EMAIL,
  AUTH_NAME,
  AUTH_PASSWORD,
  DEFAULT_REDIRECT_URL,
} from '@/core/constants';
import { useSession } from '@/core/context/SessionProvider';
import { logMessage } from '@/core/functions/helpers';
import { useToast } from '@/core/hooks/useToast';
import { signUpSchema, SignUpFormData } from '@/core/utils/validation';
import AuthScreen from '@/components/AuthScreen';
import AIAnimation from '@/components/AIAnimation';

const SignUp = () => {
  const { isLoading, signUp } = useSession();
  const { showToast } = useToast();
  const { control, handleSubmit, setValue } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // fill out the form
  useEffect(() => {
    setValue('name', AUTH_NAME);
    setValue('email', AUTH_EMAIL);
    setValue('password', AUTH_PASSWORD);
  }, []);

  const onSubmit: SubmitHandler<SignUpFormData> = async (
    data: SignUpFormData
  ) => {
    try {
      const registered = await signUp({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (registered) {
        await logMessage('[ AU ] signed up');
        router.replace(DEFAULT_REDIRECT_URL);
      }
    } catch (error: any) {
      showToast('Unable to register');
      await logMessage(
        `[ AU ] sign up error: ${error.message || JSON.stringify(error)}`,
        'error'
      );
    }
  };

  return (
    <AuthScreen>
      <>
        <View className="flex-row justify-center">
          <AIAnimation />
        </View>
        <Text className="text-3xl font-pbold text-center">Sign Up</Text>
        <Controller
          control={control}
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <FormField
              name="name"
              label="Name"
              value={value}
              onBlur={onBlur}
              handleChangeText={onChange}
              containerClassName="mt-8"
              error={error}
            />
          )}
          name="name"
        />

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
              containerClassName="mt-4"
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
          title="Sign Up"
          handlePress={handleSubmit(onSubmit)}
          containerClassName="mt-8"
          isLoading={isLoading}
        />
        <View className="flex items-center justify-center py-8 flex-row gap-3">
          <Text colorName="muted" className="font-pmedium py-4">
            Have an account already?
          </Text>
          <Link href="/sign-in" className="ml-4 py-4 pr-4">
            <Text className="font-pmedium text-lg">Sign In</Text>
          </Link>
        </View>
      </>
    </AuthScreen>
  );
};

export default SignUp;
