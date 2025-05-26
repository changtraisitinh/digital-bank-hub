import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withDelay,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
type PaymentSuccessProps = {
  serviceType: 'water' | 'electricity' | 'internet';
  transactionId: string;
  amount: number;
  token?: string; // Optional token for prepaid meters
  onDownloadReceipt?: () => void;
  onTrackUsage?: () => void;
  onSetAlerts?: () => void;
};

// Components
function SuccessAnimation() {
  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSequence(withSpring(1.2), withDelay(200, withSpring(1))),
        },
      ],
    };
  });

  return (
    <Animated.View style={iconStyle} className="mb-4 items-center">
      <View className="rounded-full bg-green-100 p-4">
        <MaterialIcons name="check-circle" size={64} color="#22c55e" />
      </View>
    </Animated.View>
  );
}

function ReceiptDetails({
  transactionId,
  amount,
  token,
}: {
  transactionId: string;
  amount: number;
  token?: string;
}) {
  return (
    <View className="mb-6 rounded-xl bg-white p-4 shadow-sm">
      <View className="mb-4 flex-row justify-between border-b border-gray-100 pb-4">
        <Text className="text-gray-600">Transaction ID</Text>
        <Text className="font-medium">{transactionId}</Text>
      </View>
      <View className="mb-4 flex-row justify-between border-b border-gray-100 pb-4">
        <Text className="text-gray-600">Amount Paid</Text>
        <Text className="font-medium">{amount.toLocaleString('vi-VN')}₫</Text>
      </View>
      {token && (
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Token</Text>
          <Text className="font-medium">{token}</Text>
        </View>
      )}
    </View>
  );
}

function ActionButton({
  icon,
  title,
  onPress,
  variant = 'primary',
}: {
  icon: string;
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Pressable
      className={`mb-3 rounded-lg p-4 ${
        variant === 'primary' ? 'bg-blue-500' : 'bg-gray-100'
      }`}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-center">
        <MaterialIcons
          name={icon as any}
          size={20}
          color={variant === 'primary' ? 'white' : '#666'}
        />
        <Text
          className={`ml-2 text-center font-semibold ${
            variant === 'primary' ? 'text-white' : 'text-gray-700'
          }`}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

// Main Component
export function PaymentSuccessScreen({
  serviceType,
  transactionId,
  amount,
  token,
  onDownloadReceipt,
  onTrackUsage,
  onSetAlerts,
}: PaymentSuccessProps) {
  const router = useRouter();

  const getServiceTitle = () => {
    switch (serviceType) {
      case 'water':
        return 'Water Bill Payment';
      case 'electricity':
        return 'Electricity Bill Payment';
      case 'internet':
        return 'Internet Bill Payment';
      default:
        return 'Bill Payment';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <SuccessAnimation />

        <Text className="mb-2 text-center text-2xl font-bold">
          Payment Successful!
        </Text>
        <Text className="mb-6 text-center text-gray-600">
          {getServiceTitle()}
        </Text>

        <ReceiptDetails
          transactionId={transactionId}
          amount={amount}
          token={token}
        />

        <View className="mb-6">
          <ActionButton
            icon="download"
            title="Download Receipt"
            onPress={onDownloadReceipt || (() => {})}
            variant="primary"
          />
          <ActionButton
            icon="analytics"
            title="Track Usage"
            onPress={onTrackUsage || (() => {})}
            variant="secondary"
          />
          <ActionButton
            icon="notifications"
            title="Set Usage Alerts"
            onPress={onSetAlerts || (() => {})}
            variant="secondary"
          />
        </View>

        <Pressable
          className="rounded-lg border border-gray-200 p-4"
          onPress={() => router.push('/payments')}
        >
          <Text className="text-center text-gray-600">Back to Payments</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
