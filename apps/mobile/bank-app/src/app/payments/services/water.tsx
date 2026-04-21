import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

// Types
type WaterProvider = 'SAWACO' | 'HanoiWater' | 'DanangWater';

type WaterUsage = {
  currentMonth: number;
  previousMonth: number;
  dueDate: string;
  amount: number;
  isOverdue: boolean;
};

// Components
function AccountCard({ usage }: { usage: WaterUsage }) {
  const { width } = useWindowDimensions();
  const daysUntilDue = new Date(usage.dueDate).getTime() - new Date().getTime();
  const isUrgent = daysUntilDue < 3 * 24 * 60 * 60 * 1000; // 3 days

  return (
    <View className="mb-4 rounded-xl bg-white p-4 shadow-lg">
      <View className="mb-4 flex-row items-center justify-between">
        <Image
          source={require('../../../../assets/images/partners/sawaco.png')}
          className="h-12 w-24"
          contentFit="contain"
        />
        <View
          className={`rounded-full px-3 py-1 ${
            usage.isOverdue ? 'bg-red-100' : 'bg-green-100'
          }`}
        >
          <Text className={usage.isOverdue ? 'text-red-600' : 'text-green-600'}>
            {usage.isOverdue ? 'Overdue' : 'Active'}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-600">Water Usage (m³)</Text>
        <LineChart
          data={{
            labels: ['Last Month', 'This Month'],
            datasets: [
              {
                data: [usage.previousMonth, usage.currentMonth],
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
      </View>

      <View className="flex-row justify-between">
        <View>
          <Text className="text-gray-600">Due Date</Text>
          <Text className={`font-medium ${isUrgent ? 'text-red-500' : ''}`}>
            {usage.dueDate}
          </Text>
        </View>
        <View>
          <Text className="text-gray-600">Amount Due</Text>
          <Text
            className={`font-medium ${usage.isOverdue ? 'text-red-500' : ''}`}
          >
            {usage.amount.toLocaleString('vi-VN')}₫
          </Text>
        </View>
      </View>
    </View>
  );
}

function QuickActions() {
  const router = useRouter();

  return (
    <View className="mb-4 flex-row justify-between">
      <Pressable
        className="mr-2 flex-1 rounded-lg bg-blue-500 p-4"
        onPress={() => router.push('/payments/pay-bill')}
      >
        <Text className="text-center font-semibold text-white">Pay Now</Text>
      </Pressable>
      <Pressable
        className="ml-2 flex-1 rounded-lg bg-gray-100 p-4"
        onPress={() => router.push('/payments/services/water/history')}
      >
        <Text className="text-center font-semibold text-gray-700">
          Usage History
        </Text>
      </Pressable>
    </View>
  );
}

function AutoPayCard() {
  const router = useRouter();

  return (
    <Pressable
      className="mb-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 p-4"
      onPress={() => router.push('/payments/services/water/auto-pay')}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="mb-2 text-lg font-semibold text-white">
            Auto-Pay Setup
          </Text>
          <Text className="text-blue-100">
            Never miss a payment with automatic billing
          </Text>
        </View>
        <MaterialIcons name="arrow-forward" size={24} color="white" />
      </View>
    </Pressable>
  );
}

// Main Component
export default function WaterScreen() {
  const mockUsage: WaterUsage = {
    currentMonth: 25,
    previousMonth: 22,
    dueDate: '15/08/2024',
    amount: 1850000,
    isOverdue: false,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <Text className="mb-4 text-2xl font-bold">Water Bill</Text>
        <AccountCard usage={mockUsage} />
        <QuickActions />
        <AutoPayCard />
      </ScrollView>
    </SafeAreaView>
  );
}

// Bill Input Screen
export function BillInputScreen() {
  const [selectedProvider, setSelectedProvider] =
    React.useState<WaterProvider>('SAWACO');
  const [customerId, setCustomerId] = React.useState('');
  const [meterNumber, setMeterNumber] = React.useState('');
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <Text className="mb-4 text-2xl font-bold">Pay Water Bill</Text>

        <View className="mb-6 rounded-xl bg-blue-50 p-4">
          <Text className="mb-2 text-blue-800">
            We'll try to find your bill automatically
          </Text>
          <Text className="text-blue-600">
            Can't find your bill? Enter manually below
          </Text>
        </View>

        <View className="mb-4">
          <Text className="mb-2 font-medium">Select Provider</Text>
          <View className="rounded-lg border border-gray-200">
            <Picker
              selectedValue={selectedProvider}
              onValueChange={(value: WaterProvider) =>
                setSelectedProvider(value)
              }
            >
              <Picker.Item label="SAWACO" value="SAWACO" />
              <Picker.Item label="Hanoi Water" value="HanoiWater" />
              <Picker.Item label="Danang Water" value="DanangWater" />
            </Picker>
          </View>
        </View>

        <View className="mb-4">
          <Text className="mb-2 font-medium">Customer ID (Mã KH)</Text>
          <TextInput
            className="rounded-lg border border-gray-200 p-4"
            placeholder="Enter your customer ID"
            value={customerId}
            onChangeText={setCustomerId}
          />
        </View>

        <View className="mb-6">
          <Text className="mb-2 font-medium">Meter Number (Số đồng hồ)</Text>
          <TextInput
            className="rounded-lg border border-gray-200 p-4"
            placeholder="Enter your meter number"
            value={meterNumber}
            onChangeText={setMeterNumber}
          />
        </View>

        <Pressable
          className="rounded-lg bg-blue-500 p-4"
          onPress={() => router.push('/payments/services/water/confirm')}
        >
          <Text className="text-center font-semibold text-white">
            Find Bill
          </Text>
        </Pressable>

        <Pressable
          className="mt-4 rounded-lg border border-gray-200 p-4"
          onPress={() => router.push('/payments/services/water/scan')}
        >
          <View className="flex-row items-center justify-center">
            <MaterialIcons name="qr-code-scanner" size={20} color="#666" />
            <Text className="ml-2 text-center text-gray-600">
              Scan QR Code from Bill
            </Text>
          </View>
        </Pressable>

        <Pressable
          className="mt-2"
          onPress={() => router.push('/payments/services/water/help')}
        >
          <Text className="text-center text-blue-500">
            Where to find my QR code?
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
