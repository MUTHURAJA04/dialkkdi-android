import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { resetPassword } from '../../api/authService';

const ResetPassword = ({ route }) => {
  const { email, otp } = route.params || {}; // ✅ Email & OTP passed from VerifyOtp (Forgot)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      console.log('📡 Sending reset password request:', { email, newPassword, confirmPassword, otp });
      const response = await resetPassword(email, newPassword, confirmPassword, otp);
      console.log('✅ Password Reset Success:', response.data);

      Alert.alert('Success', 'Password has been reset successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('❌ Password Reset Failed:', error.response?.data || error.message);
      Alert.alert('Reset Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6 justify-center">
          <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">Reset Password</Text>

          <TextInput
            placeholder="New Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            className="border border-gray-300 rounded-lg p-3 mb-4"
          />

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            className="border border-gray-300 rounded-lg p-3 mb-4"
          />

          <TouchableOpacity
            onPress={handleResetPassword}
            className="bg-orange-600 p-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Reset Password</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPassword;
