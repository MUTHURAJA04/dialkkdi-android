

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { User, ChevronRight } from 'react-native-feather';
import { useFocusEffect } from '@react-navigation/native';
import Login from './Login';

const { height } = Dimensions.get('window');

const ORANGE = '#FF7F50';
const ORANGE_DARK = '#FF4E00';

const Landing = ({ navigation }) => {
  const [loginType, setLoginType] = useState(null);

  const openLogin = (type) => setLoginType(type);
  const closeLogin = () => setLoginType(null);

  useFocusEffect(
    React.useCallback(() => {
      changeNavigationBarColor(ORANGE, true);
      return () => changeNavigationBarColor('#000000', false);
    }, [])
  );

 return (
  <View className="flex-1 bg-white relative">
    <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

    {/* If you want a solid white background, remove gradient */}
    {/* <LinearGradient ... /> */} 

    {/* Content container */}
    <View className="flex-1 px-6 pt-20 pb-10 justify-center gap-10 z-10">
      {/* Logo + Tagline */}
      <Animatable.View animation="fadeInDown" duration={800} className="items-center">
        <Image
          source={require('../assets/logo.png')}
          className="w-44 h-20"
          resizeMode="contain"
        />
        <Text className="text-gray-900 text-2xl font-bold mt-4 text-center font-serif">
          Find Quality Products You Can Trust
        </Text>
        {/* <Text className="text-gray-700 text-base mt-2 text-center max-w-xs leading-5 font-serif">
          Browse top-rated items from trusted sellers with exclusive offers and fast delivery.
        </Text> */}
      </Animatable.View>

      {/* User Login Button */}
      <Animatable.View animation="fadeInUp" delay={300} duration={900} className="mb-10">
        <TouchableOpacity
          onPress={() => openLogin('user')}
          activeOpacity={0.95}
          style={{
            backgroundColor: '#FF7F50', // orange background for button
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 18,
            flexDirection: 'row',
            alignItems: 'center',
            elevation: 12,
            shadowColor: ORANGE,
            shadowOpacity: 0.25,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
          }}
        >
          <Animatable.View
            animation="bounceIn"
            delay={500}
            className="bg-white p-5 rounded-full mr-4"
          >
            <User color={ORANGE} width={30} height={30} />
          </Animatable.View>

          <View className="flex-1">
            <Text className="text-white text-xl font-bold mb-1 font-serif">Get Started</Text>
            <Text className="text-white text-base font-serif">
             Log in to enjoy members-only deals and curated picks.
            </Text>
          </View>

          <Animatable.View animation="fadeInRight" delay={700}>
            <ChevronRight color="#fff" width={26} height={26} />
          </Animatable.View>
        </TouchableOpacity>
      </Animatable.View>
    </View>

    <Modal visible={!!loginType} animationType="slide" onRequestClose={closeLogin}>
      <Login type={loginType} onClose={closeLogin} />
    </Modal>
  </View>
  );
};

export default Landing;
