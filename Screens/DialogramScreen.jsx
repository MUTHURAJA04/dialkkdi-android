import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Alert,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StatusBar,
  Image
} from 'react-native';
import { Dialogram } from '../services/apiClient';
import PostItem from './PostItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const DialogramScreen = () => {
  const colorScheme = useColorScheme();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Set status bar theme
  useEffect(() => {
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(colorScheme === 'dark' ? '#000000' : '#ffffff');
  }, [colorScheme]);

  // Store like state locally for persistence
  const storeLikeState = useCallback(async (postId, isLiked, likesCount) => {
    try {
      const likeStates = await AsyncStorage.getItem('userLikeStates');
      const parsedStates = likeStates ? JSON.parse(likeStates) : {};

      parsedStates[postId] = {
        isLiked,
        likesCount,
        timestamp: Date.now()
      };

      await AsyncStorage.setItem('userLikeStates', JSON.stringify(parsedStates));
      console.log(`[DialogramScreen] 💾 Stored like state for post ${postId}:`, { isLiked, likesCount });
    } catch (error) {
      console.error('[DialogramScreen] ❌ Error storing like state:', error);
    }
  }, []);

  // Get stored like state
  const getStoredLikeState = useCallback(async (postId) => {
    try {
      const likeStates = await AsyncStorage.getItem('userLikeStates');
      const parsedStates = likeStates ? JSON.parse(likeStates) : {};
      const storedState = parsedStates[postId];

      if (storedState) {
        console.log(`[DialogramScreen] 📖 Retrieved stored like state for post ${postId}:`, storedState);
        return storedState;
      }
      return null;
    } catch (error) {
      console.error('[DialogramScreen] ❌ Error getting stored like state:', error);
      return null;
    }
  }, []);

  const fetchFeed = useCallback(async (isRefresh = false) => {
    console.log('[DialogramScreen] 🔄 Fetching feed...', { isRefresh });

    try {
      if (!isRefresh) {
        setLoading(true);
      }

      const data = await Dialogram();
      console.log('[DialogramScreen] ✅ Feed fetched successfully:', data);

      // Ensure data is an array and filter out invalid items
      const validData = Array.isArray(data)
        ? data.filter(item => item && item._id)
        : [];

      console.log('[DialogramScreen] 📊 Valid posts:', validData.length);

      // Check if current user has liked any of these posts
      const processedData = await processFeedWithUserLikes(validData);

      console.log('[DialogramScreen] 📊 Raw API response analysis:');
      validData.forEach((post, index) => {
        console.log(`[DialogramScreen] 📋 Post ${index + 1}:`, {
          id: post._id,
          businessName: post.business?.businessName,
          likes: post.likes,
          likesCount: post.likesCount,
          isLiked: post.isLiked,
          hasLikesArray: Array.isArray(post.likes),
          likesArrayLength: Array.isArray(post.likes) ? post.likes.length : 'not array',
          allProperties: Object.keys(post),
          // Check for alternative like property names
          likeCount: post.likeCount,
          likeCountAlt: post.like_count,
          likedBy: post.likedBy,
          liked_by: post.liked_by,
          userLikes: post.userLikes,
          user_likes: post.user_likes,
          // Check if there are any properties that might contain like info
          possibleLikeProps: Object.keys(post).filter(key =>
            key.toLowerCase().includes('like') ||
            key.toLowerCase().includes('count') ||
            key.toLowerCase().includes('user')
          )
        });
      });

      setFeed(processedData);
    } catch (error) {
      console.error('[DialogramScreen] ❌ Error fetching feed:', error);
      if (!isRefresh) {
        Alert.alert('Error', 'Failed to fetch posts. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    console.log('[DialogramScreen] 🚀 Component mounted, fetching initial feed');
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = useCallback(() => {
    console.log('[DialogramScreen] 🔄 Pull-to-refresh triggered');
    setRefreshing(true);
    fetchFeed(true);
  }, [fetchFeed]);

  // Process feed to check if current user has liked each post
  const processFeedWithUserLikes = useCallback(async (feedData) => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        console.log('[DialogramScreen] ⚠️ No user data found, skipping like state processing');
        return feedData;
      }

      const parsedUserData = JSON.parse(userData);
      const currentUserId = parsedUserData._id || parsedUserData.id || parsedUserData.userId;

      if (!currentUserId) {
        console.log('[DialogramScreen] ⚠️ No user ID found, skipping like state processing');
        return feedData;
      }

      console.log('[DialogramScreen] 👤 Processing feed with user ID:', currentUserId);

      // Since the feed API doesn't return like information, we need to check each post
      // For now, we'll use the optimistic updates from the state
      const processedFeed = await Promise.all(feedData.map(async (post) => {
        // First check stored like state
        const storedState = await getStoredLikeState(post._id);

        // Check if current user has liked this post
        const currentUserIdStr = String(currentUserId);
        const userLiked = post.likes && Array.isArray(post.likes) &&
          post.likes.some(likeId => String(likeId) === currentUserIdStr);

        // Use stored state if available, otherwise use API data
        const finalIsLiked = storedState ? storedState.isLiked : userLiked;
        const finalLikesCount = storedState ? storedState.likesCount : (post.likesCount || 0);

        console.log(`[DialogramScreen] 🔍 Post ${post._id}:`, {
          likesArray: post.likes,
          userLiked,
          likesCount: post.likesCount,
          currentUserId: currentUserIdStr,
          storedState,
          finalIsLiked,
          finalLikesCount,
          comparison: post.likes ? post.likes.map(id => `${String(id)} === ${currentUserIdStr} = ${String(id) === currentUserIdStr}`) : 'no likes array'
        });

        return {
          ...post,
          isLiked: finalIsLiked, // Mark if current user has liked this post
          likesCount: finalLikesCount,
        };
      }));

      console.log('[DialogramScreen] ✅ Feed processed with user like states');
      return processedFeed;
    } catch (error) {
      console.error('[DialogramScreen] ❌ Error processing feed with user likes:', error);
      return feedData;
    }
  }, [getStoredLikeState]);

  // Function to get like information for a specific post
  const getPostLikeInfo = useCallback(async (postId) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        console.log('[DialogramScreen] ⚠️ No user token found for like info request');
        return null;
      }

      // Call API to get like information for this post
      const response = await apiClient.get(`/feeds/${postId}/likes`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      console.log(`[DialogramScreen] ✅ Like info for post ${postId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`[DialogramScreen] ❌ Error getting like info for post ${postId}:`, error);
      return null;
    }
  }, []);

  // Update likes in state when a post is liked/unliked
  const handleUpdateLike = useCallback(async (postId, isLiked, likesCount) => {
    console.log('[DialogramScreen] 💖 Updating like state:', { postId, isLiked, likesCount });

    // Store the like state locally for persistence
    await storeLikeState(postId, isLiked, likesCount);

    // Get current user ID for likes array management
    let currentUserId = null;
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        currentUserId = parsedUserData._id || parsedUserData.id || parsedUserData.userId;
      }
    } catch (error) {
      console.error('[DialogramScreen] ❌ Error getting current user ID:', error);
    }

    setFeed((prev) =>
      prev.map((post) => {
        if (post && post._id === postId) {
          console.log('[DialogramScreen] 🔄 Updating post:', post._id, 'isLiked:', isLiked, 'likesCount:', likesCount);

          // Update likes array based on current user's action
          let updatedLikes = post.likes || [];
          if (currentUserId) {
            if (isLiked) {
              // Add current user to likes array if not already there
              if (!updatedLikes.includes(currentUserId)) {
                updatedLikes = [...updatedLikes, currentUserId];
              }
            } else {
              // Remove current user from likes array
              updatedLikes = updatedLikes.filter(id => id !== currentUserId);
            }
          }

          return {
            ...post,
            isLiked: isLiked,
            likesCount: likesCount,
            likes: updatedLikes
          };
        }
        return post;
      })
    );
  }, [storeLikeState]);

  // Function to update a specific post's like information
  const updatePostLikeInfo = useCallback((postId, likeInfo) => {
    console.log('[DialogramScreen] 🔄 Updating post like info:', { postId, likeInfo });

    setFeed((prev) =>
      prev.map((post) => {
        if (post && post._id === postId) {
          return {
            ...post,
            likes: likeInfo.likes || post.likes || [],
            likesCount: likeInfo.likesCount || likeInfo.likes?.length || post.likesCount || 0,
            isLiked: likeInfo.isLiked !== undefined ? likeInfo.isLiked : post.isLiked
          };
        }
        return post;
      })
    );
  }, []);

  const renderPost = useCallback(({ item }) => {
    // Additional safety check for renderPost
    if (!item || !item._id) {
      console.log('[DialogramScreen] ⚠️ Invalid item in renderPost:', item);
      return null;
    }

    return (
      <PostItem
        item={item}
        colorScheme={colorScheme}
        onUpdateLike={handleUpdateLike}
      />
    );
  }, [colorScheme, handleUpdateLike]);

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${colorScheme === 'dark' ? 'bg-neutral-900' : 'bg-gray-50'
        }`}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
        />
        <ActivityIndicator
          size="large"
          color={colorScheme === 'dark' ? 'white' : '#007AFF'}
        />
        <Text className={`mt-3 ${colorScheme === 'dark' ? 'text-white' : 'text-black'
          }`}>
          Loading posts...
        </Text>
      </View>
    );
  }

  if (!feed || feed.length === 0) {
    return (
      <View className={`flex-1 justify-center items-center p-5 ${colorScheme === 'dark' ? 'bg-neutral-900' : 'bg-gray-50'
        }`}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
        />
        <Text className={`text-center mb-4 ${colorScheme === 'dark' ? 'text-white' : 'text-black'
          }`}>
          No posts available
        </Text>
        <TouchableOpacity
          className="bg-blue-500 px-5 py-3 rounded-lg"
          onPress={() => fetchFeed()}
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (

    <View className={`flex-1  ${colorScheme === 'dark' ? 'bg-neutral-900' : 'bg-gray-50'
      }`}>

      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
      />

      <SafeAreaView className='pb-10' >
        <Image
          source={require("../assets/DialogramLogo.png")}
          className="w-full h-20"
          resizeMode="contain"
        />
        <FlatList
          data={feed}
          renderItem={renderPost}
          keyExtractor={(item) => item?._id || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colorScheme === 'dark' ? 'white' : '#007AFF'}
              colors={colorScheme === 'dark' ? ['white'] : ['#007AFF']}
            />
          }
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        />
      </SafeAreaView>
      
    </View>

  );
};

export default DialogramScreen;
