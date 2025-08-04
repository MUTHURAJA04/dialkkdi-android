import React from 'react';
import { View, Text, Image, Pressable, FlatList, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg'; // Import Svg and Path from react-native-svg

const categoriesData = [
  {
    id: '1',
    name: 'Home Appliances',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/6811cb3ffa997e0d57cb27a6/b28c8622035a7fe324bcd88f0ab4654b.jpg',
  },
  {
    id: '2',
    name: 'Electronics',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/681c583fb9662911ee836e30/e5ff1c2028235d1553c19521b78c96b4.jpg',
  },
  {
    id: '3',
    name: 'Electronics Store',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/687f78ffa255d651d298e9f8/379d8e01e004cb6d571ddde80f395db2.jpg',
  },
  {
    id: '4',
    name: 'Homemade Snacks',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/686b6840231e30ee4117d1a3/1c213f2a3aa2bc325709083bf24bbed2.jpg',
  },
  {
    id: '5',
    name: 'Photo Frames',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/68831021c6fde26b9b611ed1/bcf8c196a2dfd23c475bcd7392a1e7cc.jpg',
  },
  {
    id: '6',
    name: 'AC Dealers',
    image: 'https://livecdn.dialkaraikudi.com/uploads/categories/687f799aa255d651d298ea0c/d9faebe39c49937effa76f7fa62d42c3.jpg',
  },
  // Add more categories as needed
];

const Categories = () => {
  const { width } = useWindowDimensions();

  // Determine numColumns based on screen width for responsive grid
  const getNumColumns = () => {
    if (width >= 1280) return 6; // xl
    if (width >= 1024) return 5; // lg
    if (width >= 768) return 4;  // md
    if (width >= 640) return 3;  // sm
    return 2;                    // default for small screens
  };

  const numColumns = getNumColumns();

  const renderCategoryItem = ({ item }) => (
    <Pressable
      className="relative w-full aspect-[4/4] rounded-xl overflow-hidden cursor-pointer group transition-transform duration-300 hover:scale-[1.03] shadow-md flex-1"
      style={{
        // Calculate item width to fit correctly in the grid, considering gap
        // gap-5 sm:gap-6 md:gap-8 means margin between items
        marginHorizontal: numColumns === 2 ? 10 : numColumns === 3 ? 12 : numColumns === 4 ? 16 : 10, // Approximate gap
        marginBottom: numColumns === 2 ? 20 : numColumns === 3 ? 24 : numColumns === 4 ? 32 : 20, // Approximate gap
      }}
      onPress={() => console.log(`Category clicked: ${item.name}`)}
    >
      <Image
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        source={{ uri: item.image }}
        resizeMode="cover"
      />
      <View className="absolute top-0 w-full bg-gradient-to-b from-black/60 to-transparent px-3 py-2 text-white text-sm font-semibold z-10 text-center">
        <Text className="text-white text-sm font-semibold text-center truncate" numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      <View className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition duration-500">
        <View className="bg-white/90 p-3 rounded-full shadow-lg animate-bounce-slow">
          {/* SVG Icon from your HTML */}
          <Svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-blue-600 text-lg" height="1em" width="1em">
            <Path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"></Path>
          </Svg>
        </View>
      </View>
      <View className="absolute top-0 left-0 w-full h-full bg-white/5 group-hover:bg-white/10 transition-all duration-300 rounded-xl"></View>
    </Pressable>
  );

  return (
    <View className="w-full mx-auto bg-gradient-to-br from-blue-100 to-white px-4 sm:px-6 py-10 pt-4 my-6 rounded-lg overflow-hidden">
      <View className="text-center mb-6">
        <Text
          className="text-2xl md:text-[32px] my-2 font-medium text-center"
          style={{ fontFamily: 'Work Sans' }}
        >
          Explore Categories
        </Text>
      </View>

      <View className="w-11/12 mx-auto mt-8">
        <FlatList
          data={categoriesData}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          // The `columnWrapperStyle` and margins in `renderCategoryItem`
          // are used to simulate `gap-5 sm:gap-6 md:gap-8`
          columnWrapperStyle={{
            justifyContent: 'space-between',
          }}
          contentContainerStyle={{
            paddingHorizontal: - (numColumns === 2 ? 10 : numColumns === 3 ? 12 : numColumns === 4 ? 16 : 10) / 2, // Adjust to counter item's horizontal margin
          }}
          scrollEnabled={false} // If you expect all categories to fit without scrolling
        />
      </View>
    </View>
  );
};

export default Categories;