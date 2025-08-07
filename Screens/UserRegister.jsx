import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import Input from '../components/CustomInput';
import { signupUser } from '../services/apiClient';

const UserRegister = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  /** ✅ Handle Register */
  const handleRegister = async () => {
    console.log('🔹 [START] handleRegister triggered');

    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      console.warn('⚠️ Validation failed: Missing fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      console.warn('⚠️ Validation failed: Password mismatch');
      return;
    }
    if (!agreed) {
      Alert.alert('Error', 'You must agree to Terms and Conditions');
      console.warn('⚠️ Validation failed: Terms not accepted');
      return;
    }

    try {
      console.log('📡 [REQUEST] Sending signup payload:', {
        name,
        email,
        phone,
        password,
      });

      const result = await signupUser(name, email, phone, password);

      console.log('✅ [RESPONSE] Signup:', result);

      // Adjust condition based on backend response
      if (result?.success || result?.message?.includes('OTP')) {
        Alert.alert('Success', 'OTP sent to your email');
        console.log('➡️ Navigating to VerifyOtp screen with email:', email);
        navigation.navigate('VerifyOtp', { email });
      } else {
        Alert.alert('Signup Failed', result?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ [ERROR] Signup failed:', error.response?.data || error.message);
      Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
 
    <ScrollView
  contentContainerStyle={{
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }}
  className="bg-white flex-1"
>
  <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
  
  {/* Title */}
  <Text className="text-2xl font-bold text-center mb-6 text-orange-500">
    REGISTER
  </Text>

  {/* Name Input */}
  <Input
    placeholder="Enter your full name"
    value={name}
    onChangeText={setName}
    placeholderTextColor="#999"
  />

  {/* Email Input */}
  <Input
    placeholder="Email Address"
    keyboardType="email-address"
    value={email}
    onChangeText={setEmail}
    placeholderTextColor="#aaa"
  />

  {/* Phone Input */}
  <Input
    placeholder="Enter your phone number"
    keyboardType="phone-pad"
    value={phone}
    onChangeText={setPhone}
    placeholderTextColor="#999"
  />

  {/* Password Input */}
  <Input
    placeholder="Enter password"
    secureTextEntry
    value={password}
    onChangeText={setPassword}
    placeholderTextColor="#999"
  />

  {/* Confirm Password Input */}
  <Input
    placeholder="Re-enter password"
    secureTextEntry
    value={confirmPassword}
    onChangeText={setConfirmPassword}
    placeholderTextColor="#999"
  />

  {/* Agree to Terms */}
  <TouchableOpacity
    onPress={() => setAgreed(!agreed)}
    className="flex-row items-center mb-4"
  >
    <View
      className={`w-5 h-5 rounded border-2 mr-3 justify-center items-center ${
        agreed ? 'bg-orange-500 border-orange-500' : 'border-gray-400'
      }`}
    >
      {agreed && <Text className="text-white text-xs">✓</Text>}
    </View>
    <Pressable onPress={() => setShowTerms(true)}>
      <Text className="text-gray-700">
        I agree to the{' '}
        <Text className="underline text-sky-500">Terms and Conditions</Text>
      </Text>
    </Pressable>
  </TouchableOpacity>

  {/* Register Button */}
  <TouchableOpacity
    className="bg-orange-500 py-3 rounded-md mb-4 w-full"
    onPress={handleRegister}
  >
    <Text className="text-center text-white font-semibold">REGISTER</Text>
  </TouchableOpacity>

  {/* Login Link */}
  <Text className="text-center text-gray-600">
    Already have an account?{' '}
    <Text
      className="text-sky-500 underline"
      onPress={() => navigation.navigate('Login')}
    >
      Login
    </Text>
  </Text>

  {/* Terms Modal */}
  <Modal
    visible={showTerms}
    animationType="slide"
    transparent={true}
    onRequestClose={() => setShowTerms(false)}
  >
    <View className="flex-1 bg-black bg-opacity-30 justify-center items-center">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View className="bg-white w-11/12 rounded-lg p-6">
        <Text className="text-lg font-bold mb-2">Terms and Conditions</Text>
        <ScrollView className="h-60 mb-4">
          <Text className="text-gray-600">
            Welcome to DigiAiQuest. By registering, you agree not to misuse our services...
          </Text>
        </ScrollView>
        <TouchableOpacity
          onPress={() => setShowTerms(false)}
          className="bg-orange-500 rounded-md py-2"
        >
          <Text className="text-center text-white font-semibold">Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
</ScrollView>


  );
};

export default UserRegister;
