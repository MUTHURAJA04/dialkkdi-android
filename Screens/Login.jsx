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
} from 'react-native';
import { X } from 'react-native-feather';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Input from '../components/CustomInput';
import { googleSSOLogin } from '../services/apiClient'; // 🔄 Updated path

const Login = ({ type, onClose }) => {
  const navigation = useNavigation();
  const title = type === 'business' ? 'Business Login' : 'User Login';

  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      console.log('🟢 Starting Google login process...');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('✅ Google user info:', userInfo);

      const idToken = userInfo.data.idToken;
      const result = await googleSSOLogin(idToken);

      if (result.token) {
        console.log('🎉 Google login success:', result);
        Alert.alert('Welcome!', `Logged in as ${result.user.name}`);
        navigation.navigate('Home');
      } else {
        console.warn('⚠️ Google login failed:', result.message);
        Alert.alert('Login Failed', result.message);
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
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center items-center px-6">
            {/* Title */}
            <Text className="text-2xl font-bold text-gray-800 mb-6">{title}</Text>

            {/* Email Input */}
            <Input placeholder="Email Address" placeholderTextColor="#aaa" />

            {/* Password Input */}
            <Input
              placeholder="Password"
              placeholderTextColor="#aaa"
              isPassword
              showPassword={showPassword}
              togglePasswordVisibility={() => setShowPassword((prev) => !prev)}
            />

            {/* Login Button */}
            <TouchableOpacity
              className="bg-orange-500 px-6 py-3 rounded-lg w-full mb-4"
              onPress={() => {
                if (type === 'business') {
                  navigation.navigate('BusinessRegister');
                } else {
                  navigation.navigate('Home');
                }
              }}
            >
              <Text className="text-white text-center text-base font-semibold">Login</Text>
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
                  className="flex-row items-center justify-center border border-gray-300 px-6 py-3 rounded-lg w-full bg-white"
                >
                  <Text className="text-center text-base font-semibold text-gray-700">
                    Continue with Google
                  </Text>
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
                <Text className="text-sm text-orange-600">Don't have an account yet? Register</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text className="text-sm text-gray-600">Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Close Button */}
          <View className="items-center mb-6">
            <TouchableOpacity onPress={onClose} className="flex-row items-center space-x-2">
              <X color="#888" width={22} height={22} />
              <Text className="text-gray-600 text-sm">Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;
