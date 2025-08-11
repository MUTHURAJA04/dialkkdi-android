import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, useColorScheme, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut } from 'react-native-feather';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Color scheme
  const colors = {
    light: {
      background: '#f8fafc',
      text: '#0f172a',
      card: '#ffffff',
      primary: '#3b82f6',
      danger: '#ef4444',
      border: '#e2e8f0',
    },
    dark: {
      background: '#0f172a',
      text: '#f8fafc',
      card: '#1e293b',
      primary: '#60a5fa',
      danger: '#f87171',
      border: '#334155',
    },
  };

  const theme = isDarkMode ? colors.dark : colors.light;

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          setUser(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userData');
    navigation.navigate('Landing');
  };

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <StatusBar
          backgroundColor={theme.background}
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
        <StatusBar
          backgroundColor={theme.background}
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        />
        <Text className={`text-lg mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
          No user data found
        </Text>
        <TouchableOpacity
          className={`py-3 px-6 rounded-full`}
          style={{ backgroundColor: theme.primary }}
          onPress={() => navigation.navigate('Landing')}
        >
          <Text className="text-white font-semibold">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <StatusBar
        backgroundColor={theme.background}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
      />

      {/* Profile Content - Centered */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Avatar */}
        <View className={`mb-6 rounded-full p-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
          <Image
            source={{ uri: user.avatarUrl || 'https://i.pravatar.cc/300?u=' + (user.email || 'user') }}
            className="w-32 h-32 rounded-full"
          />
        </View>

        {/* User Info */}
        <View className="items-center mb-8">
          <Text className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {user.name || 'Guest User'}
          </Text>
          <Text className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {user.email || 'No email provided'}
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <View className="absolute bottom-10 left-0 right-0 px-6">
        <TouchableOpacity
          className={`flex-row items-center justify-center py-4 rounded-xl mb-4`}
          style={{ backgroundColor: theme.danger }}
          onPress={handleLogout}
        >
          <LogOut color="white" width={20} height={20} />
          <Text className="text-white font-semibold text-lg ml-2">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;
