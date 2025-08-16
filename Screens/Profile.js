import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  useColorScheme,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, Heart } from 'react-native-feather';
import { getFavoriteStatus } from '../services/apiClient';
import { useNavigation } from '@react-navigation/native';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        const businessData = await AsyncStorage.getItem('businessData');
        if (storedData) {
          setUser(JSON.parse(storedData));
        } else {
          setBusiness(JSON.parse(businessData))
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
      finally {
        setLoading(false)
      }
    };

    const fetchFavourites = async () => {
      try {
        const getFav = await getFavoriteStatus(); // imported one
        setFavourites(getFav);
        console.log(getFav, "Got Favourites");
      } catch (error) {
        console.error('Error loading favourites:', error);
      } finally {
        setLoading(false)
      }

    };

    fetchUser();
    fetchFavourites();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userData');
    navigation.navigate('Landing');
  };

  const imgUrl = "https://livecdn.dialkaraikudi.com/"

  const renderFavouriteCard = ({ item }) => (
    <TouchableOpacity
      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden mb-4 shadow"
      onPress={() => navigation.navigate('BusinessDetailScreen', { business: item?.business })}
      activeOpacity={0.8}
    >
      {/* Image with heart icon */}
      <View className="relative">
        <Image
          source={{ uri: `${imgUrl}${item.business.photos[0]}` }}
          className="w-full h-40"
          resizeMode="cover"
        />
      </View>

      {/* Business details */}
      <View className="p-3">
        <Text className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {item.business.businessName}
        </Text>
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          {item.business.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <StatusBar
          backgroundColor={isDarkMode ? '#0f172a' : '#f8fafc'}
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <ActivityIndicator size="large" color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <StatusBar
        backgroundColor={isDarkMode ? '#0f172a' : '#f8fafc'}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      {/* Profile Section */}
      <View className="items-center py-6 mt-3">
        <Image
          source={{
            uri:
              user?.avatarUrl ||
              'https://i.pravatar.cc/300?u=' + (user?.email || 'user'),
          }}
          className="w-32 h-32 rounded-full mb-4"
        />
        <Text className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">
          {user?.name || 'Guest User'}
        </Text>
        <Text className="text-lg text-slate-600 dark:text-slate-300">
          {user?.email || 'No email provided'}
        </Text>
      </View>

      {/* Favourites Section */}
      <View className="px-4 flex-1">
        <Text className="text-lg font-bold mb-3 text-slate-900 dark:text-white">
          My Favourites
        </Text>
        <FlatList
          data={favourites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavouriteCard}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Logout Button */}
      <View className="px-6 pb-6">
        <TouchableOpacity
          className="flex-row items-center justify-center py-4 rounded-xl bg-red-500"
          onPress={handleLogout}
        >
          <LogOut color="white" width={20} height={20} />
          <Text className="text-white font-semibold text-lg ml-2">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
