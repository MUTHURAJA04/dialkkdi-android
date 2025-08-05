import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  Dimensions,
  FlatList,
  Animated,
  StatusBar
} from 'react-native';
import { Star, MapPin, ArrowLeft, Phone, MessageCircle, X } from 'react-native-feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getBusinessById } from '../services/apiClient';


const IMAGE_PREFIX = 'https://livecdn.dialkaraikudi.com/';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BusinessDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { business } = route.params;
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(false);
console.log("firstID", business._id)


  useEffect(() => {
    const fetchBusinessDetail = async () => {
      if (!business?._id) {
        console.warn('⚠️ No business ID found in route params');
        return;
      }

      try {
        setLoading(true);
        const data = await getBusinessById(business._id);
        console.log("✅ Business fetched:", data);
        setBusinessData(data);
      } catch (error) {
        console.error("❌ Failed to fetch business:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetail();
  }, [business?._id]);


  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const galleryRef = useRef(null);

  const getFullImageUrl = (url) => url?.startsWith('http') ? url : `${IMAGE_PREFIX}${url}`;

  // Get current day and timing
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayIndex = new Date().getDay();
  const today = days[todayIndex];
  const todayTiming = business.businessTimings?.[today] || {};

  // Format time to AM/PM
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get today's timing display
  const getTodayTiming = () => {
    if (!todayTiming.isOpen) return 'Closed';
    if (todayTiming.openTime === '00:00' && todayTiming.closeTime === '00:00') {
      return 'Open 24 Hours';
    }
    return `${formatTime(todayTiming.openTime)} - ${formatTime(todayTiming.closeTime)}`;
  };

  // Format all business hours
  const businessHours = days.map(day => {
    const timing = business.businessTimings?.[day] || {};
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
    
    return {
      day: dayName,
      isOpen: timing.isOpen,
      timing: timing.isOpen 
        ? (timing.openTime === '00:00' && timing.closeTime === '00:00' 
          ? '12:00 AM - 12:00 AM' 
          : `${formatTime(timing.openTime)} - ${formatTime(timing.closeTime)}`)
        : 'Closed'
    };
  });

  const openWhatsApp = () => {
    const phoneNumber = business.contactDetails.phone.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/${phoneNumber}`).catch(() => {
      alert('WhatsApp is not installed');
    });
  };

  const openImageModal = (index) => setSelectedImageIndex(index);
  const closeImageModal = () => setSelectedImageIndex(null);

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="relative">
          <Image
            source={{ uri: getFullImageUrl(business.photos?.[0]) }}
            className="w-full h-64"
            resizeMode="cover"
          />
          
          
          {/* Logo */}
          {business.logoUrl && (
            <View className="mx-4 -mt-12">
              <Image
                source={{ uri: business.logoUrl }}
                className="w-24 h-24 rounded-full border-4 border-white bg-white"
                resizeMode="contain"
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View className="px-4 pt-4 pb-8">
          {/* Business Info */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-900">{business.businessName}</Text>
            <Text className="text-sm text-gray-500 mb-3">Owned by {business.ownerName}</Text>
            
            <View className="flex-row items-center mb-3">
              <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-full mr-2">
                <Star color="#facc15" width={16} height={16} />
                <Text className="ml-1 text-yellow-700 font-medium text-sm">
                  {business.ratings ?? 'N/A'} ({business.reviewCount} reviews)
                </Text>
              </View>
              
              {/* Today's Timing */}
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-blue-700 text-xs font-medium">
                  Today: {getTodayTiming()}
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Buttons */}
          <View className="flex-row mb-6 space-x-3">
            <TouchableOpacity 
              onPress={() => Linking.openURL(`tel:${business.contactDetails.phone}`)}
              className="flex-1 bg-blue-50 p-3 rounded-lg flex-row items-center justify-center"
            >
              <Phone width={18} height={18} color="#3b82f6" />
              <Text className="text-blue-600 ml-2 font-medium">Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={openWhatsApp}
              className="flex-1 bg-green-50 p-3 rounded-lg flex-row items-center justify-center"
            >
              <MessageCircle width={18} height={18} color="#25D366" />
              <Text className="text-green-600 ml-2 font-medium">WhatsApp</Text>
            </TouchableOpacity>
          </View>

    

          {/* Address */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">Address</Text>
            <View className="bg-white p-4 rounded-lg">
              <View className="flex-row">
                <MapPin color="#6b7280" width={18} height={18} className="mt-0.5 mr-2" />
                <View className="flex-1">
                  <Text className="ml-2 text-base text-gray-800">
                    {business.address?.formattedAddress}
                  </Text>
                </View>
              </View>
            </View>
          </View>



          {/* Business Hours - Clean Design */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">Business Hours</Text>
            <View className="bg-white p-4 rounded-lg">
              {businessHours.map(({ day, isOpen, timing }) => (
                <View key={day} className="flex-row justify-between py-2 border-b border-gray-100 last:border-0">
                  <Text className="text-gray-800 font-medium">{day}</Text>
                  <View className="items-end">
                    <Text className="text-gray-600">{timing}</Text>
                    <Text className={`text-xs ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          {business.description && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-2">About</Text>
              <View className="bg-white p-4 rounded-lg">
                <Text className="text-gray-700 leading-6">
                  {business.description}
                </Text>
              </View>
            </View>
          )}
      {/* Categories */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              className="py-1"
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {(business.categories || []).map((cat) => (
                <View
                  key={cat._id}
                  className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full mr-3"
                >
                  {cat.iconUrl && (
                    <Image
                      source={{ uri: cat.iconUrl }}
                      className="w-5 h-5 mr-2"
                      resizeMode="contain"
                    />
                  )}
                  <Text className="text-sm text-gray-700">{cat.displayName}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
          {/* Gallery */}
          {business.photos?.length > 1 && (
            <View className="mb-8">
              <Text className="text-lg font-bold text-gray-900 mb-2">Gallery</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                className="py-1"
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {business.photos.slice(1).map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => openImageModal(idx)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: getFullImageUrl(img) }}
                      className="w-48 h-32 rounded-lg mr-3"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Gallery Modal - Android Style */}
      <Modal
        visible={selectedImageIndex !== null}
        transparent={true}
        onRequestClose={closeImageModal}
      >
          <StatusBar barStyle="dark-content" backgroundColor="#000" />
        <View className="flex-1 bg-black/90 justify-center">
          <Animated.FlatList
            ref={galleryRef}
            data={business.photos.slice(1)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex}
            renderItem={({ item }) => (
              <View className="w-screen h-96 justify-center items-center">
                <Image
                  source={{ uri: getFullImageUrl(item) }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setSelectedImageIndex(newIndex);
            }}
          />

          {/* Android-style bottom center close button */}
          <TouchableOpacity 
            onPress={closeImageModal}
            className="absolute bottom-10 left-0 right-0 mx-auto bg-white/20 p-3 rounded-full w-32 items-center"
          >
            <Text className="text-white font-medium">Close</Text>
          </TouchableOpacity>

          {/* Pagination */}
          <View className="absolute bottom-20 left-0 right-0 flex-row justify-center">
            {business.photos.slice(1).map((_, idx) => (
              <View
                key={idx}
                className={`w-2 h-2 rounded-full mx-1 ${idx === selectedImageIndex ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BusinessDetailScreen;