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
  ActivityIndicator,
  StatusBar,
  Animated, 
} from 'react-native';
import { Star, MapPin, Phone, MessageCircle } from 'react-native-feather';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getBusinessById, review } from '../services/apiClient';
import { ReviewsSection } from './ReviewsSection';

const IMAGE_PREFIX = 'https://livecdn.dialkaraikudi.com/';
const { width: screenWidth } = Dimensions.get('window');

const BusinessDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { business } = route.params;
  const [businessData, setBusinessData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    const fetchBusinessDetail = async () => {
      if (!business?._id) {
        setError('No business ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getBusinessById(business._id);
        if (response?.success) {
          setBusinessData({
            ...response.data.business,
            reviews: response.data.reviews || []
          });
        } else {
          setError('Failed to fetch business details');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessDetail();
  }, [business?._id]);

  const getFullImageUrl = url => url?.startsWith('http') ? url : `${IMAGE_PREFIX}${url}`;

  // Timing functions remain the same
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayIndex = new Date().getDay();
  const today = days[todayIndex];
  const todayTiming = businessData?.businessTimings?.[today] || {};

  const formatTime = time => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getTodayTiming = () => {
    if (!todayTiming.isOpen) return 'Closed';
    if (todayTiming.openTime === '00:00' && todayTiming.closeTime === '00:00') {
      return 'Open 24 Hours';
    }
    return `${formatTime(todayTiming.openTime)} - ${formatTime(todayTiming.closeTime)}`;
  };

  const businessHours = days.map(day => {
    const timing = businessData?.businessTimings?.[day] || {};
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
    return {
      day: dayName,
      isOpen: timing.isOpen,
      timing: timing.isOpen 
        ? timing.openTime === '00:00' && timing.closeTime === '00:00' 
          ? '12:00 AM - 12:00 AM' 
          : `${formatTime(timing.openTime)} - ${formatTime(timing.closeTime)}`
        : 'Closed'
    };
  });

  const openWhatsApp = () => {
    const phoneNumber = businessData?.contactDetails?.phone?.replace(/\D/g, '');
    if (!phoneNumber) {
      alert('Phone number not available');
      return;
    }
    Linking.openURL(`https://wa.me/${phoneNumber}`).catch(() => {
      alert('WhatsApp is not installed');
    });
  };

  const openImageModal = index => setSelectedImageIndex(index);
  const closeImageModal = () => setSelectedImageIndex(null);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-lg mb-4">Error: {error}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!businessData) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">No business data available</Text>
      </View>
    );
  }

const handleReviewSubmit = async (newReview) => {
  try {
    // 🔁 API call: only pass rating and comment
    const response = await review(businessData._id, {
      rating: newReview.rating,
      comment: newReview.comment,
    });

    console.log('✅ Review submitted to server:', response);

    // 🔄 Use server response or fallback to newReview
    const savedReview = {
      user: { name: newReview.name || 'You' }, // fallback if API doesn't return user name
      rating: response.rating || newReview.rating,
      comment: response.comment || newReview.comment,
      createdAt: response.createdAt || new Date().toISOString(),
    };

    // 🧠 Update business state with new review
    setBusinessData(prev => ({
      ...prev,
      reviews: [...prev.reviews, savedReview],
      reviewCount: prev.reviewCount + 1,
      ratings: calculateNewAverage(prev.ratings, prev.reviewCount, newReview.rating),
    }));
  } catch (error) {
    console.error('❌ Failed to submit review:', error);
    // Optionally show a toast or alert
    Alert.alert('Failed to submit review', error.message || 'Please try again later.');
  }
};


// Helper function to calculate new average rating
const calculateNewAverage = (currentAvg, currentCount, newRating) => {
  return ((currentAvg * currentCount) + newRating) / (currentCount + 1);
};
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      
        {/* Header Image */}
        <View className="relative">
          <Image
            source={{ uri: getFullImageUrl(businessData.photos?.[0]) }}
            className="w-full h-64"
            resizeMode="cover"
          />
          
          
        </View>

        {/* Content */}
        <View className="px-4 pt-4 pb-8">
          {/* Business Info */}
          <View className="mb-4">
            <Text className="text-2xl font-bold text-gray-900">
              {businessData.businessName}
            </Text>
            <Text className="text-sm text-gray-500 mb-3">
              Owned by {businessData.ownerName}
            </Text>

            <View className="flex-row items-center mb-3">
              <View className="flex-row items-center bg-yellow-100 px-2 py-1 rounded-full mr-2">
                <Star color="#facc15" width={16} height={16} />
                <Text className="ml-1 text-yellow-700 font-medium text-sm">
                  {Math.round(businessData.ratings) ?? 'N/A'} ({businessData.reviewCount} reviews)
                </Text>
              </View>
              
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
              onPress={() => Linking.openURL(`tel:${businessData.contactDetails?.phone}`)}
              className="flex-1 bg-blue-50 p-3 rounded-lg flex-row items-center justify-center"
              disabled={!businessData.contactDetails?.phone}
            >
              <Phone width={18} height={18} color="#3b82f6" />
              <Text className="text-blue-600 ml-2 font-medium">Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={openWhatsApp}
              className="flex-1 bg-green-50 p-3 rounded-lg flex-row items-center justify-center"
              disabled={!businessData.contactDetails?.phone}
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
                    {businessData.address?.formattedAddress}
                  </Text>
                  {businessData.address?.pincode && (
                    <Text className="ml-2 text-sm text-gray-500 mt-1">
                      Pincode: {businessData.address.pincode}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Business Hours */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">Business Hours</Text>
            <View className="bg-white p-4 rounded-lg">
              {businessHours.map(({ day, isOpen, timing }) => (
                <View
                  key={day}
                  className="flex-row justify-between py-2 border-b border-gray-100 last:border-0"
                >
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
          {businessData.description && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-2">About</Text>
              <View className="bg-white p-4 rounded-lg">
                <Text className="text-gray-700 leading-6">
                  {businessData.description}
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
              {(businessData.categories || []).map(cat => (
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
          {businessData.photos?.length > 1 && (
            <View className="mb-8">
              <Text className="text-lg font-bold text-gray-900 mb-2">Gallery</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                className="py-1"
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {businessData.photos.slice(1).map((img, idx) => (
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

          {/* Reviews Section */}
      <ReviewsSection 
  reviews={businessData.reviews || []} 
  overallRating={businessData.ratings || 0} 
  onReviewSubmit={handleReviewSubmit}
/>
        </View>
      </ScrollView>

      {/* Image Gallery Modal */}
      <Modal
        visible={selectedImageIndex !== null}
        transparent={true}
        onRequestClose={closeImageModal}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#000" />
        <View className="flex-1 bg-black/90 justify-center">
          <Animated.FlatList
            ref={galleryRef}
            data={businessData.photos.slice(1)}
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
            onMomentumScrollEnd={e => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setSelectedImageIndex(newIndex);
            }}
          />

         

          <View className="absolute bottom-20 left-0 right-0 flex-row justify-center">
            {businessData.photos.slice(1).map((_, idx) => (
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