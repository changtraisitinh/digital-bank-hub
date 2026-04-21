import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';

// Mock data for the card
const cardData = {
  cardType: 'Visa',
  lastFourDigits: '5678',
  expiryDate: '05/27',
  cardholderName: 'John Doe',
  status: 'active',
  isContactless: true,
  linkedAccount: '****1234',
};

// Mock recent transactions
const recentTransactions = [
  {
    id: '1',
    merchant: 'Amazon',
    icon: '🛒',
    date: 'May 25, 2:30 PM',
    amount: -42.5,
  },
  {
    id: '2',
    merchant: 'Netflix',
    icon: '🎬',
    date: 'May 24, 9:15 AM',
    amount: -15.99,
  },
  {
    id: '3',
    merchant: 'Refund - Walmart',
    icon: '🏪',
    date: 'May 23, 3:45 PM',
    amount: 25.0,
  },
];

// Quick actions data
const quickActions = [
  { id: '1', icon: '❄️', label: 'Freeze Card' },
  { id: '2', icon: '💳', label: 'Pay' },
  { id: '3', icon: '🔒', label: 'PIN/ATM' },
  { id: '4', icon: '📤', label: 'Share' },
];

export default function CardInfo() {
  const router = useRouter();
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const flipRotation = useSharedValue(0);

  // Animated style for card flip
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateY: `${flipRotation.value}deg` }],
    };
  });

  const handleCardFlip = () => {
    flipRotation.value = withSpring(flipRotation.value === 0 ? 180 : 0);
    setShowSensitiveData(!showSensitiveData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FocusAwareStatusBar />

      <ScrollView style={styles.scrollView}>
        {/* Card Preview */}
        <Animated.View style={[styles.cardPreview, cardAnimatedStyle]}>
          <TouchableOpacity onPress={handleCardFlip}>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>{cardData.cardType}</Text>
                {cardData.isContactless && (
                  <MaterialIcons name="contactless" size={24} color="white" />
                )}
              </View>
              <Text style={styles.cardNumber}>
                •••• •••• •••• {cardData.lastFourDigits}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardholderName}>
                  {cardData.cardholderName}
                </Text>
                <Text style={styles.expiryDate}>{cardData.expiryDate}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  cardData.status === 'active' ? '#4CAF50' : '#F44336',
              },
            ]}
          />
          <Text style={styles.statusText}>
            {cardData.status.charAt(0).toUpperCase() + cardData.status.slice(1)}
          </Text>
        </View>

        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActions}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={() => {
                if (action.label === 'Freeze Card') {
                  setIsCardFrozen(!isCardFrozen);
                }
              }}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionLabel}>{action.label}</Text>
              {action.label === 'Freeze Card' && (
                <Switch
                  value={isCardFrozen}
                  onValueChange={setIsCardFrozen}
                  trackColor={{ false: '#767577', true: '#81c784' }}
                  thumbColor={isCardFrozen ? '#2e7d32' : '#f4f3f4'}
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Card Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Linked Account</Text>
            <Text style={styles.detailValue}>{cardData.linkedAccount}</Text>
          </View>
          <TouchableOpacity style={styles.detailRow}>
            <Text style={styles.detailLabel}>Billing Address</Text>
            <MaterialIcons name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity
              onPress={() => router.push('/cards/transactions')}
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <Text style={styles.transactionIcon}>{transaction.icon}</Text>
                <View>
                  <Text style={styles.merchantName}>
                    {transaction.merchant}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: transaction.amount >= 0 ? '#4CAF50' : '#F44336' },
                ]}
              >
                ${Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Emergency Block Button */}
      <View style={styles.emergencyButton}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/cards/payment')}
          >
            <MaterialIcons name="payment" size={28} color="#2e7d32" />
            <Text style={styles.iconButtonLabel}>Payment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/cards/detail')}
          >
            <MaterialIcons name="credit-card" size={28} color="#2e7d32" />
            <Text style={styles.iconButtonLabel}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/cards/installment')}
          >
            <MaterialIcons name="schedule" size={28} color="#2e7d32" />
            <Text style={styles.iconButtonLabel}>Installment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              // Handle card blocking
            }}
          >
            <MaterialIcons name="block" size={28} color="#F44336" />
            <Text style={[styles.iconButtonLabel, { color: '#F44336' }]}>
              Block
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  cardPreview: {
    margin: 16,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    backgroundColor: '#1976D2',
    padding: 20,
    height: '100%',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardNumber: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardholderName: {
    color: 'white',
    fontSize: 16,
  },
  expiryDate: {
    color: 'white',
    fontSize: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 80,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailsSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
  },
  transactionsSection: {
    backgroundColor: 'white',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#1976D2',
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  emergencyButton: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
  },
});
