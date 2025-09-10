import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Star, ChevronDown, MapPin } from 'react-native-feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { businessList } from '../services/apiClient';

const sortOptions = ['Rating High-Low', 'Rating Low-High', 'Name A-Z', 'Name Z-A'];

const BusinessListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId } = route.params || {};

  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [selectedSort, setSelectedSort] = useState('');
  const [showSortModal, setShowSortModal] = useState(false);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!categoryId) {
        console.warn('⚠️ No category ID provided.');
        return;
      }

      try {
        setLoading(true);
        const data = await businessList(categoryId); // Pass the categoryId
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

        setBusinesses(list);
        setFilteredBusinesses(list);
      } catch (error) {
        console.error('❌ Error fetching businesses:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [categoryId]);

  useEffect(() => {
    let sorted = [...businesses];

    switch (selectedSort) {
      case 'Name A-Z':
        sorted.sort((a, b) =>
          (a.businessName || a.name || '').localeCompare(b.businessName || b.name || '')
        );
        break;
      case 'Name Z-A':
        sorted.sort((a, b) =>
          (b.businessName || b.name || '').localeCompare(a.businessName || a.name || '')
        );
        break;
      case 'Rating High-Low':
        sorted.sort((a, b) => ((b.ratings ?? b.rating) || 0) - ((a.ratings ?? a.rating) || 0));
        break;
      case 'Rating Low-High':
        sorted.sort((a, b) => ((a.ratings ?? a.rating) || 0) - ((b.ratings ?? b.rating) || 0));
        break;
      default:
        break;
    }

    setFilteredBusinesses(sorted);
  }, [selectedSort, businesses]);


  const handleNavigate = (item) => {
    navigation.navigate('BusinessDetailScreen', { business: item });
  };


  const CDN_PREFIX = 'https://livecdn.dialkaraikudi.com/';

  const renderItem = ({ item }) => {
    const rawImagePath = item.photos?.[0];
    const imageUrl = rawImagePath
      ? `${CDN_PREFIX}${rawImagePath}`
      : 'https://via.placeholder.com/400x200.png?text=Business';


    return (
      <TouchableOpacity
        onPress={() => handleNavigate(item)}
        className="bg-white rounded-2xl shadow-md mb-5 overflow-hidden"
      >
        {/* 🖼️ Image */}
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-44"
          resizeMode="cover"
        />

        {/* ℹ️ Details */}
        <View className="p-4 relative">
          {/* 🏪 Name */}
          <Text className="text-xl font-semibold text-black mb-1">
            {item.businessName || item.name || 'Business Name'}
          </Text>
          {/* ⭐ Rating */}
          <View className="flex-row items-end absolute right-5 top-5">
            <Star color="#facc15" width={18} height={18} />
            <Text className="ml-1 text-yellow-500 font-medium text-sm">
              {item.ratings?.toFixed(1) || 'N/A'}
            </Text>
          </View>
          {/* 📍 Enlarged Address */}
          <View className="flex-row items-start mb-2">
            <MapPin color="#6b7280" width={16} height={16} className="mt-1" />
            <Text
              className="ml-2 text-base text-gray-700 leading-5 flex-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.address?.formattedAddress || 'No address available'}
            </Text>
          </View>


        </View>
      </TouchableOpacity>
    );
  };


  return (
    <View className="flex-1 bg-gray-100 px-4 pt-4">
      {/* Sort Button */}
      <View className="flex-row justify-end mb-3">
        <TouchableOpacity
          onPress={() => setShowSortModal(true)}
          className="bg-white px-4 py-2 rounded-xl flex-row items-center shadow"
        >
          <Text className="text-black font-medium mr-1">Sort</Text>
          <ChevronDown color="black" width={18} height={18} />
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={filteredBusinesses}
          keyExtractor={(item) =>
            item._id?.toString() || item.id?.toString() || Math.random().toString()
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">
              No businesses found.
            </Text>
          }
        />
      )}

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center px-10"
          onPressOut={() => setShowSortModal(false)}
          activeOpacity={1}
        >
          <View className="bg-white rounded-xl p-4">
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  setSelectedSort(opt);
                  setShowSortModal(false);
                }}
                className="py-2"
              >
                <Text
                  className={`text-base ${selectedSort === opt ? 'text-blue-600 font-semibold' : 'text-black'
                    }`}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default BusinessListScreen;
