import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { resetPassword } from '../../api/authService';
import { ActivityIndicator } from 'react-native/types_generated/index';

const ResetPassword = ({ route }) => {
  const { email, otp } = route.params || {}; // ✅ Email & OTP passed from VerifyOtp (Forgot)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false)
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
      setLoading(true)
      const response = await resetPassword(email, newPassword, confirmPassword, otp);

      Alert.alert('Success', 'Password has been reset successfully!');
      navigation.navigate('Login');
    } catch (error) {
      console.error('❌ Password Reset Failed:', error.response?.data || error.message);
      Alert.alert('Reset Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false)
    }
  };

  return (
    <SafeAreaView className="flex-1 ">
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
            className={` p-4 rounded-lg ${loading ? "bg-orange-400" : "bg-orange-500"}`}
            disabled={loading}
          >
            {
              loading ? (
                <ActivityIndicator />
              ) : (
                <Text className="text-white text-center font-semibold">Reset Password</Text>
              )
            }

          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
};

export default ResetPassword;
