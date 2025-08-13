import { View, Text, Image, TouchableOpacity, ScrollView, Modal, Dimensions, Share, Alert, Animated, ActivityIndicator, useColorScheme, StatusBar } from 'react-native'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Heart, Send, MessageCircle, X } from 'react-native-feather'
import { civicFeeds } from '../services/apiClient';

const IMAGE_PREFIX = 'https://livecdn.dialkaraikudi.com/';

const TalkofTown = () => {
  const colorScheme = useColorScheme();
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showComments, setShowComments] = useState(false)
  const [expandedDescriptions, setExpandedDescriptions] = useState({})
  const screenHeight = Dimensions.get('window').height

  // Set status bar theme
  useEffect(() => {
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(colorScheme === 'dark' ? '#000000' : '#ffffff');
  }, [colorScheme]);

  useEffect(() => {
    fetchFeeds()
  }, [])

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      const response = await civicFeeds()
      if (response && Array.isArray(response)) {
        setPosts(response)
      }
    } catch (error) {
      console.error('Error fetching feeds:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        const isLiked = post.likes && post.likes.length > 0
        return {
          ...post,
          likes: isLiked ? post.likes.slice(1) : [...(post.likes || []), { user: 'currentUserId', userType: 'User' }]
        }
      }
      return post
    }))
  }

  const handleComment = (postId) => {
    const post = posts.find(p => p._id === postId)
    setSelectedPost(post)
    setShowComments(true)
  }

  const handleShare = async (postId) => {
    try {
      const post = posts.find(p => p._id === postId)
      if (!post) return
      
      const shareUrl = `https://dev.dialkaraikudi.com/feed/${postId}`
      const content = {
        title: `${post.title || 'Post'} on Talk of Town`,
        message: `${post.description ? post.description + '\n' : ''}${shareUrl}`,
        url: shareUrl,
        subject: post.title || 'Talk of Town Post',
      }
      
      const result = await Share.share(content)
      if (result.action === Share.sharedAction) {
        console.log(`✅ Shared post ${postId}`, result.activityType)
      } else if (result.action === Share.dismissedAction) {
        console.log(`❎ Share dismissed for post ${postId}`)
      }
    } catch (error) {
      console.error(`❌ Share failed for post ${postId}:`, error)
      Alert.alert('Error', 'Failed to open share options.')
    }
  }

  const toggleDescription = (postId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return '1 day ago'
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const getPosterName = (post) => {
    if (post.posterType === 'Business') {
      return post.postedBy.businessName || 'Business'
    }
    return post.postedBy.name || 'User'
  }

  const renderDescription = (description, postId) => {
    if (!description) return null
    
    const isExpanded = expandedDescriptions[postId]
    const shouldTruncate = description.length > 100
    
    if (!shouldTruncate) {
      return <Text className={`text-sm ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{description}</Text>
    }
    
    return (
      <View>
        <Text className={`text-sm ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>
          {isExpanded ? description : `${description.substring(0, 100)}...`}
        </Text>
        <TouchableOpacity onPress={() => toggleDescription(postId)}>
          <Text className="text-sm text-blue-500 mt-1">
            {isExpanded ? 'See less' : 'See more'}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  const Post = ({ post }) => {
    const [imageAspectRatio, setImageAspectRatio] = useState(1)
    const [imageLoading, setImageLoading] = useState(true)
    const isLiked = post.likes && post.likes.length > 0
    const likeCount = post.likes ? post.likes.length : 0
    
    // Double tap refs and animations
    const lastTapRef = useRef(null)
    const heartScaleAnim = useRef(new Animated.Value(0)).current
    const heartOpacityAnim = useRef(new Animated.Value(0)).current

    // Measure remote image to maintain correct aspect ratio
    useEffect(() => {
      let isMounted = true
      if (!post.imageUrl) return
      
      Image.getSize(
        `${IMAGE_PREFIX}${post.imageUrl}`,
        (width, height) => {
          if (!isMounted) return
          if (width > 0 && height > 0) {
            setImageAspectRatio(width / height)
          } else {
            setImageAspectRatio(1)
          }
        },
        () => {
          if (!isMounted) return
          setImageAspectRatio(1)
        }
      )
      
      return () => {
        isMounted = false
      }
    }, [post.imageUrl])

    // Modern double-tap heart animation
    const triggerHeartAnimation = useCallback(() => {
      // Reset animations
      heartScaleAnim.setValue(0)
      heartOpacityAnim.setValue(1)

      // Create scale animation
      const scaleAnimation = Animated.spring(heartScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      })

      // Create opacity animation
      const opacityAnimation = Animated.timing(heartOpacityAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })

      // Run animations
      Animated.parallel([scaleAnimation, opacityAnimation]).start()
    }, [heartScaleAnim, heartOpacityAnim])

    // Handle double tap like
    const handleDoubleTap = useCallback(() => {
      const now = Date.now()
      const DOUBLE_PRESS_DELAY = 300

      if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {
        console.log(`❤️ Double tapped post: ${post._id}, current like state:`, isLiked)

        // Always show heart animation on double-tap
        triggerHeartAnimation()

        // Double-tap only likes, never unlikes
        if (!isLiked) {
          handleLike(post._id)
        } else {
          console.log(`ℹ️ Post ${post._id} is already liked, showing animation only`)
        }
      } else {
        lastTapRef.current = now
      }
    }, [post._id, isLiked, triggerHeartAnimation])

    const handleImageLoad = useCallback(() => {
      console.log(`🖼️ Image loaded for post: ${post._id}`)
      setImageLoading(false)
    }, [post._id])

    const handleImageLoadStart = useCallback(() => {
      console.log(`🔄 Image loading started for post: ${post._id}`)
      setImageLoading(true)
    }, [post._id])
    
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
            {/* Blurred background image */}
            <Image 
              source={{ uri: `${IMAGE_PREFIX}${post.imageUrl}` }} 
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.03)'
              }}
              blurRadius={20}
              resizeMode="cover"
            />
            
            {/* Main image */}
            <Image 
              source={{ uri: `${IMAGE_PREFIX}${post.imageUrl}` }} 
              style={{
                width: '100%',
                aspectRatio: imageAspectRatio || 1,
                minHeight: 180,
                maxHeight: Math.round(screenHeight * 0.75),
                backgroundColor: 'transparent'
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
                  color="#007AFF"
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
        )}

                 {/* Action Buttons */}
         <View className="flex-row justify-between items-center px-3 py-2">
           <View className="flex-row items-center">
             <TouchableOpacity onPress={() => handleLike(post._id)} className="mr-4 p-1">
               <Heart 
                 width={28} 
                 height={28}
                 fill={isLiked ? "#ff3040" : "none"}
                 stroke={isLiked ? "#ff3040" : (colorScheme === 'dark' ? '#9CA3AF' : '#000')}
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
           <Text className={`font-bold text-sm px-3 pb-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{likeCount} likes</Text>
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
    )
  }

  const CommentsModal = () => (
    <Modal
      visible={showComments}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowComments(false)}
    >
      <View className="flex-1 bg-black bg-opacity-50">
        <View className={`flex-1 mt-20 rounded-t-3xl ${colorScheme === 'dark' ? 'bg-neutral-800' : 'bg-white'}`}>
          {/* Header */}
          <View className={`flex-row items-center justify-between p-4 border-b ${colorScheme === 'dark' ? 'border-neutral-700' : 'border-gray-200'}`}>
            <Text className={`text-lg font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>Comments</Text>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <X width={24} height={24} stroke={colorScheme === 'dark' ? '#9CA3AF' : '#000'} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView className="flex-1 p-4">
            {selectedPost && selectedPost.comments && selectedPost.comments.length > 0 ? (
              selectedPost.comments.map((comment, index) => (
                <View key={index} className="mb-4">
                  <View className="flex-row items-start">
                    <Image 
                      source={{ uri: 'https://via.placeholder.com/32x32' }} 
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <View className="flex-1">
                      <Text className={`font-bold text-sm ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{comment.user || 'User'}</Text>
                      <Text className={`text-sm mt-1 ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{comment.text || 'Comment text'}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="flex-1 justify-center items-center py-20">
                <Text className={colorScheme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}>No comments yet</Text>
                <Text className={colorScheme === 'dark' ? 'text-neutral-500' : 'text-gray-500'}>Be the first to comment!</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )

  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${colorScheme === 'dark' ? 'bg-neutral-900' : 'bg-gray-100'}`}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
        />
        <ActivityIndicator
          size="large"
          color={colorScheme === 'dark' ? 'white' : '#007AFF'}
        />
        <Text className={`mt-3 ${colorScheme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading feeds...</Text>
      </View>
    )
  }

  return (
    <View className={`flex-1 ${colorScheme === 'dark' ? 'bg-neutral-900' : 'bg-gray-100'}`}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
      />
      <ScrollView className="flex-1">
        
        {posts.length > 0 ? (
          posts.map(post => (
            <Post key={post._id} post={post} />
          ))
        ) : (
          <View className={`flex-1 justify-center items-center py-20 ${colorScheme === 'dark' ? 'bg-neutral-900' : 'bg-gray-100'}`}>
            <Text className={colorScheme === 'dark' ? 'text-white' : 'text-gray-600'}>No feeds available</Text>
          </View>
        )}
      </ScrollView>
      
      <CommentsModal />
    </View>
  )
}

export default TalkofTown