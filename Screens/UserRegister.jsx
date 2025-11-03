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
  ActivityIndicator,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false)


  const type = 'user'

  const emailRegex = /^(?! )[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phoneRegex = /^(?! )[6-9]\d{9}$/;
  const passwordRegex = /^(?! )[A-Za-z0-9!@#$%^&*()_+\-={}[\]|:;"'<>,?/]{6,20}$/;
  const nameRegex = /^(?! )[A-Za-z\s]+$/;


  /** ✅ Handle Register */
  const handleRegister = async () => {


    if (!name && !email && !phone && !password && !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      console.warn('⚠️ Validation failed: Missing fields');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Please enter a email address');
      return;
    }
    if (!name) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!phone) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    // ✅ Email validation
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (!nameRegex.test(name)) {
      Alert.alert('Error', 'Please enter a valid Name');
      return;
    }

    // ✅ Phone validation
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    if (!passwordRegex.test(password)) {
      Alert.alert('Error', 'Password must be between 6-20 characters');
      return;
    }

    if (name.length < 3) {
      Alert.alert('Error', 'Name must be at least 3 characters long');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password.length > 20) {
      Alert.alert('Error', 'Password must not exceed 20 characters');
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
   

      setLoading(true);

      const result = await signupUser(name, email, phone, password);

   

      if (result?.success || result?.message?.includes('OTP')) {
        Alert.alert('Success', 'OTP sent to your email');
        navigation.navigate('VerifyOtp', { email, type });
      } else {
        Alert.alert('Signup Failed', result?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ [ERROR] Signup failed:', error.response?.data || error.message);
      Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false)
    }
  };

  return (

    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        // alignItems: 'center',
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
      {/* Name Input */}
      <Input
        placeholder="Enter your full name"
        value={name}
        onChangeText={(text) => setName(text.replace(/^\s+/, ''))}
        placeholderTextColor="#999"
        maxLength={30}
      />

      {/* Email Input */}
      <Input
        placeholder="Enter your Email Address"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text.replace(/^\s+/, ''))}
        placeholderTextColor="#aaa"
      />

      {/* Phone Input */}
      <Input
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(text) => setPhone(text.replace(/^\s+/, ''))}
        placeholderTextColor="#999"
        maxLength={10}
      />

      {/* Password Input */}
      <Input
        placeholder="Enter password"
        value={password}
        onChangeText={(text) => {
          const cleanedText = text.replace(/[ .,]/g, '').replace(/^\s+/, '');
          setPassword(cleanedText);
        }}
        placeholderTextColor="#999"
        maxLength={20}
        showPassword={showPassword}
        togglePasswordVisibility={() => setShowPassword((prev) => !prev)}
        isPassword
      />

      {/* Confirm Password Input */}
      <Input
        placeholder="Re-enter password"
        value={confirmPassword}
        onChangeText={(text) => {
          const cleanedText = text.replace(/[ .,]/g, '').replace(/^\s+/, '');
          setConfirmPassword(cleanedText);
        }}
        placeholderTextColor="#999"
        showPassword={showConfirmPassword}
        togglePasswordVisibility={() => setShowConfirmPassword((prev) => !prev)}
        isPassword
      />


      {/* Agree to Terms */}
      <TouchableOpacity
        onPress={() => setAgreed(!agreed)}
        className="flex-row items-center mb-4"
      >
        <View
          className={`w-5 h-5 rounded border-2 mr-3 justify-center items-center ${agreed ? 'bg-orange-500 border-orange-500' : 'border-gray-400'
            }`}
        >
          {agreed && <Text className="text-white text-xs">✓</Text>}
        </View>
        <Pressable >
          <Text className="text-gray-700 text-start">
            I agree to the{' '}
            <Text className="underline text-orange-600" onPress={() => setShowTerms(true)}>Terms and Conditions</Text>
          </Text>
        </Pressable>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        className={` py-3 rounded-md mb-4 w-full ${loading ? "bg-orange-400" : "bg-orange-500"}`}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text className="text-center text-white font-semibold">REGISTER</Text>
        )}
      </TouchableOpacity>

      {/* Login Link */}
      <Text className="text-center text-gray-600"  onPress={() => navigation.navigate('Login', { type })}>
        Already have an account?{' '}
        <Text
          className="text-orange-600 underline"
        
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
            <ScrollView className="h-[80%] mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Text className="text-gray-700 text-sm leading-6">
                <Text className="font-semibold mb-2">Last Updated: March 15, 2025</Text>{"\n\n"}

                <Text className="font-semibold text-base">Service Overview</Text>
                <Text>Welcome to our platform! We're a service listing and information portal designed to help you find local businesses and service providers easily. Think of us as a bridge connecting you with plumbers, electricians, tutors, caterers, and a host of other professionals. While we strive to present accurate and updated information, please understand that we don't directly provide these services, nor do we control how they're delivered.{"\n\n"}</Text>

                <Text>We do our best to ensure details like phone numbers, prices, and business hours are correct, but we can't guarantee their constant accuracy. We highly recommend you verify these details independently before engaging any service. Our website serves purely as an informational and connection tool. We are not responsible for any dealings, contracts, or issues that may arise between you and a service provider listed on our platform. Your use of our site is at your own discretion.{"\n\n"}</Text>

                <Text className="font-semibold text-base">User Responsibilities</Text>
                <Text>As a user, you agree to interact with our platform respectfully, lawfully, and honestly. You're responsible for all activity under your account. If you sign up or submit a listing, ensure all information is correct, up-to-date, and not misleading.{"\n\n"}</Text>

                <Text>• Do not use false identities, impersonate others, or provide fake reviews or comments.{"\n"}</Text>
                <Text>• Do not upload content that is abusive, illegal, offensive, pornographic, or misleading.{"\n"}</Text>
                <Text>• Any activity that compromises the safety, integrity, or smooth operation of our website is strictly prohibited. This includes attempting to hack the site, bypass security measures, or interfere with other users.{"\n"}</Text>
                <Text>• Keep your login credentials safe. If you notice any suspicious activity in your account or on the website, please report it to us immediately.{"\n\n"}</Text>

                <Text>We reserve the right to revoke your access if these rules are violated. By using this site, you accept full responsibility for your actions here.{"\n\n"}</Text>

                <Text className="font-semibold text-base">Third-Party Links and External Services</Text>
                <Text>Our website may contain links to external websites, mobile apps, or services not owned or controlled by us. These are "third-party" services. For example, clicking a business's website or social media link will redirect you to a different site.{"\n\n"}</Text>

                <Text>We have no control over the content, privacy policies, or business practices of these external sites. Once you leave our site, we are not responsible for what happens on the third-party website. Any information you provide or payments you make on those sites are entirely at your own risk. We strongly advise you to read the terms and privacy policy of any third-party site before sharing personal details or proceeding with any transaction. We are not liable for any loss or damage resulting from your interaction with these external services.{"\n\n"}</Text>

                <Text className="font-semibold text-base">Intellectual Property</Text>
                <Text>Everything on our website — including text, logos, graphics, images, layouts, and the site's design — is either our property or used with proper legal permission. These materials are protected under copyright and intellectual property laws.{"\n\n"}</Text>

                <Text>This means you cannot copy, download, share, publish, or modify any part of this website for personal or commercial use without our written permission. This includes our name, branding, content structure, and listing style. If we find unauthorized use of our material, we reserve the right to take legal action. If you believe any content on this site violates your copyright or rights, please contact us with proof, and we will investigate and take appropriate action. Always respect intellectual property, just as you expect others to respect yours.{"\n\n"}</Text>

                <Text className="font-semibold text-base">Limitation of Liability</Text>
                <Text>We provide this platform "as is," meaning we offer its features and services to the best of our ability, but we make no promises or guarantees about perfection. We are not responsible for any damages or losses incurred from using our website or the services listed here.{"\n\n"}</Text>

                <Text>For example, if a service provider delays work, performs poorly, or takes your payment and disappears, we are not liable. Similarly, we are not responsible for any loss you face due to errors in listing information (e.g., wrong address, outdated phone number) or if the website is temporarily unavailable due to maintenance or technical issues.{"\n\n"}</Text>

                <Text>You use our website at your own risk, and any agreements between you and a service provider are your personal responsibility. We also do not guarantee that the website will always be free of bugs, viruses, or technical issues. If you are dissatisfied with any part of the site, your sole remedy is to discontinue its use.{"\n\n"}</Text>

                <Text className="font-semibold text-base">Changes to These Terms</Text>
                <Text>We may update or change these Terms and Conditions whenever necessary, especially when we add new features or services. We are not obligated to provide advance notice, but when changes are made, we will update this page. It is your responsibility to review this page regularly.{"\n\n"}</Text>

                <Text>Your continued use of the site after changes are made signifies your acceptance of the new terms. We recommend checking this section every few months, especially if you are a frequent user or business partner. These updates may include changes to user rules, legal rights, or platform features. If you disagree with the changes, you should stop using the website immediately. The most recent version of the Terms and Conditions will always be available on this page for your reference.{"\n\n"}</Text>

                <Text className="font-semibold text-base">Governing Law and Jurisdiction</Text>
                <Text>All legal matters related to this website, including its use, policies, services, and users, are governed by the laws of India. Any legal dispute must be handled under Indian law and in an Indian court. The specific jurisdiction will be in Karaikudi, Tamil Nadu, where our business is registered or operated.{"\n\n"}</Text>

                <Text>You agree that in case of a dispute, you will cooperate with us in legal processes and not file complaints in foreign courts or under other legal systems. This section ensures fairness, legal clarity, and proper conflict resolution. You also agree that any claims must be made within a reasonable time. If you have legal concerns, we suggest discussing them with a qualified legal advisor.{"\n\n"}</Text>

                <Text className="font-semibold">By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</Text>
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
    </ScrollView >


  );
};

export default UserRegister;
