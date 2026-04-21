import { Picker } from '@react-native-picker/picker';
import {
  confirmPlatformPayPayment,
  initPaymentSheet,
  initStripe,
  PlatformPay,
} from '@stripe/stripe-react-native';
import { usePlatformPay } from '@stripe/stripe-react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Image } from 'expo-image';
import { router, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCreatePaymentIntent } from '@/api';

// Types
type BillHistory = {
  id: string;
  date: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
};

type UsageData = {
  currentMonth: number;
  previousMonth: number;
  estimate: number;
  dueDate: string;
};

type Provider = 'EVN' | 'EVN_HCMC' | 'EVN_HANOI' | 'EVN_DANANG';

type PaymentIntentResponse = {
  clientSecret: string;
  paymentIntent: {
    id: string;
    status: string;
    amount: number;
    currency: string;
  };
};

// Components
function QuickPayCard() {
  const [loading, setLoading] = React.useState(false);
  const [paymentError, setPaymentError] = React.useState<string | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState<string>('cash');
  const [showMoreMethods, setShowMoreMethods] = React.useState(false);

  const createPaymentIntent = useCreatePaymentIntent();

  const fetchPaymentIntentClientSecret = async () => {
    try {
      setIsInitializing(true);
      setPaymentError(null);

      const variables = {
        description: 'Electricity bill payment',
        amount: 1000,
        currency: 'usd',
      };

      setLoading(true);

      const response = await createPaymentIntent.mutateAsync(variables);

      console.log('🚀 Payment Intent Response:', response);

      if (!response || typeof response !== 'object') {
        throw new Error('Invalid payment intent response');
      }

      const paymentResponse = response as unknown as PaymentIntentResponse;

      if (!paymentResponse?.clientSecret) {
        throw new Error('No client secret received');
      }

      setClientSecret(paymentResponse.clientSecret);
      return paymentResponse.clientSecret;
    } catch (error) {
      console.error('Error fetching client secret:', error);
      setPaymentError('Failed to initialize payment. Please try again.');
      Alert.alert('Error', 'Failed to initialize payment. Please try again.', [
        { text: 'OK' },
      ]);
      return null;
    } finally {
      setLoading(false);
      setIsInitializing(false);
    }
  };

  const pay = async () => {
    if (!clientSecret) {
      Alert.alert('Error', 'Payment session not initialized');
      return;
    }

    try {
      setLoading(true);

      const { error } = await confirmPlatformPayPayment(clientSecret, {
        googlePay: {
          testEnv: true,
          merchantName: 'Di-Bank Solutions, Inc.',
          merchantCountryCode: 'US',
          currencyCode: 'USD',
          billingAddressConfig: {
            format: PlatformPay.BillingAddressFormat.Full,
            isPhoneNumberRequired: true,
            isRequired: true,
          },
        },
      });

      if (error) {
        switch (error.code) {
          case 'Canceled':
            Alert.alert('Payment Cancelled', 'You cancelled the payment');
            break;
          case 'Failed':
            Alert.alert(
              'Payment Failed',
              'Please try again or use a different payment method'
            );
            break;
          default:
            Alert.alert(
              'Error',
              error.message || 'Something went wrong with the payment'
            );
        }
        return;
      }

      Alert.alert(
        'Payment Successful',
        'Your electricity bill payment has been processed successfully',
        [
          {
            text: 'View Receipt',
            onPress: () => {
              router.push('/payments/receipt');
            },
          },
          {
            text: 'OK',
            onPress: () => {
              router.push('/payments/services/electricity/confirm');
            },
          },
          {
            text: 'Cancel',
            onPress: () => {
              router.push('/payments/services/electricity/confirm');
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again later.'
      );
      console.error('Payment error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="mb-4 rounded-xl bg-white p-4 shadow-lg">
      <Image
        source={require('../../../../assets/images/partners/evn.png')}
        className="mb-4 h-12 w-24"
        contentFit="contain"
      />
      <View className="items-center rounded-lg bg-gray-100 p-4">
        <Text className="mb-2 text-gray-600">Scan QR Code</Text>
        <View className="size-32 rounded-lg bg-gray-200" />
      </View>

      {paymentError && (
        <View className="mb-4 rounded-lg bg-red-50 p-3">
          <Text className="text-center text-red-600">{paymentError}</Text>
        </View>
      )}

      {/* Enhanced Payment Method Selection */}
      <View className="mb-4">
        <Text className="mb-3 text-base font-semibold text-gray-800">
          Payment Method
        </Text>

        {/* Main Payment Methods */}
        <View className="mb-3 flex-row justify-between">
          {[
            {
              id: 'cash',
              label: 'Cash',
              icon: '💵',
              color: 'bg-green-50 border-green-200',
            },
            {
              id: 'transfer',
              label: 'Transfer',
              icon: '🏦',
              color: 'bg-blue-50 border-blue-200',
            },
            {
              id: 'ewallet',
              label: 'eWallet',
              icon: '👛',
              color: 'bg-purple-50 border-purple-200',
            },
          ].map((method) => (
            <Pressable
              key={method.id}
              onPress={() => setSelectedPaymentMethod(method.id)}
              className={`mx-1 flex-1 items-center rounded-xl border p-3 ${
                selectedPaymentMethod === method.id
                  ? `${method.color} border-2`
                  : 'border-gray-200 bg-white'
              }`}
            >
              <Text className="mb-1 text-xl">{method.icon}</Text>
              <Text
                className={`text-sm font-medium ${
                  selectedPaymentMethod === method.id
                    ? 'text-gray-800'
                    : 'text-gray-600'
                }`}
              >
                {method.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Additional Payment Methods */}
        <Pressable
          onPress={() => setShowMoreMethods(!showMoreMethods)}
          className="mb-2 flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2"
        >
          <Text className="text-sm font-medium text-gray-600">
            More Payment Methods
          </Text>
          <Text className="text-gray-500">{showMoreMethods ? '▲' : '▼'}</Text>
        </Pressable>

        {showMoreMethods && (
          <View className="flex-row flex-wrap gap-2">
            {[
              { id: 'stripe', label: 'Credit Card', icon: '💳' },
              { id: 'paypal', label: 'PayPal', icon: '🔷' },
              { id: 'apple', label: 'Apple Pay', icon: '🍎' },
              { id: 'google', label: 'Google Pay', icon: 'G' },
            ].map((method) => (
              <Pressable
                key={method.id}
                onPress={() => setSelectedPaymentMethod(method.id)}
                className={`flex-row items-center rounded-full border px-3 py-2 ${
                  selectedPaymentMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text className="mr-1">{method.icon}</Text>
                <Text
                  className={`text-sm ${
                    selectedPaymentMethod === method.id
                      ? 'text-blue-600'
                      : 'text-gray-600'
                  }`}
                >
                  {method.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Pressable
        className={`mb-4 rounded-lg ${
          loading || isInitializing ? 'bg-gray-400' : 'bg-[#0066FF]'
        } px-4 py-3`}
        onPress={async () => {
          try {
            const secret = await fetchPaymentIntentClientSecret();
            if (secret) {
              await pay();
            }
          } catch (error) {
            console.error('Payment initialization error:', error);
            setPaymentError('Failed to initialize payment. Please try again.');
            Alert.alert(
              'Error',
              'Failed to initialize payment. Please try again.'
            );
          }
        }}
        disabled={loading || isInitializing}
      >
        <Text className="text-center font-semibold text-white">
          {loading
            ? 'Processing Payment...'
            : isInitializing
              ? 'Initializing...'
              : 'Pay Electricity Bill'}
        </Text>
      </Pressable>
    </View>
  );
}

function UsageInsights({ data }: { data: UsageData }) {
  const { width } = useWindowDimensions();

  return (
    <View className="mb-4 rounded-xl bg-white p-4 shadow-lg">
      <Text className="mb-4 text-lg font-semibold">Usage Insights</Text>
      <LineChart
        data={{
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              data: [data.previousMonth, data.currentMonth],
            },
          ],
        }}
        width={width - 40}
        height={180}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 102, 255, ${opacity})`,
        }}
        bezier
        style={{ borderRadius: 16 }}
      />
      <View className="mt-4">
        <Text className="text-gray-600">
          Dự kiến: {data.estimate.toLocaleString('vi-VN')}₫
        </Text>
        <Text className="mt-2 text-red-500">Pay Before {data.dueDate}</Text>
      </View>
    </View>
  );
}

function HistoryShortcut({ bills }: { bills: BillHistory[] }) {
  return (
    <View className="rounded-xl bg-white p-4 shadow-lg">
      <Text className="mb-4 text-lg font-semibold">Recent Payments</Text>
      {bills.map((bill) => (
        <View
          key={bill.id}
          className="flex-row items-center justify-between border-b border-gray-100 py-3"
        >
          <View>
            <Text className="font-medium">{bill.date}</Text>
            <Text className="text-gray-500">
              {bill.amount.toLocaleString('vi-VN')}₫
            </Text>
          </View>
          <View
            className={`rounded-full px-3 py-1 ${
              bill.status === 'success'
                ? 'bg-green-100'
                : bill.status === 'pending'
                  ? 'bg-yellow-100'
                  : 'bg-red-100'
            }`}
          >
            <Text
              className={
                bill.status === 'success'
                  ? 'text-green-600'
                  : bill.status === 'pending'
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }
            >
              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// Main Component
export default function ElectricityScreen() {
  const mockData: UsageData = {
    currentMonth: 450,
    previousMonth: 380,
    estimate: 1250000,
    dueDate: '25/08/2024',
  };

  const mockBills: BillHistory[] = [
    {
      id: '1',
      date: '15/07/2024',
      amount: 1150000,
      status: 'success',
    },
    {
      id: '2',
      date: '15/06/2024',
      amount: 980000,
      status: 'success',
    },
    {
      id: '3',
      date: '15/05/2024',
      amount: 1250000,
      status: 'success',
    },
  ];

  const [publishableKey, setPublishableKey] = React.useState('');
  const [clientSecret] = React.useState<string | null>(null);

  const { isPlatformPaySupported } = usePlatformPay();

  const fetchKey = async () => {
    const key =
      'pk_test_51RR4FeI5sqndwyBEp3aQjy2yLUUgU1N8lW9u1ghF2Tn7F4joD5cwKd2I65xp1ofs2af4SVYjatRfHMWVhFDAaZFB00O1PKEbmE';
    return key;
  };

  const setup = async () => {
    await initStripe({
      publishableKey: publishableKey,
      merchantIdentifier: 'your_merchant_identifier',
    });

    if (clientSecret) {
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Di-Bank Solutions, Inc.',
        paymentIntentClientSecret: clientSecret,
      });

      if (error) {
        console.log(error);
      }
    }
  };

  const fetchPublishableKey = async () => {
    const key = await fetchKey();
    setPublishableKey(key);
  };

  React.useEffect(() => {
    fetchPublishableKey();

    (async function () {
      if (!(await isPlatformPaySupported({ googlePay: { testEnv: true } }))) {
        Alert.alert('Google Pay is not supported.');
        return;
      }
    })();

    console.log('setup initPaymentSheet');
    setup();
  }, [clientSecret]);

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.identifier"
      urlScheme="your-url-scheme"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 p-4">
          <QuickPayCard />
          <UsageInsights data={mockData} />
          <HistoryShortcut bills={mockBills} />
        </ScrollView>
      </SafeAreaView>
    </StripeProvider>
  );
}

export function BillInputScreen() {
  const [selectedProvider, setSelectedProvider] =
    React.useState<Provider>('EVN');
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 justify-center bg-white">
      <View className="p-4">
        <Text className="mb-4 text-center text-blue-500">
          Chọn nhà cung cấp điện
        </Text>
        <View className="rounded-lg bg-gray-50 p-4">
          <Text className="mb-2 font-medium">Nhà cung cấp</Text>
          <View className="mb-4 rounded-lg border border-gray-200">
            <Picker
              selectedValue={selectedProvider}
              onValueChange={(value: Provider) => setSelectedProvider(value)}
            >
              <Picker.Item label="EVN" value="EVN" />
              <Picker.Item label="EVN HCMC" value="EVN_HCMC" />
              <Picker.Item label="EVN Hanoi" value="EVN_HANOI" />
              <Picker.Item label="EVN Da Nang" value="EVN_DANANG" />
            </Picker>
          </View>
          <Pressable
            className="rounded-lg bg-blue-500 py-3"
            onPress={() =>
              router.push('/payments/services/electricity/confirm')
            }
          >
            <Text className="text-center font-semibold text-white">
              Tiếp tục
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
