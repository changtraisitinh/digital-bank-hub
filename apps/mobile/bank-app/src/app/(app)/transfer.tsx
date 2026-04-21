import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView as RNScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useGetAccountList } from '@/api';
import {
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
} from '@/components/ui';
import { Transfer as TransferIcon } from '@/components/ui/icons/transfer';

// Mock data for accounts
const myAccounts = [
  {
    id: '1',
    name: 'Main Checking',
    number: '**** 4567',
    balance: 3245.67,
  },
  {
    id: '2',
    name: 'Savings Account',
    number: '**** 7890',
    balance: 12500.89,
  },
];

// Mock data for recent recipients
const recentRecipients = [
  {
    id: '101',
    name: 'John Smith',
    accountNumber: '**** **** **** 1234',
    bank: 'Chase Bank',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isFavorite: true,
  },
  {
    id: '102',
    name: 'Sarah Johnson',
    accountNumber: '**** **** **** 5678',
    bank: 'Bank of America',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isFavorite: false,
  },
  {
    id: '103',
    name: 'Michael Brown',
    accountNumber: '**** **** **** 9012',
    bank: 'Wells Fargo',
    avatar: 'https://i.pravatar.cc/150?img=3',
    isFavorite: true,
  },
];

export default function Transfer() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('myAccounts');
  const [fromAccount, setFromAccount] = useState(myAccounts[0]);
  const [toAccount, setToAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showRecipientSearch, setShowRecipientSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRecipients, setFilteredRecipients] = useState([]);

  // Daily limit
  const dailyLimit = 5000;
  const remainingLimit = 5000;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setToAccount(null); // Reset selected recipient when changing tabs
  };

  const handleRecipientSelect = (recipient) => {
    setToAccount(recipient);
    setShowRecipientSearch(false);
  };

  // Use the account list mutation
  const getAccountList = useGetAccountList();

  useEffect(() => {
    // Log response data when API call completes
    if (getAccountList.data) {
      console.log('✅ [API Response] getAccountList:', getAccountList.data);

      // Transform API data to match required recipient format
      const formattedRecipients = getAccountList.data.map((item, index) => ({
        id: item.id || `recipient_${index}`,
        name: item.name || 'Unknown',
        accountNumber: item.accountNumber || '**** **** **** ****',
        bank: item.bank || 'Unknown Bank',
        avatar: `https://i.pravatar.cc/150?img=${index + 1}`,
        isFavorite: item.isFavorite || false,
      }));

      setFilteredRecipients(formattedRecipients);
    }
    if (getAccountList.isError) {
      console.error('❌ [API Error] getAccountList:', getAccountList.error);
    }
  }, [getAccountList.data, getAccountList.isError, getAccountList.error]);

  useEffect(() => {
    // Fetch recipients when component mounts
    getAccountList.mutate({
      accountId: '1', // Replace with actual account ID
    });
  }, []);

  // const filteredRecipients = recentRecipients.filter((recipient) =>
  //   recipient.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  // Handle continue button press
  const handleContinue = () => {
    if (toAccount && amount) {
      router.push({
        pathname: '/transfer/confirmation',
        params: {
          fromAccount: fromAccount.id,
          fromAccountName: fromAccount.name,
          fromAccountNumber: fromAccount.number,
          fromAccountBalance: fromAccount.balance,
          toAccount: toAccount.id,
          toAccountName: toAccount.name,
          toAccountNumber: toAccount.accountNumber,
          toAccountBalance: toAccount.balance,
          toAccountBank: toAccount.bank,
          amount: amount,
          note: note,
        },
      });
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
          <Text style={styles.headerTitle}>Transfer</Text>
          <TouchableOpacity style={styles.recentButton}>
            <Text style={styles.recentButtonText}>Recent</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Transfer Type Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'myAccounts' && styles.activeTab,
              ]}
              onPress={() => handleTabChange('myAccounts')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'myAccounts' && styles.activeTabText,
                ]}
              >
                My Accounts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'otherBank' && styles.activeTab,
              ]}
              onPress={() => handleTabChange('otherBank')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'otherBank' && styles.activeTabText,
                ]}
              >
                Other Bank
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'quickPay' && styles.activeTab]}
              onPress={() => handleTabChange('quickPay')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'quickPay' && styles.activeTabText,
                ]}
              >
                Quick Pay
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'international' && styles.activeTab,
              ]}
              onPress={() => handleTabChange('international')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'international' && styles.activeTabText,
                ]}
              >
                International
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transfer Form */}
          <View style={styles.formContainer}>
            {/* From Account */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>From</Text>
              <TouchableOpacity style={styles.accountSelector}>
                <View>
                  <Text style={styles.accountName}>{fromAccount.name}</Text>
                  <Text style={styles.accountNumber}>{fromAccount.number}</Text>
                </View>
                <Text style={styles.accountBalance}>
                  {fromAccount.balance.toFixed(0)}
                </Text>
              </TouchableOpacity>
            </View>

            {/* To Account/Recipient */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>To</Text>
              {toAccount ? (
                <TouchableOpacity
                  style={styles.accountSelector}
                  onPress={() => setShowRecipientSearch(true)}
                >
                  <View style={styles.recipientInfo}>
                    {toAccount.avatar && (
                      <Image
                        source={{ uri: toAccount.avatar }}
                        style={styles.recipientAvatar}
                      />
                    )}
                    <View>
                      <Text style={styles.accountName}>{toAccount.name}</Text>
                      <Text style={styles.accountNumber}>
                        {toAccount.accountNumber}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Text
                      style={[
                        styles.favoriteIcon,
                        toAccount.isFavorite && styles.favoriteIconActive,
                      ]}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.recipientSelector}
                  onPress={() => {
                    setShowRecipientSearch(true);
                  }}
                >
                  <Text style={styles.recipientSelectorText}>
                    Select recipient
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Recipient Search Modal */}
            {showRecipientSearch && (
              <View style={styles.recipientSearchContainer}>
                <View style={styles.searchHeader}>
                  <Text style={styles.searchTitle}>Select Recipient</Text>
                  <TouchableOpacity
                    onPress={() => setShowRecipientSearch(false)}
                  >
                    <Text style={styles.closeButton}>×</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <RNScrollView style={styles.recipientList}>
                  {getAccountList.status === 'pending' ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#2e7d32" />
                    </View>
                  ) : getAccountList.isError ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>
                        Failed to load recipients
                      </Text>
                    </View>
                  ) : (
                    <>
                      {filteredRecipients.map((recipient) => (
                        <TouchableOpacity
                          key={recipient.id}
                          style={styles.recipientItem}
                          onPress={() => handleRecipientSelect(recipient)}
                        >
                          <View style={styles.recipientInfo}>
                            <Image
                              source={{ uri: recipient.avatar }}
                              style={styles.recipientAvatar}
                            />
                            <View>
                              <Text style={styles.recipientName}>
                                {recipient.name}
                              </Text>
                              <Text style={styles.recipientBank}>
                                {recipient.bank}
                              </Text>
                            </View>
                          </View>
                          {recipient.isFavorite && (
                            <Text style={styles.favoriteIconActive}>★</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={styles.addNewRecipient}>
                        <Text style={styles.addNewRecipientText}>
                          + Add New Recipient
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </RNScrollView>
              </View>
            )}

            {/* Amount Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}></Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            {/* Reference/Note */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Note (Optional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Add a note"
                value={note}
                onChangeText={setNote}
                multiline
              />
            </View>

            {/* Transaction Limits & Notices */}
            <View style={styles.noticeContainer}>
              <Text style={styles.limitText}>
                Daily limit: {remainingLimit.toFixed(0)} remaining of VND
                {dailyLimit.toFixed(0)}
              </Text>
              <Text style={styles.processingTimeText}>
                Estimated processing time: 1-3 business days
              </Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={styles.quickAction}>
                <View style={styles.quickActionIcon}>
                  <TransferIcon color="#2e7d32" width={24} height={24} />
                </View>
                <Text style={styles.quickActionText}>Scan QR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickAction}>
                <View style={styles.quickActionIcon}>
                  <TransferIcon color="#2e7d32" width={24} height={24} />
                </View>
                <Text style={styles.quickActionText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* CTA Button */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              (!toAccount || !amount) && styles.ctaButtonDisabled,
            ]}
            disabled={!toAccount || !amount}
            onPress={handleContinue}
          >
            <Text style={styles.ctaButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
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
  recentButton: {
    padding: 8,
  },
  recentButtonText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  accountSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  accountNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  accountBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  recipientSelector: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  recipientSelectorText: {
    fontSize: 16,
    color: '#666',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#e0e0e0',
  },
  favoriteIconActive: {
    color: '#ffc107',
  },
  recipientSearchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10,
    padding: 16,
    borderRadius: 12,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  recipientList: {
    maxHeight: 300,
  },
  recipientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  recipientBank: {
    fontSize: 12,
    color: '#666',
  },
  addNewRecipient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  addNewRecipientText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  currencySymbol: {
    fontSize: 20,
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    color: '#333',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  noticeContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  limitText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  processingTimeText: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
  },
  ctaContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  ctaButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
