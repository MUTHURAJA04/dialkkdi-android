import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  StatusBar,
} from 'react-native';
import Input from '../components/CustomInput';



const UserRegister = ({ navigation }) => {
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20 }}
      className="bg-white flex-1"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text className="text-2xl font-bold text-center mb-6 text-orange-500">
        REGISTER
      </Text>

      <Input
        placeholder="Enter your full name"
        placeholderTextColor="#999"
      />

      {/* <TextInput
        placeholder="Enter your full name"
        placeholderTextColor="#999"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800 bg-gray-50"
      /> */}

      <Input
        placeholder="Email Address"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
      />

      {/* <TextInput
        placeholder="Enter your email"
        keyboardType="email-address"
        placeholderTextColor="#999"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800 bg-gray-50"
      /> */}

      <Input
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        placeholderTextColor="#999"
      />

      {/* <TextInput
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        placeholderTextColor="#999"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800 bg-gray-50"
      /> */}

      <Input
        placeholder="Enter password"
        secureTextEntry
        placeholderTextColor="#999"
      />

      {/* <TextInput
        placeholder="Enter password"
        secureTextEntry
        placeholderTextColor="#999"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800 bg-gray-50"
      /> */}

      <Input
        placeholder="Re-enter password"
        secureTextEntry
        placeholderTextColor="#999"
      />

      {/* <TextInput
        placeholder="Re-enter password"
        secureTextEntry
        placeholderTextColor="#999"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-gray-800 bg-gray-50"
      /> */}

      {/* Agree to terms */}
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
        <Pressable onPress={() => setShowTerms(true)}>
          <Text className="text-gray-700">
            I agree to the{' '}
            <Text className="underline text-sky-500">Terms and Conditions</Text>
          </Text>
        </Pressable>
      </TouchableOpacity>

      {/* Register Button */}
      <TouchableOpacity
        className="bg-orange-500 py-3 rounded-md mb-4"
        onPress={() => console.log('Register pressed')}
      >
        <Text className="text-center text-white font-semibold">REGISTER</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <Text className="text-center text-gray-600">
        Already have an account?{' '}
        <Text
          className="text-sky-500 underline"
          onPress={() => navigation.navigate('Landing')}
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
                Welcome to DigiAiQuest. By registering, you agree not to misuse
                our services...
                {'\n\n'}
                You must be a real user and provide accurate information...
                {'\n\n'}
                We reserve the right to remove or suspend your access upon any
                violation...
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowTerms(false)}
              className="bg-orange-500 rounded-md py-2"
            >
              <Text className="text-center text-white font-semibold">
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default UserRegister;
