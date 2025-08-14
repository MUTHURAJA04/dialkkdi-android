import React from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, Alert, Pressable } from 'react-native';
import { X, Send, Trash2 } from 'react-native-feather';

const CommentsModal = React.memo(({
  showComments,
  setShowComments,
  commentText,
  setCommentText,
  submittingComment,
  handleSubmitComment,
  colorScheme,
  comments,
  loadingComments,
  selectedPost,
  onCommentDeleted
}) => {
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  
  // Calculate responsive dimensions
  const modalHeight = screenHeight * 0.8; // 80% of screen height
  const modalTopMargin = screenHeight * 0.2; // 20% from top
  const isSmallScreen = screenHeight < 700;
  const isMediumScreen = screenHeight >= 700 && screenHeight < 900;
  const isLargeScreen = screenHeight >= 900;
  const isTablet = screenWidth > 768;
  const isLandscape = screenWidth > screenHeight;

  // Handle long press to delete comment
  const handleLongPressComment = (comment) => {
    // Check if comment belongs to current user (you can add this check)
    // For now, allowing deletion of any comment
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteComment(comment._id),
        },
      ]
    );
  };

  // Delete comment function
  const deleteComment = async (commentId) => {
    try {
      // Import the deleteComment function dynamically
      const { deleteComment: deleteCommentAPI } = await import('../../services/apiClient');
      
      console.log('🗑️ Deleting comment:', commentId);
      
      const response = await deleteCommentAPI(commentId);
      console.log('✅ Comment deleted successfully:', response);
      
      // Call the callback to refresh comments in parent component
      if (onCommentDeleted) {
        onCommentDeleted();
      }
      
      Alert.alert('Success', 'Comment deleted successfully!');
      
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      
      let errorMessage = 'Failed to delete comment. Please try again.';
      if (error.message === 'User not authenticated. Please login again.') {
        errorMessage = 'Please login to delete comments.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };
  
  return (
    <Modal
      visible={showComments}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowComments(false)}
    >
      <View className="flex-1 bg-black bg-opacity-50">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View 
            className={`rounded-t-3xl ${colorScheme === 'dark' ? 'bg-neutral-800' : 'bg-white'}`}
            style={{
              flex: 1,
              marginTop: isLandscape ? screenHeight * 0.1 : modalTopMargin,
              width: screenWidth,
              maxWidth: isTablet ? (isLandscape ? 800 : 600) : screenWidth,
              alignSelf: 'center',
              position: 'relative'
            }}
          >
              {/* Header */}
              <View className={`flex-row items-center justify-between border-b ${colorScheme === 'dark' ? 'border-neutral-700' : 'border-gray-200'}`}
                style={{
                  padding: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
                  paddingBottom: isSmallScreen ? 14 : isMediumScreen ? 16 : 18
                }}
              >
                <View className="flex-1 mr-3">
                  <Text 
                    className={`font-bold ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={{
                      fontSize: isSmallScreen ? 16 : isMediumScreen ? 17 : 18
                    }}
                  >
                    Comments {selectedPost?.title ? `- ${selectedPost.title}` : ''}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowComments(false)}
                  className="p-2"
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <X width={24} height={24} stroke={colorScheme === 'dark' ? '#9CA3AF' : '#000'} />
                </TouchableOpacity>
              </View>

              {/* Comments List */}
              <ScrollView 
                className="flex-1 px-4"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ 
                  paddingVertical: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
                  paddingBottom: isSmallScreen ? 20 : isMediumScreen ? 25 : 30,
                  flexGrow: 1
                }}
                style={{ flex: 1 }}
              >
                {loadingComments ? (
                  <View className="flex-1 justify-center items-center py-20">
                    <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} ${colorScheme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>
                      Loading comments...
                    </Text>
                  </View>
                ) : comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <Pressable
                      key={comment._id || index}
                      onLongPress={() => handleLongPressComment(comment)}
                      className={`mb-4 p-3 rounded-lg ${colorScheme === 'dark' ? 'bg-neutral-700' : 'bg-gray-100'}`}
                      style={{
                        minHeight: isSmallScreen ? 60 : isMediumScreen ? 70 : 80
                      }}
                    >
                      <View className="flex-row items-center mb-2 flex-wrap">
                        <Text 
                          className={`font-bold ${isSmallScreen ? 'text-xs' : 'text-sm'} ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}
                          numberOfLines={1}
                        >
                          {comment.name || comment.userName || comment.user?.name || 'Anonymous'}
                        </Text>
                        <Text className={`${isSmallScreen ? 'text-xs' : 'text-xs'} ml-2 ${colorScheme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>
                          {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ''}
                        </Text>
                      </View>
                      <Text 
                        className={`${isSmallScreen ? 'text-xs' : 'text-sm'} ${colorScheme === 'dark' ? 'text-white' : 'text-black'}`}
                        numberOfLines={0}
                      >
                        {comment.text || comment.comment || comment.content || 'No comment text'}
                      </Text>
                      
                
                    </Pressable>
                  ))
                ) : (
                  <View className="flex-1 justify-center items-center py-20">
                    <Text className={`${isSmallScreen ? 'text-sm' : 'text-base'} ${colorScheme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>
                      No comments yet
                    </Text>
                    <Text className={`${isSmallScreen ? 'text-xs' : 'text-sm'} ${colorScheme === 'dark' ? 'text-neutral-500' : 'text-gray-500'} mt-1`}>
                      Be the first to comment!
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Comment Input */}
              <View 
                className={`border-t ${colorScheme === 'dark' ? 'border-neutral-700' : 'border-gray-200'}`}
                style={{
                  padding: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
                  paddingBottom: isSmallScreen ? 16 : isMediumScreen ? 18 : 20,
                  backgroundColor: colorScheme === 'dark' ? '#262626' : '#ffffff',
                  minHeight: isSmallScreen ? 80 : isMediumScreen ? 90 : 100
                }}
              >
                <View className="flex-row items-center gap-5">
                  <TextInput
                    key="comment-input"
                    className={`flex-1 rounded-full border ${colorScheme === 'dark' ? 'bg-neutral-700 border-neutral-600 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
                    placeholder="Write a comment..."
                    placeholderTextColor={colorScheme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline={false}
                    maxLength={500}
                    style={{ 
                      fontSize: isSmallScreen ? 14 : isMediumScreen ? 15 : 16,
                      paddingHorizontal: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
                      paddingVertical: isSmallScreen ? 10 : isMediumScreen ? 11 : 12,
                      minHeight: isSmallScreen ? 44 : isMediumScreen ? 48 : 52,
                      maxHeight: isSmallScreen ? 44 : isMediumScreen ? 48 : 52
                    }}
                  />
                  <TouchableOpacity 
                    onPress={handleSubmitComment}
                    disabled={!commentText.trim() || submittingComment}
                    className={`rounded-full ${commentText.trim() && !submittingComment ? 'bg-blue-500' : 'bg-gray-400'}`}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{
                      width: isSmallScreen ? 44 : isMediumScreen ? 48 : 52,
                      height: isSmallScreen ? 44 : isMediumScreen ? 48 : 52,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Send 
                      width={isSmallScreen ? 18 : isMediumScreen ? 20 : 22} 
                      height={isSmallScreen ? 18 : isMediumScreen ? 20 : 22} 
                      stroke="white" 
                    />
                  </TouchableOpacity>
                </View>
                {commentText.length > 0 && (
                  <View className="mt-2 flex-row justify-between items-center">
                    <Text 
                      className={`${isSmallScreen ? 'text-xs' : 'text-sm'} ${colorScheme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}
                      numberOfLines={1}
                      style={{ flex: 1, marginRight: 8 }}
                    >
                      {commentText.length}/500 characters
                    </Text>
                    <Text 
                      className={`${isSmallScreen ? 'text-xs' : 'text-sm'} ${colorScheme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}
                      numberOfLines={1}
                      style={{ minWidth: 50, textAlign: 'right' }}
                    >
                      {Math.ceil((commentText.length / 500) * 100)}% used
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    );
});

export default CommentsModal;