import { router } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

type BillDetails = {
  provider: string;
  providerLogo: any;
  billingPeriod: {
    start: string;
    end: string;
  };
  consumption: {
    amount: number;
    unit: string;
    comparison: number;
  };
  breakdown: {
    usage: number;
    serviceFee: number;
    latePenalty?: number;
  };
  totalDue: number;
};

const billDetails: BillDetails = {
  provider: 'SAWACO',
  providerLogo: require('../../../assets/images/partners/sawaco.png'),
  billingPeriod: {
    start: '01/07/2024',
    end: '31/07/2024',
  },
  consumption: {
    amount: 18,
    unit: 'm³',
    comparison: 5,
  },
  breakdown: {
    usage: 1200000,
    serviceFee: 300000,
    latePenalty: 350000,
  },
  totalDue: 1850000,
};

function BillDetailsCard({ details }: { details: BillDetails }) {
  const { t } = useTranslation();
  const isComparisonPositive = details.consumption.comparison > 0;

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      {/* Provider Header */}
      <View className="mb-4 flex-row items-center">
        <Image
          source={details.providerLogo}
          className="size-12 rounded-lg"
          resizeMode="contain"
        />
        <View className="ml-3">
          <Text className="text-lg font-semibold">{details.provider}</Text>
          <Text className="text-sm text-neutral-500">
            {details.billingPeriod.start} - {details.billingPeriod.end}
          </Text>
        </View>
      </View>

      {/* Consumption */}
      <View className="mb-4">
        <Text className="mb-1 text-sm text-neutral-500">
          {t('consumption')}
        </Text>
        <View className="flex-row items-baseline">
          <Text className="text-2xl font-bold">
            {details.consumption.amount}
            {details.consumption.unit}
          </Text>
          <Text
            className={`ml-2 text-sm ${
              isComparisonPositive ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {isComparisonPositive ? '+' : ''}
            {details.consumption.comparison}% {t('vsLastMonth')}
          </Text>
        </View>
      </View>

      {/* Breakdown */}
      <View className="mb-4 space-y-2">
        <Text className="mb-2 text-sm text-neutral-500">{t('breakdown')}</Text>
        <View className="flex-row justify-between">
          <Text className="text-neutral-600">{t('waterUsage')}</Text>
          <Text className="font-medium">
            {formatCurrency(details.breakdown.usage)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-neutral-600">{t('serviceFee')}</Text>
          <Text className="font-medium">
            {formatCurrency(details.breakdown.serviceFee)}
          </Text>
        </View>
        {details.breakdown.latePenalty && (
          <View className="flex-row justify-between">
            <Text className="text-neutral-600">{t('latePenalty')}</Text>
            <Text className="font-medium text-red-500">
              {formatCurrency(details.breakdown.latePenalty)}
            </Text>
          </View>
        )}
      </View>

      {/* Total Due */}
      <View className="border-t border-neutral-200 pt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold">{t('totalDue')}</Text>
          <Text className="text-xl font-bold text-primary-600">
            {formatCurrency(details.totalDue)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function SafetyNote() {
  const { t } = useTranslation();

  return (
    <View className="mt-4 rounded-xl bg-yellow-50 p-4">
      <View className="flex-row items-start">
        <Text className="mr-2 text-xl text-yellow-600">⚠️</Text>
        <Text className="flex-1 text-yellow-800">{t('safetyNote')}</Text>
      </View>
    </View>
  );
}

export default function BillConfirmationScreen() {
  const { t } = useTranslation();

  const handleConfirmPayment = () => {
    // Navigate to payment success screen
    router.push('/payments/payment-success');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView className="flex-1 p-4">
        <Text className="mb-6 text-2xl font-bold">{t('confirmPayment')}</Text>

        <BillDetailsCard details={billDetails} />
        <SafetyNote />
      </ScrollView>

      <View className="border-t border-neutral-200 bg-white p-4">
        <Button onPress={handleConfirmPayment} className="w-full">
          {t('confirmAndPay')}
        </Button>
      </View>
    </SafeAreaView>
  );
}
