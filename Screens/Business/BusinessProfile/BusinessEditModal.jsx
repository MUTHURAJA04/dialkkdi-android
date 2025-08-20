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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
    editBusiness,
    getArea,
    getbusinessDetails,
    getCities,
} from "../../../services/apiClient";

const BusinessEditModal = ({ visible, onClose }) => {
    const [form, setForm] = useState(null); // will fill after API call
    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);
    const [originalBusiness, setOriginalBusiness] = useState(null); // for cancel reset

    // 🟢 Fetch business on open
    useEffect(() => {
        if (visible) {
            getBusiness();
        }
    }, [visible]);

    const getBusiness = async () => {
        try {
            const res = await getbusinessDetails();
            const business = res.business;
            console.log(business, "get business 12412353253253")
            setOriginalBusiness(business); // keep original snapshot
            setForm({
                businessName: business.businessName || "",
                description: business.description || "",
                email: business.email || "",
                gst: business.gst || "",
                phone: business.contactDetails?.phone || "",
                whatsapp: business.contactDetails?.whatsup || "",
                address: business.address?.addressArea || "",
                city: business.address?.city?._id || "",
                area: business.address?.area?._id || "",
                pincode: business.address?.pincode || "",
            });
        } catch (error) {
            console.log(error);
        }
    };

    // 🟢 Fetch Cities
    useEffect(() => {
        (async () => {
            try {
                const cityData = await getCities();
                setCities(cityData);
            } catch {
                Alert.alert("Error", "Failed to load cities");
            }
        })();
    }, []);

    // 🟢 Fetch Areas when city changes
    useEffect(() => {
        if (!form?.city) {
            setAreas([]);
            return;
        }
        (async () => {
            try {
                const areaData = await getArea(form.city);
                setAreas(areaData);
            } catch {
                Alert.alert("Error", "Failed to load areas");
            }
        })();
    }, [form?.city]);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    // 🟢 Cancel → reset from originalBusiness
    const handleCancel = () => {
        if (originalBusiness) {
            setForm({
                businessName: originalBusiness.businessName || "",
                description: originalBusiness.description || "",
                email: originalBusiness.email || "",
                gst: originalBusiness.gst || "",
                phone: originalBusiness.contactDetails?.phone || "",
                whatsapp: originalBusiness.contactDetails?.whatsup || "",
                address: originalBusiness.address?.addressArea || "",
                city: originalBusiness.address?.city?._id || "",
                area: originalBusiness.address?.area?._id || "",
                pincode: originalBusiness.address?.pincode || "",
            });
        }
        onClose();
    };

    const handleSubmit = async () => {
        if (!form) return;

        // 🟢 Simple validations
        if (!form.businessName.trim())
            return Alert.alert("Error", "Business name is required!");
        if (!form.email.trim())
            return Alert.alert("Error", "Email is required!");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email))
            return Alert.alert("Error", "Enter a valid email!");

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(form.phone))
            return Alert.alert("Error", "Enter a valid Phone Number!");

        if (form.whatsapp && !phoneRegex.test(form.whatsapp))
            return Alert.alert("Error", "Enter a valid WhatsApp Number!");

        const gstRegex = /^[0-9A-Z]{15}$/;
        if (form.gst && !gstRegex.test(form.gst))
            return Alert.alert("Error", "Enter a valid 15-character GST number!");

        if (!form.city) return Alert.alert("Error", "Please select a city!");
        if (!form.area) return Alert.alert("Error", "Please select an area!");
        if (!form.address.trim())
            return Alert.alert("Error", "Address is required!");
        if (form.pincode.length !== 6)
            return Alert.alert("Error", "Pincode must be 6 digits!");

        // 🟢 Build formatted address
        const cityName = cities.find((c) => c._id === form.city)?.name || "";
        const areaName = areas.find((a) => a._id === form.area)?.name || "";
        const formattedAddress = `${form.address}, ${areaName}, ${cityName}, Tamil Nadu ${form.pincode}`;

        const payload = {
            businessName: form.businessName,
            description: form.description,
            email: form.email,
            gst: form.gst,
            contactDetails: {
                ...originalBusiness.contactDetails,
                phone: form.phone,
                whatsup: form.whatsapp,
            },
            address: {
                ...originalBusiness.address, // keep coordinates, placeId
                addressArea: form.address,
                city: form.city,
                area: form.area,
                state: "Tamil Nadu",
                pincode: form.pincode,
                formattedAddress,
            },
        };

        try {
            const res = await editBusiness(payload);
            if (res.success) {
                Alert.alert("Success", "Successfully Updated!");
                getBusiness(); // refresh state
                onClose();
            } else {
                Alert.alert("Error", res.error?.message || "Failed to update");
            }
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Not updated");
        }
    };

    if (!form) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/50 justify-center items-center">
                <View className="bg-white w-11/12 rounded-2xl p-5">
                    <Text className="text-xl font-bold mb-3">Edit Business Details</Text>

                    <ScrollView className="max-h-96">
                        {[
                            { key: "businessName", placeholder: "Business Name" },
                            { key: "description", placeholder: "Description", multiline: true },
                            { key: "email", placeholder: "Email", keyboardType: "email-address" },
                            { key: "gst", placeholder: "GST Number" },
                            { key: "phone", placeholder: "Phone", keyboardType: "phone-pad" },
                            { key: "whatsapp", placeholder: "WhatsApp", keyboardType: "phone-pad" },
                            { key: "address", placeholder: "Address", multiline: true },
                            { key: "pincode", placeholder: "Pincode", keyboardType: "number-pad" },
                        ].map((f) => (
                            <TextInput
                                key={f.key}
                                placeholder={f.placeholder}
                                placeholderTextColor="gray"
                                value={form[f.key]}
                                onChangeText={(t) => handleChange(f.key, t)}
                                className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                                multiline={f.multiline}
                                keyboardType={f.keyboardType}
                            />
                        ))}

                        {/* City Dropdown */}
                        <View className="overflow-hidden border border-gray-300 rounded-lg mb-2 bg-gray-50">
                            <Picker
                                selectedValue={form.city}
                                onValueChange={(val) => handleChange("city", val)}
                                style={{
                                    color: "#000",
                                    fontSize: 14,
                                    height: Platform.OS === "ios" ? 200 : 50,
                                }}
                                dropdownIconColor="#000"
                            >
                                <Picker.Item label="Select City" value="" enabled={false} />
                                {cities.map((city) => (
                                    <Picker.Item key={city._id} label={city.name} value={city._id} />
                                ))}
                            </Picker>
                        </View>

                        {/* Area Dropdown */}
                        <View className="overflow-hidden border border-gray-300 rounded-lg mb-2 bg-gray-50">
                            <Picker
                                selectedValue={form.area}
                                onValueChange={(val) => handleChange("area", val)}
                                enabled={!!form.city}
                                style={{
                                    color: "#000",
                                    fontSize: 14,
                                    height: Platform.OS === "ios" ? 200 : 50,
                                }}
                                dropdownIconColor="#000"
                            >
                                <Picker.Item
                                    label={form.city ? "Select Area" : "Select a city first"}
                                    value=""
                                    enabled={false}
                                />
                                {areas.map((area) => (
                                    <Picker.Item key={area._id} label={area.name} value={area._id} />
                                ))}
                            </Picker>
                        </View>
                    </ScrollView>

                    {/* Buttons */}
                    <View className="flex-row justify-end gap-3 mt-4">
                        <TouchableOpacity
                            onPress={handleCancel}
                            className="px-4 py-2 bg-gray-300 rounded-lg"
                        >
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            className="px-4 py-2 bg-blue-500 rounded-lg"
                        >
                            <Text className="text-white">Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default BusinessEditModal;
