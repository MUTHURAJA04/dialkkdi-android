import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, FlatList, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg'; // Import Svg and Path from react-native-svg
import { getCategories } from '../../services/apiClient';
import { useNavigation } from '@react-navigation/native';

const Categories = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();

  const [cat, setCat] = useState('')

  const imgUrl = 'https://livecdn.dialkaraikudi.com/'

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        console.log(response, "successfully ads Categories");

        const products = response.filter(
          (product) => product.categoryType === "product"
        );

        // Shuffle array
        const shuffled = [...products].sort(() => Math.random() - 0.5);

        // Pick first 6
        setCat(shuffled.slice(0, 6));

        console.log(shuffled.slice(0, 6), "random 6 Products.......");
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    fetchCategories();
  }, []);


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
      onPress={() => navigation.navigate('BusinessListScreen', { categoryId: item._id })}
    >
      <Image
        alt={item.displayName}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        source={{ uri: `${imgUrl}${item.imageUrl}` }}
        resizeMode="cover"
      />
      <View className="absolute top-0 w-full bg-white/40 px-3 py-2 text-white text-sm font-semibold z-10 text-center">
        <Text className="text-black text-sm font-semibold text-center truncate" numberOfLines={1}>
          {item.displayName}
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
    <View className="w-full mx-auto bg-gradient-to-br from-blue-100 to-white px-4 sm:px-6  pt-4 my-6 rounded-lg overflow-hidden">
      <View className="text-center mb-">
        <Text
          className="text-2xl md:text-[32px] my-2 font-semibold text-center"
        // style={{ fontFamily: 'Work Sans' }}
        >
          Explore Categories
        </Text>
      </View>

      <View className="w-11/12 mx-auto mt-8">
        <FlatList
          data={cat}
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