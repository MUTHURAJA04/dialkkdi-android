import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { verifyOtpAndCreateAccount } from '../../api/authService';

const VerifyOtp = ({ route }) => {
  const { email } = route.params || {}; // ✅ Get email from previous screen
  const [otp, setOtp] = useState('');
  const navigation = useNavigation();

  const handleVerifyOtp = async () => {
  if (!otp) {
    Alert.alert('Error', 'Please enter OTP');
    return;
  }

  try {
    console.log('📡 Sending OTP verification:', { email, otp });
    const response = await verifyOtpAndCreateAccount(email, otp);
    console.log('✅ OTP Verified:', response);

    Alert.alert('Success', 'Account created successfully!');
    navigation.navigate('Login');
  } catch (error) {
    console.error('❌ OTP Verification Failed:', error.response?.data || error.message);
    Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
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

      <TouchableOpacity
        onPress={handleVerifyOtp}
        className="bg-orange-600 p-4 rounded-lg w-full"
      >
        <Text className="text-white text-center font-semibold">Verify</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VerifyOtp;
