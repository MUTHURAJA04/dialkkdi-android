import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { Search, Mic, MicOff, ShoppingBag, X, User, Heart, LogOut } from 'react-native-feather';
import { useNavigation } from '@react-navigation/native';
import { getSearchSuggestions } from '../services/apiClient';

const Header = () => {
  const navigation = useNavigation();
  
  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNoSuggestions, setShowNoSuggestions] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [listening, setListening] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch search suggestions
  const fetchSuggestions = async (text) => {
    if (!text.trim()) {
      setSuggestions([]);
      setShowNoSuggestions(false);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      setShowNoSuggestions(false);

      const response = await getSearchSuggestions(text);
      
      let combinedSuggestions = [];

      if (response?.categories) {
        combinedSuggestions = combinedSuggestions.concat(
          response.categories.map(cat => ({
            _id: cat._id,
            type: "category",
            name: cat.displayName || cat.categoryName,
          }))
        );
      }

      if (response?.businesses) {
        combinedSuggestions = combinedSuggestions.concat(
          response.businesses.map(biz => ({
            _id: biz._id,
            type: "business",
            name: biz.businessName,
          }))
        );
      }

      // Sort by relevance
      const regex = new RegExp(`\\b${text}`, "i");
      combinedSuggestions.sort((a, b) => {
        const aIndex = a.name.toLowerCase().search(regex);
        const bIndex = b.name.toLowerCase().search(regex);

        if (aIndex === bIndex) {
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }
        return aIndex - bIndex;
      });

      setSuggestions(combinedSuggestions);
      setShowNoSuggestions(combinedSuggestions.length === 0);
    } catch (error) {
      console.error("Error fetching suggestions", error);
      setSuggestions([]);
      setShowNoSuggestions(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    navigation.navigate('BusinessListScreen', { searchQuery });
    setSuggestions([]);
    setShowNoSuggestions(false);
  };


  const navigateToSuggestion = (item) => {
  if (item.type === "category") {
    navigation.navigate('BusinessListScreen', { categoryId: item._id });
  } else {
    navigation.navigate('BusinessDetailScreen', { business: item });
  }
  setSearchQuery("");
  setSuggestions([]);
};


  // Effect for search query changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim().length >= 1) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
        setShowNoSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Voice search functions (placeholder)
  const startVoiceSearch = () => {
    setListening(true);
  };

  const stopVoiceSearch = () => {
    setListening(false);
  };

  // Render suggestion item
  const renderSuggestionItem = ({ item, index }) => (
    <TouchableOpacity
      className={`p-3 flex-row items-center justify-between ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
      onPress={() => navigateToSuggestion(item)}
    >
      <View className="flex-row items-center flex-1 gap-2">
        {item.type === "category" ? (
          <Search width={16} height={18} color="#64748B" className="mr-3" />
        ) : (
          <ShoppingBag width={16} height={18} color="#3B82F6" className="mr-3" />
        )}
        <Text className="text-gray-800 flex-1" numberOfLines={1}>{item.name}</Text>
      </View>
      <View className={`px-2 py-1 rounded-full ${item.type === "category" ? 'bg-green-100' : 'bg-blue-100'}`}>
        <Text className={`text-xs font-medium ${item.type === "category" ? 'text-green-800' : 'text-blue-800'}`}>
          {item.type === "category" ? "Category" : "Business"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      className="bg-white pt-12 pb-3 px-4 shadow-md shadow-gray-300 relative"
      style={{ zIndex: 10 }}
    >
     
      <View className="flex-row items-center justify-between mb-3">
       

        {/* Search bar */}
        <View className="flex-1 relative">
          <View 
            className={`flex-row items-center bg-gray-100 rounded-xl px-4 border-2 ${isSearchFocused ? 'border-blue-400' : 'border-gray-100'}`}
          >
            <Search width={18} height={18} color="#64748B" />
            <TextInput
              className="ml-3 flex-1 text-base text-gray-800 py-2"
              placeholder={listening ? "Listening..." : "Search for services, products..."}
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                setIsSearchFocused(false);
                setTimeout(() => {
                  setSuggestions([]);
                  setShowNoSuggestions(false);
                }, 200);
              }}
            />
            
            {searchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X width={18} height={18} color="#64748B" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={listening ? stopVoiceSearch : startVoiceSearch}
                className={`ml-2 ${listening ? 'text-red-500' : 'text-gray-500'}`}
              >
                {/* {listening ? (
                  <MicOff width={18} height={18} color="#EF4444" />
                ) : (
                  <Mic width={18} height={18} color="#64748B" />
                )} */}
              </TouchableOpacity>
            )}
          </View>

          {/* Search suggestions dropdown */}
          {(suggestions.length > 0 || showNoSuggestions) && isSearchFocused && (
            <View
              className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl z-40 max-h-60 border border-gray-200"
              style={{ zIndex: 20, elevation: 10 }}
            >
              {isSearching ? (
                <View className="p-4 items-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="text-gray-500 mt-2">Searching...</Text>
                </View>
              ) : (
                <FlatList
                  data={suggestions}
                  renderItem={renderSuggestionItem}
                  keyExtractor={(item) => item._id}
                  keyboardShouldPersistTaps="handled"
                  ListEmptyComponent={
                    <View className="p-4 items-center">
                      <Text className="text-gray-500">No suggestions found</Text>
                    </View>
                  }
                />
              )}
            </View>
          )}
        </View>

        {/* User dropdown */}
        {/* User dropdown code commented out as per your original */}
      </View>
    </View>
  );
};

export default Header;
