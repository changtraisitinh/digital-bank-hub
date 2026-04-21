import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';

// Mock data for notifications
const transactionNotifications = [
  {
    id: '1',
    title: 'Payment Successful',
    description: 'Your payment of $50 to John Doe was successful',
    time: '2 hours ago',
    icon: 'payment',
  },
  {
    id: '2',
    title: 'Transfer Received',
    description: 'You received $100 from Jane Smith',
    time: '5 hours ago',
    icon: 'account-balance-wallet',
  },
];

const activityNotifications = [
  {
    id: '1',
    title: 'Login Alert',
    description: 'New login detected from iPhone device',
    time: '1 day ago',
    icon: 'security',
  },
  {
    id: '2',
    title: 'Password Changed',
    description: 'Your account password was successfully updated',
    time: '2 days ago',
    icon: 'lock',
  },
];

const promotionNotifications = [
  {
    id: '1',
    title: 'Special Offer',
    description: '20% cashback on your next transaction',
    time: '1 hour ago',
    icon: 'local-offer',
  },
  {
    id: '2',
    title: 'New Reward',
    description: 'You earned 500 reward points',
    time: '3 hours ago',
    icon: 'star',
  },
];

export default function NotificationList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('transactions');

  const NotificationItem = ({ item }) => (
    <TouchableOpacity style={styles.notificationItem}>
      <View style={styles.notificationIcon}>
        <MaterialIcons name={item.icon} size={24} color="#2e7d32" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'transactions' && styles.activeTabText,
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activities' && styles.activeTab]}
          onPress={() => setActiveTab('activities')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'activities' && styles.activeTabText,
            ]}
          >
            Activities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'promotions' && styles.activeTab]}
          onPress={() => setActiveTab('promotions')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'promotions' && styles.activeTabText,
            ]}
          >
            Promotions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <ScrollView style={styles.notificationList}>
        {activeTab === 'transactions' &&
          transactionNotifications.map((item) => (
            <NotificationItem key={item.id} item={item} />
          ))}
        {activeTab === 'activities' &&
          activityNotifications.map((item) => (
            <NotificationItem key={item.id} item={item} />
          ))}
        {activeTab === 'promotions' &&
          promotionNotifications.map((item) => (
            <NotificationItem key={item.id} item={item} />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2e7d32',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  notificationList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
});
