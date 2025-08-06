import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { ChevronRight, X, Grid, List, ShoppingBag, Tool } from 'react-native-feather';

const Banner = ({ navigation }) => {
  // Products data
  const products = [
    { id: 1, name: 'Electronics', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/681c583fb9662911ee836e30/f0206708cb157a23dfdbf496061a9c27.png' },
    { id: 2, name: 'Readymade Dress', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/681c58f8b9662911ee836e54/fb73ce9eac10cececc30fa88e59dafb0.png' },
    { id: 3, name: 'Grocery Stores', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/681c58a7b9662911ee836e4a/7247fb13735c79639c08634ce0c47317.png' },
    { id: 4, name: 'Homemade Snacks', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/686b6840231e30ee4117d1a3/bbbe278090ba0137fa17374871d43ab0.png' },
    { id: 5, name: 'Furniture & Decor', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/681c5883b9662911ee836e46/cc43c7d3b1e609a05a6cd4ab253f835a.webp' },
    { id: 6, name: 'Home Appliances', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3ffa997e0d57cb27a6/8de6db4f9e159ff3901e8365d1da2733.png' },
    { id: 7, name: 'Aluminium Vessels', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/68749392231e30ee4117e6d7/6283655d3b883da0c3b1a46ad8498946.webp' },
    { id: 8, name: 'Footwear & Shoes', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/684c1b56a8f6d4468271091a/cec43134a450015376effe5e14047633.png' },
    { id: 9, name: 'Toys & Games', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/684c1aeba8f6d4468271075e/b9f53d6b09f6d519f58ec3299c2cdf56.png' },
    { id: 10, name: 'Books & Stationery', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/684c1a5ea8f6d44682710687/2c00a1e9ff7a0afbf31e949a97175602.png' },
    { id: 11, name: 'Jewellery', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/681c5a7eb9662911ee836eb4/7dbeea1cf04e75843380610671533589.png' },
    { id: 12, name: 'See All', image: 'https://cdn-icons-png.flaticon.com/512/2989/2989988.png' }
  ];

  // Services data
  const services = [
    { id: 1, name: 'Beauty & Personal Care', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3efa997e0d57cb2776/baed04be915adf343ea9535a08613c2f.png' },
    { id: 2, name: 'Event Decorators', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3efa997e0d57cb2785/9ac7901a35e0cc47a70a48b7aced7860.png' },
    { id: 3, name: 'Electrical and Plumbing', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/681c5826b9662911ee836e24/dfe1b33167465025244bc351cce59e4f.png' },
    { id: 4, name: 'Training & Education', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3efa997e0d57cb2779/5993106f9f17ec2805533801f6e9704a.png' },
    { id: 5, name: 'Auto Services', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6852bc3ac2eab8b4eb1dd9e9/984646c37b410013f44a2171d0a277d3.png' },
    { id: 6, name: 'Photography & Media', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3ffa997e0d57cb27af/2f6170807a5aca55a5196968349ae7ce.png' },
    { id: 7, name: 'Consulting Services', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3ffa997e0d57cb27a9/4cb984e861d197d77aa286cbeb146523.png' },
    { id: 8, name: 'Medical Professionals', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3ffa997e0d57cb279d/a3460e87ed593921b9b0df13a7315fe5.png' },
    { id: 9, name: 'Legal & Finance', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3efa997e0d57cb278b/d1a6f60b657d09bc8b0a49f87d901194.png' },
    { id: 10, name: 'Transportation', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3efa997e0d57cb2788/b45a41e357ef6ed780ad16ac595ad629.png' },
    { id: 11, name: 'Interior', image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3efa997e0d57cb277f/c9320b84cce70509d06c4443de301a81.png' },
    { id: 12, name: 'See All', image: 'https://cdn-icons-png.flaticon.com/512/2989/2989988.png' }
  ];

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const handleSeeAll = (items, title) => {
    setModalContent(items.filter(item => item.name !== 'See All'));
    setModalTitle(title);
    setModalVisible(true);
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity 
      className="w-[30%] mb-6 items-center"
      activeOpacity={0.7}
      onPress={() => {
        setModalVisible(false);
        navigation.navigate('Category', { categoryId: item.id });
      }}
    >
      <View className="w-20 h-20 bg-white rounded-xl items-center justify-center shadow-sm shadow-gray-300">
        <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg" resizeMode="contain" />
      </View>
      <Text className="text-xs text-center text-gray-700 font-medium mt-2 px-1" numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }) => (
    <TouchableOpacity 
      className="flex-row items-center py-3 px-4 bg-white mb-2 rounded-lg shadow-sm shadow-gray-200"
      activeOpacity={0.7}
      onPress={() => {
        setModalVisible(false);
        navigation.navigate('Category', { categoryId: item.id });
      }}
    >
      <View className="w-12 h-12 bg-gray-50 rounded-lg items-center justify-center mr-3">
        <Image source={{ uri: item.image }} className="w-10 h-10" resizeMode="contain" />
      </View>
      <Text className="text-sm text-gray-800 font-medium flex-1">{item.name}</Text>
      <ChevronRight width={18} height={18} color="#9ca3af" />
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item, items, title }) => (
    <TouchableOpacity 
      key={item.id} 
      className="w-[30%] mb-6 items-center"
      activeOpacity={0.7}
      onPress={() => 
        item.name === 'See All' 
          ? handleSeeAll(items, title) 
          : navigation.navigate('Category', { categoryId: item.id })
      }
    >
      <View className={`w-20 h-20 rounded-xl items-center justify-center shadow-sm ${item.name === 'See All' ? 'bg-blue-50' : 'bg-white'}`}>
        <Image source={{ uri: item.image }} className={`w-16 h-16 ${item.name === 'See All' ? 'opacity-80' : ''}`} resizeMode="contain" />
        {item.name === 'See All' && (
          <View className="absolute bottom-1 right-1 bg-blue-100 rounded-full p-1">
            <ChevronRight width={14} height={14} color="#3b82f6" />
          </View>
        )}
      </View>
      <Text className={`text-xs text-center font-medium mt-2 px-1 ${item.name === 'See All' ? 'text-blue-500' : 'text-gray-700'}`} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white py-5 px-6 border-b border-gray-100 flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-gray-900">Categories</Text>
          <View className="flex-row">
            <TouchableOpacity 
              className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-blue-100' : 'bg-gray-100'}`}
              onPress={() => setViewMode('grid')}
            >
              <Grid width={20} height={20} color={viewMode === 'grid' ? "#3b82f6" : "#6b7280"} />
            </TouchableOpacity>
            <TouchableOpacity 
              className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-100' : 'bg-gray-100'}`}
              onPress={() => setViewMode('list')}
            >
              <List width={20} height={20} color={viewMode === 'list' ? "#3b82f6" : "#6b7280"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Products Section */}
        <View className="mt-4 mx-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <ShoppingBag width={20} height={20} color="#3b82f6" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Products</Text>
            </View>
            <TouchableOpacity className="flex-row items-center" onPress={() => handleSeeAll(products, 'All Products')}>
              <Text className="text-blue-500 text-sm mr-1">See all</Text>
              <ChevronRight width={16} height={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          
          {viewMode === 'grid' ? (
            <View className="bg-white p-4 rounded-xl shadow-sm shadow-gray-200 flex-row flex-wrap justify-between">
              {products.slice(0, 6).map((product) => renderCategoryItem({ item: product, items: products, title: 'All Products' }))}
            </View>
          ) : (
            <View className="bg-white p-2 rounded-xl shadow-sm shadow-gray-200">
              <FlatList
                data={products.slice(0, 6)}
                renderItem={renderListItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* Services Section */}
        <View className="mt-4 mx-4 mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Tool width={20} height={20} color="#6366f1" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Services</Text>
            </View>
            <TouchableOpacity className="flex-row items-center" onPress={() => handleSeeAll(services, 'All Services')}>
              <Text className="text-indigo-500 text-sm mr-1">See all</Text>
              <ChevronRight width={16} height={16} color="#6366f1" />
            </TouchableOpacity>
          </View>
          
          {viewMode === 'grid' ? (
            <View className="bg-white p-4 rounded-xl shadow-sm shadow-gray-200 flex-row flex-wrap justify-between">
              {services.slice(0, 6).map((service) => renderCategoryItem({ item: service, items: services, title: 'All Services' }))}
            </View>
          ) : (
            <View className="bg-white p-2 rounded-xl shadow-sm shadow-gray-200">
              <FlatList
                data={services.slice(0, 6)}
                renderItem={renderListItem}
                keyExtractor={(item) => item.id.toString()}
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center py-4 px-6 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-900">{modalTitle}</Text>
           
          </View>
          
          {/* View Mode Toggle */}
          {/* <View className="flex-row justify-end px-6 pt-3">
            <View className="flex-row bg-gray-100 rounded-lg p-1">
              <TouchableOpacity className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`} onPress={() => setViewMode('grid')}>
                <Grid width={18} height={18} color={viewMode === 'grid' ? "#3b82f6" : "#6b7280"} />
              </TouchableOpacity>
              <TouchableOpacity className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`} onPress={() => setViewMode('list')}>
                <List width={18} height={18} color={viewMode === 'list' ? "#3b82f6" : "#6b7280"} />
              </TouchableOpacity>
            </View>
          </View> */}
          
          {/* Content */}
          {viewMode === 'grid' ? (
            <FlatList
              data={modalContent}
              renderItem={renderGridItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              contentContainerStyle={{ padding: 16 }}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={modalContent}
              renderItem={renderListItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 12 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

      <View className="items-center">
  <TouchableOpacity 
    onPress={() => setModalVisible(false)} 
    className="flex-row items-center gap-2 p-2 rounded-full bg-gray-100 mb-3"
  >
    <X width={20} height={20} color="#4b5563" />
    <Text className="text-gray-600 text-base font-medium">Close</Text>
  </TouchableOpacity>
</View>

      </Modal>
    </View>
  );
};

export default Banner;
