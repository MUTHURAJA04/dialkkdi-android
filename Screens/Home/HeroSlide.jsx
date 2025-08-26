import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  Dimensions,
  FlatList,
  SafeAreaView,
} from "react-native";

// ✅ Local images
import Banner1 from "../../assets/Banners/Banner1.jpg";
import Banner2 from "../../assets/Banners/Banner2.jpg";
import Banner3 from "../../assets/Banners/Banner3.jpg";
import Banner4 from "../../assets/Banners/Banner4.jpg";
import Banner5 from "../../assets/Banners/Banner5.jpg";

const { width: screenWidth } = Dimensions.get("window");

// ✅ Image list
const images = [Banner1, Banner2, Banner3, Banner4, Banner5];

// ✅ Extended list for infinite loop
const extendedImages = [images[images.length - 1], ...images, images[0]];

export default function HeroSlide() {
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageHeights, setImageHeights] = useState({});

  // ✅ Pre-calc local image sizes
  useEffect(() => {
    images.forEach((img) => {
      const { width, height } = Image.resolveAssetSource(img);
      const scaledHeight = (height / width) * screenWidth;
      setImageHeights((prev) => ({ ...prev, [img]: scaledHeight }));
    });
  }, []);

  const scrollTo = (index) => {
    flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const currentIndex = viewableItems[0].index;
      if (currentIndex === 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: images.length,
            animated: false,
          });
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

  // ✅ Auto-scroll every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      scrollTo(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  // ✅ Initial scroll to 1st real item
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
    }, 100);
  }, []);

  return (
    <SafeAreaView style={{ backgroundColor: "white", zIndex: 0 }}>
      <View style={{ width: "100%" }}>
        <FlatList
          ref={flatListRef}
          data={extendedImages}
          renderItem={({ item }) => (
            <Image
              source={item} // ✅ Local images use direct source
              style={{
                width: screenWidth,
                height: imageHeights[item] || 200, // fallback 200 until resolved
              }}
              resizeMode="cover"
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
