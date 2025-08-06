import { View, Text, TextInput, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import React from 'react';
import { ShoppingCart, User, Search, Menu } from 'react-native-feather';

const Header = ({
  title = 'ShopEase',
  onSearch,
  onCartPress,
  onProfilePress,
  onMenuPress,
}) => {
  const [query, setQuery] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View className="bg-white pt-10 pb-2 px-4 shadow-md shadow-gray-300 sticky top-0 z-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* 🔹 Top Row: Menu + Title + Icons */}
      <View className="flex-row justify-center items-center mb-3">
        {/* <TouchableOpacity 
          onPress={onMenuPress}
          className="p-2 rounded-full bg-gray-100"
        >
          <Menu stroke="#3B82F6" width={20} height={20} />
        </TouchableOpacity> */}
        
        <Text className="text-blue-500 text-2xl font-extrabold">{title}</Text>
        
        <View className="flex-row">
          {/* <TouchableOpacity 
            onPress={onCartPress}
            className="p-2 rounded-full bg-gray-100 relative mr-2"
          >
            <ShoppingCart stroke="#3B82F6" width={20} height={20} />
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-xs">3</Text>
            </View>
          </TouchableOpacity> */}
{/*           
          <TouchableOpacity 
            onPress={onProfilePress}
            className="p-2 rounded-full bg-gray-100"
          >
            <User stroke="#3B82F6" width={20} height={20} />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* 🔹 Search Bar */}
      <View 
        className={`flex-row items-center bg-gray-100 rounded-xl px-4 border-2 ${isFocused ? 'border-blue-400' : 'border-gray-100'}`}
      >
        <Search stroke="#64748B" width={18} height={18} />
        <TextInput
          className="ml-3 flex-1 text-base text-gray-800"
          placeholder="Search for products..."
          placeholderTextColor="#64748B"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => onSearch?.(query)}
          returnKeyType="search"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text className="text-blue-500 font-medium">Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
      
     
    </View>
  );
};

export default React.memo(Header);
