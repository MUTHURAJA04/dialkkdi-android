import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';

const VITE_RAZORPAY_KEY_ID = 'rzp_test_w7eHbASEFZ4b09'; // Replace with your key
const API_BASE_URL = 'https://api.dialkaraikudi.com'; // Replace with your API base URL

const Donate = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'business'
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: '',
        donation: '',
        businessName: '',
        logo: null,
    });
    const [errors, setErrors] = useState({});
    const [logoPreview, setLogoPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const personalPresetAmounts = [10, 50, 100, 200, 500, 1000];
    const businessPresetAmounts = [500, 1000, 2000, 5000, 10000, 25000];

    const presetAmounts = activeTab === 'personal' ? personalPresetAmounts : businessPresetAmounts;
    const minAmount = activeTab === 'personal' ? 10 : 500;

    // Validation function
    const validateDonateForm = (data, tab) => {
        const validationErrors = {};

        // Name
        if (!data.name?.trim()) {
            validationErrors.name = 'Name is required';
        } else if (data.name.trim().length < 3) {
            validationErrors.name = 'Name must be at least 3 characters';
        } else if (data.name.length > 50) {
            validationErrors.name = 'Name must be less than 50 characters';
        } else if (!/^[a-zA-Z\s&]+$/.test(data.name)) {
            validationErrors.name = 'Only letters, spaces and & are allowed';
        }

        // Donation Amount
        const minimum = tab === 'personal' ? 10 : 500;
        if (!data.donation) {
            validationErrors.donation = 'Donation amount is required';
        } else if (!/^\d+$/.test(data.donation)) {
            validationErrors.donation = 'Invalid donation amount';
        } else if (Number(data.donation) < minimum) {
            validationErrors.donation = `Minimum donation is ₹${minimum}`;
        } else if (Number(data.donation) % 10 !== 0) {
            validationErrors.donation = 'Amount must be a multiple of ₹10';
        }

        // Mobile
        if (!data.mobile) {
            validationErrors.mobile = 'Mobile number is required';
        } else if (!/^[6-9]\d{9}$/.test(data.mobile)) {
            validationErrors.mobile = 'Enter valid 10-digit mobile number';
        }

        // Personal tab - Address is required
        if (tab === 'personal') {
            if (!data.address?.trim()) {
                validationErrors.address = 'Address is required';
            } else if (data.address.length > 250) {
                validationErrors.address = 'Address must be less than 250 characters';
            }
        }

        // Business tab - Business name, address and logo are required
        if (tab === 'business') {
            if (!data.businessName?.trim()) {
                validationErrors.businessName = 'Business name is required';
            } else if (data.businessName.trim().length < 3) {
                validationErrors.businessName = 'Business name must be at least 3 characters';
            } else if (data.businessName.length > 100) {
                validationErrors.businessName = 'Business name must be less than 100 characters';
            }

            if (!data.address?.trim()) {
                validationErrors.address = 'Address is required';
            } else if (data.address.length > 250) {
                validationErrors.address = 'Address must be less than 250 characters';
            }

            if (!data.logo) {
                validationErrors.logo = 'Business logo is required';
            } else if (data.logo.fileSize > 2 * 1024 * 1024) {
                validationErrors.logo = 'Logo must be less than 2MB';
            }
        }

        return validationErrors;
    };

    const handleInputChange = (name, value) => {
        if (name === 'donation') {
            const numericValue = value.replace(/\D/g, ''); // numbers only
            setFormData((prev) => ({ ...prev, donation: numericValue }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: name === 'name' ? value.replace(/[^a-zA-Z\s&]/g, '') : value,
        }));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // Reset form when switching tabs
        setFormData({
            name: '',
            mobile: '',
            address: '',
            donation: '',
            businessName: '',
            logo: null,
        });
        setErrors({});
        setLogoPreview(null);
    };

    const handleLogoUpload = () => {
        const options = {
            mediaType: 'photo',
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 0.8,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                return;
            }

            if (response.errorCode) {
                Alert.alert('Error', 'Failed to pick image');
                return;
            }

            const file = response.assets[0];

            if (file.fileSize > 2 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, logo: 'Logo must be < 2MB' }));
                return;
            }

            setFormData((prev) => ({ ...prev, logo: file }));
            setLogoPreview(file.uri);
            setErrors((prev) => ({ ...prev, logo: null }));
        });
    };

    const validateForm = () => {
        const newErrors = validateDonateForm(formData, activeTab);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Create FormData
            const payload = new FormData();
            payload.append('name', formData.name.trim());
            payload.append('mobile', formData.mobile);
            payload.append('donationAmount', formData.donation);
            payload.append('donationType', activeTab); // 'personal' or 'business'

            if (activeTab === 'personal') {
                payload.append('address', formData.address);
            }

            if (activeTab === 'business') {
                payload.append('businessName', formData.businessName);
                payload.append('address', formData.address);

                if (formData.logo) {
                    payload.append('donationBusinessLogo', {
                        uri: formData.logo.uri,
                        type: formData.logo.type,
                        name: formData.logo.fileName || 'logo.jpg',
                    });
                }
            }

            // Create donation
            const response = await axios.post(
                `${API_BASE_URL}/donation/create-donation`,
                payload,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const { razorpayData, donation } = response.data;

            if (!razorpayData?.razorpayOrder?.id) {
                Alert.alert('Error', 'Order creation failed.');
                setLoading(false);
                return;
            }

            // Razorpay options
            const options = {
                key: VITE_RAZORPAY_KEY_ID,
                amount: razorpayData.razorpayOrder.amount,
                currency: razorpayData.razorpayOrder.currency,
                name: 'Dialkaraikudi',
                order_id: razorpayData.razorpayOrder.id,
                prefill: {
                    name: formData.name,
                    contact: formData.mobile,
                },
                theme: { color: '#2b6cb0' },
            };

            // Open Razorpay
            RazorpayCheckout.open(options)
                .then(async (data) => {
                    // Payment success
                    try {
                        const verifyPayload = {
                            razorpay_order_id: data.razorpay_order_id,
                            razorpay_payment_id: data.razorpay_payment_id,
                            razorpay_signature: data.razorpay_signature,
                            donationId: donation._id,
                        };

                        const verifyResponse = await axios.post(
                            `${API_BASE_URL}/donation/verify-payment`,
                            verifyPayload,
                            {
                                headers: { 'Content-Type': 'application/json' },
                            }
                        );

                        if (verifyResponse.data.success) {
                            Alert.alert('Success', 'Donation successful!', [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        resetForm();
                                        navigation.goBack();
                                    },
                                },
                            ]);
                        } else {
                            Alert.alert('Error', 'Payment verification failed.');
                        }
                    } catch (error) {
                        console.error('Verification failed:', error);
                        Alert.alert('Error', 'Payment verification failed.');
                    } finally {
                        setLoading(false);
                    }
                })
                .catch(async (error) => {
                    // Payment failed or cancelled
                    setLoading(false);

                    try {
                        await axios.post(
                            `${API_BASE_URL}/donation/mark-payment-failed`,
                            {
                                donationId: donation._id,
                                paymentStatus: 'cancelled',
                                reason: error.description || 'Payment cancelled',
                            },
                            {
                                headers: { 'Content-Type': 'application/json' },
                            }
                        );
                    } catch (err) {
                        console.error('Failed to mark payment as failed:', err);
                    }

                    Alert.alert(
                        'Payment Cancelled',
                        error.description || 'Payment was cancelled or failed.'
                    );
                });
        } catch (err) {
            setLoading(false);
            Alert.alert('Error', err.message || 'Error creating donation');
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            mobile: '',
            address: '',
            donation: '',
            businessName: '',
            logo: null,
        });
        setErrors({});
        setLogoPreview(null);
    };

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View className="mb-6">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className="text-blue-600 text-base mb-2">← Back</Text>
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-gray-800">
                        Muthumariamman Donation
                    </Text>
                </View>

                {/* Tabs */}
                <View className="flex-row bg-gray-200 rounded-lg p-1 mb-6">
                    <TouchableOpacity
                        className={`flex-1 py-3 rounded-md ${activeTab === 'personal' ? 'bg-white' : ''
                            }`}
                        onPress={() => handleTabChange('personal')}
                    >
                        <Text
                            className={`text-center text-base font-medium ${activeTab === 'personal' ? 'text-blue-600' : 'text-gray-600'
                                }`}
                        >
                            Personal
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className={`flex-1 py-3 rounded-md ${activeTab === 'business' ? 'bg-white' : ''
                            }`}
                        onPress={() => handleTabChange('business')}
                    >
                        <Text
                            className={`text-center text-base font-medium ${activeTab === 'business' ? 'text-blue-600' : 'text-gray-600'
                                }`}
                        >
                            Business
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Preset Amounts */}
                <Text className="text-lg font-semibold text-gray-700 mb-3">
                    Choose a Donation Amount
                </Text>
                <View className="flex-row flex-wrap gap-2 mb-6">
                    {presetAmounts.map((amount) => (
                        <TouchableOpacity
                            key={amount}
                            onPress={() => handleInputChange('donation', amount.toString())}
                            className={`w-[30%] py-3 rounded-lg border ${formData.donation == amount
                                ? 'bg-green-600 border-yellow-600'
                                : 'bg-white border-gray-300'
                                }`}
                        >
                            <Text
                                className={`text-center text-base ${formData.donation == amount
                                    ? 'text-white font-semibold'
                                    : 'text-gray-700'
                                    }`}
                            >
                                ₹ {amount}
                                
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Name Input */}
                <View className="mb-5">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Name *
                    </Text>
                    <TextInput
                        className={`bg-white border rounded-lg px-3 py-2.5 text-base text-gray-800 ${errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        value={formData.name}
                        onChangeText={(value) => handleInputChange('name', value)}
                        placeholder="Enter your name"
                        maxLength={50}
                    />
                    {errors.name && (
                        <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>
                    )}
                </View>

                {/* Mobile Input */}
                <View className="mb-5">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Mobile Number *
                    </Text>
                    <TextInput
                        className={`bg-white border rounded-lg px-3 py-2.5 text-base text-gray-800 ${errors.mobile ? 'border-red-500' : 'border-gray-300'
                            }`}
                        value={formData.mobile}
                        onChangeText={(value) => handleInputChange('mobile', value)}
                        placeholder="Enter mobile number"
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                    {errors.mobile && (
                        <Text className="text-red-500 text-xs mt-1">{errors.mobile}</Text>
                    )}
                </View>

                {/* Business Name (Business Tab Only) */}
                {activeTab === 'business' && (
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                            Business Name *
                        </Text>
                        <TextInput
                            className={`bg-white border rounded-lg px-3 py-2.5 text-base text-gray-800 ${errors.businessName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            value={formData.businessName}
                            onChangeText={(value) => handleInputChange('businessName', value)}
                            placeholder="Enter business name"
                            maxLength={100}
                        />
                        {errors.businessName && (
                            <Text className="text-red-500 text-xs mt-1">
                                {errors.businessName}
                            </Text>
                        )}
                    </View>
                )}

                {/* Address Input */}
                <View className="mb-5">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Address *
                    </Text>
                    <TextInput
                        className={`bg-white border rounded-lg px-3 py-2.5 text-base text-gray-800 ${errors.address ? 'border-red-500' : 'border-gray-300'
                            }`}
                        style={{ minHeight: 100, textAlignVertical: 'top' }}
                        value={formData.address}
                        onChangeText={(value) => handleInputChange('address', value)}
                        placeholder="Enter your address"
                        multiline
                        numberOfLines={4}
                        maxLength={250}
                    />
                    {errors.address && (
                        <Text className="text-red-500 text-xs mt-1">{errors.address}</Text>
                    )}
                </View>

                {/* Donation Amount */}
                <View className="mb-5">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Donation Amount (₹) *
                    </Text>
                    <TextInput
                        className={`bg-white border rounded-lg px-3 py-2.5 text-base text-gray-800 ${errors.donation ? 'border-red-500' : 'border-gray-300'
                            }`}
                        value={formData.donation}
                        onChangeText={(value) => handleInputChange('donation', value)}
                        placeholder={`Enter amount (Min ₹${minAmount})`}
                        keyboardType="numeric"
                    />
                    {errors.donation && (
                        <Text className="text-red-500 text-xs mt-1">{errors.donation}</Text>
                    )}
                </View>

                {/* Logo Upload (Business Tab Only) */}
                {activeTab === 'business' && (
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                            Upload Business Logo *
                        </Text>
                        <TouchableOpacity
                            onPress={handleLogoUpload}
                            className={`bg-white border-2 border-dashed rounded-lg p-5 items-center justify-center ${errors.logo ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            {logoPreview ? (
                                <View>
                                    <Image
                                        source={{ uri: logoPreview }}
                                        className="w-30 h-30 rounded-lg"
                                        style={{ width: 120, height: 120 }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            setLogoPreview(null);
                                            setFormData((prev) => ({ ...prev, logo: null }));
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                                    >
                                        <Text className="text-white text-xs font-bold">X</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View className="items-center">
                                    <Text className="text-4xl mb-2">☁️</Text>
                                    <Text className="text-sm text-gray-600 font-semibold">
                                        Upload Logo
                                    </Text>
                                    <Text className="text-xs text-gray-400 mt-1">Max 2MB</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        {errors.logo && (
                            <Text className="text-red-500 text-xs mt-1">{errors.logo}</Text>
                        )}
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    className={`py-4 rounded-lg items-center mt-2 ${loading ? 'bg-blue-300' : 'bg-blue-600'
                        }`}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-lg font-semibold">Donate</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default Donate;