import React from 'react';
import { View, ScrollView, StatusBar, Text, RefreshControl } from 'react-native';
import FeedItem from './FeedItem';

const FeedsList = ({ 
  posts, 
  loading, 
  colorScheme, 
  screenHeight, 
  handleLike, 
  handleComment, 
  handleShare, 
  renderDescription, 
  formatTimestamp,
  onRefresh
}) => {
  if (loading) {
    return (
      <View className={`flex-1 justify-center items-center ${colorScheme === 'dark' ? 'bg-neutral-900' : 'bg-gray-100'}`}>
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
        />
        <Text className={`mt-3 ${colorScheme === 'dark' ? 'text-white' : 'text-gray-600'}`}>Loading feeds...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1"
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={onRefresh}
          colors={colorScheme === 'dark' ? ['#ffffff'] : ['#000000']}
          tintColor={colorScheme === 'dark' ? '#ffffff' : '#000000'}
        />
      }
    >
      {posts.length > 0 ? (
        posts.map(post => (
          <FeedItem
            key={post._id}
            post={post}
            colorScheme={colorScheme}
            screenHeight={screenHeight}
            handleLike={handleLike}
            handleComment={handleComment}
            handleShare={handleShare}
            renderDescription={renderDescription}
            formatTimestamp={formatTimestamp}
          />
        ))
      ) : (
        <View className={`flex-1 justify-center items-center py-20 ${colorScheme === 'dark' ? 'bg-neutral-900' : 'bg-gray-100'}`}>
          <Text className={colorScheme === 'dark' ? 'text-white' : 'text-gray-600'}>No feeds available</Text>
          <Text className={`text-sm mt-2 ${colorScheme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Pull down to refresh</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default FeedsList;