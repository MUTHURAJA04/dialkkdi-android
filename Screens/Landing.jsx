

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Modal,
  Image,
  Dimensions,
  SafeAreaView,
  useColorScheme,
  Animated,
  PanResponder,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import { User, ChevronRight } from 'react-native-feather';
import { useFocusEffect } from '@react-navigation/native';
import Login from './Login';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');

const ORANGE = '#FF7F50';
const ORANGE_DARK = '#FF4E00';

const Landing = ({ navigation }) => {
  const [loginType, setLoginType] = useState(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // 3D CTA animations
  const tilt = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const press = React.useRef(new Animated.Value(0)).current;
  const shimmer = React.useRef(new Animated.Value(0)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4,
      onPanResponderMove: (_evt, { dx, dy }) => {
        const clampedX = Math.max(-40, Math.min(40, dx));
        const clampedY = Math.max(-40, Math.min(40, dy));
        tilt.setValue({ x: clampedX, y: clampedY });
      },
      onPanResponderRelease: () => {
        Animated.spring(tilt, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 5,
          tension: 60,
        }).start();
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        Animated.spring(tilt, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 5,
          tension: 60,
        }).start();
      },
    })
  ).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => {
      loop.stop();
      shimmer.setValue(0);
    };
  }, [shimmer]);

  const openLogin = (type) => setLoginType(type);
  const closeLogin = () => setLoginType(null);

  useFocusEffect(
    React.useCallback(() => {
      const navColor = isDark ? '#0b0b0c' : '#ffffff';
      // second arg controls icon color contrast on Android nav bar
      changeNavigationBarColor(navColor, isDark);
      return () => changeNavigationBarColor('#000000', true);
    }, [isDark])
  );

  // Redirect if already logged in
  useFocusEffect(
    React.useCallback(() => {
      const checkAuth = async () => {
        try {
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
          }
        } catch (e) {
          // ignore
        }
      };
      checkAuth();
    }, [navigation])
  );

  return (
  <View className="flex-1 relative">
    <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#0b0b0c' : '#ffffff'} />

    {/* Gradient background */}
    <LinearGradient
      colors={
        isDark
          ? ["#0b0b0c", "#0e1a2b", "#0b0b0c"]
          : ["#ffffff", "#eef2ff", "#ffffff"]
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ position: 'absolute', inset: 0 }}
    />

    {/* Animated background accents */}
    <View pointerEvents="none" className="absolute inset-0 overflow-hidden">
      <Animatable.View
        animation={{ 0: { transform: [{ translateX: -40 }, { translateY: -20 }, { scale: 0.95 }] }, 1: { transform: [{ translateX: 40 }, { translateY: 30 }, { scale: 1.05 }] } }}
        iterationCount="infinite"
        direction="alternate"
        duration={12000}
        className="absolute rounded-full"
        style={{
          width: Math.min(280, width * 0.7),
          height: Math.min(280, width * 0.7),
          backgroundColor: isDark ? 'rgba(59,130,246,0.16)' : 'rgba(59,130,246,0.10)',
          top: -80,
          left: -60,
        }}
      />
      <Animatable.View
        animation={{ 0: { transform: [{ translateX: 30 }, { translateY: 10 }, { scale: 1.0 }] }, 1: { transform: [{ translateX: -30 }, { translateY: -20 }, { scale: 1.08 }] } }}
        iterationCount="infinite"
        direction="alternate"
        duration={15000}
        className="absolute rounded-full"
        style={{
          width: Math.min(360, width * 0.85),
          height: Math.min(360, width * 0.85),
          backgroundColor: isDark ? 'rgba(16,185,129,0.14)' : 'rgba(16,185,129,0.10)',
          bottom: -120,
          right: -80,
        }}
      />
      <Animatable.View
        animation={{ 0: { transform: [{ translateX: 20 }, { translateY: -10 }, { scale: 0.98 }] }, 1: { transform: [{ translateX: -10 }, { translateY: 25 }, { scale: 1.06 }] } }}
        iterationCount="infinite"
        direction="alternate"
        duration={18000}
        className="absolute rounded-full"
        style={{
          width: Math.min(220, width * 0.55),
          height: Math.min(220, width * 0.55),
          backgroundColor: isDark ? 'rgba(244,114,182,0.12)' : 'rgba(244,114,182,0.10)',
          top: height * 0.35,
          right: -40,
        }}
      />
    </View>

    {/* Content */}
    <SafeAreaView className="flex-1 px-6 pt-6 pb-4 justify-between">
      {/* Hero */}
      <Animatable.View animation="fadeInDown" duration={900} className="items-center mt-6">
        {/* Logo + glow */}
        <Animatable.View animation="pulse" iterationCount="infinite" duration={2400} easing="ease-in-out" className="rounded-full items-center justify-center" style={{ padding: 10, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}>
          <LinearGradient
            colors={isDark ? ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.06)', 'rgba(0,0,0,0.01)']}
            style={{ padding: 18, borderRadius: 28 }}
          >
            <View className="w-36 h-36 rounded-3xl items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
              <Image source={require('../assets/logo.png')} className="w-32 h-16" resizeMode="contain" />
            </View>
          </LinearGradient>
        </Animatable.View>
        <Text className={`${isDark ? 'text-white' : 'text-slate-900'} text-3xl font-extrabold mt-6 text-center`}>Welcome to DialKaraikudi</Text>
        <Text className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-base mt-3 text-center leading-6`}>Discover trusted local businesses, exclusive offers, and the best of Karaikudi — all in one place.</Text>
      </Animatable.View>

      {/* Feature bullets */}
      <Animatable.View animation="fadeInUp" delay={200} duration={900} className="mt-8">
        {[
          'Curated local listings',
          'Verified reviews and ratings',
          'Personalized recommendations',
        ].map((t, idx) => (
          <Animatable.View key={idx} animation="fadeInUp" delay={300 + idx * 120} className="flex-row items-center mb-3">
            <View className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: isDark ? '#60A5FA' : '#3B82F6' }} />
            <Text className={`${isDark ? 'text-slate-200' : 'text-slate-700'} text-base`}>{t}</Text>
          </Animatable.View>
        ))}
      </Animatable.View>

      {/* CTA */}
      <Animatable.View animation="fadeInUp" delay={400} duration={900} className="mb-6">
        {/* Gradient bordered CTA for a premium feel */}
        <LinearGradient
          colors={[ORANGE_DARK, ORANGE]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 18, padding: 2 }}
        >
          <TouchableOpacity
            onPress={() => openLogin('user')}
            activeOpacity={0.95}
            className="rounded-xl flex-row items-center"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.40)',
              paddingVertical: 18,
              paddingHorizontal: 18,
              elevation: 10,
              shadowColor: ORANGE,
              shadowOpacity: 0.25,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
              overflow: 'hidden',
            }}
          >
            {/* 3D interactive layer */}
            {(() => {
              const rotateX = tilt.y.interpolate({
                inputRange: [-40, 40],
                outputRange: ['6deg', '-6deg'],
              });
              const rotateY = tilt.x.interpolate({
                inputRange: [-40, 40],
                outputRange: ['-6deg', '6deg'],
              });
              const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] });
              const translateY = press.interpolate({ inputRange: [0, 1], outputRange: [0, 4] });
              const shimmerTranslate = shimmer.interpolate({ inputRange: [0, 1], outputRange: [-width, width] });

              return (
                <Animated.View
                  {...panResponder.panHandlers}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    transform: [
                      { perspective: 1000 },
                      { rotateX },
                      { rotateY },
                      { scale },
                      { translateY },
                    ],
                  }}
                  onTouchStart={() =>
                    Animated.spring(press, { toValue: 1, useNativeDriver: true, friction: 6, tension: 120 }).start()
                  }
                  onTouchEnd={() =>
                    Animated.spring(press, { toValue: 0, useNativeDriver: true, friction: 6, tension: 120 }).start()
                  }
                >
                  {/* Moving shimmer strip */}
                  <Animated.View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      width: 120,
                      transform: [{ translateX: shimmerTranslate }, { rotateZ: '15deg' }],
                      opacity: isDark ? 0.25 : 0.35,
                    }}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.0)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ flex: 1 }}
                    />
                  </Animated.View>

                  <Animatable.View animation="bounceIn" delay={500} className="bg-white p-4 rounded-full mr-4">
                    <User color={ORANGE} width={28} height={28} />
                  </Animatable.View>
                  <View className="flex-1">
                    <Text className={`${isDark ? 'text-white' : 'text-slate-900'} text-xl font-bold mb-0.5`}>Get Started</Text>
                    <Text className={`${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Login to continue</Text>
                  </View>
                  <Animatable.View animation="fadeInRight" delay={700}>
                    <ChevronRight color={isDark ? '#ffffff' : '#111827'} width={26} height={26} />
                  </Animatable.View>
                </Animated.View>
              );
            })()}
          </TouchableOpacity>
        </LinearGradient>
      </Animatable.View>
    </SafeAreaView>

    <Modal visible={!!loginType} animationType="slide" onRequestClose={closeLogin}>
      <Login type={loginType} onClose={closeLogin} />
    </Modal>
  </View>
  );
};

export default Landing;
