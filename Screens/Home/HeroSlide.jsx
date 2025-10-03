import { useNavigation } from "@react-navigation/native";
import React, { useState, useRef, useEffect } from "react";
import { View, Image, Dimensions, FlatList, SafeAreaView, TouchableOpacity } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function HeroSlide({ images }) {
  const navigation = useNavigation();

  if (!images || images.length === 0) return null;

  const extendedImages = [
    images[images.length - 1],
    ...images,
    images[0],
  ];

  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollTo = (index) => {
    flatListRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

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

  useEffect(() => {
    const interval = setInterval(() => {
      scrollTo(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
    }, 100);
  }, []);

  const handleNavigate = (item) => {
    if (!item.businessId) return; // fallback images don't navigate
    navigation.navigate("BusinessDetailScreen", { business: item.businessId });
  };

  return (
    <SafeAreaView style={{ backgroundColor: "white", zIndex: 0 }}>
      <View style={{ width: "100%" }}>
        <FlatList
          ref={flatListRef}
          data={extendedImages}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleNavigate(item)}>
              <Image
                source={typeof item.url === "string" ? { uri: item.url } : item.url}
                style={{ width: screenWidth, height: 200 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          keyExtractor={(_, index) => `slide-${index}`}
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
