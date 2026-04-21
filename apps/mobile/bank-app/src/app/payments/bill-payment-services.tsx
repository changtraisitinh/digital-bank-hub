import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';

// Bill categories data
const billCategories = [
  { id: '1', name: 'Electricity', icon: '⚡' },
  { id: '2', name: 'Water', icon: '💧' },
  { id: '3', name: 'Internet', icon: '🌐' },
  { id: '4', name: 'Phone', icon: '📱' },
  { id: '5', name: 'Traffic', icon: '🚦' },
  { id: '6', name: 'More', icon: '...' },
];

// Mock upcoming bills data
const upcomingBills = [
  {
    id: '1',
    provider: 'PLN',
    icon: '⚡',
    dueDate: 'May 25',
    amount: 45.0,
    urgent: true,
  },
  {
    id: '2',
    provider: 'Netflix',
    icon: '🎬',
    dueDate: 'May 28',
    amount: 15.99,
    urgent: false,
  },
];

export default function BillPaymentServices() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutopayEnabled, setIsAutopayEnabled] = useState(false);

  const handleScanQR = () => {
    // Implement QR scanning functionality
    router.push('/transfer/scan-qr');
  };

  const handlePayBill = (billId: string) => {
    console.log('billId', billId);
    const category = billCategories.find((cat) => cat.id === billId);

    console.log('category', category);

    if (category) {
      const serviceName = category.name.toLowerCase();
      router.push(`/payments/services/${serviceName}`);
    } else {
      // Handle unknown category
      alert('Unknown bill category');
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SafeAreaView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bill Payments</Text>
          <TouchableOpacity style={styles.scanButton} onPress={handleScanQR}>
            <MaterialIcons name="qr-code-scanner" size={24} color="#2e7d32" />
            <Text style={styles.scanButtonText}>Scan Bill</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bill type, provider, or customer code..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <MaterialIcons
            name="mic"
            size={20}
            color="#666"
            style={styles.voiceIcon}
          />
        </View>

        <ScrollView style={styles.content}>
          {/* Bill Categories Grid */}
          <View style={styles.categoriesGrid}>
            {billCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryItem}
                onPress={() => {
                  const serviceName = category.name.toLowerCase();
                  router.push(`/payments/services/${serviceName}`);
                }}
              >
                <View style={styles.categoryIcon}>
                  <Text style={styles.categoryIconText}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Autopay Panel */}
          <TouchableOpacity
            style={styles.autopayPanel}
            onPress={() => router.push('/payments/autopay-setup')}
          >
            <View style={styles.autopayContent}>
              <Text style={styles.autopayTitle}>
                Autopay your bills – Never miss a due date!
              </Text>
              <Switch
                value={isAutopayEnabled}
                onValueChange={setIsAutopayEnabled}
                trackColor={{ false: '#767577', true: '#81c784' }}
                thumbColor={isAutopayEnabled ? '#2e7d32' : '#f4f3f4'}
              />
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>

          {/* My Bills Section */}
          <View style={styles.myBillsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Bills</Text>
              <TouchableOpacity
                onPress={() => router.push('/payments/all-bills')}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {/* Upcoming Bills List */}
            {upcomingBills.map((bill) => (
              <View key={bill.id} style={styles.billItem}>
                <View style={styles.billInfo}>
                  <Text style={styles.billIcon}>{bill.icon}</Text>
                  <View>
                    <Text style={styles.billProvider}>{bill.provider}</Text>
                    <Text
                      style={[
                        styles.billDueDate,
                        bill.urgent && styles.urgentDueDate,
                      ]}
                    >
                      Due {bill.dueDate}
                    </Text>
                  </View>
                </View>
                <View style={styles.billActions}>
                  <Text style={styles.billAmount}>
                    {bill.amount.toFixed(0)}
                  </Text>
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => handlePayBill(bill.id)}
                  >
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    marginLeft: 4,
    color: '#2e7d32',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  voiceIcon: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  categoryItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    color: '#333',
  },
  autopayPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  autopayContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 16,
  },
  autopayTitle: {
    fontSize: 14,
    color: '#1976d2',
    flex: 1,
    marginRight: 16,
  },
  myBillsSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  billInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  billProvider: {
    fontSize: 16,
    fontWeight: '500',
  },
  billDueDate: {
    fontSize: 12,
    color: '#666',
  },
  urgentDueDate: {
    color: '#d32f2f',
  },
  billActions: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  payButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});
