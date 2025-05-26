import { Picker } from '@react-native-picker/picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const router = useRouter();

  return (
    <View className="mb-4 rounded-xl bg-white p-4 shadow-lg">
      <Image
        source={require('../../../../assets/images/partners/evn.png')}
        className="mb-4 h-12 w-24"
        contentFit="contain"
      />
      <Pressable
        className="mb-4 rounded-lg bg-[#0066FF] px-4 py-3"
        onPress={() => router.push('/payments/pay-bill')}
      >
        <Text className="text-center font-semibold text-white">
          Pay Electricity Bill
        </Text>
      </Pressable>
      <View className="items-center rounded-lg bg-gray-100 p-4">
        <Text className="mb-2 text-gray-600">Scan QR Code</Text>
        <View className="size-32 rounded-lg bg-gray-200" />
      </View>
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-4">
        <QuickPayCard />
        <UsageInsights data={mockData} />
        <HistoryShortcut bills={mockBills} />
      </ScrollView>
    </SafeAreaView>
  );
}

export function BillInputScreen() {
  const [selectedProvider, setSelectedProvider] = React.useState<Provider>('EVN');
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white justify-center">
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
            onPress={() => router.push('/payments/services/electricity/confirm')}
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
