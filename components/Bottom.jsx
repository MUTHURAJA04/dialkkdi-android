import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Home, User } from 'react-native-feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const Bottom = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const actions = [
    {
      screen: 'Home',
      icon: <Home stroke="white" width={24} height={24} />,
    },
    {
      screen: 'CivicScreen',
      icon: (
        <Image
          source={require('../assets/civic.png')}
          style={{ width: 36, height: 36, resizeMode: 'contain' }}
        />
      ),
    },
    {
      screen: 'DialogramScreen',
      icon: (
        <Image
          source={require('../assets/Dialogram.png')}
          style={{ width: 36, height: 36, resizeMode: 'contain' }}
        />
      ),
    },
    {
      screen: 'Profile',
      icon: <User stroke="white" width={24} height={24} />,
    },
  ];

  const handlePress = (item) => {
    console.log(`✅ ${item.name} clicked`);
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#121212',
        paddingVertical: 12,
        paddingBottom: insets.bottom + 10,
        borderTopWidth: 0.5,
        borderTopColor: '#333',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: -2 },
      }}
    >
      {actions.map((item, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handlePress(item)}
          style={{
            alignItems: 'center',
            padding: 8,
            borderRadius: 50,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
          activeOpacity={0.7}
        >
          {item.icon}
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Bottom;
