import React from "react";
import { SafeAreaView, ScrollView, Text, View, Image, Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

const Seasonal = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Seasonal Products Section */}
        <View className="w-11/12 mx-auto mt-6 px-2">
          <Text className="text-2xl my-2 font-semibold text-center text-gray-800">
            Seasonal Products
          </Text>
          <View className="flex flex-row flex-wrap justify-between">
            {/* Malgova Mango */}
            <View className="w-full bg-white rounded-lg mb-4 shadow">
              <Image
                source={{
                  uri: "https://livecdn.dialkaraikudi.com/default/Sesonal_Products/malgova.webp",
                }}
                className="w-full rounded-t-lg"
                style={{ height: screenWidth * 0.45 }}
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="font-semibold text-sm text-gray-800 mb-1">
                  Malgova Mango
                </Text>
                <Text className="text-sm text-gray-500">Agni Farms</Text>
              </View>
            </View>

            {/* Alphonsa Mango */}
            <View className="w-full bg-white rounded-lg mb-4 shadow">
              <Image
                source={{
                  uri: "https://livecdn.dialkaraikudi.com/default/Sesonal_Products/alphonsa-mango.jpg",
                }}
                className="w-full rounded-t-lg"
                style={{ height: screenWidth * 0.45 }}
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="font-semibold text-sm text-gray-800 mb-1">
                  Alphonsa Mango
                </Text>
                <Text className="text-sm text-gray-500">Agni Farms</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Seasonal Services Section */}
        <View className="w-11/12 mx-auto mt-6 px-2">
          <Text className="text-2xl my-2 font-semibold text-center text-gray-800">
            Seasonal Services
          </Text>
          <View className="flex flex-row flex-wrap justify-between">
            {/* Holiday Packages */}
            <View className="w-full bg-white rounded-lg mb-4 shadow">
              <Image
                source={{
                  uri: "https://livecdn.dialkaraikudi.com/default/Sesonal_Services/tour-packages.jpg",
                }}
                className="w-full rounded-t-lg"
                style={{ height: screenWidth * 0.45 }}
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="font-semibold text-sm text-gray-800 mb-1">
                  Holiday Packages
                </Text>
                <Text className="text-sm text-gray-500">Asian Tours</Text>
              </View>
            </View>

            {/* Festival Light Installation */}
            <View className="w-full bg-white rounded-lg mb-4 shadow">
              <Image
                source={{
                  uri: "https://livecdn.dialkaraikudi.com/default/Sesonal_Services/festival-light.webp",
                }}
                className="w-full rounded-t-lg"
                style={{ height: screenWidth * 0.45 }}
                resizeMode="cover"
              />
              <View className="p-3">
                <Text className="font-semibold text-sm text-gray-800 mb-1">
                  Festival Light Installation
                </Text>
                <Text className="text-sm text-gray-500">RMS Light system</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Seasonal;
