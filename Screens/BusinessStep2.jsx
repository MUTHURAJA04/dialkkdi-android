import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Input from '../components/CustomInput';
import { getArea, getCities } from '../services/apiClient';

const BusinessStep2 = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { formData } = route.params;

  const [address, setAddress] = useState('');
  const [cityId, setCityId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [pincode, setPincode] = useState('');
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const cityData = await getCities();
        setCities(cityData);
      } catch (err) {
        console.error('Error fetching cities:', err);
        Alert.alert('Error', 'Failed to load cities');
      }
    })();
  }, []);

  useEffect(() => {
    if (!cityId) {
      setAreas([]);
      return;
    }

    (async () => {
      try {
        const areaData = await getArea(cityId);
        setAreas(areaData);
      } catch (err) {
        console.error('Error fetching areas:', err);
        Alert.alert('Error', 'Failed to load areas');
      }
    })();
  }, [cityId]);

  const handleNext = () => {
    if (!address.trim()) {
      Alert.alert('Validation Error', 'Address is required');
      return;
    }

    if (!cityId) {
      Alert.alert('Validation Error', 'Please select a city');
      return;
    }

    if (!areaId) {
      Alert.alert('Validation Error', 'Please select an area');
      return;
    }

    if (!pincode.trim()) {
      Alert.alert('Validation Error', 'Pincode is required');
      return;
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      Alert.alert('Validation Error', 'Enter a valid 6-digit pincode');
      return;
    }

    const mergedFormData = {
      ...formData,
      address,
      cityId,
      areaId,
      pincode,
    };

    console.log('✅ Full Form Data after Step 2:', mergedFormData);

    navigation.navigate('BusinessStep3', {
      formData: mergedFormData,
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-16 pb-6">
        <Text className="text-2xl font-bold mb-4 text-orange-600 text-center">Business Registration</Text>
        <Text className="text-sm text-gray-500 mb-6 text-center">Step 2 of 3</Text>

        <Input
          placeholder="Address"
          placeholderTextColor="#aaa"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View className="overflow-hidden border border-gray-300 rounded-lg mb-4 bg-gray-50">
          <Picker
            selectedValue={cityId}
            onValueChange={(itemValue) => {
              setCityId(itemValue);
              setAreaId('');
            }}
            style={{
              color: '#000', // Ensure text is visible
              height: Platform.OS === 'ios' ? 200 : 50, // Better height for Android
            }}
            dropdownIconColor="#000" // For Android dropdown icon
          >
            <Picker.Item label="Select City" value="" enabled={false} />
            {cities.map((city) => (
              <Picker.Item
                key={city._id}
                label={city.name}
                value={city._id}
                color="#fff" // Ensure item text is visible
              />
            ))}
          </Picker>
        </View>

        <View className="overflow-hidden border border-gray-300 rounded-lg mb-4 bg-gray-50">
          <Picker
            selectedValue={areaId}
            onValueChange={(itemValue) => setAreaId(itemValue)}
            enabled={!!cityId} // Disable if no city selected
            style={{
              color: '#000',
              height: Platform.OS === 'ios' ? 200 : 50,
            }}
            dropdownIconColor="#000"
          >
            <Picker.Item label={cityId ? "Select Area" : "Select a city first"} value="" enabled={false} />
            {areas.map((area) => (
              <Picker.Item
                key={area._id}
                label={area.name}
                value={area._id}
                color="#fff"
              />
            ))}
          </Picker>
        </View>

        <Input
          placeholder="Pincode"
          placeholderTextColor="#aaa"
          keyboardType="number-pad"
          value={pincode}
          onChangeText={setPincode}
        />

        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-gray-300 px-6 py-3 rounded-lg"
          >
            <Text className="text-gray-600 font-semibold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            className="bg-orange-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate(('Login'), { type: 'business' })}>
          <Text className="text-sm text-orange-600 text-center">
            Already have an account?
            <Text className="underline"
              onPress={() => navigation.navigate('Login', { type })}
            >Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView >
    </View >
  );
};

export default BusinessStep2;
