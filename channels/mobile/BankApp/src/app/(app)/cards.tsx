import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Cards as CardsIcon } from '@/components/ui/icons/cards';
import { Mastercard } from '@/components/ui/icons/mastercard';
import { Visa } from '@/components/ui/icons/visa';

const { width } = Dimensions.get('window');

// Mock data for card products
const cardProducts = [
  {
    id: '1',
    name: 'Premium Credit Card',
    description: 'Exclusive rewards and benefits',
    color: '#2e7d32',
    benefits: ['5% cashback', 'Airport lounge access', 'Travel insurance'],
  },
  {
    id: '2',
    name: 'Gold Debit Card',
    description: 'Enhanced daily spending',
    color: '#ff9800',
    benefits: [
      'No foreign transaction fees',
      'ATM fee rebates',
      'Purchase protection',
    ],
  },
  {
    id: '3',
    name: 'Platinum Business Card',
    description: 'For your business needs',
    color: '#424242',
    benefits: [
      'Business expense tracking',
      'Employee cards',
      'Extended warranty',
    ],
  },
];

// Mock data for user's cards
const userCards = [
  {
    id: '101',
    type: 'Credit',
    number: '**** **** **** 4567',
    issuer: 'VISA',
    expiryDate: '12/25',
    color: '#1e88e5',
    balance: 2345.67,
    limit: 5000,
  },
  {
    id: '102',
    type: 'Debit',
    number: '**** **** **** 8901',
    issuer: 'MASTERCARD',
    expiryDate: '09/24',
    color: '#43a047',
    balance: 1234.56,
    limit: null,
  },
];

export default function Cards() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const productsScrollRef = useRef(null);

  // Auto scroll for card products
  useEffect(() => {
    const timer = setInterval(() => {
      if (productsScrollRef.current) {
        const newScrollX = scrollX._value + width;
        if (newScrollX >= width * cardProducts.length) {
          productsScrollRef.current.scrollTo({ x: 0, animated: true });
        } else {
          productsScrollRef.current.scrollTo({ x: newScrollX, animated: true });
        }
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // Card product item
  const CardProductItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.cardProductItem, { backgroundColor: item.color }]}
      onPress={() => {
        /* Handle card product selection */
      }}
    >
      <Text style={styles.cardProductName}>{item.name}</Text>
      <Text style={styles.cardProductDescription}>{item.description}</Text>
      <View style={styles.benefitsContainer}>
        {item.benefits.map((benefit, index) => (
          <View key={index} style={styles.benefitItem}>
            <Text style={styles.benefitText}>• {benefit}</Text>
          </View>
        ))}
      </View>
      <View style={styles.applyButton}>
        <Text style={styles.applyButtonText}>Apply Now</Text>
      </View>
    </TouchableOpacity>
  );

  // User card item
  const UserCardItem = ({ card }) => (
    <TouchableOpacity
      style={[styles.userCardItem, { backgroundColor: card.color }]}
      onPress={() => {
        /* Handle card details view */
      }}
    >
      <View style={styles.cardBackground}>
        <View style={styles.cardBackgroundCircle1} />
        <View style={styles.cardBackgroundCircle2} />
        <View style={styles.cardBackgroundPattern} />
      </View>

      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>{card.type} Card</Text>
        <View style={styles.cardIssuerLogo}>
          {card.issuer === 'VISA' ? (
            <Visa width={48} height={30} color="white" />
          ) : (
            <Mastercard width={48} height={30} />
          )}
        </View>
      </View>
      <View style={styles.cardChip} />
      <Text style={styles.cardNumber}>{card.number}</Text>
      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.cardLabel}>Expires</Text>
          <Text style={styles.cardExpiry}>{card.expiryDate}</Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.cardLabel}>
            {card.type === 'Credit' ? 'Available Credit' : 'Available Balance'}
          </Text>
          <Text style={styles.cardBalance}>
            $
            {card.type === 'Credit'
              ? (card.limit - card.balance).toFixed(2)
              : card.balance.toFixed(2)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Cards</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ New Card</Text>
            </TouchableOpacity>
          </View>

          {/* Galaxy Panel for Card Products */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Card Products</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={productsScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            style={styles.productsScrollView}
          >
            {cardProducts.map((item) => (
              <CardProductItem key={item.id} item={item} />
            ))}
          </ScrollView>

          <View style={styles.paginationContainer}>
            {cardProducts.map((_, i) => {
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

          {/* User's Cards Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Cards</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.userCardsContainer}>
            {userCards.map((card) => (
              <UserCardItem key={card.id} card={card} />
            ))}
          </View>

          {/* Card Actions */}
          <View style={styles.cardActionsContainer}>
            <TouchableOpacity style={styles.cardAction}>
              <CardsIcon color="#2e7d32" />
              <Text style={styles.cardActionText}>Lock Card</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardAction}>
              <CardsIcon color="#2e7d32" />
              <Text style={styles.cardActionText}>Set Limits</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cardAction}>
              <CardsIcon color="#2e7d32" />
              <Text style={styles.cardActionText}>View PIN</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
    color: '#333',
  },
  viewAllText: {
    color: '#2e7d32',
    fontWeight: '500',
  },
  productsScrollView: {
    height: 230, // Increased from 210 to 215
  },
  cardProductItem: {
    width: width - 32,
    height: 205, // Increased from 190 to 195
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    justifyContent: 'space-between',
  },
  cardProductName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  cardProductDescription: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 12,
  },
  benefitsContainer: {
    marginBottom: 12,
  },
  benefitItem: {
    marginBottom: 4,
  },
  benefitText: {
    color: 'white',
    fontSize: 12,
  },
  applyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    marginBottom: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2e7d32',
    marginHorizontal: 4,
  },
  userCardsContainer: {
    marginBottom: 24,
  },
  userCardItem: {
    height: 195, // Increased from 190 to 195
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-between',
    overflow: 'hidden', // Important for background elements
    position: 'relative', // For absolute positioning of background elements
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardBackgroundCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -30,
  },
  cardBackgroundCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    bottom: -100,
    left: -50,
  },
  cardBackgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    // Pattern effect with diagonal lines
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'white',
    borderStyle: 'dashed',
    transform: [{ rotate: '45deg' }, { scale: 3 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1, // Ensure content is above background elements
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cardIssuer: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cardIssuerLogo: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  // You can remove these styles as they're no longer needed:
  // visaLogo: { ... },
  // mastercardCircleRed: { ... },
  // mastercardCircleYellow: { ... },
  // mastercardText: { ... },
  visaLogo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  mastercardCircleRed: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EB001B',
    position: 'absolute',
    left: -8,
  },
  mastercardCircleYellow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F79E1B',
    position: 'absolute',
    right: -8,
  },
  mastercardText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 26,
    letterSpacing: 0.5,
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    marginVertical: 16,
    zIndex: 1,
    // Add metallic effect to chip
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  cardNumber: {
    fontSize: 18,
    letterSpacing: 2,
    color: 'white',
    fontWeight: '500',
    zIndex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
    zIndex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  cardExpiry: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  cardBalance: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  cardActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardAction: {
    alignItems: 'center',
  },
  cardActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
  },
});
