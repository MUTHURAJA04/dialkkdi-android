// Landing.jsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Image, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { Briefcase, User } from 'react-native-feather';
import { useFocusEffect } from '@react-navigation/native';
import Login from './Login';


const Landing = () => {
  const [loginType, setLoginType] = useState(null); // "business" | "user" | null

  const openLogin = (type) => setLoginType(type);
  const closeLogin = () => setLoginType(null);

  useFocusEffect(
    React.useCallback(() => {
      changeNavigationBarColor('#ff9068', true);
      return () => changeNavigationBarColor('#000000', false);
    }, [])
  );

  return (
    <LinearGradient
      colors={['#ff4b1f', '#ff9068']}
      className="flex-1 justify-center items-center px-4"
    >
      <StatusBar barStyle="light-content" backgroundColor="#ff4b1f" />

      {/* Logo */}
      <Animatable.Image
        animation="bounceInDown"
        delay={2000}
        duration={1000}
        source={require('../assets/logo.png')}
        className="w-40 h-20 mb-8"
        resizeMode="contain"
      />

      {/* Business Login Card */}
      <View className="w-full items-start">
        <Animatable.View
          animation="fadeInLeftBig"
          delay={1000}
          duration={1000}
          className="w-[85%] rounded-2xl bg-white/25 p-9 backdrop-blur-md border border-white/20"
        >
          <TouchableOpacity
            onPress={() => openLogin('business')}
            activeOpacity={0.85}
            className="flex-row items-start space-x-3"
          >
            <Briefcase color="#fff" width={28} height={28} />
            <View className="flex-1 ml-1">
              <Text className="text-white text-xl font-bold mb-1">Business Login</Text>
              <Text className="text-white/80 text-sm">
                Expand your brand digitally. List your business and reach more customers.
              </Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>
      </View>

      {/* User Login Card */}
      <View className="w-full items-end mt-6">
        <Animatable.View
          animation="fadeInRightBig"
          delay={1000}
          duration={1000}
          className="w-[85%] rounded-2xl bg-white/25 p-9 backdrop-blur-md border border-white/20"
        >
          <TouchableOpacity
            onPress={() => openLogin('user')}
            activeOpacity={0.85}
            className="flex-row items-start space-x-3"
          >
            <User color="#fff" width={28} height={28} />
            <View className="flex-1 ml-1">
              <Text className="text-white text-xl font-bold mb-1">User Login</Text>
              <Text className="text-white/80 text-sm">
                Discover Karaikudi’s best local services and businesses.
              </Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>
      </View>

      {/* Login Modal */}
      <Modal visible={!!loginType} animationType="slide" transparent>
        <Login type={loginType} onClose={closeLogin} />
      </Modal>
    </LinearGradient>
  );
};

export default Landing;
