import React, { useRef, useCallback, useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, Alert } from 'react-native';
import { Heart, MessageCircle, Send } from 'react-native-feather';
import { civicLikeUnlike } from '../../services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FeedItem = ({ 
  post, 
  colorScheme, 
  screenHeight, 
  handleLike, 
  handleComment, 
  handleShare, 
  renderDescription, 
  formatTimestamp 
}) => {
  const IMAGE_PREFIX = 'https://livecdn.dialkaraikudi.com/';

  const lastTapRef = useRef(null);
  const heartScaleAnim = useRef(new Animated.Value(0)).current;
  const heartOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // State for image dimensions and fit checking
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [imageFits, setImageFits] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes ? post.likes.length : 0);
  const [isLiking, setIsLiking] = useState(false);

  // Get current user ID and check if they liked this post
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          const userId = parsedUserData._id || parsedUserData.id || parsedUserData.userId;
          setCurrentUserId(userId);
          
          // Check if current user has liked this post
          if (userId && post.likes && Array.isArray(post.likes)) {
            console.log(`🔍 Checking likes for post ${post._id}:`, post.likes);
            const userLiked = post.likes.some(like => {
              // Handle both like objects and direct user IDs
              if (typeof like === 'object' && like.user) {
                return like.user === userId;
              }
              return like === userId;
            });
            setIsLiked(userLiked);
            console.log(`✅ User ${userId} ${userLiked ? 'has liked' : 'has not liked'} post ${post._id}`);
          } else {
            console.log(`⚠️ No likes array or user ID for post ${post._id}:`, { likes: post.likes, userId });
          }
        }
      } catch (error) {
        console.error('❌ Error getting current user ID:', error);
      }
    };
    
    getCurrentUserId();
  }, [post.likes]);

  // Check if image fits properly when dimensions are loaded
  useEffect(() => {
    if (imageAspectRatio > 0) {
      // Image fits if aspect ratio is reasonable (not too wide or too tall)
      const fits = imageAspectRatio >= 0.5 && imageAspectRatio <= 2.0;
      setImageFits(fits);
    }
  }, [imageAspectRatio]);

  // Get image dimensions to determine if blur is needed
  useEffect(() => {
    if (!post.imageUrl) return;
    
    const uri = `${IMAGE_PREFIX}${post.imageUrl}`;
    Image.getSize(
      uri,
      (width, height) => {
        if (width > 0 && height > 0) {
          const aspectRatio = width / height;
          setImageAspectRatio(aspectRatio);
        }
      },
      () => {
        setImageAspectRatio(1);
      }
    );
  }, [post.imageUrl]);

  // Handle like/unlike with API integration
  const handleLikePress = async () => {
    try {
      // Check if user is authenticated
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Login Required', 'Please login to like posts.');
        return;
      }

      setIsLiking(true);
      console.log('❤️ Like button pressed for post:', post._id, 'Current state:', isLiked);

      // Call the API to toggle like
      const response = await civicLikeUnlike(post._id);
      console.log('✅ Like API response:', response);

      if (response) {
        // Update local state based on current state (toggle)
        const newIsLiked = !isLiked;
        const newLikeCount = newIsLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
        
        setIsLiked(newIsLiked);
        setLikeCount(newLikeCount);
        
        console.log(`✅ Post ${post._id} ${newIsLiked ? 'liked' : 'unliked'}, new count: ${newLikeCount}`);
        
        // Also update the post.likes array to keep it in sync
        if (newIsLiked) {
          // Add current user to likes array
          const updatedLikes = [...(post.likes || []), currentUserId];
          post.likes = updatedLikes;
        } else {
          // Remove current user from likes array
          const updatedLikes = (post.likes || []).filter(like => {
            if (typeof like === 'object' && like.user) {
              return like.user !== currentUserId;
            }
            return like !== currentUserId;
          });
          post.likes = updatedLikes;
        }
      }
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const triggerHeartAnimation = useCallback(() => {
    heartScaleAnim.setValue(0);
    heartOpacityAnim.setValue(1);

    const scaleAnimation = Animated.spring(heartScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    });

    const opacityAnimation = Animated.timing(heartOpacityAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    });

    Animated.parallel([scaleAnimation, opacityAnimation]).start();
  }, [heartScaleAnim, heartOpacityAnim]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {
      triggerHeartAnimation();
      // Double-tap only likes, never unlikes
      if (!isLiked && !isLiking) {
        handleLikePress();
      } else if (isLiked) {
        console.log(`ℹ️ Post ${post._id} is already liked, showing animation only`);
      }
    } else {
      lastTapRef.current = now;
    }
  }, [post._id, isLiked, isLiking, triggerHeartAnimation, handleLikePress]);

  const getPosterName = (post) => {
    if (post.posterType === 'Business') {
      return post.postedBy.businessName || 'Business';
    }
    return post.postedBy.name || 'User';
  };

  return (
    <View className={`mb-4 rounded-lg overflow-hidden ${colorScheme === 'dark' ? 'bg-neutral-800' : 'bg-white'}`}>
      {/* Header */}
      <View className={`flex-row items-center p-3 border-b ${colorScheme === 'dark' ? 'border-neutral-700' : 'border-gray-200'}`}>
        <View className="flex-1">
          <Text className={`font-bold text-sm ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{post.title || 'Untitled Post'}</Text>
          <Text className={`text-xs ${colorScheme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>{getPosterName(post)} • {post.posterType}</Text>
        </View>
      </View>

      {/* Image with double tap handler */}
      {post.imageUrl && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleDoubleTap}
          className="relative flex justify-center items-center overflow-hidden"
        >
          {/* Background image (always visible) */}
          <Image 
            source={{ uri: `${IMAGE_PREFIX}${post.imageUrl}` }} 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
            }}
            blurRadius={20}
            resizeMode="cover"
          />
          
          {/* Conditional blurred background image - only show when image doesn't fit */}
          {!imageFits && imageLoaded && (
            <Image 
              source={{ uri: `${IMAGE_PREFIX}${post.imageUrl}` }} 
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
              }}
              blurRadius={20}
              resizeMode="cover"
            />
          )}
          
          {/* Main image */}
          <Image 
            source={{ uri: `${IMAGE_PREFIX}${post.imageUrl}` }} 
            style={{
              width: '100%',
              aspectRatio: imageAspectRatio,
              minHeight: 180,
              maxHeight: Math.round(screenHeight * 0.75),
              backgroundColor: 'transparent'
            }}
            resizeMode="contain"
            onLoadStart={() => setImageLoaded(false)}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Modern double-tap heart animation */}
          <Animated.View
            className="absolute inset-0 justify-center items-center"
            style={{
              opacity: heartOpacityAnim,
              transform: [{ scale: heartScaleAnim }],
            }}
          >
            <View className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Heart
                fill="red"
                stroke="red"
                width={80}
                height={80}
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Action Buttons */}
      <View className="flex-row justify-between items-center px-3 py-2">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={handleLikePress} 
            disabled={isLiking}
            className="mr-4 p-1"
          >
            <Heart 
              width={28} 
              height={28}
              fill={isLiked ? "#ff3040" : "none"}
              stroke={isLiked ? "#ff3040" : (colorScheme === 'dark' ? '#9CA3AF' : '#000')}
              opacity={isLiking ? 0.5 : 1}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleComment(post._id)} className="mr-4 p-1">
            <MessageCircle width={26} height={26} stroke={colorScheme === 'dark' ? '#9CA3AF' : '#000'} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => handleShare(post._id)} className="p-1">
          <Send 
            width={26} 
            height={26}
            stroke={colorScheme === 'dark' ? '#9CA3AF' : '#000'}
          />
        </TouchableOpacity>
      </View>

      {/* Likes Count */}
      {likeCount > 0 && (
        <Text className={`font-bold text-sm px-3 pb-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </Text>
      )}

      {/* Description */}
      <View className="px-3 pb-1">
        {renderDescription(post.description, post._id)}
      </View>

      {/* Comments */}
      {post.commentCount > 0 && (
        <TouchableOpacity onPress={() => handleComment(post._id)}>
          <Text className={`text-sm px-3 pb-1 ${colorScheme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>View all {post.commentCount} comments</Text>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <Text className={`text-xs px-3 pb-3 ${colorScheme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>{formatTimestamp(post.createdAt)}</Text>
    </View>
  );
};

export default FeedItem;