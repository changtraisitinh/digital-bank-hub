import { Picker } from '@react-native-picker/picker';
import {
  confirmPlatformPayPayment,
  initPaymentSheet,
  initStripe,
  PlatformPay,
  PlatformPayButton,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import { usePlatformPay } from '@stripe/stripe-react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { Image } from 'expo-image';
import { router, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Button, Pressable, ScrollView, Text, View } from 'react-native';
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

// Components
function QuickPayCard() {
  const [loading, setLoading] = React.useState(false);
  const [showPayWithGooglePay, setShowPayWithGooglePay] = React.useState(false);
  const [clientSecret, setClientSecret] = React.useState(
    'pi_3RWHNHI5sqndwyBE0bUwBkfy_secret_X0KX291oh6CnwWjWatjC60s2Q'
  );

  const createPaymentIntent = useCreatePaymentIntent();

  const fetchPaymentIntentClientSecret = async () => {
    try {
      setLoading(true);

      const variables = {
        description: 'create payment intent for 1000 usd',
        amount: 1000,
        currency: 'usd',
      };
      const response = await createPaymentIntent.mutate(variables);

      // Log response for debugging
      console.log('🚀 Payment Intent Response:', response);

      const clientSecret =
        'pi_3RWHNHI5sqndwyBE0bUwBkfy_secret_X0KX291oh6CnwWjWatjC60s2Q';
      setClientSecret(clientSecret);
      return clientSecret;
    } catch (error) {
      console.error('Error fetching client secret:', error);
      Alert.alert('Error', 'Failed to initialize payment. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkout = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      // handle error
      console.log('error', error);
    } else {
      // success
      console.log('success');
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
        // Specific error handling based on error codes
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
          case 'InvalidRequest':
            Alert.alert(
              'Invalid Request',
              'Please check your payment details and try again'
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
              // Navigate to receipt or transaction details
              router.push('/payments/receipt');
            },
          },
          { text: 'OK' },
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
      <View>
        {showPayWithGooglePay && (
          <View>
            <Button title="Checkout" onPress={checkout} />
            <PlatformPayButton
              type={PlatformPay.ButtonType.Pay}
              onPress={pay}
              style={{
                width: '100%',
                height: 50,
              }}
            />
          </View>
        )}
      </View>
      <Pressable
        className={`mb-4 rounded-lg ${loading ? 'bg-gray-400' : 'bg-[#0066FF]'} px-4 py-3`}
        onPress={async () => {
          try {
            const secret = await fetchPaymentIntentClientSecret();
            if (secret) {
              await pay();
            }
          } catch (error) {
            console.error('Payment initialization error:', error);
            Alert.alert(
              'Error',
              'Failed to initialize payment. Please try again.'
            );
          }
        }}
        disabled={loading}
      >
        <Text className="text-center font-semibold text-white">
          {loading ? 'Processing Payment...' : 'Pay Electricity Bill'}
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

  const [clientSecret, setClientSecret] = React.useState(
    'pi_3RW7l7I5sqndwyBE1qgnLjP6_secret_bVUiSfYRb1fN6njotlmgprn3l'
  ); // Replace with your client secret

  const { isPlatformPaySupported } = usePlatformPay();

  const fetchKey = async () => {
    // Fetch key from your server here
    const key =
      'pk_test_51RR4FeI5sqndwyBEp3aQjy2yLUUgU1N8lW9u1ghF2Tn7F4joD5cwKd2I65xp1ofs2af4SVYjatRfHMWVhFDAaZFB00O1PKEbmE';
    return key;
  };

  const setup = async () => {
    // Initialize Stripe first
    await initStripe({
      publishableKey: publishableKey, // Replace with your Stripe publishable key
      merchantIdentifier: 'your_merchant_identifier', // Required for Apple Pay
    });

    const { error } = await initPaymentSheet({
      merchantDisplayName: 'Di-Bank Solutions, Inc.',
      paymentIntentClientSecret: clientSecret, // retrieve paymentInstant this from your server
    });

    if (error) {
      // handle error
      console.log(error);
    }
  };

  const fetchPublishableKey = async () => {
    const key = await fetchKey(); // fetch key from your server here
    setPublishableKey(key);
  };

  React.useEffect(() => {
    fetchPublishableKey();
    // fetchPaymentIntentClientSecret();

    (async function () {
      if (!(await isPlatformPaySupported({ googlePay: { testEnv: true } }))) {
        Alert.alert('Google Pay is not supported.');
        return;
      }
    })();

    console.log('setup initPaymentSheet');
    setup();
  }, []);

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
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
