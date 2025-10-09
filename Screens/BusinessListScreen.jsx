import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Star, ChevronDown, MapPin } from "react-native-feather";
import { useNavigation, useRoute } from "@react-navigation/native";
import { businessList, getads } from "../services/apiClient";
import ListScreenBanner from "../Screens/ListScreenBanner";
import banner1 from "../assets/Banners/Banner1.jpg";
import banner2 from "../assets/Banners/Banner2.jpg";

const sortOptions = ["Rating High-Low", "Rating Low-High", "Name A-Z", "Name Z-A"];

const BusinessListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId } = route.params || {};

  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [selectedSort, setSelectedSort] = useState("");
  const [showSortModal, setShowSortModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [banners, setBanners] = useState([]);

  const CDN_PREFIX = "https://livecdn.dialkaraikudi.com";

  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!categoryId) {
        console.warn("⚠️ No category ID provided.");
        return;
      }

      try {
        setLoading(true);
        const data = await businessList(categoryId);
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];

        setBusinesses(list);
        setFilteredBusinesses(list);
      } catch (error) {
        console.error("❌ Error fetching businesses:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [categoryId]);

  useEffect(() => {
    let sorted = [...businesses];

    switch (selectedSort) {
      case "Name A-Z":
        sorted.sort((a, b) =>
          (a.businessName || a.name || "").localeCompare(b.businessName || b.name || "")
        );
        break;
      case "Name Z-A":
        sorted.sort((a, b) =>
          (b.businessName || b.name || "").localeCompare(a.businessName || a.name || "")
        );
        break;
      case "Rating High-Low":
        sorted.sort(
          (a, b) => ((b.ratings ?? b.rating) || 0) - ((a.ratings ?? a.rating) || 0)
        );
        break;
      case "Rating Low-High":
        sorted.sort(
          (a, b) => ((a.ratings ?? a.rating) || 0) - ((b.ratings ?? b.rating) || 0)
        );
        break;
      default:
        break;
    }

    setFilteredBusinesses(sorted);
  }, [selectedSort, businesses]);

  const fallbackBanners = [
    { url: banner1 }, // require('../assets/Banners/Banner1.jpg')
    { url: banner2 },
  ];

  useEffect(() => {
    const getAdverts = async () => {
      try {
        const response = await getads();
        const data = response || [];

        const filtered = data
          .filter(ad => ad.slotId?._id === "68283c12158ec22d9c5bae4e" && ad.isActive)
          .map(ad => ({
            url: ad.contentUrl ? { uri: `${CDN_PREFIX}/${ad.contentUrl}` } : null, // note the { uri: ... }
            businessId: ad.businessId || null,
          }))
          .filter(ad => ad.url);

        let finalAds = [];

        if (filtered.length === 0) {
          finalAds = fallbackBanners; // 2 local images
        } else if (filtered.length === 1) {
          finalAds = [
            filtered[0],
            fallbackBanners[0], // 1 local
          ];
        } else {
          finalAds = filtered.slice(0, 2); // first 2 API banners
        }

        setBanners(finalAds);
        console.log(finalAds, "✅ Final merged banners");
      } catch (error) {
        console.error(error);
        setBanners(fallbackBanners);
      }
    };

    getAdverts();
  }, []);




  const handleNavigate = (item) => {
    navigation.navigate("BusinessDetailScreen", { business: item });
  };

  // ✅ Render a business card
  const renderBusinessItem = (item) => {
    const rawImagePath = item.photos?.[0];
    const imageUrl = rawImagePath
      ? `${CDN_PREFIX}${rawImagePath}`
      : "https://via.placeholder.com/400x200.png?text=Business";

    return (
      <TouchableOpacity
        onPress={() => handleNavigate(item)}
        className="bg-white rounded-2xl shadow-md mb-5 overflow-hidden"
      >
        <Image source={{ uri: imageUrl }} className="w-full h-44" resizeMode="cover" />
        <View className="p-4 relative">
          <Text className="text-xl font-semibold text-black mb-1">
            {item.businessName || item.name || "Business Name"}
          </Text>

          <View className="flex-row items-end absolute right-5 top-5">
            <Star color="#facc15" width={18} height={18} />
            <Text className="ml-1 text-yellow-500 font-medium text-sm">
              {item.ratings?.toFixed(1) || "N/A"}
            </Text>
          </View>

          <View className="flex-row items-start mb-2">
            <MapPin color="#6b7280" width={16} height={16} />
            <Text
              className="ml-2 text-base text-gray-700 leading-5 flex-1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.address?.formattedAddress || "No address available"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ Render special square banner after every 3 businesses
  const renderMixedItem = ({ item }) => {
    if (item.type === "banner") {
      return (
        <View className="w-full aspect-square mt-5 mb-2 rounded-2xl overflow-hidden">
          <Image
            source={item.url?.uri ? item.url : item.url} // { uri: ... } or require(...)
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>
      );
    }

    if (item.type === "emptyMessage") {
      return (
        <Text className="text-center text-gray-500 mt-10 text-lg">
          {item.message}
        </Text>
      );
    }

    return renderBusinessItem(item);
  };


  // ✅ Prepare data with banner every 3 items
  const getMixedData = () => {
    const list = [...filteredBusinesses];
    const mixedData = [];

    // Use banners from state
    const banner1 = banners[0];
    const banner2 = banners[1];

    if (list.length === 0) {
      // No businesses → just show banners
      if (banner1) mixedData.push({ type: "banner", url: banner1.url });
      if (banner2) mixedData.push({ type: "banner", url: banner2.url });
      // Add a "message" item
      mixedData.unshift({ type: "emptyMessage", message: "No businesses found." });
    } else if (list.length > 3) {
      for (let i = 0; i < list.length; i++) {
        mixedData.push(list[i]);
        if (i === 2 && banner1) mixedData.push({ type: "banner", url: banner1.url });
      }
      if (banner2) mixedData.push({ type: "banner", url: banner2.url });
    } else {
      // Push all businesses
      list.forEach(item => mixedData.push(item));
      if (banner1) mixedData.push({ type: "banner", url: banner1.url });
      if (banner2) mixedData.push({ type: "banner", url: banner2.url });
    }

    return mixedData;
  };


  const mixedData = getMixedData();

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-4">
      <ListScreenBanner />

      {/* Sort Button */}
      <View className="flex-row justify-end mb-3">
        <TouchableOpacity
          onPress={() => setShowSortModal(true)}
          className="bg-white px-4 py-2 rounded-xl flex-row items-center shadow"
        >
          <Text className="text-black font-medium mr-1">Sort</Text>
          <ChevronDown color="black" width={18} height={18} />
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <FlatList
          data={mixedData}
          keyExtractor={(item, index) =>
            item._id?.toString() || `banner-${index}` || Math.random().toString()
          }
          renderItem={renderMixedItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            filteredBusinesses.length === 0 ? (
              <Text className="text-center text-gray-500 pb-10">
                No businesses found.
              </Text>
            ) : null
          }
        />
      )}

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-center px-10"
          onPressOut={() => setShowSortModal(false)}
          activeOpacity={1}
        >
          <View className="bg-white rounded-xl p-4">
            {sortOptions.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  setSelectedSort(opt);
                  setShowSortModal(false);
                }}
                className="py-2"
              >
                <Text
                  className={`text-base ${selectedSort === opt
                    ? "text-blue-600 font-semibold"
                    : "text-black"
                    }`}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default BusinessListScreen;
