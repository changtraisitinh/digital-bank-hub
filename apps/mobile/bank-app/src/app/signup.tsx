import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import * as z from 'zod';

import { useSignUp } from '@/api';
import { Button, ControlledInput, Text, View } from '@/components/ui';
import { LogoIcon } from '@/components/ui/icons';

const schema = z
  .object({
    fullName: z
      .string({
        required_error: 'Full name is required',
      })
      .min(2, 'Name must be at least 2 characters'),
    // email: z
    //   .string({
    //     required_error: 'Email is required',
    //   })
    //   .email('Invalid email format'),
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
        'Password must contain uppercase, lowercase, and number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormType = z.infer<typeof schema>;

export default function Signup() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { handleSubmit, control } = useForm<FormType>({
    resolver: zodResolver(schema),
  });

  // Use the account list mutation
  const signup = useSignUp();

  const onSubmit = (data: FormType) => {
    console.log(data);
    const variables = {
      username: data.username,
      email: data.email || 'user3@gmail.com',
      password: data.password,
      fullName: data.fullName,
      phone: '1234567894',
      address: '',
      dob: '',
      gender: 'M',
      avatarUrl: '',
      nationality: 'VN',
      occupation: '',
    };

    signup.mutate(variables, {
      onSuccess: (response) => {
        if (response.status === 0) {
          router.push('/');
        }
      },
      onError: (error) => {
        console.log('Signup error:', error);
        // Here you can add error handling UI feedback
      },
    });
    // Remove the redundant router.push('/') here
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-12">
          {/* Header */}
          <View className="mb-8 items-center">
            <LogoIcon size={80} color="#2e7d32" />
            <Text className="text-primary mt-4 text-3xl font-bold">
              Create Account
            </Text>
            <Text className="mt-2 text-center text-gray-500">
              Join millions of users banking smarter
            </Text>
          </View>

          {/* Form */}
          <View className="space-y-4">
            <ControlledInput
              control={control}
              name="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoCorrect={false}
            />

            <ControlledInput
              control={control}
              name="email"
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <ControlledInput
              control={control}
              name="username"
              label="Username"
              placeholder="Choose a username"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <ControlledInput
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

            <ControlledInput
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              label="Create Account"
              onPress={handleSubmit(onSubmit)}
              className="mt-6"
              textClassName="text-white font-semibold text-base"
            />
          </View>

          {/* Footer */}
          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('login')}>
              <Text className="text-primary font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
