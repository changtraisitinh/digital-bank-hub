import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import * as z from 'zod';

import { Button, ControlledInput, Text, View } from '@/components/ui';
import { LogoIcon } from '@/components/ui/icons';

const schema = z.object({
  username: z
    .string({
      required_error: 'Username is required',
    })
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      // /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
      /[\s\S]*/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export const LoginForm = ({ onSubmit = () => {} }: LoginFormProps) => {
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center p-4">
        <View className="mb-8 items-center justify-center">
          <LogoIcon size={80} color="#2e7d32" />
          <Text className="text-primary mt-4 text-3xl font-bold">
            Welcome Back
          </Text>
          <Text className="mt-2 text-center text-gray-500">
            Please sign in to continue to your account
          </Text>
        </View>

        <View className="space-y-4">
          <ControlledInput
            testID="username-input"
            control={control}
            name="username"
            label="Username"
            placeholder="Enter your username"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <ControlledInput
            testID="password-input"
            control={control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            rightElement={
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="px-3"
              >
                <Text className="text-primary">
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            }
          />

          <TouchableOpacity className="self-end">
            <Text className="text-primary">Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            testID="login-button"
            label="Sign In"
            onPress={handleSubmit(onSubmit)}
            className="mt-6"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
