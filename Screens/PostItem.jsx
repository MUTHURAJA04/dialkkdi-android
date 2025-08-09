import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Share,
  Dimensions
} from 'react-native';
import { Heart, Send } from 'react-native-feather';
import { DialogramLike } from '../services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CDN_PREFIX = 'https://livecdn.dialkaraikudi.com/';

const PostItem = ({ item, colorScheme, onUpdateLike }) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const screenHeight = Dimensions.get('window').height;
  const [currentUserId, setCurrentUserId] = useState(null);
  const lastTapRef = useRef(null);
  const heartScaleAnim = useRef(new Animated.Value(0)).current;
  const heartOpacityAnim = useRef(new Animated.Value(0)).current;

  // Defensive check - if item is undefined, don't render
  if (!item || !item._id) {
    console.log('[PostItem] ⚠️ Item is undefined or missing _id, skipping render');
    return null;
  }

  // Safe access to item properties
  const postId = item._id || '';
  const businessName = item.business?.businessName || 'Unknown Business';
  const imageUrl = item.imageUrl || '';
  // Measure remote image to maintain correct aspect ratio
  useEffect(() => {
    let isMounted = true;
    const uri = `${CDN_PREFIX}${imageUrl}`;
    if (!imageUrl) return;
    Image.getSize(
      uri,
      (width, height) => {
        if (!isMounted) return;
        if (width > 0 && height > 0) {
          setImageAspectRatio(width / height);
        } else {
          setImageAspectRatio(1);
        }
      },
      () => {
        if (!isMounted) return;
        setImageAspectRatio(1);
      }
    );
    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  const description = item.description || '';
  const createdAt = item.createdAt || new Date();

  // Get current user ID for like state detection
  const getCurrentUserId = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        const userId = parsedUserData._id || parsedUserData.id || parsedUserData.userId;
        setCurrentUserId(userId);
        return userId;
      }
      return null;
    } catch (error) {
      console.error('[PostItem] ❌ Error getting current user ID:', error);
      return null;
    }
  }, []);

  // Determine if current user has liked this post
  const isLikedByCurrentUser = useCallback(() => {
    console.log(`[PostItem] 🔍 Checking like state for post ${postId}:`, {
      currentUserId,
      likesArray: item.likes,
      isLikedProperty: item.isLiked,
      likesCount: item.likesCount,
      currentUserIdType: typeof currentUserId,
      likesArrayType: Array.isArray(item.likes) ? 'array' : typeof item.likes
    });

    // First priority: Check if the current user's ID is in the likes array
    if (item.likes && Array.isArray(item.likes) && currentUserId) {
      // Convert both to strings for comparison to handle different ID formats
      const currentUserIdStr = String(currentUserId);

      // Log the actual contents of the likes array
      console.log(`[PostItem] 🔍 Likes array contents:`, {
        likesArray: item.likes,
        likesArrayTypes: item.likes.map(id => typeof id),
        currentUserIdStr,
        currentUserIdType: typeof currentUserId
      });

      const userLiked = item.likes.some(likeId => {
        const likeIdStr = String(likeId);
        const matches = likeIdStr === currentUserIdStr;
        console.log(`[PostItem] 🔍 Comparing: "${likeIdStr}" === "${currentUserIdStr}" = ${matches}`);
        return matches;
      });

      console.log(`[PostItem] ✅ User like check from likes array:`, {
        currentUserId: currentUserIdStr,
        userLiked,
        likesArray: item.likes.map(id => String(id)),
        comparison: item.likes.map(id => `${String(id)} === ${currentUserIdStr} = ${String(id) === currentUserIdStr}`)
      });
      return userLiked;
    }

    // Second priority: Check if there are any likes and current user might be one of them
    if (item.likesCount && item.likesCount > 0 && currentUserId) {
      console.log(`[PostItem] ℹ️ Post has ${item.likesCount} likes, checking if current user is one of them`);
      // If we have likes but no likes array, we'll use the isLiked property
    }

    // Third priority: Use isLiked property if available
    if (item.isLiked !== undefined) {
      console.log(`[PostItem] ℹ️ Using isLiked property:`, item.isLiked);
      return item.isLiked === true;
    }

    // Fourth priority: If there are likes but no specific user info, assume current user hasn't liked
    if (item.likesCount && item.likesCount > 0) {
      console.log(`[PostItem] ℹ️ Post has ${item.likesCount} likes but no user-specific info, assuming current user hasn't liked`);
      return false;
    }

    console.log(`[PostItem] ❌ No like state found for current user`);
    return false;
  }, [item.likes, item.isLiked, item.likesCount, currentUserId, postId]);

  // Get final like state with stored state priority
  const getFinalLikeState = useCallback(async () => {
    try {
      // Check for stored like state first
      const likeStates = await AsyncStorage.getItem('userLikeStates');
      const parsedStates = likeStates ? JSON.parse(likeStates) : {};
      const storedState = parsedStates[postId];

      if (storedState) {
        console.log(`[PostItem] 📖 Using stored like state for post ${postId}:`, storedState);
        return {
          isLiked: storedState.isLiked,
          likesCount: storedState.likesCount
        };
      }

      // Fallback to API data
      console.log(`[PostItem] ℹ️ No stored state, using API data for post ${postId}`);
      return {
        isLiked: isLikedByCurrentUser(),
        likesCount: item.likesCount || (item.likes && Array.isArray(item.likes) ? item.likes.length : 0) || 0
      };
    } catch (error) {
      console.error(`[PostItem] ❌ Error getting final like state:`, error);
      return {
        isLiked: isLikedByCurrentUser(),
        likesCount: item.likesCount || (item.likes && Array.isArray(item.likes) ? item.likes.length : 0) || 0
      };
    }
  }, [postId, isLikedByCurrentUser, item.likes, item.likesCount]);

  // Get current like state with better persistence
  const [finalLikeState, setFinalLikeState] = useState({
    isLiked: false,
    likesCount: 0
  });

  // Update final like state when component mounts or dependencies change
  React.useEffect(() => {
    const updateFinalLikeState = async () => {
      const state = await getFinalLikeState();
      setFinalLikeState(state);
      console.log(`[PostItem] 🔄 Updated final like state for post ${postId}:`, state);
    };

    updateFinalLikeState();
  }, [getFinalLikeState, postId]);

  const isLiked = finalLikeState.isLiked;
  const likesCount = finalLikeState.likesCount;

  // Load current user ID on component mount and check for persistent like state
  React.useEffect(() => {
    const loadUserAndCheckLikes = async () => {
      const userId = await getCurrentUserId();
      if (userId) {
        console.log(`[PostItem] 👤 Current user loaded: ${userId}`);

        // Check for stored like state for this post
        try {
          const likeStates = await AsyncStorage.getItem('userLikeStates');
          const parsedStates = likeStates ? JSON.parse(likeStates) : {};
          const storedState = parsedStates[postId];

          if (storedState) {
            console.log(`[PostItem] 📖 Found stored like state for post ${postId}:`, storedState);
            // Force re-render with stored state
            console.log(`[PostItem] 🔄 Stored state indicates user ${storedState.isLiked ? 'liked' : 'did not like'} this post`);
          }
        } catch (error) {
          console.error(`[PostItem] ❌ Error checking stored like state:`, error);
        }

        // Force re-evaluation of like state after user ID is loaded
        console.log(`[PostItem] 🔄 Re-evaluating like state for user: ${userId}`);
      }
    };
    loadUserAndCheckLikes();
  }, [getCurrentUserId, postId]);

  console.log(`[PostItem] 📊 Post ${postId} final state:`, {
    isLiked,
    likesCount,
    currentUserId,
    likesArray: item.likes,
    originalIsLiked: item.isLiked,
    originalLikesCount: item.likesCount,
    heartWillFill: isLiked ? 'YES (current user liked)' : 'NO (current user did not like)',
    persistenceCheck: `User ID: ${currentUserId}, Likes Array: ${item.likes?.length || 0} items, IsLiked Property: ${item.isLiked}`
  });

  // Check if user is authenticated
  const checkAuthentication = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const userToken = await AsyncStorage.getItem('userToken');

      if (!userData || !userToken) {
        console.log('[PostItem] ⚠️ User not authenticated');
        return false;
      }

      const parsedUserData = JSON.parse(userData);
      const userId = parsedUserData._id || parsedUserData.id || parsedUserData.userId;

      if (!userId) {
        console.log('[PostItem] ⚠️ No user ID found in user data');
        return false;
      }

      console.log('[PostItem] ✅ User authenticated:', userId);
      return true;
    } catch (error) {
      console.error('[PostItem] ❌ Error checking authentication:', error);
      return false;
    }
  }, []);

  // Modern double-tap heart animation
  const triggerHeartAnimation = useCallback(() => {
    // Reset animations
    heartScaleAnim.setValue(0);
    heartOpacityAnim.setValue(1);

    // Create scale animation
    const scaleAnimation = Animated.spring(heartScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    });

    // Create opacity animation
    const opacityAnimation = Animated.timing(heartOpacityAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    });

    // Run animations
    Animated.parallel([scaleAnimation, opacityAnimation]).start();
  }, [heartScaleAnim, heartOpacityAnim]);

  // Handle double tap like
  const handleDoubleTap = useCallback(async () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;

    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {
      console.log(`[PostItem] ❤️ Double tapped post: ${postId}, current like state:`, isLiked);

      // Always show heart animation on double-tap
      triggerHeartAnimation();

      // Check authentication first
      const isAuthenticated = await checkAuthentication();
      if (!isAuthenticated) {
        Alert.alert('Login Required', 'Please login to like posts.');
        return;
      }

      // Double-tap only likes, never unlikes
      if (!isLiked) {
        try {
          console.log(`[PostItem] 📡 Calling DialogramLike API for post: ${postId}`);
          const response = await DialogramLike(postId);
          console.log(`[PostItem] ✅ Double-tap like API response:`, response);

          // Update the like state based on API response message
          let newLikesCount;

          if (response.message === 'Liked') {
            newLikesCount = likesCount + 1;
            console.log(`[PostItem] 🔄 Double-tap post was liked:`, { newLikesCount });
          } else {
            // Fallback: increment like count
            newLikesCount = likesCount + 1;
            console.log(`[PostItem] 🔄 Double-tap using fallback:`, { newLikesCount });
          }

          console.log(`[PostItem] 🔄 Double-tap liking post:`, {
            oldState: isLiked,
            newState: true,
            oldCount: likesCount,
            newCount: newLikesCount,
            apiResponse: response
          });

          onUpdateLike(postId, true, newLikesCount);

        } catch (error) {
          console.error(`[PostItem] ❌ Double tap like failed for post ${postId}:`, error);
          if (error.message.includes('authenticated') || error.message.includes('login')) {
            Alert.alert('Login Required', 'Please login to like posts.');
          } else {
            Alert.alert('Error', 'Failed to like post. Please try again.');
          }
        }
      } else {
        console.log(`[PostItem] ℹ️ Post ${postId} is already liked by current user, showing animation only`);
      }
    } else {
      lastTapRef.current = now;
    }
  }, [postId, isLiked, likesCount, onUpdateLike, checkAuthentication, triggerHeartAnimation]);

  // Handle manual like/unlike via heart button
  const handleHeartPress = useCallback(async () => {
    console.log(`[PostItem] 💖 Heart button pressed for post: ${postId}, current like state:`, isLiked);

    // Check authentication first
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to like posts.');
      return;
    }

    try {
      console.log(`[PostItem] 📡 Calling DialogramLike API for post: ${postId}`);
      const response = await DialogramLike(postId);
      console.log(`[PostItem] ✅ Heart button like API response:`, response);

      // Determine new like state based on API response message
      let newLikeState;
      let newLikesCount;

      if (response.message === 'Liked') {
        newLikeState = true;
        newLikesCount = likesCount + 1;
        console.log(`[PostItem] 🔄 Post was liked:`, { newLikeState, newLikesCount });
      } else if (response.message === 'Unliked') {
        newLikeState = false;
        newLikesCount = Math.max(0, likesCount - 1);
        console.log(`[PostItem] 🔄 Post was unliked:`, { newLikeState, newLikesCount });
      } else {
        // Fallback: toggle current state
        newLikeState = !isLiked;
        newLikesCount = newLikeState ? likesCount + 1 : Math.max(0, likesCount - 1);
        console.log(`[PostItem] 🔄 Using fallback toggle:`, { oldState: isLiked, newState: newLikeState, newLikesCount });
      }

      console.log(`[PostItem] 🔄 Heart button updating like state:`, {
        oldState: isLiked,
        newState: newLikeState,
        oldCount: likesCount,
        newCount: newLikesCount,
        apiResponse: response,
        willPersist: newLikeState ? 'YES - Heart will stay filled' : 'NO - Heart will be transparent'
      });

      onUpdateLike(postId, newLikeState, newLikesCount);

      // After updating, try to get fresh like information from server
      setTimeout(async () => {
        try {
          const userToken = await AsyncStorage.getItem('userToken');
          if (userToken) {
            const likeInfoResponse = await fetch(`https://dev-api.dialkaraikudi.com/feeds/${postId}/likes`, {
              headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
              }
            });

            if (likeInfoResponse.ok) {
              const likeInfo = await likeInfoResponse.json();
              console.log(`[PostItem] 🔄 Fresh like info for post ${postId}:`, likeInfo);
              // Update the post with fresh like information
              onUpdateLike(postId, likeInfo.isLiked, likeInfo.likesCount);
            }
          }
        } catch (error) {
          console.error(`[PostItem] ❌ Error getting fresh like info:`, error);
        }
      }, 1000); // Wait 1 second after like action

    } catch (error) {
      console.error(`[PostItem] ❌ Heart button like failed for post ${postId}:`, error);
      if (error.message.includes('authenticated') || error.message.includes('login')) {
        Alert.alert('Login Required', 'Please login to like posts.');
      } else {
        Alert.alert('Error', 'Failed to update like. Please try again.');
      }
    }
  }, [postId, isLiked, likesCount, onUpdateLike, checkAuthentication]);

  const handleImageLoad = useCallback(() => {
    console.log(`[PostItem] 🖼️ Image loaded for post: ${postId}`);
    setImageLoading(false);
  }, [postId]);

  const handleImageLoadStart = useCallback(() => {
    console.log(`[PostItem] 🔄 Image loading started for post: ${postId}`);
    setImageLoading(true);
  }, [postId]);

  const formatTime = useCallback((timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('[PostItem] ❌ Error formatting time:', error);
      return 'Unknown time';
    }
  }, []);

  // Handle share action using native share menu
  const handleSharePress = useCallback(async () => {
    try {
      const shareUrl = `https://dev.dialkaraikudi.com/feed/${postId}`;
      const content = {
        title: `${businessName} on Dialogram`,
        message: `${description ? description + '\n' : ''}${shareUrl}`,
        url: shareUrl,
        subject: businessName,
      };
      const result = await Share.share(content);
      if (result.action === Share.sharedAction) {
        console.log(`[PostItem] ✅ Shared post ${postId}`, result.activityType);
      } else if (result.action === Share.dismissedAction) {
        console.log(`[PostItem] ❎ Share dismissed for post ${postId}`);
      }
    } catch (error) {
      console.error(`[PostItem] ❌ Share failed for post ${postId}:`, error);
      Alert.alert('Error', 'Failed to open share options.');
    }
  }, [businessName, description, imageUrl, postId]);

  return (
    <View className={`rounded-xl mb-5 overflow-hidden shadow-md  ${colorScheme === 'dark' ? 'bg-neutral-900' : 'bg-white'
      }`}>
      {/* Header with business name */}
      <View className="p-3">
        <Text className={`font-bold text-sm ${colorScheme === 'dark' ? 'text-white' : 'text-black'
          }`}>
          {businessName}
        </Text>
      </View>

      {/* Post Image with double tap handler */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDoubleTap}
        className="relative flex justify-center items-center"
      >
        <View className='absolute inset-0 w-full h-full bg-white' ></View>
        <Image
          source={{ uri: `${CDN_PREFIX}${imageUrl}` }}
          style={{
            width: '100%',
            aspectRatio: imageAspectRatio || 1,
            // Keep very short panoramas visible and very tall portraits constrained
            minHeight: 180,
            maxHeight: Math.round(screenHeight * 0.75),
            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
          }}
          resizeMode="contain"
          onLoadStart={handleImageLoadStart}
          onLoad={handleImageLoad}
        />
     
    

        {/* Image loading indicator */}
        {imageLoading && (
          <View className="absolute inset-0 justify-center items-center bg-black/20">
            <ActivityIndicator
              size="large"
              color={colorScheme === 'dark' ? 'white' : '#007AFF'}
            />
          </View>
        )}

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

      {/* Actions */}
      <View className="flex-row p-3">
        <TouchableOpacity
          className="mr-4"
          onPress={handleHeartPress}
        >
          <Heart
            fill={isLiked ? 'red' : 'transparent'}
            stroke={isLiked ? 'red' : (colorScheme === 'dark' ? 'white' : 'black')}
            width={26}
            height={26}
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="ml-auto"
          onPress={handleSharePress}
        >
          <Send
            stroke={colorScheme === 'dark' ? 'white' : 'black'}
            width={26}
            height={26}
          />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <Text className={`px-3 font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'
        }`}>
        {likesCount} likes
      </Text>

      {/* Description */}
      <Text className={`px-3 mt-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'
        }`}>
        <Text className="font-bold">{businessName} </Text>
        {description}
      </Text>

      {/* Time */}
      <Text className={`px-3 mt-1 mb-3 text-xs ${colorScheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
        }`}>
        {formatTime(createdAt)}
      </Text>
    </View>
  );
};

export default PostItem;