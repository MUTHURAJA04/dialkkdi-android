import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { SwiperFlatList } from 'react-native-swiper-flatlist';

const productOffers = [
  {
    id: '3',
    name: 'Buy1 get2 Gingelly Oil',
    shop: 'Murugan Oil Mill',
    image: 'https://livecdn.dialkaraikudi.com/default/Product_Offers/Gingelly_oil.webp',
  },
  {
    id: '4',
    name: 'Buy1 get2 Water Bottles',
    shop: 'Plastic World',
    image: 'https://livecdn.dialkaraikudi.com/default/Product_Offers/plastic-bottle.avif',
  },
  {
    id: '5',
    name: 'Combo Offer Homemade',
    shop: 'Chettinadu Sweets',
    image: 'https://livecdn.dialkaraikudi.com/default/Product_Offers/combo-offer-sweet.avif',
  },
  {
    id: '6',
    name: '12% OFF 22KT ring',
    shop: 'Nshree Jewellery',
    image: 'https://livecdn.dialkaraikudi.com/default/Product_Offers/ring.jpeg',
  },
  {
    id: '0',
    name: '50% OFF Biriyani Rice',
    shop: 'Lalitha Muthumaari',
    image: 'https://livecdn.dialkaraikudi.com/default/Product_Offers/india-gate-rice.webp',
  },
  {
    id: '1',
    name: '1+1 OFF Mens Shirt',
    shop: 'AR Mens Collections',
    image: 'https://livecdn.dialkaraikudi.com/default/Product_Offers/mens-shirt.jpg',
  },
  {
    id: '2',
    name: '30% OFF Motorola Edge 50 Fusion',
    shop: 'Indian Mobiles',
    image: 'https://livecdn.dialkaraikudi.com/default/Product_Offers/motorola.webp',
  },
];

const serviceOffers = [
  {
    id: '3',
    name: '1 KM Just ₹8',
    provider: 'Justdial Taxi',
    image: 'https://livecdn.dialkaraikudi.com/default/Service_offers/taxi.avif',
  },
  {
    id: '4',
    name: '₹100 All Mobiles Services',
    provider: 'Mobiles Doctor',
    image: 'https://livecdn.dialkaraikudi.com/default/Service_offers/mobile-services.jpg',
  },
  {
    id: '5',
    name: '50%OFF All Services',
    provider: 'KRT Plumbers',
    image: 'https://livecdn.dialkaraikudi.com/default/Service_offers/plumber.jpg',
  },
  {
    id: '0',
    name: '50% OFF Eyebrow threading',
    provider: 'Trends Beauty',
    image: 'https://livecdn.dialkaraikudi.com/default/Service_offers/parlor.jpg',
  },
  {
    id: '1',
    name: 'Only ₹250 all Service',
    provider: 'AtoZ Service',
    image: 'https://livecdn.dialkaraikudi.com/default/Service_offers/ac-service.webp',
  },
  {
    id: '2',
    name: 'Just ₹300 any issue',
    provider: 'RaJ Electrician',
    image: 'https://livecdn.dialkaraikudi.com/default/Service_offers/electrical.webp',
  },
];

// ✅ Function to handle unsupported formats
const getValidImage = (url) => {
  if (url.endsWith('.avif') || url.endsWith('.webp')) {
    return url.replace('.avif', '.jpg').replace('.webp', '.jpg');
  }
  return url;
};

const ProductOffers = () => {
  return (
    <View className="flex flex-col my-4">
      <Text className="text-2xl md:text-[32px] my-2 font-medium text-center">
        Product & Service Offers
      </Text>

      <View className="flex flex-col md:flex-row justify-center items-center w-full md:w-11/12 mx-auto gap-4">
        {/* Product Offers */}
        <View className="w-11/12 md:w-6/12">
          <SwiperFlatList
            autoplay
            autoplayDelay={3}
            autoplayLoop
            data={productOffers}
            horizontal
            renderItem={({ item }) => (
              <Pressable
                className="border border-gray-200 shadow-md bg-white rounded-md mx-2"
                style={{ width: 160, height: 220 }}
              >
                <Image
                  source={{ uri: getValidImage(item.image) }}
                  style={{ width: '100%', height: 150, borderTopLeftRadius: 6, borderTopRightRadius: 6 }}
                  resizeMode="cover"
                />
                <Text className="font-semibold text-sm px-2 mt-1" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-500 px-2" numberOfLines={1}>
                  {item.shop}
                </Text>
              </Pressable>
            )}
            keyExtractor={(item, index) => {
              const key = item?.id ?? String(index);
              if (__DEV__) console.log('[ProductOffers] product key', { key, id: item?.id, name: item?.name });
              return key;
            }}
            showPagination={false}
          />
        </View>

        {/* Service Offers */}
        <View className="w-11/12 md:w-6/12">
          <SwiperFlatList
            autoplay
            autoplayDelay={3}
            autoplayLoop
            data={serviceOffers}
            horizontal
            renderItem={({ item }) => (
              <Pressable
                className="border border-gray-200 shadow-md bg-white rounded-md mx-2"
                style={{ width: 160, height: 220 }}
              >
                <Image
                  source={{ uri: getValidImage(item.image) }}
                  style={{ width: '100%', height: 150, borderTopLeftRadius: 6, borderTopRightRadius: 6 }}
                  resizeMode="cover"
                />
                <Text className="font-semibold text-sm px-2 mt-1" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-500 px-2" numberOfLines={1}>
                  {item.provider}
                </Text>
              </Pressable>
            )}
            keyExtractor={(item, index) => {
              const key = item?.id ?? String(index);
              if (__DEV__) console.log('[ProductOffers] service key', { key, id: item?.id, name: item?.name });
              return key;
            }}
            showPagination={false}
          />
        </View>
      </View>
    </View>
  );
};

export default ProductOffers;
