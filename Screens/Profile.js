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
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, Heart, User } from 'react-native-feather';
import { getFavoriteStatus } from '../services/apiClient';
import { useNavigation } from '@react-navigation/native';
import CivicCrud from './Business/CivicCrud/CivicCrud';
import * as Animatable from "react-native-animatable";

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);
  const [activeTab, setActiveTab] = useState("favourites"); // 👈 tab state
  const [profileOpen, setProfileOpen] = useState(false)
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { width, height } = Dimensions.get("window"); // 👈 FIXED

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

  const FloatingBall = ({ delay, top, left, size }) => (
    <Animatable.View
      animation={{
        0: { translateY: 0, opacity: 0.6 },
        0.5: { translateY: -15, opacity: 1 },
        1: { translateY: 0, opacity: 0.6 },
      }}
      iterationCount="infinite"
      easing="ease-in-out"
      duration={4000}
      delay={delay}
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#EB5B00", // orange-500 with opacity
        shadowColor: "#f97316",
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 6,
      }}
    />
  );

  return (
    <SafeAreaView className={`flex-1 relative ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Profile Section */}
      {profileOpen && (
        <View className="items-center justify-between h-screen w-full py-6 absolute z-10 bg-black/95">
          <StatusBar backgroundColor={"black"} />

          <FloatingBall delay={0} top={100} left={20} size={80} />
          <FloatingBall delay={800} top={250} left={width - 120} size={60} />
          <FloatingBall delay={1600} top={400} left={width - 140} size={300} />
          <FloatingBall delay={2200} top={height - 220} left={width / 2 - 50} size={70} />

          <View className='items-center'>
            <Image
              source={{
                uri: user?.avatarUrl || 'https://i.pravatar.cc/300?u=' + (user?.email || 'user'),
              }}
              className="w-24 h-24 rounded-full mb-4"
            />
            <Text className="text-2xl font-bold mb-1 text-white">
              {user?.name || 'Guest User'}
            </Text>
            <Text className="text-lg text-white">
              {user?.email || 'No email provided'}
            </Text>
          </View>
          <View className="px-6 pb-6 flex-col gap-3 w-full">
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 w-full rounded-xl bg-green-500"
              onPress={() => setProfileOpen(!profileOpen)}
            >
              <LogOut color="white" width={20} height={20} />
              <Text className="text-white font-semibold text-lg ml-2">Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 rounded-xl bg-red-500"
              onPress={handleLogout}
            >
              <LogOut color="white" width={20} height={20} />
              <Text className="text-white font-semibold text-lg ml-2">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View className="flex-row mt-4 mx-4 mb-4 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden">
        <StatusBar backgroundColor={"black"} />
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeTab === "favourites" ? "bg-green-400" : ""}`}
          onPress={() => setActiveTab("favourites")}
        >
          <Text className={`${activeTab === "favourites" ? "text-white font-semibold" : "text-slate-700 dark:text-slate-300"}`}>
            My Favourites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeTab === "choices" ? "bg-green-500" : ""}`}
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
          className="flex-row items-center justify-center py-4 rounded-xl bg-orange-500"
          onPress={() => setProfileOpen(!profileOpen)}
        >
          <User color="white" width={20} height={20} />
          <Text className="text-white font-semibold text-lg ml-2">My Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
