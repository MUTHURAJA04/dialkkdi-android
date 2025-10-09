import { useNavigation } from "@react-navigation/native";
import React, { useState, useRef, useEffect } from "react";
import { View, Image, Dimensions, FlatList, TouchableOpacity, SafeAreaView } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export default function HeroSlide({ images }) {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Guarded inputs without breaking hook order
  const baseImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const hasImages = baseImages.length > 0;
  const extendedImages = hasImages
    ? [
        { ...(baseImages[baseImages.length - 1] || {}), _clone: "start" },
        ...baseImages.map((img, idx) => ({ ...(img || {}), _clone: `original-${idx}` })),
        { ...(baseImages[0] || {}), _clone: "end" },
      ]
    : [];

  // Build stable key
  const buildKey = (item, index) => {
    // For remote urls, use the filename tail to keep keys short and stable
    if (typeof item?.url === "string") {
      try {
        const tail = item.url.split("/").pop() || item.url;
        return `${item?._clone || "orig"}-${tail}`;
      } catch (_) {
        return `${item?._clone || "orig"}-${index}`;
      }
    }
    // For local require numeric ids, include clone + index
    if (typeof item?.url === "number") {
      return `${item?._clone || "orig"}-local-${index}`;
    }
    return `${item?._clone || "orig"}-${index}`;
  };

  // Log computed key strings explicitly
  if (__DEV__) {
    try {
      const keyStrings = extendedImages.map((it, idx) => buildKey(it, idx));
      console.log("[HeroSlide] keyStrings:", keyStrings);
    } catch (e) {
      console.log("[HeroSlide] keyStrings error:", e);
    }
  }

  // Debug logs
  if (__DEV__) {
    try {
      console.log("[HeroSlide] hasImages:", hasImages, "props length:", Array.isArray(images) ? images.length : "not-array");
      const preview = baseImages.map((it, idx) => ({ idx, businessId: it?.businessId, id: it?.id || it?._id, url: it?.url }));
      console.log("[HeroSlide] baseImages preview:", preview);
      const keys = extendedImages.map((it, idx) => ({ idx, key: buildKey(it, idx), clone: it?._clone, biz: it?.businessId }));
      console.log("[HeroSlide] extended len:", extendedImages.length, "keys:", keys);
    } catch (e) {
      console.log("[HeroSlide] debug error:", e);
    }
  }

  const scrollTo = (index) => {
    const listLen = extendedImages.length;
    if (!flatListRef.current || listLen === 0) return;
    const target = Math.max(0, Math.min(index + 1, listLen - 1));
    try {
      flatListRef.current.scrollToIndex({ index: target, animated: true });
    } catch (e) {
      console.warn("[HeroSlide] scrollToIndex failed", { requestedIndex: index, target, listLen }, e?.message);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length === 0) return;
    const currentIndex = viewableItems[0].index ?? 0;
    const baseLen = baseImages.length;
    const extendedLen = extendedImages.length;
    if (currentIndex === 0) {
      setTimeout(() => {
        if (!flatListRef.current) return;
        const target = Math.max(0, Math.min(baseLen, extendedLen - 1));
        try { flatListRef.current.scrollToIndex({ index: target, animated: false }); } catch {}
        setActiveIndex(Math.max(0, baseLen - 1));
      }, 50);
    } else if (currentIndex === extendedLen - 1) {
      setTimeout(() => {
        if (!flatListRef.current) return;
        try { flatListRef.current.scrollToIndex({ index: 1, animated: false }); } catch {}
        setActiveIndex(0);
      }, 50);
    } else {
      setActiveIndex(currentIndex - 1);
    }
  }).current;

  useEffect(() => {
    if (!hasImages || !flatListRef.current) return;
    const interval = setInterval(() => {
      const next = activeIndex === baseImages.length - 1 ? 0 : activeIndex + 1;
      scrollTo(next);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeIndex, hasImages, baseImages.length]);

  useEffect(() => {
    if (!hasImages) return;
    const id = setTimeout(() => {
      if (!flatListRef.current) return;
      try { flatListRef.current.scrollToIndex({ index: 1, animated: false }); } catch {}
    }, 100);
    return () => clearTimeout(id);
  }, [hasImages]);

  const handleNavigate = (item) => {
    if (!item.businessId) return; // fallback images don't navigate
    navigation.navigate("BusinessDetailScreen", { business: item.businessId });
  };

  return (
    <SafeAreaView style={{ backgroundColor: "white", zIndex: 0 }}>
      <View style={{ width: "100%" }}>
        {hasImages ? (
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
          keyExtractor={(item, index) => buildKey(item, index)}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />) : null}
      </View>
    </SafeAreaView>
  );
}
