import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Dimensions, Animated, Image } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const LimitedOffers = ({ offers1 = [], offers2 = [] }) => {
  const fadeDuration = 800;
  const displayDuration = 3000;
  const imgHeight = screenWidth * 0.5;

  // Use single animated value for each offer
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;

  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [currentIndex2, setCurrentIndex2] = useState(0);

  const getImageSource = (item) =>
    item?.url ? (typeof item.url === "string" ? { uri: item.url } : item.url) : null;

  // Simplified fade animation for single offer
  const fadeOffer = (fadeAnim, setIndex, offers) => {
    if (offers.length <= 1) return;

    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start(() => {
      // Change index when completely faded out
      setIndex(prev => (prev + 1) % offers.length);
      
      // Fade in new image
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start();
    });
  };

  useEffect(() => {
    // Start with images visible
    fadeAnim1.setValue(1);
    fadeAnim2.setValue(1);

    if (offers1.length === 0 && offers2.length === 0) return;

    const timer = setInterval(() => {
      if (offers1.length > 1) fadeOffer(fadeAnim1, setCurrentIndex1, offers1);
      if (offers2.length > 1) fadeOffer(fadeAnim2, setCurrentIndex2, offers2);
    }, displayDuration);

    return () => clearInterval(timer);
  }, [offers1, offers2]);

  const currentImage1 = getImageSource(offers1[currentIndex1]);
  const currentImage2 = getImageSource(offers2[currentIndex2]);

  return (
    <View className="w-full">
      <View className="w-11/12 mx-auto my-6 items-center">
        <Text className="text-2xl font-semibold text-gray-800 text-center">
          Limited Offers
        </Text>
      </View>

      <View className="px-5 w-full flex flex-col lg:flex-row justify-center items-center gap-3 mt-2">
        {/* First Offer */}
        <Pressable
          className="w-full lg:w-6/12 relative overflow-hidden rounded-lg"
          style={{ height: imgHeight }}
        >
          {currentImage1 && (
            <Animated.View
              style={[
                { 
                  position: "absolute", 
                  width: "100%", 
                  height: "100%",
                },
                { 
                  opacity: fadeAnim1 
                },
              ]}
            >
              <Image 
                source={currentImage1} 
                style={{ width: "100%", height: "100%" }} 
                resizeMode="cover" 
              />
            </Animated.View>
          )}
        </Pressable>

        {/* Second Offer */}
        <Pressable
          className="w-full lg:w-6/12 relative overflow-hidden rounded-lg"
          style={{ height: imgHeight }}
        >
          {currentImage2 && (
            <Animated.View
              style={[
                { 
                  position: "absolute", 
                  width: "100%", 
                  height: "100%" 
                },
                { 
                  opacity: fadeAnim2 
                },
              ]}
            >
              <Image 
                source={currentImage2} 
                style={{ width: "100%", height: "100%" }} 
                resizeMode="contain" 
              />
            </Animated.View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

export default LimitedOffers;