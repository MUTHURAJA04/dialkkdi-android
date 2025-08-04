import React, { useState, useRef, useEffect } from 'react';
import { View, Image, Dimensions, FlatList, SafeAreaView } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// ✅ Image URLs
const images = [
  'https://livecdn.dialkaraikudi.com/default/Hero_Banner/hero_banner1.jpg',
  'https://livecdn.dialkaraikudi.com/default/Hero_Banner/hero_banner2.jpg',
  'https://livecdn.dialkaraikudi.com/default/Hero_Banner/hero_banner3.jpg',
  'https://livecdn.dialkaraikudi.com/default/Hero_Banner/hero_banner4.jpg',
];

// ✅ Extended images for infinite loop
const extendedImages = [images[images.length - 1], ...images, images[0]];

export default function HeroSlide() {
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const IMAGE_HEIGHT = 220; // ✅ Fixed height for slider

  // ✅ Scroll to index
  const scrollTo = (index) => {
    flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  // ✅ Handle visible items
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const currentIndex = viewableItems[0].index;
      if (currentIndex === 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: images.length, animated: false });
          setActiveIndex(images.length - 1);
        }, 50);
      } else if (currentIndex === extendedImages.length - 1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: 1, animated: false });
          setActiveIndex(0);
        }, 50);
      } else {
        setActiveIndex(currentIndex - 1);
      }
    }
  }).current;

  // ✅ Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      scrollTo(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  // ✅ Initial scroll
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
    }, 100);
  }, []);

  return (
    <SafeAreaView className="bg-white">
      <View className="w-full">
        <FlatList
          ref={flatListRef}
          data={extendedImages}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width: screenWidth, height: IMAGE_HEIGHT }}
              className="w-full rounded-md"
              resizeMode="cover"   // ✅ Ensures full image is visible (no crop)
            />
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          keyExtractor={(item, index) => `slide-${index}`}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />
      </View>
    </SafeAreaView>
  );
}
