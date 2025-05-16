// Try importing with error handling
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/components/ui';

let LocalAuthentication;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch (error) {
  console.warn('expo-local-authentication module not available:', error);
  // Create a mock implementation to prevent crashes
  LocalAuthentication = {
    hasHardwareAsync: async () => false,
    authenticateAsync: async () => ({
      success: false,
      error: 'Module not available',
    }),
  };
}

export default function TransferConfirmation() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock transfer details (in real app, these would come from params or context)
  const transferDetails = {
    amount: 250.0,
    currency: 'USD',
    recipientName: 'John Doe',
    recipientBank: 'Chase',
    recipientAccount: '•••• 4567',
    fromAccount: 'My Checking •••• 1234',
    fee: 0.0,
    deliveryTime: 'Instantly',
    note: 'Rent payment for June',
  };

  // States
  const [otpCode, setOtpCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Animation values
  const checkmarkScale = new Animated.Value(0);
  const successOpacity = new Animated.Value(0);

  // Check if biometric authentication is available
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricAvailable(compatible);
    })();
  }, []);

  // Handle OTP input
  const handleOtpChange = (text) => {
    // Only allow digits and limit to 6 characters
    const formattedText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpCode(formattedText);
  };

  // Handle biometric authentication
  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to confirm transfer',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        handleConfirmTransfer();
      }
    } catch (error) {
      Alert.alert(
        'Authentication Error',
        'Failed to authenticate. Please try again.'
      );
    }
  };

  // Handle transfer confirmation
  const handleConfirmTransfer = () => {
    if (otpCode.length !== 6 && !isBiometricAvailable) {
      Alert.alert(
        'Verification Required',
        'Please enter the 6-digit code to proceed.'
      );
      return;
    }

    setIsProcessing(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setTransactionId(generateTransactionId());

      // Animate success checkmark
      Animated.sequence([
        Animated.timing(checkmarkScale, {
          toValue: 1,
          duration: 500,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);
  };

  // Generate a random transaction ID
  const generateTransactionId = () => {
    return 'TRX' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  // Handle cancel transfer
  const handleCancelTransfer = () => {
    setShowCancelModal(true);
  };

  // Handle confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    router.back();
  };

  // Handle share receipt
  const handleShareReceipt = () => {
    Alert.alert('Share Receipt', 'Receipt has been sent to your email.');
  };

  // Handle done (return to home)
  const handleDone = () => {
    router.replace('/(app)');
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SafeAreaView style={styles.container}>
        {!showSuccess ? (
          // Confirmation Screen
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Confirm Transfer</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancelTransfer}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              {/* Transaction Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.amountText}>
                  -${transferDetails.amount.toFixed(2)}{' '}
                  {transferDetails.currency}
                </Text>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>To</Text>
                  <View style={styles.detailValue}>
                    <Text style={styles.recipientName}>
                      {transferDetails.recipientName}
                    </Text>
                    <Text style={styles.recipientBank}>
                      {transferDetails.recipientBank}{' '}
                      {transferDetails.recipientAccount}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>From</Text>
                  <Text style={styles.detailValue}>
                    {transferDetails.fromAccount}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fee</Text>
                  <Text style={styles.detailValue}>
                    ${transferDetails.fee.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    ${(transferDetails.amount + transferDetails.fee).toFixed(2)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Delivery</Text>
                  <Text style={styles.deliveryValue}>
                    {transferDetails.deliveryTime}
                  </Text>
                </View>

                {transferDetails.note && (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteLabel}>Note</Text>
                    <Text style={styles.noteText}>{transferDetails.note}</Text>
                  </View>
                )}
              </View>

              {/* Security Verification */}
              <View style={styles.securityCard}>
                <Text style={styles.securityTitle}>Verification Required</Text>

                <View style={styles.otpContainer}>
                  <Text style={styles.otpLabel}>
                    Enter the 6-digit code sent to ***@gmail.com
                  </Text>
                  <TextInput
                    style={styles.otpInput}
                    value={otpCode}
                    onChangeText={handleOtpChange}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="000000"
                  />
                </View>
              </View>

              {/* Additional Options */}
              <View style={styles.optionsCard}>
                <TouchableOpacity style={styles.optionButton}>
                  <Text style={styles.optionText}>Edit Note</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.optionButton}>
                  <Text style={styles.optionText}>Schedule Transfer</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* CTA Buttons */}
            <View style={styles.ctaContainer}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleCancelTransfer}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  otpCode.length !== 6 && styles.disabledButton,
                ]}
                onPress={handleConfirmTransfer}
                disabled={otpCode.length !== 6}
              >
                <Text style={styles.primaryButtonText}>Confirm Transfer</Text>
              </TouchableOpacity>
            </View>

            {/* Processing Modal */}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <View style={styles.processingCard}>
                  <ActivityIndicator size="large" color="#2e7d32" />
                  <Text style={styles.processingText}>
                    Processing Transfer...
                  </Text>
                </View>
              </View>
            )}

            {/* Cancel Confirmation Modal */}
            <Modal visible={showCancelModal} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>Cancel Transfer?</Text>
                  <Text style={styles.modalText}>
                    Are you sure you want to cancel this transfer? This action
                    cannot be undone.
                  </Text>
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.modalSecondaryButton}
                      onPress={() => setShowCancelModal(false)}
                    >
                      <Text style={styles.modalSecondaryButtonText}>
                        No, Continue
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalPrimaryButton}
                      onPress={handleConfirmCancel}
                    >
                      <Text style={styles.modalPrimaryButtonText}>
                        Yes, Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        ) : (
          // Success Screen
          <View style={styles.successContainer}>
            <View style={styles.successContent}>
              <Animated.View
                style={[
                  styles.checkmarkContainer,
                  {
                    transform: [{ scale: checkmarkScale }],
                  },
                ]}
              >
                <Text style={styles.checkmark}>✓</Text>
              </Animated.View>

              <Animated.View
                style={[
                  styles.successTextContainer,
                  { opacity: successOpacity },
                ]}
              >
                <Text style={styles.successTitle}>Transfer Successful!</Text>
                <Text style={styles.successMessage}>
                  Your transfer of ${transferDetails.amount.toFixed(2)} to{' '}
                  {transferDetails.recipientName} has been processed.
                </Text>
              </Animated.View>

              <View style={styles.receiptCard}>
                <Text style={styles.receiptTitle}>Receipt</Text>

                <View style={styles.receiptDetail}>
                  <Text style={styles.receiptLabel}>Transaction ID</Text>
                  <Text style={styles.receiptValue}>{transactionId}</Text>
                </View>

                <View style={styles.receiptDetail}>
                  <Text style={styles.receiptLabel}>Date & Time</Text>
                  <Text style={styles.receiptValue}>
                    {new Date().toLocaleString()}
                  </Text>
                </View>

                <View style={styles.receiptDetail}>
                  <Text style={styles.receiptLabel}>Amount</Text>
                  <Text style={styles.receiptValue}>
                    ${transferDetails.amount.toFixed(2)}{' '}
                    {transferDetails.currency}
                  </Text>
                </View>

                <View style={styles.receiptDetail}>
                  <Text style={styles.receiptLabel}>Recipient</Text>
                  <Text style={styles.receiptValue}>
                    {transferDetails.recipientName}
                  </Text>
                </View>

                <View style={styles.receiptDetail}>
                  <Text style={styles.receiptLabel}>Status</Text>
                  <Text style={styles.receiptStatusValue}>Completed</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareReceipt}
              >
                <Text style={styles.shareButtonText}>Share Receipt</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  amountText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e53935', // Red for debit
    textAlign: 'center',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  recipientName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
  },
  recipientBank: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  deliveryValue: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
    textAlign: 'right',
  },
  noteContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  noteLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 16,
    color: '#333',
  },
  securityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  otpContainer: {
    marginBottom: 16,
  },
  otpLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
  },
  optionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: '#2e7d32',
  },
  ctaContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  processingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalPrimaryButton: {
    backgroundColor: '#e53935',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
  modalPrimaryButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  modalSecondaryButton: {
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  modalSecondaryButtonText: {
    fontSize: 16,
    color: '#666',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  successContent: {
    width: '100%',
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 48,
    color: 'white',
  },
  successTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  receiptCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  receiptDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
  },
  receiptValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  receiptStatusValue: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  shareButton: {
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
