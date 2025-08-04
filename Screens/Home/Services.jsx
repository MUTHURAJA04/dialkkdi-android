import React from 'react';
import { View, Text, Image, Pressable, useWindowDimensions,ScrollView } from 'react-native';
import { Video } from 'react-native-video';
import { SwiperFlatList } from 'react-native-swiper-flatlist';

const services= [
  {
    id: '1',
    name: 'Home Appliance Repair',
    provider: 'Star Service Engineering',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Services/home-appliance-repair.jpg',
  },
  {
    id: '2',
    name: 'Software Solutions',
    provider: 'Digitaly Tech AI Solutions',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Services/it-software-solutions.jpg',
  },
  {
    id: '3',
    name: 'Catering Services',
    provider: 'Akshaya Catering',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Services/catering-services.jpg',
  },
  {
    id: '4',
    name: 'Wedding Decorators',
    provider: 'Deivam Events',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Services/wedding-decoration.jpg',
  },
  {
    id: '5',
    name: 'Home & Deep Cleaning',
    provider: 'DNA Deep Cleaning',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Services/home-cleaning.jpg',
  },
  {
    id: '0',
    name: 'Two Wheeler Mechanic',
    provider: 'Motor Clinic',
    image: 'https://livecdn.dialkaraikudi.com/default/Top_Services/two-wheeler.jpg',
  },
];


const Services = () => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  const itemWidth = isLargeScreen ? (width * 0.8) / 3.5 : (width * 0.9) / 2.2;

  return (
   <>
<ScrollView>
   <View className="flex flex-col items-center justify-center">
      <Text className="text-2xl md:text-[32px] my-2 font-medium text-center">
        Top Services
      </Text>

      <View className="w-11/12 md:my-4 mb-4 mx-auto flex flex-col md:flex-row md:border md:border-gray-200 md:min-h-[180px] xl:min-h-[200px] 2xl:min-h-[240px] justify-between">
        <View className="w-full md:w-6/12 lg:w-7/12 xl:w-8/12 2xl:w-8/12 flex items-center">
          <View className="w-full px-2 py-4 lg:px-8">
            <SwiperFlatList
              autoplay
              autoplayDelay={3}
              autoplayLoop
              data={services}
              renderItem={({ item }) => (
                <Pressable
                  style={{ width: itemWidth }}
                  className="mr-1"
                >
                  <View className="flex flex-col bg-white border border-gray-200 rounded-md shadow-md">
                    <View className="w-full aspect-[4/3] overflow-hidden rounded-t-md">
                      <Image
                        source={{ uri: item.image }}
                        className="w-full h-full object-cover"
                        resizeMode="cover"
                      />
                    </View>
                    <View className="flex flex-col items-center justify-center px-2 py-3 min-h-[70px]">
                      <Text className="text-sm font-semibold text-center" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-sm text-gray-600 text-center" numberOfLines={1}>
                        {item.provider}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              )}
              keyExtractor={(item) => item.id}
              showPagination={false}
              numColumns={1}
            />
          </View>
        </View>

        {isLargeScreen && (
          <View className="hidden md:block text-white w-full md:w-6/12 lg:w-5/12 xl:w-4/12 2xl:w-4/12">
            <Video
              source={{ uri: 'https://livecdn.dialkaraikudi.com/default/Top_Services/Welcome_to_G-TEC_Computer_Education_Center_zmvp0d.mp4' }}
              style={{ width: '100%', height: '' }}
              resizeMode="cover"
              repeat
              playInBackground={false}
              playWhenInactive={false}
              ignoreSilentSwitch="obey"
            />
          </View>
        )}
      </View>
    </View>
</ScrollView>

   </>
  );
};


export default Services;