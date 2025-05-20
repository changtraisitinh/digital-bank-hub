import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, TouchableOpacity } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';

// Carousel data for value propositions
const carouselData = [
  {
    id: '1',
    icon: '⚡',
    title: 'Instant Transfers',
    description: 'Send money to anyone in seconds.',
  },
  {
    id: '2',
    icon: '🔒',
    title: 'Security',
    description: 'Biometric login and 24/7 fraud monitoring.',
  },
  {
    id: '3',
    icon: '📊',
    title: 'Budgeting',
    description: 'Track spending with smart analytics.',
  },
];

export default function Onboarding() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeSlide, setActiveSlide] = useState(0);
  const screenWidth = Dimensions.get('window').width;

  // Render carousel item
  const renderCarouselItem = ({ item }) => (
    <View className="items-center justify-center px-4">
      <Text className="mb-4 text-6xl">{item.icon}</Text>
      <Text className="mb-2 text-center text-2xl font-bold">{item.title}</Text>
      <Text className="text-center text-base text-gray-600">
        {item.description}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <FocusAwareStatusBar />

      {/* Welcome Section */}
      <View className="flex-1">
        <View className="items-center justify-center pb-8 pt-12">
          <Text className="mb-2 text-3xl font-bold">
            Welcome to Digital Bank
          </Text>
          <Text className="px-8 text-center text-lg text-gray-600">
            Banking made simple, secure, and fast.
          </Text>
        </View>

        {/* Value Proposition Carousel */}
        <View className="flex-1 justify-center">
          <Carousel
            data={carouselData}
            renderItem={renderCarouselItem}
            width={screenWidth}
            height={screenWidth * 0.8}
            onSnapToItem={setActiveSlide}
            mode="parallax"
          />

          {/* Carousel Indicators */}
          <View className="mt-4 flex-row justify-center space-x-2">
            {carouselData.map((_, index) => (
              <View
                key={index}
                className={`size-2 rounded-full ${
                  activeSlide === index ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View
          className="px-6 pb-6"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Button
            label="Get Started"
            onPress={() => {
              setIsFirstTime(false);
              router.replace('/register');
            }}
            className="mb-4"
          />

          <TouchableOpacity
            onPress={() => {
              setIsFirstTime(false);
              router.replace('/login');
            }}
          >
            <Text className="text-primary text-center text-base">
              Already have an account? Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
