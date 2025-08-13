import React from 'react';
import { TouchableOpacity, useColorScheme } from 'react-native';
import { Home, User } from 'react-native-feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { Image } from 'react-native';

const Bottom = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

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
      screen: 'TalkofTown',
      icon: (
        <Image
          source={require('../assets/TalkofTown.jpg')}
          className="w-5 h-7"
        />
      ),
    },
    {
      screen: 'Profile',
      icon: <User stroke={isDarkMode ? "#ffffff" : "#000000"} width={22} height={22} />,
    },
  ];

  const handlePress = (item) => {
    console.log(`✅ ${item.screen} clicked`);
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View 
      className="flex-row justify-around items-center py-3"
      style={{
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? '#333' : '#e5e5e5',
      }}
    >
      {actions.map((item, index) => (
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