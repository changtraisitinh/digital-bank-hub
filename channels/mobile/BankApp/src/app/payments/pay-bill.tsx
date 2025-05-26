import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';

type Tab = 'auto' | 'manual' | 'qr';

type Provider = {
  id: string;
  name: string;
  logo: any;
};

const providers: Provider[] = [
  {
    id: 'sawaco',
    name: 'SAWACO',
    logo: require('../../../assets/images/partners/sawaco.png'),
  },
  {
    id: 'hanoi-water',
    name: 'Hà Nội Water',
    logo: require('../../../assets/images/partners/sawaco.png'),
  },
];

function TabButton({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Button
      onPress={onPress}
      variant={active ? 'default' : 'secondary'}
      className={`mx-1 flex-1 ${active ? 'shadow-sm' : ''}`}
    >
      <Text className={active ? 'text-white' : 'text-neutral-600'}>
        {label}
      </Text>
    </Button>
  );
}

function AutoDetectTab() {
  const { t } = useTranslation();

  return (
    <View className="p-4">
      <View className="mb-6 rounded-xl bg-primary-50 p-4">
        <View className="flex-row items-center">
          <Ionicons name="information-circle" size={24} color="#3b82f6" />
          <Text className="ml-2 flex-1 text-sm text-primary-700">
            {t('autoDetectDescription')}
          </Text>
        </View>
      </View>

      <Button
        onPress={() => {
          // Handle API permission and bill fetching
        }}
        className="w-full"
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="cloud-download" size={20} color="white" />
          <Text className="ml-2 text-white">{t('fetchMyBill')}</Text>
        </View>
      </Button>
    </View>
  );
}

function ManualEntryTab() {
  const { t } = useTranslation();
  const [selectedProvider, setSelectedProvider] = React.useState(
    providers[0].id
  );
  const [customerId, setCustomerId] = React.useState('');
  const [meterNumber, setMeterNumber] = React.useState('');
  const [isCustomerIdValid, setIsCustomerIdValid] = React.useState(false);

  const validateCustomerId = (id: string) => {
    // Add validation logic here
    setIsCustomerIdValid(id.length >= 8);
  };

  return (
    <View className="space-y-6 p-4">
      <View>
        <Text className="mb-2 text-sm font-medium text-neutral-700">
          {t('utilityProvider')}
        </Text>
        <View className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <Picker
            selectedValue={selectedProvider}
            onValueChange={(value) => setSelectedProvider(value)}
            style={{ height: 50 }}
          >
            {providers.map((provider) => (
              <Picker.Item
                key={provider.id}
                label={provider.name}
                value={provider.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-neutral-700">
          {t('customerId')}
        </Text>
        <View className="relative">
          <TextInput
            value={customerId}
            onChangeText={(text) => {
              setCustomerId(text);
              validateCustomerId(text);
            }}
            className="rounded-xl border border-neutral-200 bg-white p-4 text-base"
            placeholder={t('enterCustomerId')}
            placeholderTextColor="#9ca3af"
          />
          {isCustomerIdValid && (
            <View className="absolute right-4 top-4">
              <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
            </View>
          )}
        </View>
      </View>

      <View>
        <Text className="mb-2 text-sm font-medium text-neutral-700">
          {t('meterNumber')}
        </Text>
        <TextInput
          value={meterNumber}
          onChangeText={setMeterNumber}
          className="rounded-xl border border-neutral-200 bg-white p-4 text-base"
          placeholder={t('enterMeterNumber')}
          placeholderTextColor="#9ca3af"
        />
      </View>
    </View>
  );
}

function QRScanTab() {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = React.useState(false);

  const handleScanPress = () => {
    setIsScanning(true);
    // Simulate scanning delay
    setTimeout(() => {
      setIsScanning(false);
      // Navigate to confirmation screen
      router.push('/payments/bill-confirmation');
    }, 2000);
  };

  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center bg-neutral-50">
        {isScanning ? (
          <View className="items-center">
            <View className="size-72 rounded-2xl border-2 border-primary-500 bg-primary-50 shadow-lg">
              <View className="absolute inset-0 items-center justify-center">
                <Ionicons name="scan" size={64} color="#3b82f6" />
              </View>
            </View>
            <Text className="mt-6 text-center text-lg font-medium text-neutral-700">
              {t('scanningQR')}
            </Text>
            <Text className="mt-2 text-center text-sm text-neutral-500">
              {t('pleaseWait')}
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <View className="size-72 rounded-2xl border-2 border-neutral-300 bg-white shadow-lg">
              <View className="absolute inset-0 items-center justify-center">
                <Ionicons name="qr-code-outline" size={64} color="#6b7280" />
              </View>
            </View>
            <Text className="mt-6 text-center text-lg font-medium text-neutral-700">
              {t('scanQRGuide')}
            </Text>
            <Text className="mt-2 text-center text-sm text-neutral-500">
              {t('scanQRDescription')}
            </Text>
            <Button onPress={handleScanPress} className="mt-8">
              <View className="flex-row items-center">
                <Ionicons name="scan-outline" size={20} color="white" />
                <Text className="ml-2 text-white">{t('startScanning')}</Text>
              </View>
            </Button>
          </View>
        )}
      </View>
      <View className="bg-white p-4">
        <Button
          onPress={() => {
            // Navigate to help screen
          }}
          variant="secondary"
          className="w-full"
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="help-circle-outline" size={20} color="#4b5563" />
            <Text className="ml-2 text-neutral-600">{t('whereToFindQR')}</Text>
          </View>
        </Button>
      </View>
    </View>
  );
}

export default function PayBillScreen() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<Tab>('auto');

  const handleContinue = () => {
    router.push('/payments/bill-confirmation');
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className="p-4">
        <Text className="mb-2 text-2xl font-bold text-neutral-900">
          {t('payBill')}
        </Text>
        <Text className="mb-6 text-sm text-neutral-500">
          {t('payBillDescription')}
        </Text>

        <View className="mb-4 flex-row">
          <TabButton
            active={activeTab === 'auto'}
            label={t('autoDetect')}
            onPress={() => setActiveTab('auto')}
          />
          <TabButton
            active={activeTab === 'manual'}
            label={t('manualEntry')}
            onPress={() => setActiveTab('manual')}
          />
          <TabButton
            active={activeTab === 'qr'}
            label={t('qrScan')}
            onPress={() => setActiveTab('qr')}
          />
        </View>
      </View>

      <ScrollView className="flex-1">
        {activeTab === 'auto' && <AutoDetectTab />}
        {activeTab === 'manual' && <ManualEntryTab />}
        {activeTab === 'qr' && <QRScanTab />}
      </ScrollView>

      <View className="border-t border-neutral-200 bg-white p-4">
        <Button onPress={handleContinue} className="w-full">
          <View className="flex-row items-center justify-center">
            <Ionicons name="arrow-forward" size={20} color="white" />
            <Text className="ml-2 text-white">{t('continue')}</Text>
          </View>
        </Button>
      </View>
    </SafeAreaView>
  );
}
