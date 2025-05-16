import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Alert,
  Animated,
  Clipboard,
  Easing,
  Platform,
  ScrollView as RNScrollView,
  Share,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text } from '@/components/ui';

export default function TransferSuccessful() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Animation values
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const checkmarkOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Mock transaction details (in real app, these would come from params)
  const transactionDetails = {
    amount: 500.0,
    currency: 'USD',
    recipientName: 'Sarah Miller',
    recipientBank: 'Chase',
    recipientAccount: '•••• 7890',
    date: new Date(),
    transactionId: 'TXN7892XYZ',
    isInstant: true,
  };

  // Run animations on component mount
  useEffect(() => {
    Animated.sequence([
      Animated.timing(checkmarkScale, {
        toValue: 1,
        duration: 600,
        easing: Easing.elastic(1),
        useNativeDriver: true,
      }),
      Animated.timing(checkmarkOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Format date and time
  const formatDateTime = (date) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Copy transaction ID to clipboard
  const copyTransactionId = () => {
    Clipboard.setString(transactionDetails.transactionId);
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        'Transaction ID copied to clipboard',
        ToastAndroid.SHORT
      );
    } else {
      Alert.alert('Copied', 'Transaction ID copied to clipboard');
    }
  };

  // Share receipt
  const shareReceipt = async () => {
    try {
      const result = await Share.share({
        message: `Transfer Receipt\n\nAmount: $${transactionDetails.amount.toFixed(2)} ${transactionDetails.currency}\nTo: ${transactionDetails.recipientName}\nBank: ${transactionDetails.recipientBank} ${transactionDetails.recipientAccount}\nDate: ${formatDateTime(transactionDetails.date)}\nTransaction ID: ${transactionDetails.transactionId}`,
        title: 'Transfer Receipt',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share receipt');
    }
  };

  // Navigate to home
  const goToHome = () => {
    router.replace('/(app)');
  };

  // Navigate to transaction history
  const viewTransaction = () => {
    router.push('/(app)/transactions');
  };

  // Make another transfer
  const makeAnotherTransfer = () => {
    router.push('/(app)/transfer');
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SafeAreaView style={styles.container}>
        <RNScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Animation */}
          <View style={styles.animationContainer}>
            <Animated.View
              style={[
                styles.checkmarkCircle,
                {
                  transform: [{ scale: checkmarkScale }],
                },
              ]}
            >
              <Animated.Text
                style={[styles.checkmark, { opacity: checkmarkOpacity }]}
              >
                ✓
              </Animated.Text>
            </Animated.View>
          </View>

          {/* Success Message */}
          <Animated.View
            style={[styles.messageContainer, { opacity: contentOpacity }]}
          >
            <Text style={styles.successTitle}>Transfer Successful!</Text>
            <Text style={styles.successSubtitle}>
              {transactionDetails.isInstant
                ? 'The amount has been credited instantly!'
                : 'Your money is on its way!'}
            </Text>
          </Animated.View>

          {/* Transaction Summary */}
          <Animated.View
            style={[styles.summaryCard, { opacity: contentOpacity }]}
          >
            {/* Amount */}
            <View style={styles.summaryRow}>
              <Text style={styles.amountText}>
                -${transactionDetails.amount.toFixed(2)}{' '}
                {transactionDetails.currency}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Recipient */}
            <View style={styles.summaryRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="person" size={20} color="#666" />
              </View>
              <View style={styles.detailContainer}>
                <Text style={styles.detailLabel}>To</Text>
                <Text style={styles.detailValue}>
                  {transactionDetails.recipientName}
                </Text>
              </View>
            </View>

            {/* Bank */}
            <View style={styles.summaryRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="business" size={20} color="#666" />
              </View>
              <View style={styles.detailContainer}>
                <Text style={styles.detailLabel}>Bank</Text>
                <Text style={styles.detailValue}>
                  {transactionDetails.recipientBank}{' '}
                  {transactionDetails.recipientAccount}
                </Text>
              </View>
            </View>

            {/* Date & Time */}
            <View style={styles.summaryRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={20} color="#666" />
              </View>
              <View style={styles.detailContainer}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(transactionDetails.date)}
                </Text>
              </View>
            </View>

            {/* Transaction ID */}
            <View style={styles.summaryRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed" size={20} color="#666" />
              </View>
              <View style={styles.detailContainer}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <View style={styles.transactionIdContainer}>
                  <Text style={styles.detailValue}>
                    {transactionDetails.transactionId}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={copyTransactionId}
                  >
                    <Ionicons name="copy-outline" size={18} color="#2e7d32" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View
            style={[styles.actionsCard, { opacity: contentOpacity }]}
          >
            <Text style={styles.actionsTitle}>Quick Actions</Text>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={shareReceipt}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="share-outline" size={24} color="#2e7d32" />
                </View>
                <Text style={styles.actionText}>Share Receipt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => Alert.alert('Info', 'PDF saved to your device')}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="document-outline" size={24} color="#2e7d32" />
                </View>
                <Text style={styles.actionText}>Save as PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  Alert.alert('Info', 'Notification sent to recipient')
                }
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color="#2e7d32"
                  />
                </View>
                <Text style={styles.actionText}>Notify Recipient</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={makeAnotherTransfer}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="repeat" size={24} color="#2e7d32" />
                </View>
                <Text style={styles.actionText}>Make Another</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Security Reminder */}
          <Animated.View
            style={[styles.reminderContainer, { opacity: contentOpacity }]}
          >
            <Ionicons name="shield-checkmark" size={20} color="#666" />
            <Text style={styles.reminderText}>
              Always verify transfers with recipients. Report issues immediately
              if something's wrong.
            </Text>
          </Animated.View>

          {/* Primary CTAs */}
          <Animated.View
            style={[styles.ctaContainer, { opacity: contentOpacity }]}
          >
            <TouchableOpacity style={styles.primaryButton} onPress={goToHome}>
              <Text style={styles.primaryButtonText}>Back to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={viewTransaction}
            >
              <Text style={styles.secondaryButtonText}>View Transaction</Text>
            </TouchableOpacity>
          </Animated.View>
        </RNScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e53935', // Red for debit
    textAlign: 'center',
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  transactionIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  reminderContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  reminderText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  ctaContainer: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
  },
});
