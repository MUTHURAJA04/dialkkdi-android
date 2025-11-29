import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
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

  // NEW STATES FOR NAME
  const [cityName, setCityName] = useState('');
  const [areaName, setAreaName] = useState('');

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

    const trimmedAddress = address.trim();

    if (!/^(?!\.)(?!\d+$)[A-Za-z0-9\s,#-]+$/.test(trimmedAddress) || trimmedAddress.length < 5) {
      Alert.alert('Validation Error', 'Enter a valid Mail address');
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

    // MERGED FORM DATA WITH NAME + ID
    const mergedFormData = {
      ...formData,
      address,
      cityId,
      cityName, // ADDED
      areaId,
      areaName, // ADDED
      pincode,
    };

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
          onChangeText={(text) => {
            let formatted = text.replace(/^\s+/g, '');
            formatted = formatted.replace(/\s{2,}/g, ' ');
            setAddress(formatted);
          }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* CITY PICKER */}
        <View className="overflow-hidden border border-gray-300 rounded-lg mb-4 bg-gray-200">
          <Picker
            selectedValue={cityId}
            onValueChange={(itemValue) => {
              setCityId(itemValue);
              setAreaId('');

              const selectedCity = cities.find((c) => c._id === itemValue);
              setCityName(selectedCity?.name || '');
            }}
            style={{ color: '#000' }}
            dropdownIconColor="#000"
          >
            <Picker.Item label="Select City" value="" enabled={false} />
            {cities.map((city) => (
              <Picker.Item
                key={city._id}
                label={city.name}
                value={city._id}
                color="#000"
              />
            ))}
          </Picker>
        </View>

        {/* AREA PICKER */}
        <View className="overflow-hidden border border-gray-300 rounded-lg mb-4 bg-gray-200">
          <Picker
            selectedValue={areaId}
            onValueChange={(itemValue) => {
              setAreaId(itemValue);

              const selectedArea = areas.find((a) => a._id === itemValue);
              setAreaName(selectedArea?.name || '');
            }}
            enabled={!!cityId}
            style={{ color: '#000' }}
            dropdownIconColor="#000"
          >
            <Picker.Item label={cityId ? "Select Area" : "Select a city first"} value="" enabled={false} />
            {areas.map((area) => (
              <Picker.Item
                key={area._id}
                label={area.name}
                value={area._id}
                color="#000"
              />
            ))}
          </Picker>
        </View>

        {/* PINCODE */}
        <Input
          placeholder="Pincode"
          placeholderTextColor="#aaa"
          keyboardType="number-pad"
          value={pincode}
          onChangeText={setPincode}
        />

        {/* BUTTONS */}
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
            <Text className="underline"> Login</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default BusinessStep2;
