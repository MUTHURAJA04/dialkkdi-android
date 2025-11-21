import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { X } from 'react-native-feather';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import Input from '../components/CustomInput';
import { googleSSOLogin, loginWithEmail } from '../services/apiClient'; // ✅ Added login API
import AsyncStorage from '@react-native-async-storage/async-storage';
import PhoneModal from '../components/PhoneModal';

const Login = ({ route }) => {
  const navigation = useNavigation();
  const { type } = route.params;
  const title = type === 'business' ? 'Business Login' : 'User Login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleloading, setGoogleloading] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  /** ✅ Handle Google Login */
  const handleGoogleLogin = async () => {
    try {
      setGoogleloading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data.idToken;
      const result = await googleSSOLogin(idToken);

      if (result?.token) {
        Alert.alert('Welcome!', `Logged in as ${result.user.name}`);
        console.log('SSO CLICKED');
        setShowPhoneModal(true);
      } else {
        console.warn('⚠️ Google login failed:', result?.message);
        Alert.alert('Login Failed', result?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ Google Sign-In Error:', error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Login cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Login already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play Services not available');
      } else {
        Alert.alert('Something went wrong', error.message || 'Unknown error');
      }
    } finally {
      setGoogleloading(false);
    }
  };

  /** ✅ Handle Email/Password Login */
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const emailRegex =
      /^(?!\.)(?!.*\.\.)(?!.*\.\@)[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\.com$/;

    if (!emailRegex.test(email.trim())) {
      Alert.alert('Validation Error', 'Enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be 6-20 characters');
      return;
    }
    if (password.length > 20) {
      Alert.alert('Validation Error', 'Password must be 6-20 characters');
      return;
    }

    try {
      setLoading(true);

      const result = await loginWithEmail(email, password, type);

      if (result?.token) {
        if (type == 'user') {
          console.log('result', result);
          console.log('result.name', result.user.name);
          Alert.alert('Welcome!', `Logged in as ${result.user.name} `);
          navigation.navigate('Home');
        } else {
          Alert.alert('Welcome!', `Logged in as ${result?.business?.name} `);
          navigation.navigate('BusinessLanding');
        }
      } else {
        console.warn(' Login failed:', result?.message);
        Alert.alert('Login Failed', result?.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error(' Email Login Error:', error);
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const checkAuth = async () => {
        try {
          const userData = await AsyncStorage.getItem('userData');
          const businessData = await AsyncStorage.getItem('businessData');

          if (userData || businessData) {
            BackHandler.exitApp();
          }
        } catch (e) {
          // ignore
        }
      };
      checkAuth();
    }, [navigation]),
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center px-6">
            {/* Title */}
            <Text className="text-2xl font-bold text-gray-800 mb-6">
              {title}
            </Text>

            {/* Email Input */}
            <Input
              placeholder="Email Address"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password Input */}
            <Input
              placeholder="Password"
              placeholderTextColor="#aaa"
              isPassword
              value={password}
              onChangeText={setPassword}
              showPassword={showPassword}
              togglePasswordVisibility={() => setShowPassword(prev => !prev)}
            />

            {/* ✅ Email Login Button */}
            <TouchableOpacity
              className={`px-6 py-3 rounded-lg w-full mb-4 ${loading ? 'bg-orange-400' : 'bg-orange-500'}`}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  Login
                </Text>
              )}
            </TouchableOpacity>

            {/* Conditional Google SSO for User Login */}
            {type === 'user' && (
              <View className="w-full items-center mb-4">
                <View className="flex-row items-center w-full my-4">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="mx-2 text-gray-500 text-sm">OR</Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                <TouchableOpacity
                  onPress={handleGoogleLogin}
                  disabled={googleloading}
                  className="flex-row items-center justify-center border border-gray-300 px-6 py-3 rounded-lg w-full bg-white"
                >
                  {googleloading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text className="text-center text-base font-semibold text-gray-700">
                      Continue with Google
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Register & Forgot Password */}
            <View className="flex-row justify-between items-center w-full mb-6">
              <TouchableOpacity
                onPress={() => {
                  if (type === 'business') {
                    navigation.navigate('BusinessRegister');
                  } else {
                    navigation.navigate('UserRegister');
                  }
                }}
              >
                <Text className="text-sm text-gray-700">
                  Don't have an account yet?{' '}
                  <Text className="text-orange-600 font-semibold underline">
                    Register
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword', { type })}
              >
                <Text className="text-sm text-orange-600 font-semibold underline">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Close Button */}
          {/* <View className="items-center mb-6">
            <TouchableOpacity onPress={onClose} className="flex-row items-center space-x-2">
              <X color="#888" width={22} height={22} />
              <Text className="text-gray-600 text-sm">Close</Text>
            </TouchableOpacity>
          </View> */}
        </ScrollView>
      </KeyboardAvoidingView>
      <PhoneModal
        visible={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
      />
    </SafeAreaView>
  );
};

export default Login;
