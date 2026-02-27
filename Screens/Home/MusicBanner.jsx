import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const MusicBanner = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate('Donate')}
      className="w-full"
    >
      <LinearGradient
        colors={['#7c3aed', '#4f46e5', '#2563eb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-48 justify-center px-6"
      >
        {/* Decorative Glow Circle */}
        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <View className="absolute -bottom-16 -left-10 w-52 h-52 bg-white/10 rounded-full" />

        {/* Content */}
        <View>
          <Text className="text-white text-3xl font-extrabold tracking-wide">
            Donate Fund
          </Text>

<Text className="text-white/80 text-base mt-2">
  Contribute to the Karaikud Shri Lalitha Muthumariamman Video Song 
</Text>

          {/* CTA Button */}
          <View className="mt-6 bg-white px-6 py-2 rounded-full self-start">
            <Text className="text-indigo-700 font-bold text-sm">
              Donate Now
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default MusicBanner;