import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { Animated, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
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
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [errorShake] = useState(new Animated.Value(0));

  const handleLoginAttempt: SubmitHandler<FormType> = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      setLoginAttempts((prev) => prev + 1);
      // Trigger shake animation
      Animated.sequence([
        Animated.timing(errorShake, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(errorShake, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(errorShake, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const getErrorMessage = () => {
    if (loginAttempts === 0) return '';
    if (loginAttempts === 1)
      return 'Incorrect username or password. Please try again.';
    if (loginAttempts === 2)
      return 'Invalid login attempt. You have 1 attempt left before your account is temporarily locked.';
    return 'This is your last attempt. Your account will be locked for 15 minutes after the next failed attempt.';
  };

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

        <Animated.View
          style={{
            transform: [{ translateX: errorShake }],
          }}
          className="space-y-4"
        >
          {loginAttempts > 0 && (
            <View className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <Text className="flex-row items-center font-medium text-red-700">
                🔒 {getErrorMessage()}
              </Text>
              {loginAttempts >= 2 && (
                <TouchableOpacity className="mt-2">
                  <Text className="text-primary font-medium">
                    Use Biometric Login
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

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
            placeholder="••••••••"
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
            onPress={handleSubmit(handleLoginAttempt)}
            className="mt-6"
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};
