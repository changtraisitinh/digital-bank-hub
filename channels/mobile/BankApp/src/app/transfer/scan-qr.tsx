import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColorScheme } from 'react-native';

import { SafeAreaView } from '@/components/ui';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanQRScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // States
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);

  // Animation values
  const scannerAnimation = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;

  // Partner data
  const partners = [
    {
      id: 'vnpay',
      name: 'VNPay',
      logo: require('../../../assets/images/partners/vnpay.png'),
      description: 'Pay via VNPay at 50,000+ stores',
    },
    {
      id: 'vietqr',
      name: 'VietQR',
      logo: require('../../../assets/images/partners/vietqr.png'),
      description: 'Scan VietQR for bank transfers',
    },
    {
      id: 'napas',
      name: 'Napas',
      logo: require('../../../assets/images/partners/napas.png'),
      description: 'Napas network compatible',
    },
  ];

  // Start scanner animation
  useEffect(() => {
    startScannerAnimation();

    // Hide hint after 5 seconds
    const hintTimer = setTimeout(() => {
      Animated.timing(hintOpacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => setShowHint(false));
    }, 5000);

    return () => clearTimeout(hintTimer);
  }, []);

  // Scanner animation
  const startScannerAnimation = () => {
    scannerAnimation.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scannerAnimation, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.timing(scannerAnimation, {
          toValue: 0,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  // Navigate to manual entry
  const goToManualEntry = () => {
    router.push('/(app)/transfer/manual-entry');
  };

  // Navigate to my QR code
  const goToMyQRCode = () => {
    router.push('/(app)/transfer/my-qr');
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      {/* Scanner UI */}
      <View style={styles.camera}>
        {/* Top Bar */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDarkMode ? 'white' : 'black'}
            />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Scanner Overlay */}
        <View style={styles.overlay}>
          {/* Scanner Frame */}
          <View style={styles.scannerFrame}>
            {/* Animated Scanner Line */}
            <Animated.View
              style={[
                styles.scannerLine,
                {
                  transform: [
                    {
                      translateY: scannerAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, SCAN_AREA_SIZE],
                      }),
                    },
                  ],
                },
              ]}
            />

            {/* Corner Markers */}
            <View style={[styles.cornerMarker, styles.topLeftMarker]} />
            <View style={[styles.cornerMarker, styles.topRightMarker]} />
            <View style={[styles.cornerMarker, styles.bottomLeftMarker]} />
            <View style={[styles.cornerMarker, styles.bottomRightMarker]} />
          </View>

          {/* Scan Hint */}
          {showHint && (
            <Animated.Text
              style={[
                styles.scanHint,
                { opacity: hintOpacity },
                isDarkMode && styles.textLight,
              ]}
            >
              Please select a payment method below
            </Animated.Text>
          )}

          {/* Partner Logos */}
          <View style={styles.partnersContainer}>
            {partners.map((partner) => (
              <TouchableOpacity
                key={partner.id}
                style={styles.partnerLogo}
                onPress={() => showPartnerTooltip(partner)}
              >
                <Image
                  source={partner.logo}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={goToMyQRCode}
            >
              <Ionicons
                name="qr-code"
                size={20}
                color={isDarkMode ? 'white' : 'black'}
              />
              <Text style={[styles.actionText, isDarkMode && styles.textLight]}>
                My QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={goToManualEntry}
            >
              <Ionicons
                name="keypad"
                size={20}
                color={isDarkMode ? 'white' : 'black'}
              />
              <Text style={[styles.actionText, isDarkMode && styles.textLight]}>
                Manual Entry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Partner Tooltip Modal */}
      <Modal
        visible={selectedPartner !== null}
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.tooltipOverlay}
          activeOpacity={1}
          onPress={() => setSelectedPartner(null)}
        >
          <View style={styles.tooltipContainer}>
            <Image
              source={selectedPartner?.logo}
              style={styles.tooltipLogo}
              resizeMode="contain"
            />
            <Text style={styles.tooltipTitle}>{selectedPartner?.name}</Text>
            <Text style={styles.tooltipDescription}>
              {selectedPartner?.description}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  flashButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  scannerLine: {
    height: 2,
    width: '100%',
    backgroundColor: '#2e7d32',
    shadowColor: '#2e7d32',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  cornerMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#2e7d32',
    backgroundColor: 'transparent',
  },
  topLeftMarker: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  topRightMarker: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bottomLeftMarker: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRightMarker: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  scanHint: {
    marginTop: 16,
    fontSize: 16,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  partnersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  partnerLogo: {
    width: 40,
    height: 40,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
  },
  textLight: {
    color: 'white',
  },
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  tooltipLogo: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tooltipDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
});
