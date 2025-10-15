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
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import BusinessEditModal from "./BusinessEditModal";
import ImagesEditModal from "./ImagesEditModal";
import BusinessTimingEditModal from "./BusinessTimingEditModal";
import { getbusinessDetails, editBusiness, deleteAccount } from "../../../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Trash2 } from "react-native-feather";

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

    // Account deletion state
    const [deletingAccount, setDeletingAccount] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState(null);
    const [customReason, setCustomReason] = useState("");

    const navigation = useNavigation();
    const deleteReasons = [
        'I no longer need the service',
        'I had a bad experience',
        'Privacy or security concerns',
        'I get too many emails/notifications',
        'I found a better alternative',
        'Just taking a break',
        'Other',
    ];


    // Initialize business data when component mounts or businessPanel changes
    useEffect(() => {


        if (businessPanel?.business) {

            setCurrentBusiness(businessPanel.business);
            setImages(businessPanel.business.photos || []);
            setBusinessTimings(businessPanel.business.businessTimings || {});
        }
    }, [businessPanel]);

    // Refresh business data after successful edit
    const handleBusinessUpdated = async () => {
        try {
            const response = await getbusinessDetails();

            if (response.business) {
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
    const handleImagesUpdate = async (formData) => {
        try {

            // ImagesEditModal now handles the API call directly
            // This function is kept for backward compatibility but simplified

            // Refresh business data to get updated images
            await handleBusinessUpdated();

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


            const payload = { businessTimings: newTimings };
            const response = await editBusiness(payload);

            if (response.success) {
                setBusinessTimings(newTimings);
                setTimingEditVisible(false);
                Alert.alert("Success!", "Business timings updated successfully!");
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

    // Handle account deletion
    const handleDeleteAccount = async () => {
        const finalReason = selectedReason === 'Other' ? customReason : selectedReason;
        Alert.alert(
            "Confirm Account Deletion",
            "Are you sure you want to permanently delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setDeletingAccount(true);
                        try {
                            const result = await deleteAccount(finalReason || "Business profile delete request");
                            if (result?.businessdeleted) {
                                Alert.alert("Account Deleted", "Your account has been deleted successfully.");
                                await AsyncStorage.clear();
                                setDeleteModalOpen(false);
                                setSelectedReason(null);
                                setCustomReason("");
                                navigation.replace("Landing");
                            } else {
                                Alert.alert("Error", result?.message || "Failed to delete account.");
                            }
                        } catch (error) {
                            console.error('❌ [BusinessProfileScreen] Account deletion error:', {
                                message: error.message,
                                response: error.response?.data,
                                status: error.response?.status
                            });
                            Alert.alert("Error", error?.message || "Something went wrong.");
                        } finally {
                            setDeletingAccount(false);
                        }
                    }
                }
            ]
        );
    };

    // Loading state
    if (!businessPanel || !currentBusiness) {
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

            {/* Danger Zone - Account Deletion */}
            <View className="px-4 mb-16">
                <View className="bg-white rounded-2xl p-5 shadow border border-red-200">
                    <Text className="text-xl font-semibold text-red-700 mb-2">Danger Zone</Text>
                    <Text className="text-gray-600 mb-4">
                        Deleting your account will permanently remove your business profile, images, and associated data. This action cannot be undone.
                    </Text>
                    <TouchableOpacity
                        onPress={() => setDeleteModalOpen(true)}
                        disabled={deletingAccount}
                        className={`flex-row items-center justify-center py-4 rounded-xl ${deletingAccount ? 'bg-red-600 opacity-70' : 'bg-red-600'}`}
                    >
                        {deletingAccount ? (
                            <>
                                <ActivityIndicator size="small" color="#ffffff" />
                                <Text className="text-white font-semibold text-lg ml-2">Deleting…</Text>
                            </>
                        ) : (
                            <>
                                <Trash2 color="#ffffff" width={20} height={20} />
                                <Text className="text-white font-semibold text-lg ml-2">Delete My Account</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Delete Account Modal */}
            <Modal
                visible={deleteModalOpen}
                transparent={true}
                animationType="slide"
                onRequestClose={() => {
                    if (deletingAccount) return;
                    setDeleteModalOpen(false);
                    setSelectedReason(null);
                    setCustomReason("");
                }}
            >
                <KeyboardAvoidingView
                    className="flex-1 bg-black/60 justify-end"
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View className="bg-white rounded-t-3xl px-6 py-8 h-[90%]">
                        {/* Header */}
                        <View className="items-center mb-6">
                            <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-4">
                                <Trash2 color="#ef4444" width={24} height={24} />
                            </View>
                            <Text className="text-2xl font-bold text-slate-900 mb-2">
                                Delete Account
                            </Text>
                            <Text className="text-slate-600 text-center leading-5">
                                We're sorry to see you go. Please tell us why you're deleting your account so we can improve our service.
                            </Text>
                        </View>

                        {/* Reasons List */}
                        <View className="mb-6 flex-1">
                            <Text className="text-lg font-semibold text-slate-900 mb-4">
                                Why are you leaving?
                            </Text>
                            <FlatList
                                data={deleteReasons}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        className={`py-4 px-4 rounded-xl mb-3 border-2 ${
                                            selectedReason === item
                                                ? 'bg-red-50 border-red-500'
                                                : 'bg-slate-50 border-slate-200'
                                        }`}
                                        onPress={() => !deletingAccount && setSelectedReason(item)}
                                        disabled={deletingAccount}
                                    >
                                        <Text
                                            className={`text-center ${
                                                selectedReason === item
                                                    ? 'text-red-700 font-semibold'
                                                    : 'text-slate-700'
                                            }`}
                                        >
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                                className="flex-1"
                            />
                        </View>

                        {/* Custom Input for "Other" */}
                        {selectedReason === 'Other' && (
                            <View className="mb-6">
                                <Text className="text-lg font-semibold text-slate-900 mb-3">
                                    Please tell us more
                                </Text>
                                <TextInput
                                    className="bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-4 text-slate-900 text-base"
                                    placeholder="Share your reason..."
                                    placeholderTextColor="#64748b"
                                    value={customReason}
                                    onChangeText={text => !deletingAccount && setCustomReason(text)}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    style={{ minHeight: 100 }}
                                    editable={!deletingAccount}
                                />
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                className="flex-1 py-4 rounded-xl bg-slate-200"
                                onPress={() => {
                                    if (deletingAccount) return;
                                    setDeleteModalOpen(false);
                                    setSelectedReason(null);
                                    setCustomReason("");
                                }}
                                disabled={deletingAccount}
                            >
                                <Text className="text-center text-slate-700 font-semibold text-lg">
                                    {deletingAccount ? 'Please wait…' : 'Cancel'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className={`flex-1 py-4 rounded-xl ${
                                    selectedReason && (selectedReason !== 'Other' || customReason.trim())
                                        ? (deletingAccount ? 'bg-red-600 opacity-70' : 'bg-red-600')
                                        : 'bg-slate-400'
                                }`}
                                onPress={handleDeleteAccount}
                                disabled={
                                    deletingAccount ||
                                    !selectedReason ||
                                    (selectedReason === 'Other' && !customReason.trim())
                                }
                            >
                                {deletingAccount ? (
                                    <View className="flex-row items-center justify-center">
                                        <ActivityIndicator size="small" color="#ffffff" />
                                        <Text className="text-center text-white font-semibold text-lg ml-2">
                                            Deleting…
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-center text-white font-semibold text-lg">
                                        Delete Account
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
