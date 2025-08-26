import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Dimensions, Animated } from 'react-native';
import Limited1 from '../../assets/Banners/Limited1.jpg'
import Limited2 from '../../assets/Banners/Limited2.jpg'

const { width: screenWidth } = Dimensions.get('window');

const LimitedOffers = () => {
  // Animations for first card
  const opacityAnim1a = useRef(new Animated.Value(1)).current;
  const opacityAnim1b = useRef(new Animated.Value(0)).current;

  // Animations for second card
  const opacityAnim2a = useRef(new Animated.Value(1)).current;
  const opacityAnim2b = useRef(new Animated.Value(0)).current;

  const images1 = [
    Limited1, Limited2
  ];
  const [currentImageIndex1, setCurrentImageIndex1] = useState(0);

  const [currentImageIndex2, setCurrentImageIndex2] = useState(0);

  // Cross-fade for first card
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex1((prev) => (prev + 1) % images1.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Cross-fade for second card
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex2((prev) => (prev + 1) % images1.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(opacityAnim1a, {
      toValue: currentImageIndex1 === 0 ? 1 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnim1b, {
      toValue: currentImageIndex1 === 0 ? 0 : 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [currentImageIndex1]);

  useEffect(() => {
    Animated.timing(opacityAnim2a, {
      toValue: currentImageIndex2 === 0 ? 1 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    Animated.timing(opacityAnim2b, {
      toValue: currentImageIndex2 === 0 ? 0 : 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [currentImageIndex2]);

  // Dynamic height based on screen width
  const imgHeight = screenWidth * 0.5;

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
        <Pressable className="w-full lg:w-6/12 relative overflow-hidden rounded-lg" style={{ height: imgHeight }}>
          <Animated.Image
            source={images1[0]}
            className="absolute w-full h-full"
            style={{ opacity: opacityAnim1a }}
            resizeMode="cover"
          />
          <Animated.Image
            source={images1[1]}
            className="absolute w-full h-full"
            style={{ opacity: opacityAnim1b }}
            resizeMode="cover"
          />
        </Pressable>

        {/* Second Offer Card */}
        <Pressable className="w-full lg:w-6/12 relative overflow-hidden rounded-lg" style={{ height: imgHeight }}>
          <Animated.Image
            source={images1[1]}
            className="absolute w-full h-full"
            style={{ opacity: opacityAnim2a }}
            resizeMode="contain"
          />
          <Animated.Image
            source={images1[0]}
            className="absolute w-full h-full"
            style={{ opacity: opacityAnim2b }}
            resizeMode="contain"
          />
        </Pressable>
      </View>
    </View>
  );
};

export default LimitedOffers;
