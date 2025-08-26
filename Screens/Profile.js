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
import CivicCrud from './CivicCrud/CivicCrud';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);
  const [activeTab, setActiveTab] = useState("favourites"); // 👈 tab state
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
      } finally {
        setLoading(false);
      }
    };

    const fetchFavourites = async () => {
      try {
        const getFav = await getFavoriteStatus();
        setFavourites(getFav);
      } catch (error) {
        console.error('Error loading favourites:', error);
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
      <Image
        source={{ uri: `${imgUrl}${item.business.photos[0]}` }}
        className="w-full h-40"
        resizeMode="cover"
      />
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
        <ActivityIndicator size="large" color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Profile Section */}
      <View className="items-center py-6 mt-3">
        <Image
          source={{
            uri: user?.avatarUrl || 'https://i.pravatar.cc/300?u=' + (user?.email || 'user'),
          }}
          className="w-24 h-24 rounded-full mb-4"
        />
        <Text className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">
          {user?.name || 'Guest User'}
        </Text>
        <Text className="text-lg text-slate-600 dark:text-slate-300">
          {user?.email || 'No email provided'}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-4 mb-4 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden">
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeTab === "favourites" ? "bg-blue-500" : ""}`}
          onPress={() => setActiveTab("favourites")}
        >
          <Text className={`${activeTab === "favourites" ? "text-white font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
            My Favourites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeTab === "choices" ? "bg-blue-500" : ""}`}
          onPress={() => setActiveTab("choices")}
        >
          <Text className={`${activeTab === "choices" ? "text-white font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
            My Choices
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View className="flex-1 px-4 py-2 ">
        {activeTab === "favourites" ? (
          <FlatList
            data={favourites}
            keyExtractor={(item) => item.id}
            renderItem={renderFavouriteCard}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <CivicCrud />
        )}
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
