import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { FocusAwareStatusBar, Text, View } from '@/components/ui';

// Mock data for the galaxy panel (promotions/offers)
const promotions = [
  { id: '1', title: 'Get 5% cashback on all transactions', image: 'promo1' },
  { id: '2', title: 'Zero fee on international transfers', image: 'promo2' },
  { id: '3', title: 'Earn 2x rewards on weekend spending', image: 'promo3' },
  { id: '4', title: 'Apply for a loan with special rates', image: 'promo4' },
];

// Mock data for banking services
const bankingServices = [
  { id: '1', title: 'Electricity', icon: 'flash' },
  { id: '2', title: 'Water', icon: 'water' },
  { id: '3', title: 'Phone Top-up', icon: 'phone-portrait' },
  { id: '4', title: 'Internet', icon: 'wifi' },
  { id: '5', title: 'Flight Tickets', icon: 'airplane' },
  { id: '6', title: 'Movie Tickets', icon: 'film' },
  { id: '7', title: 'Food Delivery', icon: 'restaurant' },
  { id: '8', title: 'Shopping', icon: 'cart' },
];

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  // Auto scroll for galaxy panel
  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const newScrollX = scrollX._value + width;
        if (newScrollX >= width * promotions.length) {
          scrollRef.current.scrollTo({ x: 0, animated: true });
        } else {
          scrollRef.current.scrollTo({ x: newScrollX, animated: true });
        }
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Quick action buttons
  const QuickActionButton = ({ icon, title, onPress }) => (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#2e7d32" />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  // Service button
  const ServiceButton = ({ icon, title }) => (
    <TouchableOpacity style={styles.serviceButton}>
      <View style={styles.serviceIconContainer}>
        <Ionicons name={icon} size={20} color="#2e7d32" />
      </View>
      <Text style={styles.serviceText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <FocusAwareStatusBar />

      {/* Header with greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, John</Text>
          <Text style={styles.subGreeting}>Welcome back!</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Galaxy Panel (Auto-scrolling promotions) */}
      <View style={styles.galaxyPanelContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {promotions.map((item, index) => (
            <View key={item.id} style={styles.promotionItem}>
              <Text style={styles.promotionText}>{item.title}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.paginationContainer}>
          {promotions.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 16, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>
      </View>

      {/* Account Information Panel */}
      <View style={styles.accountPanel}>
        <View style={styles.accountHeader}>
          <Text style={styles.accountTitle}>Main Account</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.accountDetails}>
          <Text style={styles.accountName}>John Doe</Text>
          <Text style={styles.accountNumber}>**** **** **** 1234</Text>
          <Text style={styles.accountBalance}>$12,345.67</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <QuickActionButton
          icon="add-circle-outline"
          title="Add Money"
          onPress={() => {}}
        />
        <QuickActionButton
          icon="arrow-forward-circle-outline"
          title="Transfer"
          onPress={handleTransfer}
        />
        <QuickActionButton
          icon="qr-code-outline"
          title="My QR"
          onPress={() => {}}
        />
        <QuickActionButton
          icon="document-text-outline"
          title="Pay Bills"
          onPress={() => {}}
        />
      </View>

      {/* Banking Services */}
      <View style={styles.servicesContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Banking Services</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.servicesGrid}>
          {bankingServices.map((service) => (
            <ServiceButton
              key={service.id}
              icon={service.icon}
              title={service.title}
            />
          ))}
        </View>
      </View>

      {/* Advertisement Banner */}
      <TouchableOpacity style={styles.advertisementBanner}>
        <Text style={styles.adTitle}>Special Offer</Text>
        <Text style={styles.adDescription}>
          Apply for a credit card today and get 50% off on annual fees
        </Text>
        <View style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </View>
      </TouchableOpacity>

      {/* Support Section */}
      <View style={styles.supportContainer}>
        <Text style={styles.supportTitle}>Need Help?</Text>
        <View style={styles.supportOptions}>
          <TouchableOpacity style={styles.supportOption}>
            <Ionicons name="call-outline" size={24} color="#2e7d32" />
            <Text style={styles.supportText}>Call Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportOption}>
            <Ionicons name="chatbubble-outline" size={24} color="#2e7d32" />
            <Text style={styles.supportText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.supportOption}>
            <Ionicons name="mail-outline" size={24} color="#2e7d32" />
            <Text style={styles.supportText}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galaxyPanelContainer: {
    height: 150,
    marginVertical: 16,
  },
  promotionItem: {
    width: width - 32,
    height: 120,
    marginHorizontal: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  promotionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2e7d32',
    marginHorizontal: 4,
  },
  accountPanel: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2e7d32',
  },
  accountDetails: {
    marginTop: 8,
  },
  accountName: {
    fontSize: 14,
    color: '#666',
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionButton: {
    alignItems: 'center',
    width: '22%',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  servicesContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  serviceButton: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  advertisementBanner: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  adDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  applyButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  supportContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  supportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  supportOption: {
    alignItems: 'center',
  },
  supportText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
});

// Handle transfer navigation
const handleTransfer = () => {
  router.push('/(app)/transfer');
};
