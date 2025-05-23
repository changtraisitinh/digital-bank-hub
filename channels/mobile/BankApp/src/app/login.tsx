import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSignIn } from '@/api';
import { LoginForm } from '@/components/login-form';
import { FocusAwareStatusBar, Text } from '@/components/ui';
import { FaceIDIcon, FingerprintIcon } from '@/components/ui/icons';
import { useAuth } from '@/lib';

const { width } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const signIn = useAuth.use.signIn();
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin'>(
    'biometric'
  );

  // Use the account list mutation
  const login = useSignIn();

  const handleBiometricAuth = async () => {
    try {
      // Temporarily simulate successful authentication
      signIn({ access: 'access-token', refresh: 'refresh-token' });
      router.push('/');
    } catch (error) {
      console.log('Authentication error:', error);
    }
  };

  const onSubmit = (data) => {
    const variables = {
      username: data.username,
      password: data.password,
    };

    login.mutate(variables, {
      onSuccess: (response) => {
        if (response.status === 200) {
          signIn({ access: 'access-token', refresh: 'refresh-token' });
          router.push('/');
        }
      },
      onError: (error) => {
        console.log('Login error:', error);
      },
    });
  };

  useEffect(() => {});

  return (
    <View style={styles.container}>
      <FocusAwareStatusBar />

      {/* Authentication Section */}
      <View style={styles.authContainer}>
        {authMethod === 'biometric' ? (
          <View style={styles.biometricContainer}>
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricAuth}
            >
              {Platform.OS === 'ios' ? (
                <FaceIDIcon
                  size={60}
                  color="#2e7d32"
                  style={styles.biometricIcon}
                />
              ) : (
                <FingerprintIcon
                  size={60}
                  color="#2e7d32"
                  style={styles.biometricIcon}
                />
              )}
              <Text style={styles.biometricText}>
                {Platform.OS === 'ios' ? 'Use Face ID' : 'Use Fingerprint'}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={styles.switchAuth}
              onPress={() => setAuthMethod('pin')}
            >
              <Text style={styles.switchText}>Use PIN Instead</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <LoginForm onSubmit={onSubmit} />
            <TouchableOpacity
              style={styles.switchAuth}
              onPress={() => setAuthMethod('biometric')}
            >
              <Text style={styles.switchText}>
                Use {Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint'} Instead
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupButton}>Sign Up</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.helpLink}>
          <Text style={styles.helpText}>Trouble signing in?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  authContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  biometricContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  biometricButton: {
    alignItems: 'center',
    padding: 20,
  },
  biometricIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  biometricText: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
  },
  formContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 20,
  },
  switchAuth: {
    alignItems: 'center',
    padding: 12,
    marginTop: 16,
  },
  switchText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signupText: {
    color: '#666',
    marginRight: 8,
  },
  signupButton: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  helpLink: {
    alignItems: 'center',
  },
  helpText: {
    color: '#666',
    textDecorationLine: 'underline',
  },
});
