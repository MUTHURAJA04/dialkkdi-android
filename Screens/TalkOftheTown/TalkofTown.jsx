import { View, Dimensions, useColorScheme, StatusBar, Alert, Share, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import FeedsList from './FeedsList';
import CommentsModal from './CommentsModal';
import { civicFeeds, GetComments, civicComments } from '../../services/apiClient';

const IMAGE_PREFIX = 'https://livecdn.dialkaraikudi.com/';

const TalkofTown = () => {
  const colorScheme = useColorScheme();
  
  // State management for posts and UI
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  
  const screenHeight = Dimensions.get('window').height;

  // Set status bar theme based on system preference
  useEffect(() => {
    StatusBar.setBarStyle(colorScheme === 'dark' ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(colorScheme === 'dark' ? '#000000' : '#ffffff');
  }, [colorScheme]);

  // Fetch feeds when component mounts
  useEffect(() => {
    fetchFeeds();
  }, []);

  // Fetch feeds from API and map to component format
  const fetchFeeds = async () => {
    try {
      setLoading(true);
      
      const response = await civicFeeds();
      
      // Handle both direct array and nested data responses
      let feedsData = null;
      if (response && Array.isArray(response)) {
        feedsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        feedsData = response.data;
      }
      
      if (feedsData) {
        
        // Debug: Check comment fields in first post
        if (feedsData.length > 0) {
          const firstPost = feedsData[0];
          
        }
        
        // Map API data to our component format
        const mappedPosts = feedsData.map(feed => ({
          _id: feed._id || feed.id,
          title: feed.title || 'Untitled Post',
          description: feed.description || '',
          imageUrl: feed.imageUrl || feed.image || feed.media || null,
          posterType: feed.posterType || 'User',
          postedBy: feed.postedBy || { name: 'Unknown User' },
          likes: feed.likes || [],
          likesCount: feed.likes ? feed.likes.length : 0,
          commentCount: feed.commentCount || feed.commentsCount || (feed.comments ? feed.comments.length : 0) || 0,
          createdAt: feed.createdAt || feed.created_at || new Date().toISOString()
        }));
        
        setPosts(mappedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching feeds:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    await fetchFeeds();
  };

  // Toggle like status for a post (local state update)
  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        const isLiked = post.likes && post.likes.length > 0;
        return {
          ...post,
          likes: isLiked ? post.likes.slice(1) : [...(post.likes || []), { user: 'currentUserId', userType: 'User' }]
        };
      }
      return post;
    }));
  };

  // Open comments modal for a specific post
  const handleComment = async (postId) => {
    const post = posts.find(p => p._id === postId);
    setSelectedPost(post);
    setShowComments(true);
    setCommentText('');
    
    // Fetch comments for this post
    await fetchComments(postId);
  };

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      setLoadingComments(true);
      
      const response = await GetComments(postId);
      
      if (response && Array.isArray(response)) {
        setComments(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setComments(response.data);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Handle comment submission using civicComments API
  const handleSubmitComment = async () => {
    if (!commentText.trim() || !selectedPost) return;
    
    try {
      setSubmittingComment(true);
      
      // Call civicComments API to add the comment
      const response = await civicComments(selectedPost._id, commentText.trim());
      
      // Clear the input
      setCommentText('');
      
      // Refresh comments to show the new comment
      await fetchComments(selectedPost._id);
      
      // Update comment count in posts list
      const currentCount = selectedPost.commentCount || 0;
      updatePostCommentCount(selectedPost._id, currentCount + 1);
      
      // Show success message
      Alert.alert('Success', 'Comment added successfully!');
      
    } catch (error) {
      console.error('❌ Error submitting comment:', error);
      
      // Show appropriate error message
      let errorMessage = 'Failed to submit comment. Please try again.';
      if (error.message === 'User not authenticated. Please login again.') {
        errorMessage = 'Please login to add comments.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Share post using native share functionality
  const handleShare = async (postId) => {
    try {
      const post = posts.find(p => p._id === postId);
      if (!post) return;
      
      const shareUrl = `https://dev.dialkaraikudi.com/talkofthetown/${postId}`;
      const content = {
        title: `${post.title || 'Post'} on Talk of Town`,
        message: `${post.description ? post.description + '\n' : ''}${shareUrl}`,
        url: shareUrl,
        subject: post.title || 'Talk of Town Post',
      };
      
      await Share.share(content);
    } catch (error) {
      console.error(`Share failed for post ${postId}:`, error);
      Alert.alert('Error', 'Failed to open share options.');
    }
  };

  // Toggle description expansion for long posts
  const toggleDescription = (postId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Format timestamp to relative time (e.g., "2 hours ago")
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Render description with expand/collapse functionality
  const renderDescription = (description, postId) => {
    if (!description) return null;
    
    const isExpanded = expandedDescriptions[postId];
    const shouldTruncate = description.length > 100;
    
    if (!shouldTruncate) {
      return <Text className={`text-sm ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}>{description}</Text>;
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
    );
  };

  // Refresh comments for a specific post
  const refreshComments = async (postId) => {
    await fetchComments(postId);
  };

  // Handle comment deletion callback
  const handleCommentDeleted = async () => {
    if (selectedPost) {
      // Refresh comments after deletion
      await fetchComments(selectedPost._id);
      
      // Update comment count in posts list (decrease by 1)
      const currentCount = selectedPost.commentCount || 0;
      updatePostCommentCount(selectedPost._id, Math.max(0, currentCount - 1));
    }
  };

  // Update comment count in posts list
  const updatePostCommentCount = (postId, newCount) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        return { ...post, commentCount: newCount };
      }
      return post;
    }));
  };

  return (
    <View className={`flex-1 ${colorScheme === 'dark' ? 'bg-neutral-900' : 'bg-gray-100'}`}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
      />
      
      {/* Main feeds list with pull-to-refresh */}
      <FeedsList
        posts={posts}
        loading={loading}
        colorScheme={colorScheme}
        screenHeight={screenHeight}
        handleLike={handleLike}
        handleComment={handleComment}
        handleShare={handleShare}
        renderDescription={renderDescription}
        formatTimestamp={formatTimestamp}
        onRefresh={handleRefresh}
      />
      
      {/* Comments modal for viewing and adding comments */}
      <CommentsModal
        showComments={showComments}
        setShowComments={setShowComments}
        commentText={commentText}
        setCommentText={setCommentText}
        submittingComment={submittingComment}
        handleSubmitComment={handleSubmitComment}
        colorScheme={colorScheme}
        comments={comments}
        loadingComments={loadingComments}
        selectedPost={selectedPost}
        onCommentDeleted={handleCommentDeleted}
      />
    </View>
  );
};

export default TalkofTown;