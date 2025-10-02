import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import { getCategories } from '../../services/apiClient';
import { useNavigation } from '@react-navigation/native';

const servicesData = [
  {
    id: '1',
    name: 'Consulting Services',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3ffa997e0d57cb27a9/f94da63a4702f5c564a19704fb011b4f.png',
  },
  {
    id: '2',
    name: 'Beauty & Personal Care',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3efa997e0d57cb2776/fc886b0e108a40ac32e3560f59447756.jpg',
  },
  {
    id: '3',
    name: 'Pharmacies',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/687b65712286ece76b49043a/4c1f6e3f05a23fd93ab0bb510b1beb74.jpg',
  },
  {
    id: '4',
    name: 'Restaurants',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6878a668231e30ee4117f09a/f52d8420ccd42a66054748bf5d777423.jpg',
  },
  {
    id: '5',
    name: 'Stock Brokers',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/687e1fbe85c36c84de83d209/367cb42561ec812d85655dd996cc77e1.jpg',
  },
  {
    id: '6',
    name: 'Baby care',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/684bb225e0002a01e767c817/26ffaba851e5815c9c5f6561de12977b.jpg',
  },
];

const ServicesOn = () => {
  const { width } = useWindowDimensions();

  const imgUrl = 'https://livecdn.dialkaraikudi.com/'

  const navigation = useNavigation()

  const getNumColumns = () => {
    if (width >= 1280) return 5; 
    if (width >= 1024) return 5;
    if (width >= 768) return 4;
    if (width >= 640) return 3;
    return 2;
  };

  const numColumns = getNumColumns();

  const [cat, setCat] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();

        const products = response.filter(
          (product) => product.categoryType === "service"
        );

        // Shuffle array
        const shuffled = [...products].sort(() => Math.random() - 0.5);

        // Pick first 6
        setCat(shuffled.slice(0, 6));

      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    fetchCategories();
  }, []);



  const renderServiceItem = ({ item }) => (
    <Pressable
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
        marginVertical: 8,
        flex: 1,
      }}
      onPress={() => navigation.navigate('BusinessListScreen', { categoryId: item._id })}
    >
      <View
        style={{
          width: 90,
          height: 90,
          backgroundColor: '#E6F0FF',
          borderRadius: 100,
          overflow: 'hidden',
          elevation: 3,
        }}
      >
        <Image
          source={{ uri: `${imgUrl}${item.imageUrl}` }}
          style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
        />
      </View>
      <Text
        style={{
          marginTop: 6,
          fontSize: 14,
          fontWeight: '600',
          color: '#333',
          textAlign: 'center',
        }}
        numberOfLines={1}
      >
        {item.displayName}
      </Text>
      <View
        style={{
          width: 20,
          height: 3,
          marginTop: 4,
          backgroundColor: '#60A5FA',
          borderRadius: 4,
        }}
      />
    </Pressable>
  );

  return (
    <ScrollView>
      <View style={{ width: '100%', padding: 16, marginTop: 16, backgroundColor: '#E9EEF6' }}>
        <Text style={{ fontSize: 22, fontWeight: '500', textAlign: 'center', marginVertical: 12 }}>
          Services on Dial Karaikudi
        </Text>

        <FlatList
          data={cat}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: 'space-around', marginVertical: 10 }}
          contentContainerStyle={{ marginTop: 10 }}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

export default ServicesOn;
