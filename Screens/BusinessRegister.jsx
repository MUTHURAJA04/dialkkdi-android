import React, { useEffect, useState, useMemo } from 'react';
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
import Input from '../components/CustomInput';
import { getCategories } from '../services/apiClient';
import { ChevronUp, ChevronDown } from 'react-native-feather';
 
const BusinessRegister = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [openSegments, setOpenSegments] = useState({});
  const [activeSegmentId, setActiveSegmentId] = useState(null); // New state to track the active segment

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Regex rules
  const regex = {
    businessName: /^(?! )[a-zA-Z0-9&\-. ]{2,50}$/, // disallow starting with space
    ownerName: /^(?! )[a-zA-Z ]{2,50}$/,          // disallow starting with space
    phone: /^[6-9]\d{9}$/,                        // same
    email: /^(?!\.)(?!.*\.\.)(?!.*\.\@)(?!.*\.$)[A-Za-z0-9._-]+@[A-Za-z0-9-]+(\.[A-Za-z]{2,})+$/
  };

  const toggleSubcategory = (categoryId, segmentId) => {
    setSelected((prev) => {
      // If the category is already selected, unselect it
      if (prev.includes(categoryId)) {
        const newSelection = prev.filter((id) => id !== categoryId);
        // If the last item from the segment is unselected, reset the active segment
        if (newSelection.length === 0) {
          setActiveSegmentId(null);
        }
        return newSelection;
      }

      // If no segment is active yet and we have space, make the selection
      if (!activeSegmentId && prev.length < 4) {
        setActiveSegmentId(segmentId);
        return [...prev, categoryId];
      }

      // If a segment is already active and the new selection is from the same segment and we have space
      if (activeSegmentId && segmentId === activeSegmentId && prev.length < 4) {
        return [...prev, categoryId];
      }

      // Otherwise, prevent the selection
      Alert.alert('Selection Restricted', 'You can only select categories from the same segment.');
      return prev;
    });
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

    const formData = {
      businessName,
      ownerName,
      phone,
      email,
      categories: selected,
    };

    navigation.navigate('BusinessStep2', { formData });
  };

  const type = 'business';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const filteredGroupedCategories = useMemo(() => {
    const filtered = categories.filter((category) => {
      const categoryName = category.displayName || category.categoryName;
      const segmentName = category.businessSegment?.name;
      const searchTerm = search.toLowerCase();

      return (
        categoryName?.toLowerCase().includes(searchTerm) ||
        segmentName?.toLowerCase().includes(searchTerm)
      );
    });

    const grouped = filtered.reduce((acc, current) => {
      const segmentId = current.businessSegment?._id || 'others';
      const segmentName = current.businessSegment?.name || 'Other Categories';

      if (!acc[segmentId]) {
        acc[segmentId] = {
          _id: segmentId,
          name: segmentName,
          subcategories: [],
        };
      }
      acc[segmentId].subcategories.push(current);

      return acc;
    }, {});

    return Object.values(grouped);
  }, [categories, search]);

  const toggleSegment = (id) => {
    setOpenSegments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
        onChangeText={(text) => setBusinessName(text.replace(/^\s+/, ''))}
      />
      <Input
        placeholder="Enter owner name"
        placeholderTextColor="#aaa"
        value={ownerName}
        onChangeText={(text) => {
          const onlyLetters = text.replace(/[^A-Za-z\s]/g, '').replace(/^\s+/, '');
          setOwnerName(onlyLetters);
        }}
      />
      <Input
        placeholder="Enter phone number"
        keyboardType="phone-pad"
        placeholderTextColor="#aaa"
        value={phone}
        onChangeText={(text) => setPhone(text.replace(/^\s+/, ''))}
      />

      <Input
        placeholder="Enter email Address"
        keyboardType="email-address"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={(text) => setEmail(text.replace(/^\s+/, ''))}
      />

      {/* Category Selector */}
      <TouchableOpacity
        className="w-full border border-gray-300 rounded-lg px-4 py-4 mb-4"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-gray-500">
          {selected.length > 0 ? `${selected.length} selected` : 'Select Categories'}
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
      <Text className="text-orange-600 text-center mt-3">
        Already have an account?{' '}
        <Text
          className="underline"
          onPress={() => navigation.navigate('Login', { type })}
        >
          Login
        </Text>
      </Text>

      {/* Modal for Category Selection */}
      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 p-4 bg-white">
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            className="absolute top-6 right-6 z-10 bg-orange-500 rounded-full p-1"
          >
            <X color="#64748B" width={24} height={24} />
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
            {filteredGroupedCategories.map((group) => (
              <View key={group._id} className="mb-2">
                <TouchableOpacity
                  onPress={() => toggleSegment(group._id)}
                  className={`flex-row items-center justify-between p-3 my-1 rounded-lg ${activeSegmentId && group._id !== activeSegmentId
                    ? 'bg-gray-300'
                    : 'bg-gray-100'
                    }`}
                  disabled={activeSegmentId && group._id !== activeSegmentId}
                >
                  <Text className={`font-bold text-gray-800 ${activeSegmentId && group._id !== activeSegmentId
                    ? 'text-gray-500'
                    : ''
                    }`}>{group.name}</Text>
                  {openSegments[group._id] ? <ChevronUp color="gray" /> : <ChevronDown color="gray" />}
                </TouchableOpacity>
                {openSegments[group._id] && (
                  <View className="flex-row flex-wrap p-2">
                    {group.subcategories.map((sub) => {
                      const isDisabled = activeSegmentId && group._id !== activeSegmentId;
                      return (
                        <TouchableOpacity
                          key={sub._id}
                          className={`border rounded-full px-4 py-2 m-1 ${selected.includes(sub._id)
                            ? 'bg-orange-100 border-orange-400'
                            : isDisabled
                              ? 'bg-gray-200 border-gray-300'
                              : 'border-gray-300'
                            }`}
                          onPress={() => toggleSubcategory(sub._id, group._id)}
                          disabled={isDisabled}
                        >
                          <Text className={`text-gray-700 ${isDisabled ? 'text-gray-400' : ''}`}>
                            {sub.displayName || sub.categoryName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
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