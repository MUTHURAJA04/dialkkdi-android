import { View, Text, TextInput, TouchableOpacity ,StatusBar} from 'react-native';
import React from 'react';
import { ShoppingCart, User, Search } from 'react-native-feather';

const Header = ({
  title = 'ShopEase',
  onSearch,
  onCartPress,
  onProfilePress,
}) => {
  const [query, setQuery] = React.useState('');
console.log('Header rendered');

  return (
    <View className="bg-blue-500 pt-3 pb-2 px-4">
    
   <StatusBar
        barStyle="light-content" // or "dark-content" depending on background
        backgroundColor="#3B82F6" // Tailwind blue-500 hex
      />
      {/* Top Row: Title + Icons */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-white text-xl font-bold">{title}</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={onCartPress}>
            <ShoppingCart stroke="white" width={24} height={24} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onProfilePress}>
            <User stroke="white" width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-full px-4 py-2">
        <Search stroke="#888" width={18} height={18} />
        <TextInput
          className="ml-2 flex-1 text-sm text-black"
          placeholder="Search for products"
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => onSearch?.(query)}
          returnKeyType="search"
        />
      </View>
    </View>
  );
};

export default Header;
