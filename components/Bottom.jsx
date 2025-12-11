import React, { useEffect, useState } from 'react';
import { TouchableOpacity, useColorScheme, View, Image } from 'react-native';
import { Home, User, Briefcase, Grid } from 'react-native-feather'; // Added Briefcase for business icon
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Bottom = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        const businessData = await AsyncStorage.getItem('businessData');
        if (storedData) {
          setUser(JSON.parse(storedData));
        } else if (businessData) {
          setBusiness(JSON.parse(businessData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return null; // Don’t render until data is loaded

  const actions = [
    {
      screen: 'Home',
      icon: <Home stroke={isDarkMode ? "#ffffff" : "#000000"} width={22} height={22} />,
    },
    {
      screen: 'DialogramScreen',
      icon: (
        <Image
          source={require('../assets/Dialogram.png')}
          className="w-5 h-7"
        />
      ),
    },
    {
      screen: 'FestivelScreen',
      icon: (
        <Image
          source={require('../assets/kolam.png')}
          className="w-14 h-14"
        />
      ),
    },
    {
      screen: 'TalkofTown',
      icon: (
        <Image
          source={require('../assets/TalkofTown.jpg')}
          className="w-5 h-7"
        />
      ),
    },
    business
      ? {
        screen: 'BusinessLanding', // 👈 If business, show this
        icon: (
          <Grid
            stroke={isDarkMode ? "#ffffff" : "#000000"}
            width={22}
            height={22}
          />
        ),
      }
      : {
        screen: 'Profile', // 👈 Else fallback to Profile
        icon: <User stroke={isDarkMode ? "#ffffff" : "#000000"} width={22} height={22} />,
      },
  ];

  const handlePress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View
      className="flex-row justify-around items-center py-1"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#333' : '#e5e5e5',
        paddingBottom: insets.bottom || 6,
      }}
    >
      {actions.map((item) => (
        <TouchableOpacity
          key={item.screen}
          onPress={() => handlePress(item)}
          className="items-center p-2 rounded-full"
          style={{
            backgroundColor: 'transparent',
          }}
          activeOpacity={0.6}
        >
          {item.icon}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Bottom;
