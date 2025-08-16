import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import apiClient from '../services/apiClient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Input from '../components/CustomInput';

const ForgotPassword = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params;

  const [step, setStep] = useState(1); // 1=Email, 2=OTP, 3=Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  /** ✅ Send OTP */
  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    try {
      if (type === 'business') {
        console.log('📡 Sending OTP to:', email);
        const res = await apiClient.post('/business/forgotpassword', { email });
        Alert.alert('Success', res.data.message || 'OTP sent successfully');
        setStep(2);
      } else {
        console.log('📡 Sending OTP to:', email);
        const res = await apiClient.post('/user/forgotpassword', { email });
        Alert.alert('Success', res.data.message || 'OTP sent successfully');
        setStep(2);
      }
    } catch (err) {
      console.error('❌ Send OTP Error:', err.response?.data);
      Alert.alert('Error', err.response?.data?.message || 'Failed to send OTP');
    }
  };

  /** ✅ Verify OTP */
  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    try {
      if (type === 'business') {
        console.log('📡 Verifying OTP:', otp);
        const res = await apiClient.post('/business/verifyotp', { email, otp });
        console.log('✅ OTP verified successfully:', res.data);
        Alert.alert('Success', res.data.message || 'OTP verified');
        setStep(3);
      } else {
        console.log('📡 Verifying OTP:', otp);
        const res = await apiClient.post('/user/verifyotp', { email, otp });
        console.log('✅ OTP verified successfully:', res.data);
        Alert.alert('Success', res.data.message || 'OTP verified');
        setStep(3);
      }

    } catch (err) {
      console.error('❌ Verify OTP Error:', err.response?.data);
      Alert.alert('Error', err.response?.data?.message || 'OTP verification failed');
    }
  };

  /** ✅ Reset Password */
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter and confirm new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    try {
      if (type === 'business') {
        console.log('📡 Resetting password...');
        const res = await apiClient.post('/business/resetpassword', {
          email,
          newPassword,
          confirmPassword,
          otp,
        });
        console.log('✅ Password reset successful:', res.data);
        Alert.alert('Success', res.data.message || 'Password has been reset', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        console.log('📡 Resetting password...');
        const res = await apiClient.post('/user/resetpassword', {
          email,
          newPassword,
          confirmPassword,
          otp,
        });
        console.log('✅ Password reset successful:', res.data);
        Alert.alert('Success', res.data.message || 'Password has been reset', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      }

    } catch (err) {
      console.error('❌ Reset Password Error:', err.response?.data);
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (


    //     <SafeAreaView className="flex-1 bg-white">
    //   <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

    //   <KeyboardAvoidingView
    //     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    //     className="flex-1"
    //   >
    //     <ScrollView
    //       contentContainerStyle={{ flexGrow: 1 }}
    //       keyboardShouldPersistTaps="handled"
    //     >
    //       <View className="flex-1 justify-center items-center px-6">
    //         <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
    //           Forgot Password
    //         </Text>

    //         {/* STEP 1: Send OTP */}
    //         {step === 1 && (
    //           <>
    //             <TextInput
    //               placeholder="Enter your email"
    //               placeholderTextColor="#888"
    //               value={email}
    //               onChangeText={setEmail}
    //               className="border border-gray-300 rounded-lg p-3 mb-4 w-full"
    //             />
    //             <TouchableOpacity
    //               onPress={handleSendOTP}
    //               className="bg-orange-600 p-4 rounded-lg w-full"
    //             >
    //               <Text className="text-white text-center font-semibold">Send OTP</Text>
    //             </TouchableOpacity>
    //           </>
    //         )}

    //         {/* STEP 2: Verify OTP */}
    //         {step === 2 && (
    //           <>
    //             <TextInput
    //               placeholder="Enter OTP"
    //               placeholderTextColor="#888"
    //               value={otp}
    //               onChangeText={setOtp}
    //               className="border border-gray-300 rounded-lg p-3 mb-4 w-full"
    //             />
    //             <TouchableOpacity
    //               onPress={handleVerifyOTP}
    //               className="bg-orange-600 p-4 rounded-lg w-full"
    //             >
    //               <Text className="text-white text-center font-semibold">Verify OTP</Text>
    //             </TouchableOpacity>
    //           </>
    //         )}

    //         {/* STEP 3: Reset Password */}
    //         {step === 3 && (
    //           <>
    //             <TextInput
    //               placeholder="New Password"
    //               placeholderTextColor="#888"
    //               secureTextEntry
    //               value={newPassword}
    //               onChangeText={setNewPassword}
    //               className="border border-gray-300 rounded-lg p-3 mb-4 w-full"
    //             />
    //             <TextInput
    //               placeholder="Confirm Password"
    //               placeholderTextColor="#888"
    //               secureTextEntry
    //               value={confirmPassword}
    //               onChangeText={setConfirmPassword}
    //               className="border border-gray-300 rounded-lg p-3 mb-4 w-full"
    //             />
    //             <TouchableOpacity
    //               onPress={handleResetPassword}
    //               className="bg-orange-600 p-4 rounded-lg w-full"
    //             >
    //               <Text className="text-white text-center font-semibold">Reset Password</Text>
    //             </TouchableOpacity>
    //           </>
    //         )}
    //       </View>
    //     </ScrollView>
    //   </KeyboardAvoidingView>
    // </SafeAreaView>



    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="p-6"
        >
          <View className="flex-1 justify-center items-center">
            <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Forgot Password
            </Text>

            {/* STEP 1: Send OTP */}
            {step === 1 && (
              <>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  className="border border-gray-300 rounded-lg p-3 mb-4 w-full"
                />
                <TouchableOpacity
                  onPress={handleSendOTP}
                  className="bg-orange-600 p-4 rounded-lg w-full"
                >
                  <Text className="text-white text-center font-semibold">Send OTP</Text>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 2: Verify OTP */}
            {step === 2 && (
              <>
                <TextInput
                  placeholder="Enter OTP"
                  placeholderTextColor="#888"
                  value={otp}
                  onChangeText={setOtp}
                  className="border border-gray-300 rounded-lg p-3 mb-4 w-full"
                  keyboardType='number-pad'
                  maxLength={4}
                />
                <TouchableOpacity
                  onPress={handleVerifyOTP}
                  className="bg-orange-600 p-4 rounded-lg w-full"
                >
                  <Text className="text-white text-center font-semibold">Verify OTP</Text>
                </TouchableOpacity>
              </>
            )}

            {/* STEP 3: Reset Password */}
            {step === 3 && (
              <>
                <Input
                  placeholder="New Password"
                  placeholderTextColor="#888"
                  // secureTextEntry
                  isPassword
                  value={newPassword}
                  onChangeText={(text) => {
                    const cleanedText = text.replace(/[ .,]/g, '');
                    setNewPassword(cleanedText);
                  }}
                  showPassword={showPassword}
                  togglePasswordVisibility={() => setShowPassword((prev) => !prev)}
                // className="border border-gray-300 rounded-lg p-3 mb-4 w-full"
                />

                <Input
                  placeholder="Confirm Password"
                  placeholderTextColor="#888"
                  // secureTextEntry
                  isPassword
                  value={confirmPassword}
                  onChangeText={(text) => {
                    const cleanedText = text.replace(/[ .,]/g, '');
                    setConfirmPassword(cleanedText);
                  }}
                  // className="border border-gray-300 rounded-lg p-3 mb-4 w-full"
                  showPassword={showPassword}
                  togglePasswordVisibility={() => setShowPassword((prev) => !prev)}
                />
                <TouchableOpacity
                  onPress={handleResetPassword}
                  className="bg-orange-600 p-4 rounded-lg w-full"
                >
                  <Text className="text-white text-center font-semibold">Reset Password</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>


  );
};

export default ForgotPassword;
