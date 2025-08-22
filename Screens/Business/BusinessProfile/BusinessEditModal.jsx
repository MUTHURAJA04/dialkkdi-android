import { useEffect, useState } from "react";
import {
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
    Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { X, Save, Edit3, Plus, Trash2, Clock } from "react-native-feather";
import { launchImageLibrary } from 'react-native-image-picker';
import {
    editBusiness,
    getArea,
    getbusinessDetails,
    getCities,
    uploadBusinessImage,
    deleteBusinessImage,
} from "../../../services/apiClient";

// Constants
const IMAGE_PREFIX = "https://livecdn.dialkaraikudi.com/";

// Main Business Edit Modal Component
const BusinessEditModal = ({ visible, onClose, business, onBusinessUpdated }) => {
    const [form, setForm] = useState({});
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [originalBusiness, setOriginalBusiness] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form when modal opens or business changes
    useEffect(() => {
        console.log('🔄 [BusinessEditModal] useEffect triggered:', { visible, hasBusiness: !!business });
        
        if (visible && business) {
            console.log('📥 [BusinessEditModal] Business data received:', business);
            console.log('📥 [BusinessEditModal] Contact details:', business.contactDetails);
            console.log('📥 [BusinessEditModal] Address details:', business.address);
            
            setOriginalBusiness(business);
            
            const newForm = {
                businessName: business.businessName || "",
                description: business.description || "",
                email: business.email || "",
                gst: business.gst || "",
                phone: business.contactDetails?.phone || "",
                whatsapp: business.contactDetails?.whatsapp || "",
                address: business.address?.addressArea || "",
                city: business.address?.city?._id || "",
                area: business.address?.area?._id || "",
                pincode: business.address?.pincode || "",
            };
            
            console.log('📝 [BusinessEditModal] Form initialized with:', newForm);
            setForm(newForm);
        }
    }, [visible, business]);

    // Load cities on mount
    useEffect(() => {
        loadCities();
    }, []);

    // Load areas when city changes
    useEffect(() => {
        if (form.city) {
            loadAreas(form.city);
        } else {
            setAreas([]);
        }
    }, [form.city]);

    const loadCities = async () => {
        try {
            const cityData = await getCities();
            setCities(cityData || []);
        } catch (error) {
            console.error("Failed to load cities:", error);
        }
    };

    const loadAreas = async (cityId) => {
        try {
            const areaData = await getArea(cityId);
            setAreas(areaData || []);
        } catch (error) {
            console.error("Failed to load areas:", error);
        }
    };

    const handleChange = (field, value) => {
        console.log(`🔄 [BusinessEditModal] handleChange: ${field} = "${value}"`);
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        if (originalBusiness) {
            const resetForm = {
                businessName: originalBusiness.businessName || "",
                description: originalBusiness.description || "",
                email: originalBusiness.email || "",
                gst: originalBusiness.gst || "",
                phone: originalBusiness.contactDetails?.phone || "",
                whatsapp: originalBusiness.contactDetails?.whatsapp || "",
                address: originalBusiness.address?.addressArea || "",
                city: originalBusiness.address?.city?._id || "",
                area: originalBusiness.address?.area?._id || "",
                pincode: originalBusiness.address?.pincode || "",
            };
            console.log('🔄 [BusinessEditModal] Resetting form to:', resetForm);
            setForm(resetForm);
        }
        onClose();
    };

    const validateForm = () => {
        if (!form.businessName?.trim()) {
            Alert.alert("Error", "Business name is required!");
            return false;
        }
        if (!form.email?.trim()) {
            Alert.alert("Error", "Email is required!");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            Alert.alert("Error", "Please enter a valid email address!");
            return false;
        }

        if (!form.phone?.trim()) {
            Alert.alert("Error", "Phone number is required!");
            return false;
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(form.phone)) {
            Alert.alert("Error", "Please enter a valid 10-digit phone number!");
            return false;
        }

        if (form.whatsapp && !phoneRegex.test(form.whatsapp)) {
            Alert.alert("Error", "Please enter a valid 10-digit WhatsApp number!");
            return false;
        }

        if (form.gst && form.gst.length !== 15) {
            Alert.alert("Error", "GST number must be exactly 15 characters!");
            return false;
        }

        if (!form.city) {
            Alert.alert("Error", "Please select a city!");
            return false;
        }

        if (!form.area) {
            Alert.alert("Error", "Please select an area!");
            return false;
        }

        if (!form.address?.trim()) {
            Alert.alert("Error", "Address is required!");
            return false;
        }

        if (!form.pincode || form.pincode.length !== 6) {
            Alert.alert("Error", "Please enter a valid 6-digit pincode!");
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const cityName = cities.find(c => c._id === form.city)?.name || "";
            const areaName = areas.find(a => a._id === form.area)?.name || "";
            const formattedAddress = `${form.address}, ${areaName}, ${cityName}, Tamil Nadu ${form.pincode}`;

            const payload = {
                businessName: form.businessName.trim(),
                description: form.description.trim(),
                email: form.email.trim(),
                gst: form.gst.trim(),
                contactDetails: {
                    ...originalBusiness?.contactDetails,
                    phone: form.phone.trim(),
                    whatsapp: form.whatsapp.trim(),
                },
                address: {
                    ...originalBusiness?.address,
                    addressArea: form.address.trim(),
                    city: form.city,
                    area: form.area,
                    state: "Tamil Nadu",
                    pincode: form.pincode.trim(),
                    formattedAddress,
                },
            };

            console.log('📤 [BusinessEditModal] Submitting payload:', payload);
            const response = await editBusiness(payload);
            
            if (response.success) {
                console.log('✅ [BusinessEditModal] Business updated successfully');
                
                // Call the callback to refresh parent component
                if (onBusinessUpdated) {
                    await onBusinessUpdated();
                }
                
                Alert.alert(
                    "Success! 🎉",
                    "Business details updated successfully!",
                    [{ text: "OK", onPress: onClose }]
                );
            } else {
                Alert.alert("Error", response.error || "Failed to update business details");
            }
        } catch (error) {
            console.error("Update failed:", error);
            Alert.alert("Error", "Failed to update business details. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Debug: Log current form state
    console.log('🔍 [BusinessEditModal] Current form state:', form);
    console.log('🔍 [BusinessEditModal] Business prop:', business);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleCancel}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 bg-black/50">
                    {/* Header */}
                    <View className="flex-row items-center justify-between bg-white px-6 py-4 rounded-t-3xl mt-20">
                        <View className="flex-row items-center">
                            <Edit3 size={24} color="#3B82F6" />
                            <Text className="text-xl font-bold text-gray-800 ml-3">
                                Edit Business Details
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleCancel}
                            className="p-2 rounded-full bg-gray-100"
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <X size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Form Content */}
                    <View className="flex-1 bg-white rounded-t-3xl -mt-2">
                        <ScrollView
                            className="flex-1 px-6"
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Business Name */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Business Name *
                                </Text>
                                <TextInput
                                    placeholder="Enter business name"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.businessName || ""}
                                    onChangeText={(text) => handleChange("businessName", text)}
                                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
                                    autoCapitalize="words"
                                />
                                <Text className="text-xs text-gray-500 mt-1">
                                    Current: {business?.businessName || "Not set"}
                                </Text>
                            </View>

                            {/* Description */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </Text>
                                <TextInput
                                    placeholder="Describe your business"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.description || ""}
                                    onChangeText={(text) => handleChange("description", text)}
                                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
                                    multiline={true}
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                                <Text className="text-xs text-gray-500 mt-1">
                                    Current: {business?.description || "Not set"}
                                </Text>
                            </View>

                            {/* Email */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Email Address *
                                </Text>
                                <TextInput
                                    placeholder="business@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.email || ""}
                                    onChangeText={(text) => handleChange("email", text)}
                                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <Text className="text-xs text-gray-500 mt-1">
                                    Current: {business?.email || "Not set"}
                                </Text>
                            </View>

                            {/* Phone */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number *
                                </Text>
                                <TextInput
                                    placeholder="Enter 10-digit phone number"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.phone || ""}
                                    onChangeText={(text) => handleChange("phone", text)}
                                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                                <Text className="text-xs text-gray-500 mt-1">
                                    Current: {business?.contactDetails?.phone || "Not set"}
                                </Text>
                            </View>

                            {/* WhatsApp */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    WhatsApp Number
                                </Text>
                                <TextInput
                                    placeholder="Enter 10-digit WhatsApp number"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.whatsapp || ""}
                                    onChangeText={(text) => handleChange("whatsapp", text)}
                                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    autoCorrect={false}
                                />
                                <Text className="text-xs text-gray-500 mt-1">
                                    Current: {business?.contactDetails?.whatsapp || "Not set"}
                                </Text>
                            </View>

                            {/* GST */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    GST Number
                                </Text>
                                <TextInput
                                    placeholder="Enter 15-character GST number"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.gst || ""}
                                    onChangeText={(text) => handleChange("gst", text)}
                                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
                                    autoCapitalize="characters"
                                    autoCorrect={false}
                                    maxLength={15}
                                />
                                <Text className="text-xs text-gray-500 mt-1">
                                    Current: {business?.gst || "Not set"}
                                </Text>
                            </View>

                            {/* Address */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Address *
                                </Text>
                                <TextInput
                                    placeholder="Enter your business address"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.address || ""}
                                    onChangeText={(text) => handleChange("address", text)}
                                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
                                    multiline={true}
                                    numberOfLines={2}
                                    textAlignVertical="top"
                                />
                                <Text className="text-xs text-gray-500 mt-1">
                                    Current: {business?.address?.addressArea || "Not set"}
                                </Text>
                            </View>

                            {/* City */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    City *
                                </Text>
                                <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                                    <Picker
                                        selectedValue={form.city || ""}
                                        onValueChange={(value) => handleChange("city", value)}
                                        style={{
                                            color: "#374151",
                                            fontSize: 16,
                                            height: Platform.OS === "ios" ? 200 : 50,
                                        }}
                                    >
                                        <Picker.Item label="Select a city" value="" enabled={false} />
                                        {cities.map((city) => (
                                            <Picker.Item
                                                key={city._id}
                                                label={city.name}
                                                value={city._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                                <Text className="text-xs text-gray-500 mt-1">
                                    Current: {business?.address?.city?.name || "Not set"}
                                </Text>
                            </View>

                            {/* Area */}
                            <View className="mb-4">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Area *
                                </Text>
                                <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                                    <Picker
                                        selectedValue={form.area || ""}
                                        onValueChange={(value) => handleChange("area", value)}
                                        enabled={!!form.city}
                                        style={{
                                            color: "#374151",
                                            fontSize: 16,
                                            height: Platform.OS === "ios" ? 200 : 50,
                                        }}
                                    >
                                        <Picker.Item
                                            label={form.city ? "Select an area" : "Select a city first"}
                                            value=""
                                            enabled={false}
                                        />
                                        {areas.map((area) => (
                                            <Picker.Item
                                                key={area._id}
                                                label={area.name}
                                                value={area._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>
                                <Text className="text-xs text-gray-500 mt-1">
                                    Current: {business?.address?.area?.name || "Not set"}
                                </Text>
                            </View>

                            {/* Pincode */}
                            <View className="mb-6">
                                <Text className="text-sm font-semibold text-gray-700 mb-2">
                                    Pincode *
                                </Text>
                                <TextInput
                                    placeholder="Enter 6-digit pincode"
                                    placeholderTextColor="#9CA3AF"
                                    value={form.pincode || ""}
                                    onChangeText={(text) => handleChange("pincode", text)}
                                    className="border border-gray-300 rounded-xl px-4 py-3 text-gray-800 bg-gray-50"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                                <Text className="text-xs text-gray-500 mt-1">
                                    Current: {business?.address?.pincode || "Not set"}
                                </Text>
                            </View>
                        </ScrollView>

                        {/* Action Buttons */}
                        <View className="px-6 pb-6 pt-4 border-t border-gray-200">
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    className="flex-1 bg-gray-200 rounded-xl py-4 items-center"
                                    disabled={isSubmitting}
                                >
                                    <Text className="text-gray-700 font-semibold text-base">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    className="flex-1 bg-blue-500 rounded-xl py-4 items-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <View className="flex-row items-center">
                                            <Save size={18} color="white" />
                                            <Text className="text-white font-semibold text-base ml-2">
                                                Save Changes
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// Images Edit Modal Component
export const ImagesEditModal = ({ visible, onClose, images = [], onUpdate }) => {
    const [localImages, setLocalImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImages, setUploadingImages] = useState([]);

    // Build full image URL - handles both server URLs and local file URIs
    const resolveImageUri = (src) => {
        if (!src) return null;
        
        // If it's already a full URL (http/https), return as is
        if (src.startsWith("http")) {
            return src;
        }
        
        // If it's a local file URI (file://), return as is
        if (src.startsWith("file://")) {
            return src;
        }
        
        // If it's a relative path, add the IMAGE_PREFIX
        return `${IMAGE_PREFIX}${src}`;
    };

    useEffect(() => {
        if (visible) {
            console.log('🖼️ [ImagesEditModal] Modal opened with images:', { 
                count: images?.length || 0, 
                images: images 
            });
            setLocalImages([...images]);
            setUploadingImages([]);
        }
    }, [visible, images]);

    const handleAddImage = () => {
        const options = {
            mediaType: "photo",
            quality: 0.8,
            maxWidth: 1024,
            maxHeight: 1024,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel || !response.assets?.[0]?.uri) return;

            const newImage = response.assets[0];
            console.log('📸 [ImagesEditModal] New image selected:', {
                uri: newImage.uri,
                type: newImage.type,
                size: newImage.fileSize
            });
            
            // Add to local images immediately for UI feedback
            setLocalImages((prev) => {
                const updated = [...prev, newImage.uri];
                console.log('📸 [ImagesEditModal] Added to local images:', {
                    count: updated.length,
                    images: updated
                });
                return updated;
            });

            // Mark as uploading
            setUploadingImages(prev => [...prev, newImage.uri]);

            // Upload to server
            try {
                console.log('📤 [ImagesEditModal] Uploading image to server:', newImage.uri);
                const uploadResult = await uploadBusinessImage(newImage.uri);
                
                if (uploadResult.success) {
                    console.log('✅ [ImagesEditModal] Image uploaded successfully:', uploadResult.data);
                    
                    // Replace local URI with server path
                    setLocalImages((prev) => {
                        const updated = prev.map(img => 
                            img === newImage.uri ? uploadResult.data.imagePath : img
                        );
                        console.log('✅ [ImagesEditModal] Updated with server path:', {
                            count: updated.length,
                            images: updated
                        });
                        return updated;
                    });
                } else {
                    console.error('❌ [ImagesEditModal] Upload failed:', uploadResult.error);
                    Alert.alert("Upload Failed", uploadResult.error || "Failed to upload image");
                    
                    // Remove from local images if upload failed
                    setLocalImages((prev) => prev.filter(img => img !== newImage.uri));
                }
            } catch (error) {
                console.error('❌ [ImagesEditModal] Upload error:', error);
                Alert.alert("Upload Error", "Failed to upload image. Please try again.");
                
                // Remove from local images if upload failed
                setLocalImages((prev) => prev.filter(img => img !== newImage.uri));
            } finally {
                // Remove from uploading list
                setUploadingImages(prev => prev.filter(img => img !== newImage.uri));
            }
        });
    };

    const handleRemoveImage = (index) => {
        const imageToRemove = localImages[index];
        console.log('🗑️ [ImagesEditModal] Removing image at index:', index, 'Image:', imageToRemove);
        
        Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    // If it's a server image (not a local file URI), delete from server
                    if (imageToRemove && !imageToRemove.startsWith('file://')) {
                        try {
                            console.log('🗑️ [ImagesEditModal] Deleting from server:', imageToRemove);
                            const deleteResult = await deleteBusinessImage(imageToRemove);
                            
                            if (deleteResult.success) {
                                console.log('✅ [ImagesEditModal] Image deleted from server successfully');
                            } else {
                                console.error('❌ [ImagesEditModal] Server delete failed:', deleteResult.error);
                                Alert.alert("Delete Warning", "Image removed locally but failed to delete from server");
                            }
                        } catch (error) {
                            console.error('❌ [ImagesEditModal] Delete error:', error);
                            Alert.alert("Delete Error", "Failed to delete image from server");
                        }
                    }
                    
                    // Remove from local state
                    setLocalImages((prev) => {
                        const updated = prev.filter((_, i) => i !== index);
                        console.log('🗑️ [ImagesEditModal] Image removed from local state, updated count:', updated.length);
                        return updated;
                    });
                },
            },
        ]);
    };

    const handleSave = async () => {
        if (localImages.length === 0) {
            Alert.alert("Error", "Please add at least one image");
            return;
        }

        // Check if any images are still uploading
        if (uploadingImages.length > 0) {
            Alert.alert("Please Wait", "Some images are still uploading. Please wait for them to complete.");
            return;
        }

        console.log('💾 [ImagesEditModal] Saving images:', {
            count: localImages.length,
            images: localImages
        });

        setIsSubmitting(true);
        try {
            await onUpdate(localImages);
        } catch (error) {
            console.error('❌ [ImagesEditModal] Save failed:', error);
            Alert.alert("Error", "Failed to save images. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-center items-center">
                <View
                    className="bg-white w-11/12 rounded-2xl p-5"
                    style={{ maxHeight: "90%", minHeight: "60%" }}
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-gray-800">Edit Images</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="p-2 rounded-full bg-gray-100"
                        >
                            <X size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Images Grid */}
                    <View className="flex-1">
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ flexGrow: 1 }}
                        >
                            <View className="flex-row flex-wrap gap-3 mb-4">
                                {/* Existing Images */}
                                {localImages.map((src, index) => {
                                    const resolved = resolveImageUri(src);
                                    const isUploading = uploadingImages.includes(src);
                                    const isLocalFile = src?.startsWith('file://');
                                    
                                    console.log('🖼️ [ImagesEditModal] Rendering thumbnail:', { 
                                        index, 
                                        originalSrc: src, 
                                        resolvedUri: resolved,
                                        isLocalFile,
                                        isServerUrl: src?.startsWith('http'),
                                        isUploading
                                    });
                                    
                                    return (
                                        <View key={index} className="relative">
                                            <Image
                                                source={{ uri: resolved }}
                                                className="w-24 h-24 rounded-lg bg-gray-200"
                                                resizeMode="cover"
                                                onLoad={() => console.log('✅ [ImagesEditModal] Thumbnail loaded successfully:', { index, resolved })}
                                                onError={(e) => console.warn('❌ [ImagesEditModal] Thumbnail load failed:', { 
                                                    index, 
                                                    resolved, 
                                                    error: e?.nativeEvent?.error,
                                                    originalSrc: src
                                                })}
                                            />
                                            
                                            {/* Upload Progress Overlay */}
                                            {isUploading && (
                                                <View className="absolute inset-0 bg-black/50 rounded-lg justify-center items-center">
                                                    <ActivityIndicator color="white" size="small" />
                                                    <Text className="text-white text-xs mt-1">Uploading...</Text>
                                                </View>
                                            )}
                                            
                                            {/* Remove Button */}
                                            <TouchableOpacity
                                                onPress={() => handleRemoveImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                                hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                                                disabled={isUploading}
                                            >
                                                <Trash2 size={16} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}

                                {/* Add Image Button */}
                                <TouchableOpacity
                                    onPress={handleAddImage}
                                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg justify-center items-center bg-gray-50"
                                >
                                    <Plus size={24} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            {/* Image Count */}
                            <View className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-2">
                                <Text className="text-sm text-blue-700 text-center">
                                    {localImages.length} image
                                    {localImages.length !== 1 ? "s" : ""} selected
                                </Text>
                            </View>
                        </ScrollView>

                        {/* Action Buttons */}
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                onPress={onClose}
                                className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
                                disabled={isSubmitting}
                            >
                                <Text className="text-gray-700 font-semibold">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSave}
                                className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
                                disabled={isSubmitting || localImages.length === 0}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text className="text-white font-semibold">Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// Business Timing Edit Modal Component
export const BusinessTimingEditModal = ({ visible, onClose, timings, onUpdate }) => {
    const [localTimings, setLocalTimings] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const timeSlots = [
        '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
        '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
    ];

    useEffect(() => {
        if (visible) {
            console.log('⏰ [BusinessTimingEditModal] Modal opened with timings:', {
                count: Object.keys(timings).length,
                openDays: Object.values(timings).filter(t => t.isOpen).length
            });
            
            // Initialize with default timings if none exist
            const defaultTimings = {};
            days.forEach(day => {
                defaultTimings[day] = timings[day] || { 
                    isOpen: false, 
                    openTime: "09:00", 
                    closeTime: "18:00" 
                };
            });
            setLocalTimings(defaultTimings);
        }
    }, [visible, timings]);

    const handleTimingChange = (day, field, value) => {
        console.log('🔄 [BusinessTimingEditModal] Timing change:', { day, field, value });
        setLocalTimings(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        console.log('💾 [BusinessTimingEditModal] Saving timing changes:', {
            currentCount: Object.keys(timings).length,
            newCount: Object.keys(localTimings).length,
            openDays: Object.values(localTimings).filter(t => t.isOpen).length
        });

        setIsSubmitting(true);
        try {
            await onUpdate(localTimings);
            console.log('✅ [BusinessTimingEditModal] Timings saved successfully');
        } catch (error) {
            console.error('❌ [BusinessTimingEditModal] Failed to save timings:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        console.log('🚪 [BusinessTimingEditModal] Modal closing');
        onClose();
    };

    if (!visible) return null;

    console.log('🔍 [BusinessTimingEditModal] Rendering modal with:', {
        visible,
        localTimingsCount: Object.keys(localTimings).length,
        isSubmitting,
        timingsProp: timings,
        timingsKeys: Object.keys(timings || {})
    });

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="bg-white w-11/12 rounded-2xl p-5" style={{ maxHeight: '90%', minHeight: '60%' }}>
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <Clock size={24} color="#3B82F6" />
                                <Text className="text-xl font-bold text-gray-800 ml-3">Edit Business Timings</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={handleClose}
                                className="p-2 rounded-full bg-gray-100"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <X size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Timings List */}
                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            {/* Debug Info */}
                            <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4">
                                <Text className="text-sm text-yellow-700 text-center">
                                    Debug: {Object.keys(localTimings).length} days configured
                                </Text>
                            </View>
                            
                            {days.map((day) => {
                                const dayTiming = localTimings[day] || { isOpen: false, openTime: "09:00", closeTime: "18:00" };
                                
                                return (
                                    <View key={day} className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                                        <View className="flex-row items-center justify-between mb-3">
                                            <Text className="text-lg font-semibold text-gray-800 capitalize">
                                                {day.charAt(0).toUpperCase() + day.slice(1)}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => handleTimingChange(day, 'isOpen', !dayTiming.isOpen)}
                                                className={`px-4 py-2 rounded-full ${dayTiming.isOpen ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}
                                            >
                                                <Text className={`font-medium ${dayTiming.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                                                    {dayTiming.isOpen ? '🟢 Open' : '🔴 Closed'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {dayTiming.isOpen && (
                                            <View className="space-y-3">
                                                <View>
                                                    <Text className="text-sm font-medium text-gray-600 mb-2">Opening Time</Text>
                                                    <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                                        <Picker
                                                            selectedValue={dayTiming.openTime}
                                                            onValueChange={(value) => handleTimingChange(day, 'openTime', value)}
                                                            style={{
                                                                color: "#374151",
                                                                fontSize: 16,
                                                                height: Platform.OS === "ios" ? 150 : 50,
                                                            }}
                                                        >
                                                            {timeSlots.map((time) => (
                                                                <Picker.Item
                                                                    key={time}
                                                                    label={time}
                                                                    value={time}
                                                                />
                                                            ))}
                                                        </Picker>
                                                    </View>
                                                </View>

                                                <View>
                                                    <Text className="text-sm font-medium text-gray-600 mb-2">Closing Time</Text>
                                                    <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                                        <Picker
                                                            selectedValue={dayTiming.closeTime}
                                                            onValueChange={(value) => handleTimingChange(day, 'closeTime', value)}
                                                            style={{
                                                                color: "#374151",
                                                                fontSize: 16,
                                                                height: Platform.OS === "ios" ? 150 : 50,
                                                            }}
                                                        >
                                                            {timeSlots.map((time) => (
                                                                <Picker.Item
                                                                    key={time}
                                                                    label={time}
                                                                    value={time}
                                                                />
                                                            ))}
                                                        </Picker>
                                                    </View>
                                                </View>

                                                <View className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                    <Text className="text-xs text-blue-700 text-center">
                                                        Business Hours: {dayTiming.openTime} - {dayTiming.closeTime}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-3 mt-4">
                        <TouchableOpacity
                            onPress={handleClose}
                            className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
                            disabled={isSubmitting}
                        >
                            <Text className="text-gray-700 font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            onPress={handleSave}
                            className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text className="text-white font-semibold">Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default BusinessEditModal;


