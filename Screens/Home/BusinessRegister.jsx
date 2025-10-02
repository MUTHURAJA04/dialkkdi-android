import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import { categories } from './categories';
import { X } from 'react-native-feather';
import { useNavigation } from '@react-navigation/native';
import Input from '../components/CustomInput';

const BusinessRegister = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');

  const toggleSubcategory = subcategory => {
    const isSelected = selected.includes(subcategory);
    if (isSelected) {
      setSelected(prev => prev.filter(item => item !== subcategory));
    } else if (selected.length < 4) {
      setSelected(prev => [...prev, subcategory]);
    }
  };

  return (
    <View className="flex-1 p-4 pt-16 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text className="text-2xl font-bold mb-4 text-orange-600 text-center">
        Business Registration
      </Text>
      <Text className="text-gray-500 mb-6 text-center">Step 1 of 3</Text>

      {/* Business Info Inputs */}

      {/* <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base text-gray-800"
        placeholder="Enter business name"
        placeholderTextColor="#aaa"
      /> */}

      <Input
        placeholder="Enter business name"
        placeholderTextColor="#aaa"
      />

      {/* <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base text-gray-800"
        placeholder="Enter owner name"
        placeholderTextColor="#aaa"
      /> */}

      <Input
        placeholder="Enter owner name"
        placeholderTextColor="#aaa"
      />

      {/* <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base text-gray-800"
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        placeholderTextColor="#aaa"
      /> */}

      <Input
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        placeholderTextColor="#aaa"
      />

      {/* <TextInput
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base text-gray-800"
        placeholder="Enter email"
        keyboardType="email-address"
        placeholderTextColor="#aaa"
      /> */}

      <Input
        placeholder="Enter email Address"
        keyboardType="email-address"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        className="w-full border border-gray-300 rounded-lg px-4 py-4 mb-4 text-base text-gray-800"
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
        onPress={() => navigation.navigate('BusinessStep2')}
      >
        <Text className="text-center text-white font-medium">Next</Text>
      </TouchableOpacity>

      {/* Navigate to login */}
      <Text
        className="text-orange-600  text-center mt-3"
        onPress={() => navigation.navigate('Landing')}
      >
        <Text>
          Already have an account? <Text className="underline">Login</Text>
        </Text>
      </Text>

      {/* Category Selection Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 p-4 bg-white">
          {/* Close Icon */}
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="absolute top-6 right-6 z-10 bg-orange-500 rounded-full p-1"
          >
            <X color="#64748B" width={24} height={24} />
          </TouchableOpacity>

          <Text className="text-xl font-bold mb-4 text-orange-600 mt-12">
            Select Categories ({selected.length}/4)
          </Text>

          {/* <TextInput
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base text-gray-800"
            placeholderTextColor="#aaa"
            placeholder="Search categories..."
            value={search}
            onChangeText={setSearch}
          /> */}

          <Input
            placeholderTextColor="#aaa"
            placeholder="Search categories..."
            value={search}
            onChangeText={setSearch}
          />

          <ScrollView>
            {categories.map(cat => {
              const filteredSubs = cat.subcategories.filter(sub =>
                sub.toLowerCase().includes(search.toLowerCase()),
              );
              if (filteredSubs.length === 0) return null;

              return (
                <View key={cat.name} className="mb-4">
                  <Text className="font-semibold text-lg mb-1 text-gray-800">
                    {cat.name}
                  </Text>
                  {filteredSubs.map(sub => (
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
