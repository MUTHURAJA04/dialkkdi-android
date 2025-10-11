import { useNavigation } from "@react-navigation/native";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  Dimensions,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function HeroSlide({ images }) {
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  // stable ref for current index (avoids stale closures)
  const indexRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);

  const baseImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const hasImages = baseImages.length > 0;

  // safe key
  const keyExtractor = (_, idx) => `image-${idx}`;

  // navigate when image tapped
  const handleNavigate = (item) => {
    if (!item?.businessId) return;
    navigation.navigate("BusinessDetailScreen", { business: item.businessId });
  };

  // Keep active index in sync when user manually scrolls
  const onMomentumScrollEnd = (e) => {
    const index = Math.floor(e.nativeEvent.contentOffset.x / screenWidth);
    indexRef.current = index;
    setActiveIndex(index);
  };

  // fallback if scrollToIndex fails (some platforms need measured frames)
  const onScrollToIndexFailed = ({ index, highestMeasuredFrameIndex }) => {
    const offset = index * screenWidth;
    flatListRef.current?.scrollToOffset({ offset, animated: true });
  };

  // single interval managed effect -> loops through images
  useEffect(() => {
    if (!hasImages) return;

    // reset to first on mount / when images change
    indexRef.current = 0;
    setActiveIndex(0);
    try {
      // try to ensure initial position
      flatListRef.current?.scrollToIndex({ index: 0, animated: false });
    } catch (e) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    }

    const id = setInterval(() => {
      if (!flatListRef.current || baseImages.length === 0) return;

      const next = (indexRef.current + 1) % baseImages.length;

      // try scrolling to next; fallback handled by onScrollToIndexFailed
      try {
        flatListRef.current.scrollToIndex({ index: next, animated: true });
      } catch (e) {
        // fallback handled in onScrollToIndexFailed, but keep a safety here
        const offset = next * screenWidth;
        flatListRef.current.scrollToOffset({ offset, animated: true });
      }

      indexRef.current = next;
      setActiveIndex(next);
    }, 3000);

    return () => clearInterval(id);
  }, [hasImages, baseImages.length]);

  if (!hasImages) return null;

  return (
    <SafeAreaView style={{ backgroundColor: "white" }}>
      <View style={{ width: "100%" }}>
        <FlatList
          ref={flatListRef}
          data={baseImages}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleNavigate(item)} activeOpacity={0.9}>
              <Image
                source={typeof item?.url === "string" ? { uri: item.url } : item?.url}
                style={{ width: screenWidth, height: 200 }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollToIndexFailed={onScrollToIndexFailed}
          keyExtractor={keyExtractor}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
        />
      </View>
    </SafeAreaView>
  );
}
