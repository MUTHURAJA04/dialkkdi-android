import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import Input from '../components/CustomInput';



const BusinessStep2 = () => {
  const navigation = useNavigation();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [pincode, setPincode] = useState('');

  const cities = ['Devakottai', 'Karaikudi', 'Sivaganga'];
  const areas = {
    Devakottai: ['Devakottai Rastha', 'New Bus Stand', 'Market Road'],
    Karaikudi: ['Sekkalai', 'Kallukatti', 'Palaniyappa Nagar'],
    Sivaganga: ['Main Bazaar', 'Railway Colony'],
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-16 pb-6">
        {/* Title */}
        <Text className="text-2xl font-bold mb-4 text-orange-600 text-center">Business Registration</Text>
        <Text className="text-sm text-gray-500 mb-6 text-center">Step 2 of 3</Text>

        {/* Address */}
        {/* <TextInput
          placeholder="Address"
          placeholderTextColor="#aaa"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base text-gray-800 bg-gray-50"
        /> */}

        <Input
          placeholder="Address"
          placeholderTextColor="#aaa"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* City Picker */}

        <View className="overflow-hidden border border-gray-300 rounded-lg mb-4 bg-gray-50">
          <Picker
            selectedValue={city}
            onValueChange={(itemValue) => {
              setCity(itemValue);
              setArea('');
            }}
            style={{
              height: Platform.OS === 'android' ? 50 : undefined,
              color: city ? '#1f2937' : '#9ca3af',
              paddingHorizontal: 10,
            }}
            dropdownIconColor="#1f2937"
          >
            <Picker.Item label="Select City..." value="" />
            {cities.map((cityName) => (
              <Picker.Item key={cityName} label={cityName} value={cityName} />
            ))}
          </Picker>
        </View>

        {/* Area Picker */}

        <View className="overflow-hidden border border-gray-300 rounded-lg mb-4 bg-gray-50">
          <Picker
            selectedValue={area}
            enabled={!!city}
            onValueChange={(itemValue) => setArea(itemValue)}
            style={{
              height: Platform.OS === 'android' ? 50 : undefined,
              color: area ? '#1f2937' : '#9ca3af',
              paddingHorizontal: 10,
            }}
            dropdownIconColor="#1f2937"
          >
            <Picker.Item label="Select Area..." value="" />
            {city &&
              areas[city]?.map((areaName) => (
                <Picker.Item key={areaName} label={areaName} value={areaName} />
              ))}
          </Picker>
        </View>

        {/* Pincode */}
        {/* <TextInput
          placeholder="Pincode"
          placeholderTextColor="#aaa"
          keyboardType="number-pad"
          value={pincode}
          onChangeText={setPincode}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base text-gray-800 bg-gray-50"
        /> */}

        <Input
          placeholder="Pincode"
          placeholderTextColor="#aaa"
          keyboardType="number-pad"
          value={pincode}
          onChangeText={setPincode}
        />

        {/* Buttons */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-gray-300 px-6 py-3 rounded-lg"
          >
            <Text className="text-gray-600 font-semibold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('BusinessStep3')}
            className="bg-orange-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>

        {/* Already have an account */}
        <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
          <Text className="text-sm text-orange-600 text-center">
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default BusinessStep2;
