import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Dimensions, Animated } from "react-native";


const { width: screenWidth } = Dimensions.get("window");

const LimitedOffers = ({ offers1 = [], offers2 = [] }) => {
  // 🧩 Animations for both offer sets
  const opacityAnim1a = useRef(new Animated.Value(1)).current;
  const opacityAnim1b = useRef(new Animated.Value(0)).current;
  const opacityAnim2a = useRef(new Animated.Value(1)).current;
  const opacityAnim2b = useRef(new Animated.Value(0)).current;

  const [currentImageIndex1, setCurrentImageIndex1] = useState(0);
  const [currentImageIndex2, setCurrentImageIndex2] = useState(0);

  // 🕒 Crossfade interval for first card
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex1(
        (prev) => (prev + 1) % (offers1.length > 0 ? offers1.length : 1)
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [offers1]);

  // 🕒 Crossfade interval for second card
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex2(
        (prev) => (prev + 1) % (offers2.length > 0 ? offers2.length : 1)
      );
    }, 3000);
    return () => clearInterval(interval);
  }, [offers2]);

  // 🧩 Animate fade for first offer group
  useEffect(() => {
    Animated.timing(opacityAnim1a, {
      toValue: currentImageIndex1 % 2 === 0 ? 1 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnim1b, {
      toValue: currentImageIndex1 % 2 === 0 ? 0 : 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [currentImageIndex1]);

  // 🧩 Animate fade for second offer group
  useEffect(() => {
    Animated.timing(opacityAnim2a, {
      toValue: currentImageIndex2 % 2 === 0 ? 1 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnim2b, {
      toValue: currentImageIndex2 % 2 === 0 ? 0 : 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [currentImageIndex2]);

  // 📱 Dynamic height
  const imgHeight = screenWidth * 0.5;

  // 🧠 Safe helper for image source
  const getImageSource = (item) => {
    if (!item || !item.url) return null;
    return typeof item.url === "string" ? { uri: item.url } : item.url; // handles local require() & remote URLs
  };

  // 🖼️ Get current and next image safely
  const img1a = getImageSource(offers1[currentImageIndex1 % offers1.length]);
  const img1b = getImageSource(
    offers1[(currentImageIndex1 + 1) % offers1.length]
  );
  const img2a = getImageSource(offers2[currentImageIndex2 % offers2.length]);
  const img2b = getImageSource(
    offers2[(currentImageIndex2 + 1) % offers2.length]
  );

  return (
    <View className="w-full">
      {/* Title */}
      <View className="w-11/12 mx-auto my-6 items-center">
        <Text className="text-2xl font-semibold text-gray-800 text-center">
          Limited Offers
        </Text>
      </View>

      {/* Offer Cards */}
      <View className="px-5 w-full flex flex-col lg:flex-row justify-center items-center gap-3 mt-2">
        {/* First Offer Card */}
        <Pressable
          className="w-full lg:w-6/12 relative overflow-hidden rounded-lg"
          style={{ height: imgHeight }}
        >
          {img1a && (
            <Animated.Image
              source={img1a}
              className="absolute w-full h-full"
              style={{ opacity: opacityAnim1a }}
              resizeMode="cover"
            />
          )}
          {img1b && (
            <Animated.Image
              source={img1b}
              className="absolute w-full h-full"
              style={{ opacity: opacityAnim1b }}
              resizeMode="cover"
            />
          )}
        </Pressable>

        {/* Second Offer Card */}
        <Pressable
          className="w-full lg:w-6/12 relative overflow-hidden rounded-lg"
          style={{ height: imgHeight }}
        >
          {img2a && (
            <Animated.Image
              source={img2a}
              className="absolute w-full h-full"
              style={{ opacity: opacityAnim2a }}
              resizeMode="contain"
            />
          )}
          {img2b && (
            <Animated.Image
              source={img2b}
              className="absolute w-full h-full"
              style={{ opacity: opacityAnim2b }}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default LimitedOffers;
