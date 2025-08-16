import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { resendRegisterOtp, verifyOtpAndCreateAccount } from '../services/apiClient';

const VerifyOtp = () => {
  // const { email } = route.params || {}; // ✅ Get email from previous screen
  const route = useRoute();
  const { email, type } = route.params;
  const [otp, setOtp] = useState('');
  const navigation = useNavigation();

  /** ✅ Handle OTP Verification */
  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    try {
      console.log('📡 Sending OTP verification:', { email, otp, type });
      const response = await verifyOtpAndCreateAccount(email, otp, type);
      console.log('✅ OTP Verified:', response);

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('❌ OTP Verification Failed:', error.response?.data || error.message);
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
    }
  };

  /** ✅ Handle Resend OTP */
  const handleResendOtp = async () => {
    try {
      console.log('📡 Resending OTP to:', email);
      const response = await resendRegisterOtp(email, type);
      console.log('✅ OTP Resent:', response);

      Alert.alert('Success', 'A new OTP has been sent to your email.');
    } catch (error) {
      console.error('❌ Resend OTP Failed:', error.response?.data || error.message);
      Alert.alert('Failed', error.response?.data?.message || 'Unable to resend OTP');
    }
  };


  return (
    <SafeAreaView className="flex-1 justify-center items-center bg-white px-6">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Verify OTP</Text>

      <TextInput
        placeholder="Enter OTP"
        placeholderTextColor="#888"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        className="border border-gray-300 rounded-lg p-3 w-full mb-4"
      />

      {/* ✅ Verify OTP Button */}
      <TouchableOpacity
        onPress={handleVerifyOtp}
        className="bg-orange-600 p-4 rounded-lg w-full mb-3"
      >
        <Text className="text-white text-center font-semibold">Verify</Text>
      </TouchableOpacity>

      {/* ✅ Resend OTP Button */}
      <TouchableOpacity
        onPress={handleResendOtp}
        className="bg-gray-300 p-4 rounded-lg w-full"
      >
        <Text className="text-black text-center font-semibold">Resend OTP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VerifyOtp;
