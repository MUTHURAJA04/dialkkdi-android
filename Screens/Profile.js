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
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogOut, Heart, User, Trash2 } from 'react-native-feather';
import { getFavoriteStatus, deleteAccount } from '../services/apiClient';
import { useNavigation } from '@react-navigation/native';
import CivicCrud from './Business/CivicCrud/CivicCrud';
import * as Animatable from 'react-native-animatable';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState([]);
  const [activeTab, setActiveTab] = useState('favourites'); // 👈 tab state
  const [profileOpen, setProfileOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const { width, height } = Dimensions.get('window'); // 👈 FIXED

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        const businessData = await AsyncStorage.getItem('businessData');
        if (storedData) {
          setUser(JSON.parse(storedData));
        } else {
          setBusiness(JSON.parse(businessData));
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
     await AsyncStorage.clear();
    navigation.navigate('Landing');
  };

  const handleDeleteAccount = async () => {
    try {
      // ✅ Determine final reason
      const finalReason =
        selectedReason === 'Other' ? customReason : selectedReason;
      console.log('Account deletion reason:', finalReason);

      // 🧩 Confirm user action
      Alert.alert(
        'Confirm Account Deletion',
        'Are you sure you want to permanently delete your account? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              setDeleting(true);
              try {
                // 🔹 Call the API
                const result = await deleteAccount(finalReason);
                console.log('API Response:', result);

                if (result?.userdeleted) {
                  Alert.alert(
                    'Account Deleted',
                    'Your account has been deleted successfully.',
                  );

                  // 🔹 Clear all stored data
                  await AsyncStorage.clear();

                  // Close modal state before navigating away
                  setDeleteModalOpen(false);
                  setSelectedReason(null);
                  setCustomReason('');

                  // 🔹 Navigate to login/onboarding
                  navigation.replace('Landing');
                } else {
                  Alert.alert(
                    'Error',
                    result?.message || 'Failed to delete account.',
                  );
                }
              } catch (err) {
                console.error('❌ deleteAccount API Error:', err);
                Alert.alert('Error', err?.message || 'Something went wrong.');
              } finally {
                setDeleting(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('❌ handleDeleteAccount Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong.');
    }
  };

  const deleteReasons = [
    'I no longer need the service',
    'I had a bad experience',
    'Privacy or security concerns',
    'I get too many emails/notifications',
    'I found a better alternative',
    'Just taking a break',
    'Other',
  ];

  const imgUrl = 'https://livecdn.dialkaraikudi.com/';

  const renderFavouriteCard = ({ item }) => (
    <TouchableOpacity
      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden mb-4 shadow"
      onPress={() =>
        navigation.navigate('BusinessDetailScreen', {
          business: item?.business,
        })
      }
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
      <View
        className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}
      >
        <ActivityIndicator
          size="large"
          color={isDarkMode ? '#60a5fa' : '#3b82f6'}
        />
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
        position: 'absolute',
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#EB5B00', // orange-500 with opacity
        shadowColor: '#f97316',
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 6,
      }}
    />
  );

  return (
    <SafeAreaView
      className={`flex-1 pt-5 relative ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#0f172a' : '#f8fafc'}
        translucent={false}
      />

      {profileOpen && (
        <View className="items-center justify-between h-screen w-full pt-10 py-6 absolute z-10 bg-black/95">
          <StatusBar backgroundColor={'black'} />
          <FloatingBall delay={0} top={100} left={20} size={80} />
          <FloatingBall delay={800} top={250} left={width - 120} size={60} />
          <FloatingBall delay={1600} top={400} left={width - 140} size={300} />
          <FloatingBall
            delay={2200}
            top={height - 220}
            left={width / 2 - 50}
            size={70}
          />

          <View className="items-center">
            <Image
              source={{
                uri:
                  user?.avatarUrl ||
                  'https://i.pravatar.cc/300?u=' + (user?.email || 'user'),
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
              <Text className="text-white font-semibold text-lg ml-2">
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 rounded-xl bg-red-700"
              onPress={() => setDeleteModalOpen(true)}
            >
              <Trash2 color="white" width={20} height={20} />
              <Text className="text-white font-semibold text-lg ml-2">
                Delete My Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center justify-center py-4 rounded-xl bg-red-500"
              onPress={handleLogout}
            >
              <LogOut color="white" width={20} height={20} />
              <Text className="text-white font-semibold text-lg ml-2">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          if (deleting) return;
          setDeleteModalOpen(false);
          setSelectedReason(null);
          setCustomReason('');
        }}
      >
        <KeyboardAvoidingView
          className="flex-1 bg-black/60 justify-end"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View className="bg-white dark:bg-slate-800 rounded-t-3xl px-6 py-8 h-[90%]">
            {/* Header */}
            <View className="items-center mb-6">
              <View className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mb-4">
                <Trash2 color="#ef4444" width={24} height={24} />
              </View>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Delete Account
              </Text>
              <Text className="text-slate-600 dark:text-slate-400 text-center leading-5">
                We're sorry to see you go. Please tell us why you're deleting
                your account so we can improve our service.
              </Text>
            </View>

            {/* Reasons List */}
            <View className="mb-6 flex-1">
              <Text className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Why are you leaving?
              </Text>
              <FlatList
                data={deleteReasons}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`py-4 px-4 rounded-xl mb-3 border-2 ${
                      selectedReason === item
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                    }`}
                    onPress={() => !deleting && setSelectedReason(item)}
                    disabled={deleting}
                  >
                    <Text
                      className={`text-center ${
                        selectedReason === item
                          ? 'text-red-700 dark:text-red-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                className="flex-1"
              />
            </View>

            {/* Custom Input for "Other" */}
            {selectedReason === 'Other' && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Please tell us more
                </Text>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-4 text-slate-900 dark:text-white text-base"
                  placeholder="Share your reason..."
                  placeholderTextColor="#64748b"
                  value={customReason}
                  onChangeText={text => !deleting && setCustomReason(text)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ minHeight: 100 }}
                  editable={!deleting}
                />
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 py-4 rounded-xl bg-slate-200 dark:bg-slate-600"
                onPress={() => {
                  if (deleting) return;
                  setDeleteModalOpen(false);
                  setSelectedReason(null);
                  setCustomReason('');
                }}
                disabled={deleting}
              >
                <Text className="text-center text-slate-700 dark:text-slate-300 font-semibold text-lg">
                  {deleting ? 'Please wait…' : 'Cancel'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-4 rounded-xl ${
                  selectedReason &&
                  (selectedReason !== 'Other' || customReason.trim())
                    ? (deleting ? 'bg-red-600 opacity-70' : 'bg-red-600')
                    : 'bg-slate-400'
                }`}
                onPress={handleDeleteAccount}
                disabled={
                  deleting ||
                  !selectedReason ||
                  (selectedReason === 'Other' && !customReason.trim())
                }
              >
                {deleting ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-center text-white font-semibold text-lg ml-2">
                      Deleting…
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center text-white font-semibold text-lg">
                    Delete Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Tabs */}
      <View className="flex-row mt-4 mx-4 mb-4 bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden">
        <StatusBar backgroundColor={'black'} />
        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeTab === 'favourites' ? 'bg-green-400' : ''}`}
          onPress={() => setActiveTab('favourites')}
        >
          <Text
            className={`${activeTab === 'favourites' ? 'text-white font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
          >
            My Favourites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-3 items-center ${activeTab === 'choices' ? 'bg-green-500' : ''}`}
          onPress={() => setActiveTab('choices')}
        >
          <Text
            className={`${activeTab === 'choices' ? 'text-white font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
          >
            My Civic Events
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View className="flex-1 py-2 ">
        {activeTab === 'favourites' ? (
          <FlatList
            data={favourites || []}
            keyExtractor={(item, index) =>
              item?.id ? item.id.toString() : index.toString()
            }
            renderItem={renderFavouriteCard}
            showsVerticalScrollIndicator={false}
            className="px-4"
            ListEmptyComponent={
              <View className="items-center justify-center py-10">
                <Text className="text-gray-600 text-lg">No Favourites...</Text>
              </View>
            }
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
          <Text className="text-white font-semibold text-lg ml-2">
            My Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
