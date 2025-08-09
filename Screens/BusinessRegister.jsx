import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import { X } from 'react-native-feather';
import { useNavigation } from '@react-navigation/native';
import Input from '../components/CustomInput'; // Your custom input component
import { categories } from './categories'; // Your category data
import { getCategories } from '../services/apiClient';

const BusinessRegister = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Regex rules
  const regex = {
    businessName: /^[a-zA-Z0-9&\-. ]{2,50}$/,
    ownerName: /^[a-zA-Z ]{2,50}$/,
    phone: /^[6-9]\d{9}$/,
    email: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
  };

  const handleNext = () => {
    if (!regex.businessName.test(businessName)) {
      Alert.alert('Invalid Input', 'Please enter a valid business name');
      return;
    }

    if (!regex.ownerName.test(ownerName)) {
      Alert.alert('Invalid Input', 'Please enter a valid owner name');
      return;
    }

    if (!regex.phone.test(phone)) {
      Alert.alert('Invalid Input', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (!regex.email.test(email)) {
      Alert.alert('Invalid Input', 'Please enter a valid email address');
      return;
    }

    if (selected.length === 0) {
      Alert.alert('Missing Selection', 'Please select at least one category');
      return;
    }

    // If all inputs are valid, navigate to next screen with data
    const formData = {
      businessName,
      ownerName,
      phone,
      email,
      categories: selected,
    };

    navigation.navigate('BusinessStep2', { formData });
    console.log(formData, "form Data Datas");

  };

  const toggleSubcategory = (subcategory) => {
    const isSelected = selected.includes(subcategory);
    if (isSelected) {
      setSelected((prev) => prev.filter((item) => item !== subcategory));
    } else if (selected.length < 4) {
      setSelected((prev) => [...prev, subcategory]);
    }
  };


  useEffect(() => {
    console.log('useEffect triggered for fetching categories');
    const fetchCategories = async () => {
      try {
        console.log('Starting to fetch categories...');
        const response = await getCategories();
        console.log('Raw API response:', response);

      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <View className="flex-1 p-4 pt-16 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text className="text-2xl font-bold mb-4 text-orange-600 text-center">
        Business Registration
      </Text>
      <Text className="text-gray-500 mb-6 text-center">Step 1 of 3</Text>

      {/* Form Inputs */}
      <Input
        placeholder="Enter business name"
        placeholderTextColor="#aaa"
        value={businessName}
        onChangeText={setBusinessName}
      />

      <Input
        placeholder="Enter owner name"
        placeholderTextColor="#aaa"
        value={ownerName}
        onChangeText={setOwnerName}
      />

      <Input
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        placeholderTextColor="#aaa"
        value={phone}
        onChangeText={setPhone}
      />

      <Input
        placeholder="Enter email"
        keyboardType="email-address"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        className="w-full border border-gray-300 rounded-lg px-4 py-4 mb-4"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-gray-500">
          {selected.length > 0
            ? `${selected.length} selected`
            : 'Select Categories'}
        </Text>
      </TouchableOpacity>

      {/* Next Button */}
      <TouchableOpacity
        className="bg-orange-500 p-3 rounded mt-4"
        onPress={handleNext}
      >
        <Text className="text-center text-white font-medium">Next</Text>
      </TouchableOpacity>

      {/* Navigate to login */}
      <Text
        className="text-orange-600 text-center mt-3"
        onPress={() => navigation.navigate('Landing')}
      >
        Already have an account? <Text className="underline">Login</Text>
      </Text>

      {/* Modal for Category Selection */}
      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 p-4 bg-white">
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="absolute top-6 right-6 z-10 bg-orange-500 rounded-full p-1"
          >
            <X color="white" width={24} height={24} />
          </TouchableOpacity>

          <Text className="text-xl font-bold mb-4 text-orange-600 mt-12">
            Select Categories ({selected.length}/4)
          </Text>

          <Input
            placeholder="Search categories..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />

          <ScrollView>
            {categories.map((cat) => {
              const filteredSubs = cat.subcategories.filter((sub) =>
                sub.toLowerCase().includes(search.toLowerCase())
              );
              if (filteredSubs.length === 0) return null;

              return (
                <View key={cat.name} className="mb-4">
                  <Text className="font-semibold text-lg mb-1 text-gray-800">
                    {cat.name}
                  </Text>
                  {filteredSubs.map((sub) => (
                    <TouchableOpacity
                      key={sub}
                      className={`border rounded-md px-3 py-2 mb-2 ${selected.includes(sub)
                        ? 'bg-orange-100 border-orange-400'
                        : 'border-gray-300'
                        }`}
                      onPress={() => toggleSubcategory(sub)}
                    >
                      <Text className="text-gray-800">{sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            className="mt-4 bg-orange-500 rounded-md p-3"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-white text-center font-medium">Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default BusinessRegister;
