import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  PhoneAuthProvider
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const recaptchaVerifier = useRef(null);

  // Google Auth Configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          // Navigation handled by App.js auth state
        })
        .catch((error) => {
          Alert.alert('Error', 'Google sign in failed');
          console.error(error);
        });
    }
  }, [response]);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
      let errorMessage = 'Authentication failed';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address';
          break;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendCode = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Basic phone number validation
    if (!phoneNumber.startsWith('+')) {
      Alert.alert('Error', 'Please include country code (e.g., +1 for US)');
      return;
    }

    try {
      setLoading(true);
      const phoneProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      setVerificationId(verificationId);
      Alert.alert('Success', 'Verification code sent to your phone');
    } catch (error) {
      console.error('Phone auth error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      let errorMessage = 'Failed to send verification code';

      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later or use a test phone number.';
      } else if (error.code === 'auth/missing-app-credential') {
        errorMessage = 'App verification failed. You may need to configure SHA-1 certificate in Firebase Console.';
      } else if (error.code === 'auth/captcha-check-failed') {
        errorMessage = 'reCAPTCHA verification failed. Please try again.';
      } else {
        // Show the actual error for debugging
        errorMessage = `${errorMessage}\n\nError: ${error.code || 'unknown'}\n${error.message}`;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!verificationId) {
      Alert.alert('Error', 'Please request a verification code first');
      return;
    }

    try {
      setLoading(true);
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await signInWithCredential(auth, credential);
      // Navigation handled by App.js auth state
    } catch (error) {
      console.error('Verification error:', error);
      let errorMessage = 'Invalid verification code';

      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'The code you entered is incorrect';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'The code has expired. Please request a new one';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={{
          apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        }}
        attemptInvisibleVerification={true}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>FoodieMaps</Text>
          <Text style={styles.subtitle}>
            {authMethod === 'phone'
              ? (verificationId ? 'Enter verification code' : 'Sign in with phone')
              : (isSignUp ? 'Create your account' : 'Welcome back!')}
          </Text>

          {/* Auth Method Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, authMethod === 'email' && styles.activeTab]}
              onPress={() => {
                setAuthMethod('email');
                setVerificationId(null);
              }}
            >
              <Text style={[styles.tabText, authMethod === 'email' && styles.activeTabText]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, authMethod === 'phone' && styles.activeTab]}
              onPress={() => {
                setAuthMethod('phone');
                setVerificationId(null);
              }}
            >
              <Text style={[styles.tabText, authMethod === 'phone' && styles.activeTabText]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Email/Password Form */}
          {authMethod === 'email' && (
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
              <Text style={styles.hint}>Must be at least 6 characters</Text>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleEmailAuth}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                disabled={loading}
              >
                <Text style={styles.switchText}>
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Phone Number Form */}
          {authMethod === 'phone' && (
            <View style={styles.formContainer}>
              {!verificationId ? (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    editable={!loading}
                  />
                  <Text style={styles.hint}>Include country code (e.g., +1 for US)</Text>

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handlePhoneSendCode}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Sending...' : 'Send Verification Code'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                  />

                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handlePhoneVerify}
                    disabled={loading}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Verifying...' : 'Verify Code'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setVerificationId(null)}
                    disabled={loading}
                  >
                    <Text style={styles.switchText}>
                      Resend code
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={!request || loading}
          >
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Back to Landing */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Landing')}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back to home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#d9f99d',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#16a34a',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#16a34a',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 4,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    marginLeft: 4,
  },
  button: {
    backgroundColor: '#16a34a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    color: '#16a34a',
    textAlign: 'center',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    paddingHorizontal: 12,
    color: '#999',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 20,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  backText: {
    color: '#999',
    fontSize: 14,
  },
});
