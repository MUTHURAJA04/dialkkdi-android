import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Star, MessageSquare } from 'react-native-feather';
import Input from '../components/CustomInput';

export const ReviewsSection = ({ reviews = [], overallRating = 0, onReviewSubmit }) => {
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    name: ''
  });
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // 🧠 Load current user from storage
  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      }
    };
    loadUser();
  }, []);

  // 🔍 Check if this user already reviewed
  useEffect(() => {
    if (currentUserId && reviews.length > 0) {
      const existingReview = reviews.find(r => r.user?._id === currentUserId || r.user?.id === currentUserId);
      if (existingReview) {
        setNewReview({
          rating: existingReview.rating || 0,
          comment: existingReview.comment || '',
          name: existingReview.user?.name || ''
        });
        setIsWritingReview(true); // auto open in edit mode
      }
    }
  }, [currentUserId, reviews]);

  const handleStarPress = (rating) => {
    setNewReview({ ...newReview, rating });
  };

  const handleSubmit = async () => {
    if (!newReview.rating) {
      Alert.alert('Please select a rating');
      return;
    }
    if (!newReview.comment.trim()) {
      Alert.alert('Please write a review');
      return;
    }

    const existingReview = reviews.find(
      r => String(r.user?._id) === String(currentUserId) ||
        String(r.user?.id) === String(currentUserId)
    );

    console.log(existingReview, "existingReview");


    // Call API with `isOldUser` flag
    await onReviewSubmit({
      rating: newReview.rating,
      comment: newReview.comment,
      name: newReview.name || 'Anonymous',
      isOldUser: !!existingReview,
      reviewId: existingReview?._id
    });

    setIsWritingReview(false);
  };


  return (
    <ScrollView className="px-4 py-1">
      {/* Overall Rating */}
      <View className="mb-6">
        <Text className="text-lg font-bold mb-1">Overall Rating</Text>
        <View className="flex-row items-center">
          <Text className="text-2xl font-bold mr-2">{overallRating.toFixed(1)}</Text>
          <Text className="text-gray-500">out of 5</Text>
        </View>
        <View className="flex-row mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              width={20}
              height={20}
              fill={star <= Math.round(overallRating) ? '#f59e0b' : 'transparent'}
              stroke={star <= Math.round(overallRating) ? '#f59e0b' : '#d1d5db'}
              className="mr-1"
            />
          ))}
        </View>
      </View>

      {/* Reviews List */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold">Reviews</Text>
        <TouchableOpacity
          onPress={() => setIsWritingReview(!isWritingReview)}
          className="flex-row items-center bg-blue-500 px-3 py-1 rounded-full"
        >
          <MessageSquare width={16} height={16} color="white" />
          <Text className="text-white ml-1 text-sm">{newReview.rating ? 'Edit Review' : 'Write Review'}</Text>
        </TouchableOpacity>
      </View>

      {/* Write/Edit Review Form */}
      {isWritingReview && (
        <View className="bg-white p-4 rounded-lg mb-4 shadow-sm">
          <Text className="font-medium mb-2">Your Rating</Text>
          <View className="flex-row mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => handleStarPress(star)}
                activeOpacity={0.7}
              >
                <Star
                  width={24}
                  height={24}
                  fill={star <= newReview.rating ? '#f59e0b' : 'transparent'}
                  stroke={star <= newReview.rating ? '#f59e0b' : '#d1d5db'}
                  className="mr-1"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Name Input */}
          <Input
            placeholder="Your name (optional)"
            placeholderTextColor="#aaa"
            value={newReview.name}
            onChangeText={(text) => setNewReview({ ...newReview, name: text })}
          />

          {/* Review Comment Input */}
          <Input
            placeholder="Share your experience..."
            placeholderTextColor="#aaa"
            value={newReview.comment}
            onChangeText={(text) => setNewReview({ ...newReview, comment: text })}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity
              onPress={() => setIsWritingReview(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="ml-2 px-4 py-2 bg-blue-500 rounded-lg"
            >
              <Text className="text-white">{newReview.rating ? 'Update' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reviews Display */}
      {reviews.length > 0 ? (
        <ScrollView className="min-h-64">
          {reviews.map((review, index) => (
            <View key={index} className="mb-2 pb-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold">{review.user?.name || 'Customer'}</Text>
                <View className="flex-row items-center">
                  <Text className="mr-1">{review.rating.toFixed(1)}</Text>
                  <Star width={16} height={16} fill="#f59e0b" stroke="#f59e0b" />
                </View>
              </View>
              <Text className="text-gray-700">{review.comment}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text className="text-gray-500">No reviews yet</Text>
      )}
    </ScrollView>
  );
};
