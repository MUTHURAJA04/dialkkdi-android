import React from 'react';
import { View, Text, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import Video from 'react-native-video';
import { SwiperFlatList } from 'react-native-swiper-flatlist';

const products = [
  {
    id: '0',
    name: 'Fortune Basmati',
    shop: 'Lalitha Muthumaari',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Products/fortune-bastmati.webp',
  },
  {
    id: '1',
    name: 'Supreme Plastic Chair',
    shop: 'Plastic World',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Products/supreme-plastic-chair.jpg',
  },
  {
    id: '2',
    name: 'Karaikudi Kaara Murukku',
    shop: 'Shree Anandhass',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Products/kai-mureukku.jpg',
  },
  {
    id: '3',
    name: 'Vivo Y28 5G',
    shop: 'Chettinadu Mobiles',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Products/vivi-y028.jpg',
  },
  {
    id: '4',
    name: 'Home Made Sweets',
    shop: 'Karaikudi Sweets',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Products/sweets.png',
  },
  {
    id: '5',
    name: 'Clay Water Pot',
    shop: 'Star Clay Works',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Products/clay-waterp-pot.jpg',
  },
  {
    id: '6',
    name: 'Fresh Mushroom',
    shop: 'Sakthi Naturals',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Products/mashroom.jpg',
  },
];

const Products = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const itemWidth = isLargeScreen ? (width * 0.8) / 3.5 : (width * 0.9) / 2.2;

  return (
    <>
      <View className="flex flex-col items-center justify-center">
        <Text className="text-2xl md:text-[32px] mt-5 my-2 font-medium text-center">
          Top Products
        </Text>

        <View className="w-11/12 md:my-10 md:mt-4 mx-auto flex flex-col md:flex-row md:border md:border-gray-200 xl:min-h-[260px] 2xl:min-h-[260px] justify-between">

          {isLargeScreen && (
            <View className="hidden md:block text-white w-full md:w-6/12 lg:w-5/12 xl:w-4/12">
              <Video
                source={{ uri: 'https://livecdn.dialkaraikudi.com/default/Top_Products/Sri_Lalitha_Muthumariyamman_Shop_ekxwxr.mp4' }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                repeat
                playInBackground={false}
                playWhenInactive={false}
                ignoreSilentSwitch="obey"
              />
            </View>
          )}

          <View className="w-full md:w-6/12 lg:w-7/12 xl:w-8/12 flex items-center">
            <View className="w-full px-2 py-2 lg:px-8">
              <SwiperFlatList
                autoplay
                autoplayDelay={3}
                autoplayLoop
                data={products}
                renderItem={({ item }) => (
                  <View style={{ width: itemWidth, marginRight: 8 }}>
                    <View className="border border-gray-200 py-3 bg-white rounded-md shadow-md flex flex-col justify-start ">
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: '100%', height: 130 }}
                        resizeMode="contain"
                      />
                      <View className="w-full px-2 mt-2">
                        <Text className="font-semibold text-sm text-center number-of-lines-1">
                          {item.name}
                        </Text>
                        <Text className="text-sm text-gray-600 text-center number-of-lines-1">
                          {item.shop}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                keyExtractor={(item, index) => {
                  const key = item?.id ?? String(index);
                  if (__DEV__) console.log('[Products] keyExtractor', { key, id: item?.id, name: item?.name });
                  return key;
                }}
                showPagination={false}
              />
            </View>
          </View>
        </View>

        {/* <TouchableOpacity
          onPress={() => navigation.navigate('Services')}
          className="bg-green-500 px-4 py-2 rounded-md mb-4"
        >
          <Text className="text-white">Go to Services</Text>
        </TouchableOpacity> */}
      </View>
    </>
  );
};

export default Products;


