import React, { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Alert,
} from "react-native";
import BusinessEditModal, { ImagesEditModal, BusinessTimingEditModal } from "./BusinessEditModal";
import { getbusinessDetails, editBusiness } from "../../../services/apiClient";

const BusinessProfileScreen = ({ businessPanel }) => {
    // State management
    const [sortOrder, setSortOrder] = useState("highest");
    const [showmore, setShowmore] = useState(false);
    const [editVisible, setEditVisible] = useState(false);
    const [currentBusiness, setCurrentBusiness] = useState(businessPanel?.business);
    
    // Images edit state
    const [imagesEditVisible, setImagesEditVisible] = useState(false);
    const [images, setImages] = useState([]);
    
    // Business timing edit state
    const [timingEditVisible, setTimingEditVisible] = useState(false);
    const [businessTimings, setBusinessTimings] = useState({});

    // Initialize business data when component mounts or businessPanel changes
    useEffect(() => {
        console.log('🔄 [BusinessProfileScreen] useEffect triggered:', { 
            hasBusinessPanel: !!businessPanel, 
            hasBusiness: !!businessPanel?.business 
        });
        
        if (businessPanel?.business) {
            console.log('📥 [BusinessProfileScreen] Setting initial business data:', {
                businessName: businessPanel.business.businessName,
                photosCount: businessPanel.business.photos?.length || 0,
                timingsCount: Object.keys(businessPanel.business.businessTimings || {}).length
            });
            
            setCurrentBusiness(businessPanel.business);
            setImages(businessPanel.business.photos || []);
            setBusinessTimings(businessPanel.business.businessTimings || {});
        }
    }, [businessPanel]);

    // Refresh business data after successful edit
    const handleBusinessUpdated = async () => {
        try {
            console.log('🔄 [BusinessProfileScreen] Refreshing business data...');
            const response = await getbusinessDetails();
            
            if (response.business) {
                console.log('✅ [BusinessProfileScreen] Business data refreshed successfully:', {
                    businessName: response.business.businessName,
                    photosCount: response.business.photos?.length || 0,
                    timingsCount: Object.keys(response.business.businessTimings || {}).length,
                    hasWhatsApp: !!response.business.contactDetails?.whatsapp
                });
                
                setCurrentBusiness(response.business);
                setImages(response.business.photos || []);
                setBusinessTimings(response.business.businessTimings || {});
            } else {
                console.warn('⚠️ [BusinessProfileScreen] No business data in response');
            }
        } catch (error) {
            console.error('❌ [BusinessProfileScreen] Failed to refresh business data:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
        }
    };

    // Handle images update
    const handleImagesUpdate = async (update) => {
        try {
            const isArrayPayload = Array.isArray(update);
            if (isArrayPayload) {
                console.log('📤 [BusinessProfileScreen] Updating images (full replace):', {
                    currentCount: images.length,
                    newCount: update.length,
                });

                const payload = { photos: update };
                const response = await editBusiness(payload);

                if (response.success) {
                    console.log('✅ [BusinessProfileScreen] Images replaced successfully');
                    setImages(update);
                    setImagesEditVisible(false);
                    Alert.alert("Success! 🎉", "Images updated successfully!");
                    await handleBusinessUpdated();
                } else {
                    console.error('❌ [BusinessProfileScreen] Images update failed:', response.error);
                    Alert.alert("Error", response.error || "Failed to update images");
                }
                return;
            }

            const addPhotos = update?.addPhotos || [];
            const removePhotos = update?.removePhotos || [];

            console.log('📤 [BusinessProfileScreen] Updating images (delta):', {
                currentCount: images.length,
                addCount: addPhotos.length,
                removeCount: removePhotos.length,
                addPreview: addPhotos.slice ? addPhotos.slice(0, 2) : addPhotos,
                removePreview: removePhotos.slice ? removePhotos.slice(0, 2) : removePhotos,
            });

            const payload = { addPhotos, removePhotos };
            const response = await editBusiness(payload);

            if (response.success) {
                console.log('✅ [BusinessProfileScreen] Image changes applied successfully');
                setImagesEditVisible(false);
                Alert.alert("Success! 🎉", "Images updated successfully!");
                await handleBusinessUpdated();
            } else {
                console.error('❌ [BusinessProfileScreen] Image changes failed:', response.error);
                Alert.alert("Error", response.error || "Failed to update images");
            }
        } catch (error) {
            console.error('❌ [BusinessProfileScreen] Images update error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            Alert.alert("Error", "Failed to update images. Please try again.");
        }
    };

    // Handle business timing update
    const handleTimingUpdate = async (newTimings) => {
        try {
            console.log('📤 [BusinessProfileScreen] Updating business timings:', {
                currentCount: Object.keys(businessTimings).length,
                newCount: Object.keys(newTimings).length,
                openDays: Object.values(newTimings).filter(t => t.isOpen).length
            });
            
            const payload = { businessTimings: newTimings };
            const response = await editBusiness(payload);
            
            if (response.success) {
                console.log('✅ [BusinessProfileScreen] Business timings updated successfully');
                setBusinessTimings(newTimings);
                setTimingEditVisible(false);
                Alert.alert("Success! 🎉", "Business timings updated successfully!");
                await handleBusinessUpdated();
            } else {
                console.error('❌ [BusinessProfileScreen] Timings update failed:', response.error);
                Alert.alert("Error", response.error || "Failed to update business timings");
            }
        } catch (error) {
            console.error('❌ [BusinessProfileScreen] Timings update error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            Alert.alert("Error", "Failed to update business timings. Please try again.");
        }
    };

    // Loading state
    if (!businessPanel || !currentBusiness) {
        console.log('⏳ [BusinessProfileScreen] Loading state - waiting for business data');
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-600 mt-4">Loading business profile...</Text>
            </View>
        );
    }

    // Constants
    const IMG_URL = "https://livecdn.dialkaraikudi.com";
    const createdDate = currentBusiness.createdDate;
    const dateObj = new Date(createdDate);
    const onlyDate = `${dateObj.getDate().toString().padStart(2, "0")}-${(dateObj.getMonth() + 1)
        .toString().padStart(2, "0")}-${dateObj.getFullYear()}`;

    const days = Object.entries(businessTimings);
    const sortedReviews = [...businessPanel.reviews].sort((a, b) =>
        sortOrder === "highest" ? b.rating - a.rating : a.rating - b.rating
    );

    console.log('🔍 [BusinessProfileScreen] Rendering with data:', {
        businessName: currentBusiness.businessName,
        imagesCount: images.length,
        timingsCount: days.length,
        reviewsCount: sortedReviews.length,
        sortOrder
    });

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header Section */}
            <View className="bg-white shadow-md p-5 rounded-b-3xl flex-row justify-between items-center">
                <View>
                    <Text className="text-3xl font-bold text-gray-800">
                        {currentBusiness.businessName}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                        Your Dialkaraikudi Journey Started on{" "}
                        <Text className="font-medium text-gray-700">{onlyDate}</Text>
                    </Text>
                </View>
            </View>

            {/* Images Section */}
            <View className="mt-5 px-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl font-semibold text-gray-800">Images</Text>
                    <TouchableOpacity 
                        onPress={() => {
                            console.log('🖼️ [BusinessProfileScreen] Opening images edit modal with:', {
                                imagesCount: images.length,
                                images: images,
                                imagesEditVisible: imagesEditVisible
                            });
                            setImagesEditVisible(true);
                        }}
                        className="px-3 py-1 bg-blue-100 rounded-lg"
                    >
                        <Text className="text-blue-600 font-medium">Edit</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                    {images.length > 0 ? (
                        images.map((src, i) => (
                        <Image
                            key={i}
                                source={{ uri: `${IMG_URL}/${src}` }}
                            resizeMode="cover"
                            className="w-40 h-28 mr-3 rounded-xl bg-gray-200"
                        />
                        ))
                    ) : (
                        <View className="w-40 h-28 mr-3 rounded-xl bg-gray-200 items-center justify-center">
                            <Text className="text-gray-500 text-center">No images</Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Business Details Section */}
            <View className="mt-6 px-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl font-semibold text-gray-800">Business Details</Text>
                    <TouchableOpacity 
                        onPress={() => {
                            console.log('✏️ [BusinessProfileScreen] Opening business edit modal');
                            setEditVisible(true);
                        }}
                        className="px-3 py-1 bg-blue-100 rounded-lg"
                    >
                        <Text className="text-blue-600 font-medium">Edit</Text>
                    </TouchableOpacity>
                </View>
                <View className="bg-white rounded-2xl p-4 shadow flex gap-3">
                    <Text className="text-lg font-bold text-gray-900">
                        {currentBusiness.businessName}
                    </Text>
                    <Text className="text-gray-700">{currentBusiness.description}</Text>
                    <Text className="font-semibold text-gray-800">
                        Email: <Text className="font-medium text-gray-600">{currentBusiness.email}</Text>
                    </Text>
                    <Text className="font-semibold text-gray-800">
                        GST No: <Text className="font-medium text-gray-600">{currentBusiness.gst || "-"}</Text>
                    </Text>
                    <Text className="font-semibold text-gray-800">
                        Phone No: <Text className="font-medium text-gray-600">{currentBusiness.contactDetails?.phone}</Text>
                    </Text>
                    <Text className="font-semibold text-gray-800">
                        WhatsApp: <Text className="font-medium text-gray-600">{currentBusiness.contactDetails?.whatsapp || "-"}</Text>
                    </Text>
                    <Text className="font-semibold text-gray-800">
                        Address: <Text className="font-medium text-gray-600">{currentBusiness.address?.formattedAddress}</Text>
                    </Text>
                </View>
            </View>

            {/* Business Timings Section */}
            <View className="mt-6 px-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl font-semibold text-gray-800">Business Timing</Text>
                    <TouchableOpacity 
                        onPress={() => {
                            console.log('⏰ [BusinessProfileScreen] Opening timing edit modal with:', {
                                timingsCount: Object.keys(businessTimings).length,
                                businessTimings: businessTimings,
                                timingEditVisible: timingEditVisible
                            });
                            setTimingEditVisible(true);
                        }}
                        className="px-3 py-1 bg-blue-100 rounded-lg"
                    >
                        <Text className="text-blue-600 font-medium">Edit</Text>
                    </TouchableOpacity>
                </View>
                <View className="bg-white rounded-2xl shadow-md divide-y divide-gray-200">
                    {days.length > 0 ? (
                        days.map(([day, { isOpen, openTime, closeTime }], index) => (
                        <View key={index} className="flex-row justify-between items-center px-4 py-3">
                            <Text className="text-base font-semibold text-gray-700 capitalize">
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                            </Text>
                            {isOpen ? (
                                <Text className="text-base text-green-600 font-medium">
                                    {openTime} - {closeTime}
                                </Text>
                            ) : (
                                <Text className="text-base text-red-500 font-medium">Closed</Text>
                            )}
                        </View>
                        ))
                    ) : (
                        <View className="px-4 py-8 items-center">
                            <Text className="text-gray-500">No business timings set</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Reviews Section */}
            <View className="mt-6 px-4 mb-10">
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-xl font-semibold text-gray-800">Reviews</Text>
                    <View className="flex-row space-x-2 gap-2">
                        <TouchableOpacity
                            onPress={() => {
                                console.log('🔍 [BusinessProfileScreen] Changing sort order to highest');
                                setSortOrder("highest");
                            }}
                            className={`px-3 py-1 rounded-full ${sortOrder === 'highest' ? 'bg-blue-500' : 'bg-gray-200'}`}
                        >
                            <Text className={sortOrder === 'highest' ? 'text-white' : 'text-gray-700'}>
                                Highest
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                console.log('🔍 [BusinessProfileScreen] Changing sort order to lowest');
                                setSortOrder("lowest");
                            }}
                            className={`px-3 py-1 rounded-full ${sortOrder === 'lowest' ? 'bg-blue-500' : 'bg-gray-200'}`}
                        >
                            <Text className={sortOrder === 'lowest' ? 'text-white' : 'text-gray-700'}>
                                Lowest
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {sortedReviews.length > 0 ? (
                    <>
                <FlatList
                    data={showmore ? sortedReviews : sortedReviews.slice(0, 3)}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View className="bg-white rounded-xl shadow p-4 mb-3">
                            <Text className="text-lg font-semibold text-gray-800">
                                {item.user?.name || "Anonymous"}
                            </Text>
                            <Text className="text-gray-500 text-sm mb-1">
                                {item.user?.email || "No email"}
                            </Text>
                            <Text className="text-yellow-500 font-bold mb-1">
                                ⭐ {item.rating}/5
                            </Text>
                            <Text className="text-gray-700">{item.comment}</Text>
                        </View>
                    )}
                            scrollEnabled={false}
                />
                    <TouchableOpacity
                            onPress={() => {
                                console.log('📖 [BusinessProfileScreen] Toggling show more reviews:', !showmore);
                                setShowmore(!showmore);
                            }}
                            className="bg-gray-200 rounded-lg py-3 items-center mt-2"
                        >
                            <Text className="text-gray-700 font-medium">
                                {showmore ? "Show Less" : `Show More (${sortedReviews.length - 3} more)`}
                        </Text>
                    </TouchableOpacity>
                    </>
                ) : (
                    <View className="bg-white rounded-xl shadow p-8 items-center">
                        <Text className="text-gray-500 text-lg">No reviews yet</Text>
                        <Text className="text-gray-400 text-sm mt-1">Be the first to review!</Text>
                    </View>
                )}
                </View>

            {/* Modals */}
            <BusinessEditModal
                visible={editVisible}
                onClose={() => setEditVisible(false)}
                business={currentBusiness}
                onBusinessUpdated={handleBusinessUpdated}
            />

            <ImagesEditModal
                visible={imagesEditVisible}
                onClose={() => setImagesEditVisible(false)}
                images={images || []}
                onUpdate={handleImagesUpdate}
            />

            <BusinessTimingEditModal
                visible={timingEditVisible}
                onClose={() => setTimingEditVisible(false)}
                timings={businessTimings || {}}
                onUpdate={handleTimingUpdate}
            />
        </ScrollView>
    );
};

export default BusinessProfileScreen;
