import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Share,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { useGenerateQRCode } from '@/api';
import {
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/components/ui';

// Mock data for accounts
const myAccounts = [
  {
    id: '1',
    name: 'John Doe',
    number: '**** 6789',
    balance: 5280.0,
  },
  {
    id: '2',
    name: 'John Doe',
    number: '**** 4321',
    balance: 12500.89,
  },
];

export default function MyQRScreen() {
  const router = useRouter();
  const [selectedAccount, setSelectedAccount] = useState(myAccounts[0]);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [qrValue, setQrValue] = useState(`account:${selectedAccount.id}`);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const qrRef = useRef();

  const generateQRCode = useGenerateQRCode();

  // Check if biometric authentication is available
  useEffect(() => {
    let variables = {
      bankCode: '970415',
      accountNumber: '113366668888',
      accountName: 'QUY UNG HO NGAN HANG',
      amount: '99000',
    };

    generateQRCode.refetch(variables);
  }, []);

  // Handle QR code data when it's received
  useEffect(() => {
    if (generateQRCode.data) {
      // Convert ArrayBuffer to base64 using array manipulation
      const bytes = new Uint8Array(generateQRCode.data);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      setQrImage(`data:image/jpeg;base64,${base64}`);
    }
  }, [generateQRCode.data]);

  // Handle account selection
  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    setQrValue(`account:${account.id}${amount ? `:amount:${amount}` : ''}`);
    setShowAccountSelector(false);
  };

  // Handle amount setting
  const handleSetAmount = () => {
    if (amount) {
      setQrValue(`account:${selectedAccount.id}:amount:${amount}`);
      setShowAmountModal(false);
    } else {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
    }
  };

  // Handle amount clearing
  const handleClearAmount = () => {
    setAmount('');
    setQrValue(`account:${selectedAccount.id}`);
    setShowAmountModal(false);
  };

  // Handle QR code sharing
  const handleShare = async () => {
    try {
      // Instead of capturing the QR as an image, share the data directly
      await Share.share({
        title: 'My Payment QR Code',
        message: `Scan this QR code to pay ${selectedAccount.name}${amount ? ` $${amount}` : ''}: ${qrValue}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share QR code');
      console.error(error);
    }
  };

  // Handle QR code saving - simplified approach
  const handleSave = async () => {
    try {
      // Create a shareable message with instructions
      const message = `My payment details:\n\nAccount: ${selectedAccount.name}\nAccount Number: ${selectedAccount.number}${amount ? `\nAmount: $${amount}` : ''}`;

      // Share the text information instead
      await Share.share({
        title: 'My Payment Details',
        message: message,
      });

      Alert.alert(
        'QR Code Information',
        'Your payment details have been shared. You can save this information or take a screenshot of the QR code.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to share payment details');
      console.error(error);
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SafeAreaView style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Image
              source={require('../../../assets/images/partners/napas.png')}
              style={styles.bankLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Digital Banking</Text>
          </View>
          <View style={styles.placeholderRight} />
        </View>

        <ScrollView style={styles.content}>
          {/* Account Selector */}
          <TouchableOpacity
            style={styles.accountSelector}
            onPress={() => setShowAccountSelector(true)}
          >
            <View>
              <Text style={styles.accountName}>{selectedAccount.name}</Text>
              <Text style={styles.accountNumber}>{selectedAccount.number}</Text>
            </View>
            <View style={styles.accountRight}>
              <Text style={styles.accountBalance}>
                Available: {selectedAccount.balance.toFixed(0)}
              </Text>
              <Text style={styles.chevron}>▼</Text>
            </View>
          </TouchableOpacity>

          {/* QR Code Section */}
          <View style={styles.qrContainer}>
            {qrImage ? (
              <Image
                source={{ uri: qrImage }}
                style={{
                  width: 200,
                  height: 200,
                  borderRadius: 8,
                }}
                resizeMode="contain"
              />
            ) : (
              <QRCode
                value={qrValue}
                size={200}
                color="#000"
                backgroundColor="#fff"
                logo={require('../../../assets/images/partners/napas.png')}
                logoSize={40}
                logoBackgroundColor="#fff"
                getRef={(ref) => (qrRef.current = ref)}
              />
            )}
            <Text style={styles.qrHelperText}>
              Scan this QR to receive payments
            </Text>
            {amount ? (
              <View style={styles.amountBadge}>
                <Text style={styles.amountBadgeText}>${amount}</Text>
                <TouchableOpacity onPress={handleClearAmount}>
                  <Text style={styles.clearAmountText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => setShowAmountModal(true)}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.actionButtonIcon}>+$</Text>
            </View>
            <Text style={styles.actionButtonText}>Set Amount</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <View style={styles.iconContainer}>
              <Text style={styles.actionButtonIcon}>↗</Text>
            </View>
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <View style={styles.iconContainer}>
              <Text style={styles.actionButtonIcon}>↓</Text>
            </View>
            <Text style={styles.actionButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* Account Selector Modal */}
        <Modal
          visible={showAccountSelector}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAccountSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Account</Text>
                <TouchableOpacity onPress={() => setShowAccountSelector(false)}>
                  <Text style={styles.modalCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>
              {myAccounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.accountOption}
                  onPress={() => handleAccountSelect(account)}
                >
                  <View>
                    <Text style={styles.accountOptionName}>{account.name}</Text>
                    <Text style={styles.accountOptionNumber}>
                      {account.number}
                    </Text>
                  </View>
                  <Text style={styles.accountOptionBalance}>
                    ${account.balance.toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Amount Modal */}
        <Modal
          visible={showAmountModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAmountModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Set Amount</Text>
                <TouchableOpacity onPress={() => setShowAmountModal(false)}>
                  <Text style={styles.modalCloseButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
              </View>
              <View style={styles.amountButtonsContainer}>
                <TouchableOpacity
                  style={[styles.amountButton, styles.cancelButton]}
                  onPress={() => setShowAmountModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.amountButton, styles.confirmButton]}
                  onPress={handleSetAmount}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: '500',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2e7d32',
  },
  placeholderRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  accountSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  accountRight: {
    alignItems: 'flex-end',
  },
  accountBalance: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginBottom: 4,
  },
  chevron: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrHelperText: {
    marginTop: 16,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  amountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
  },
  amountBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  clearAmountText: {
    color: 'white',
    fontSize: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  primaryButton: {
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionButtonIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    fontSize: 20,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  accountOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  accountOptionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  accountOptionNumber: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  accountOptionBalance: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '500',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    paddingVertical: 12,
  },
  amountButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#757575',
    fontWeight: '500',
  },
  confirmButton: {
    marginLeft: 8,
    backgroundColor: '#2e7d32',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
