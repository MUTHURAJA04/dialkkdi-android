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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { X, Save, Edit3 } from "react-native-feather";
import {
    editBusiness,
    getArea,
    getCities,
} from "../../../services/apiClient";

// Main Business Edit Modal Component
const BusinessEditModal = ({ visible, onClose, business, onBusinessUpdated }) => {
    const [form, setForm] = useState({});
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [originalBusiness, setOriginalBusiness] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form when modal opens or business changes
    useEffect(() => {

        if (visible && business) {


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

            setForm(newForm);
        }
    }, [visible, business]);

    // Load cities on mount
    useEffect(() => {
        loadCities();
    }, []);

    // Load areas when city changes
    useEffect(() => {
        // Reset area selection on city change
        setForm(prev => ({ ...prev, area: "" }));
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
            const parsed = Array.isArray(areaData?.data) ? areaData.data : (Array.isArray(areaData) ? areaData : []);
            setAreas(parsed);
        } catch (error) {
            console.error("Failed to load areas:", error);
        }
    };

    // Auto-select first area when areas list loads (per user request)
    // useEffect(() => {
    //     if (form.city && areas.length > 0 && !form.area) {
    //         const first = `${areas[0]._id || areas[0].id}`;
    //         setForm(prev => ({ ...prev, area: first }));
    //     }
    // }, [areas, form.city]);



    const handleChange = (field, value) => {
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

            const response = await editBusiness(payload);

            if (response.success) {

                // Call the callback to refresh parent component
                if (onBusinessUpdated) {
                    await onBusinessUpdated();
                }

                Alert.alert(
                    "Success!",
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
                                        onValueChange={(value, index) => {
                                            handleChange("city", value);
                                        }}
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
                        {/* Area */}
<View className="mb-4">
    <Text className="text-sm font-semibold text-gray-700 mb-2">
        Area *
    </Text>
    <View className="border border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
        <Picker
            key={form.city || 'no-city'}
            selectedValue={form.area || ""}
            onValueChange={(value) => {
                handleChange("area", value);
            }}
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
            />
            {areas.map((area) => (
                <Picker.Item
                    key={area._id || area.id}
                    label={area.name}
                    value={area._id || area.id}
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

export default BusinessEditModal;


