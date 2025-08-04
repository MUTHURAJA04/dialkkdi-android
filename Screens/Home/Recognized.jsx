import React from 'react';
import { View, Text, Image, useWindowDimensions } from 'react-native';

const Recognized = () => {
  const { width } = useWindowDimensions();

  // For responsiveness, adjust container direction manually (simple example)
  const isLargeScreen = width >= 768; // approx md breakpoint

  return (
    <View className="flex flex-col items-center py-6 bg-blue-50">
      <Text className="text-center text-3xl font-medium mb-6 text-red-900">
        Recognized by
      </Text>

      <View
        className="justify-center items-center gap-10"
        style={{
          flexDirection: isLargeScreen ? 'row' : 'column',
          width: '100%',
          paddingHorizontal: 20,
        }}
      >
        {/* Startup India */}
        <View style={{ width: 230, height: 100 }}>
          <Image
            source={{
              uri: "https://livecdn.dialkaraikudi.com/default/default_images/startup_india.png",
            }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {/* DPIT */}
        <View style={{ width: isLargeScreen ? 100 : 160, height: 100 }}>
          <Image
            source={{
              uri: "https://livecdn.dialkaraikudi.com/default/default_images/dpit.png",
            }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {/* Startup TN */}
        <View style={{ width: 250, height: 100 }}>
          <Image
            source={{
              uri: "https://livecdn.dialkaraikudi.com/default/default_images/startup_tn.png",
            }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

export default Recognized;
