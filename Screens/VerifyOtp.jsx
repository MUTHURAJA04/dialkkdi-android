import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar, SafeAreaView, ActivityIndicatorBase, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { resendRegisterOtp, verifyOtpAndCreateAccount } from '../services/apiClient';

const VerifyOtp = () => {
  // const { email } = route.params || {}; // ✅ Get email from previous screen
  const route = useRoute();
  const { email, type } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false)
  const [resendLoading, setresendLoading] = useState(false)
  const navigation = useNavigation();

  /** ✅ Handle OTP Verification */
  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter OTP');
      return;
    }

    try {
      setLoading(true)
      const response = await verifyOtpAndCreateAccount(email, otp, type);

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login', { type });
    } catch (error) {
      console.error('❌ OTP Verification Failed:', error.response?.data || error.message);
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false)
    }
  };

  /** ✅ Handle Resend OTP */
  const handleResendOtp = async () => {
    try {
      setresendLoading(true)
      const response = await resendRegisterOtp(email, type);

      Alert.alert('Success', 'A new OTP has been sent to your email.');
    } catch (error) {
      console.error('❌ Resend OTP Failed:', error.response?.data || error.message);
      Alert.alert('Failed', error.response?.data?.message || 'Unable to resend OTP');
    } finally {
      setresendLoading(false)
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
        onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ""))} // ✅ only numbers
        keyboardType="number-pad"
        maxLength={4} // optional: limit OTP length
        className="border border-gray-300 rounded-lg p-3 w-full mb-4"
      />

      {/* ✅ Verify OTP Button */}
      <TouchableOpacity
        onPress={handleVerifyOtp}
        disabled={loading}
        className="bg-orange-600 p-4 rounded-lg w-full mb-3"
      >
        {
          loading ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-white text-center font-semibold">Verify</Text>
          )
        }
      </TouchableOpacity>

      {/* ✅ Resend OTP Button */}
      <TouchableOpacity
        onPress={handleResendOtp}
        disabled={loading}
        className="bg-gray-300 p-4 rounded-lg w-full"
      >
        {
          resendLoading ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-black text-center font-semibold">Resend OTP</Text>
          )
        }

      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VerifyOtp;
