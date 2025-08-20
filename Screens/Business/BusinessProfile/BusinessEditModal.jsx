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
import { getArea, getCities } from "../../../services/apiClient";

const BusinessEditModal = ({ visible, onClose, business, onSave }) => {
    const [form, setForm] = useState({
        businessName: business.businessName,
        description: business.description,
        email: business.email,
        gst: business.gst,
        phone: business.contactDetails.phone,
        whatsapp: business.contactDetails.whatsup,
        address: business.address.addressArea,
        city: business.address.city._id,
        area: business.address.area._id,
        pincode: business.address.pincode,
    });

    const [cities, setCities] = useState([]);
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const cityData = await getCities();
                setCities(cityData);
            } catch (err) {
                Alert.alert("Error", "Failed to load cities");
            }
        })();
    }, []);

    useEffect(() => {
        if (!form.city) {
            setAreas([]);
            return;
        }
        (async () => {
            try {
                const areaData = await getArea(form.city);
                setAreas(areaData);
            } catch (err) {
                Alert.alert("Error", "Failed to load areas");
            }
        })();
    }, [form.city]);

    const handleChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleSubmit = () => {
        // Required checks
        if (!form.businessName.trim()) {
            Alert.alert("Error", "Business name is required!");
            return;
        }

        if (!form.email.trim()) {
            Alert.alert("Error", "Email is required!");
            return;
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email)) {
            Alert.alert("Error", "Enter a valid email address!");
            return;
        }

        if (!form.phone.trim()) {
            Alert.alert("Error", "Phone number is required!");
            return;
        }

        if (form.phone.length < 10) {
            Alert.alert("Error", "Phone number must be at least 10 digits!");
            return;
        }

        if (!form.whatsapp.trim()) {
            Alert.alert("Error", "WhatsApp number is required!");
            return;
        }

        if (form.whatsapp.length < 10) {
            Alert.alert("Error", "WhatsApp number must be at least 10 digits!");
            return;
        }

        if (!form.gst.trim()) {
            Alert.alert("Error", "GST number is required!");
            return;
        }

        const gstRegex = /^[0-9A-Z]{15}$/; // Indian GST format
        if (!gstRegex.test(form.gst)) {
            Alert.alert("Error", "Enter a valid 15-character GST number!");
            return;
        }

        if (!form.city) {
            Alert.alert("Error", "Please select a city!");
            return;
        }

        if (!form.area) {
            Alert.alert("Error", "Please select an area!");
            return;
        }

        if (!form.address.trim()) {
            Alert.alert("Error", "Address is required!");
            return;
        }

        if (!form.pincode.trim()) {
            Alert.alert("Error", "Pincode is required!");
            return;
        }

        if (form.pincode.length !== 6) {
            Alert.alert("Error", "Pincode must be 6 digits!");
            return;
        }

        // ✅ If everything valid → save data
        console.log("Form Data to Save:", form);

        // Call parent save handler
        // onSave(form);

        // Close modal
        onClose();
    };



    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/50 justify-center items-center">
                <View className="bg-white w-11/12 rounded-2xl p-5">
                    <Text className="text-xl font-bold mb-3">Edit Business Details</Text>

                    <ScrollView className="max-h-96">
                        {/* Other Inputs */}
                        <TextInput
                            placeholder="Business Name"
                            placeholderTextColor="gray"
                            value={form.businessName}
                            onChangeText={(t) => handleChange("businessName", t)}
                            className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                        />

                        <TextInput
                            placeholder="Description"
                            placeholderTextColor="gray"
                            value={form.description}
                            onChangeText={(t) => handleChange("description", t)}
                            className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                            multiline
                        />

                        <TextInput
                            placeholder="Email"
                            keyboardType="email-address"
                            placeholderTextColor="gray"
                            value={form.email}
                            onChangeText={(t) => handleChange("email", t)}
                            className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                        />

                        <TextInput
                            placeholder="GST Number"
                            placeholderTextColor="gray"
                            value={form.gst}
                            onChangeText={(t) => handleChange("gst", t)}
                            className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                        />

                        <TextInput
                            placeholder="Phone"
                            keyboardType="phone-pad"
                            placeholderTextColor="gray"
                            value={form.phone}
                            onChangeText={(t) => handleChange("phone", t)}
                            className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                        />

                        <TextInput
                            placeholder="WhatsApp"
                            keyboardType="phone-pad"
                            placeholderTextColor="gray"
                            value={form.whatsapp}
                            onChangeText={(t) => handleChange("whatsapp", t)}
                            className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                        />

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
                                {cities?.map((city) => (
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
                                {areas?.map((area) => (
                                    <Picker.Item key={area._id} label={area.name} value={area._id} />
                                ))}
                            </Picker>
                        </View>

                        {/* Address + Pincode */}
                        <TextInput
                            placeholder="Address"
                            placeholderTextColor="gray"
                            value={form.address}
                            onChangeText={(t) => handleChange("address", t)}
                            className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                            multiline
                        />

                        <TextInput
                            placeholder="Pincode"
                            keyboardType="number-pad"
                            placeholderTextColor="gray"
                            value={form.pincode}
                            onChangeText={(t) => handleChange("pincode", t)}
                            className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
                        />

                    </ScrollView>

                    <View className="flex-row justify-end gap-3 mt-4">
                        <TouchableOpacity
                            onPress={onClose}
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
