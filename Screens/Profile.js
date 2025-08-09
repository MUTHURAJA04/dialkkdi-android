import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from AsyncStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          setUser(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('❌ Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userData');
    console.log('🚪 User logged out');
    navigation.navigate('Login');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffff', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#aaa', fontSize: 16 }}>No user data found</Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#1E90FF',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 25,
            marginTop: 20,
          }}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#121212', padding: 20 }}>
      {/* Profile Info */}
      <View style={{ alignItems: 'center', marginTop: 50 }}>
        <Image
          source={{ uri: user.avatar || 'https://i.pravatar.cc/150?img=3' }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            marginBottom: 15,
            borderWidth: 2,
            borderColor: '#fff',
          }}
        />
        <Text style={{ fontSize: 20, color: 'white', fontWeight: 'bold' }}>
          {user.name || 'Guest User'}
        </Text>
        <Text style={{ fontSize: 14, color: '#aaa', marginBottom: 20 }}>
          {user.email || 'No email provided'}
        </Text>

        {/* Edit Profile */}
        <TouchableOpacity
          style={{
            backgroundColor: '#1E90FF',
            paddingVertical: 10,
            paddingHorizontal: 25,
            borderRadius: 25,
            marginBottom: 20,
          }}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={{
            backgroundColor: '#FF4D4D',
            paddingVertical: 10,
            paddingHorizontal: 25,
            borderRadius: 25,
          }}
          onPress={handleLogout}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;
