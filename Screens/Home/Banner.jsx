import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, ScrollView, Modal, FlatList
} from 'react-native';
import {
  ChevronRight, X, Grid, List, ShoppingBag, Tool
} from 'react-native-feather';
import { useNavigation } from '@react-navigation/native';
import { getCategories } from '../../services/apiClient';

const CDN_PREFIX = 'https://livecdn.dialkaraikudi.com';

const Banner = () => {
  console.log('Banner component rendering');
  const navigation = useNavigation();

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    console.log('useEffect triggered for fetching categories');
    const fetchCategories = async () => {
      try {
        console.log('Starting to fetch categories...');
        const response = await getCategories();
        console.log('Raw API response:', response);

        const data = Array.isArray(response) ? response : [];
        console.log('Processed categories data:', data);

        const productCategories = data.filter(cat => cat.categoryType === 'product');
        const serviceCategories = data.filter(cat => cat.categoryType === 'service');

        console.log('Product categories:', productCategories);
        console.log('Service categories:', serviceCategories);

        setProducts(productCategories);
        setServices(serviceCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSeeAll = (items, title) => {
    console.log(`See all clicked for ${title}`, items);
    setModalContent(items);
    setModalTitle(title);
    setModalVisible(true);
  };

  const handleItemPress = (item) => {
    console.log('Category item pressed:', item);
    setModalVisible(false);
    navigation.navigate('BusinessListScreen', { categoryId: item._id });
  };

  const getImageUrl = (url) => {
    if (!url) {
      console.log('No image URL provided, using placeholder');
      return 'https://via.placeholder.com/100';
    }
    const finalUrl = url.startsWith('http') ? url : `${CDN_PREFIX}/${url}`;
  
    return finalUrl;
  };

  const renderGridItem = ({ item }) => {
    console.log('Rendering grid item:', item.displayName);
    return (
      <TouchableOpacity
        className="w-[30%] mb-6 items-center"
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
      >
        <View className="w-20 h-20 bg-white rounded-xl items-center justify-center shadow-sm shadow-gray-300">
          <Image
            source={{ uri: getImageUrl(item.iconUrl) }}
            className="w-16 h-16 rounded-lg"
            resizeMode="contain"
          />
        </View>
        <Text
          className="text-xs text-center text-gray-700 font-medium mt-2 px-1"
          numberOfLines={2}
        >
          {item.displayName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }) => {
    console.log('Rendering list item:', item.displayName);
    return (
      <TouchableOpacity
        className="flex-row items-center py-3 px-4 bg-white mb-2 rounded-lg shadow-sm shadow-gray-200"
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}
      >
        <View className="w-12 h-12 bg-gray-50 rounded-lg items-center justify-center mr-3">
          <Image
            source={{ uri: getImageUrl(item.iconUrl) }}
            className="w-10 h-10"
            resizeMode="contain"
          />
        </View>
        <Text className="text-sm text-gray-800 font-medium flex-1">{item.displayName}</Text>
        <ChevronRight width={18} height={18} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  console.log('Current component state:', {
    products,
    services,
    modalVisible,
    modalContent,
    modalTitle,
    viewMode
  });

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white py-5 px-6 border-b border-gray-100 flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">Categories</Text>
          <View className="flex-row">
            <TouchableOpacity
              className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-blue-100' : 'bg-gray-100'}`}
              onPress={() => {
                console.log('Grid view selected');
                setViewMode('grid');
              }}
            >
              <Grid width={20} height={20} color={viewMode === 'grid' ? '#3b82f6' : '#6b7280'} />
            </TouchableOpacity>
            <TouchableOpacity
              className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-100' : 'bg-gray-100'}`}
              onPress={() => {
                console.log('List view selected');
                setViewMode('list');
              }}
            >
              <List width={20} height={20} color={viewMode === 'list' ? '#3b82f6' : '#6b7280'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Products */}
        <View className="mt-4 mx-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <ShoppingBag width={20} height={20} color="#3b82f6" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Products</Text>
            </View>
            <TouchableOpacity 
              onPress={() => handleSeeAll(products, 'All Products')} 
              className="flex-row items-center"
            >
              <Text className="text-blue-500 text-sm mr-1">See all</Text>
              <ChevronRight width={16} height={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {viewMode === 'grid' ? (
            <View className="bg-white p-4 rounded-xl shadow-sm shadow-gray-200 flex-row flex-wrap justify-between">
              {products.slice(0, 6).map((item) => (
                <React.Fragment key={item._id}>{renderGridItem({ item })}</React.Fragment>
              ))}
            </View>
          ) : (
            <View className="bg-white p-2 rounded-xl shadow-sm shadow-gray-200">
              <FlatList
                data={products.slice(0, 6)}
                renderItem={renderListItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* Services */}
        <View className="mt-4 mx-4 mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Tool width={20} height={20} color="#6366f1" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Services</Text>
            </View>
            <TouchableOpacity 
              onPress={() => handleSeeAll(services, 'All Services')} 
              className="flex-row items-center"
            >
              <Text className="text-indigo-500 text-sm mr-1">See all</Text>
              <ChevronRight width={16} height={16} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {viewMode === 'grid' ? (
            <View className="bg-white p-4 rounded-xl shadow-sm shadow-gray-200 flex-row flex-wrap justify-between">
              {services.slice(0, 6).map((item) => (
                <React.Fragment key={item._id}>{renderGridItem({ item })}</React.Fragment>
              ))}
            </View>
          ) : (
            <View className="bg-white p-2 rounded-xl shadow-sm shadow-gray-200">
              <FlatList
                data={services.slice(0, 6)}
                renderItem={renderListItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          console.log('Modal close requested');
          setModalVisible(false);
        }}
      >
        <View className="flex-1 bg-white">
          <View className="flex-row justify-between items-center py-4 px-6 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">{modalTitle}</Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('Closing modal');
                setModalVisible(false);
              }} 
              className="p-2 rounded-full bg-gray-100"
            >
              <X width={20} height={20} color="#4b5563" />
            </TouchableOpacity>
          </View>

          {viewMode === 'grid' ? (
            <FlatList
              data={modalContent}
              renderItem={renderGridItem}
              keyExtractor={(item) => item._id}
              numColumns={3}
              contentContainerStyle={{ padding: 16 }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={modalContent}
              renderItem={renderListItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ padding: 12 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default Banner;