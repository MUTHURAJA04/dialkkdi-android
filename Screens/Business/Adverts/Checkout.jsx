import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import RazorpayCheckout from "react-native-razorpay";
import { createOrder, verifyPayment } from "../../../services/apiClient";

const Checkout = () => {
    const route = useRoute();
    const { plan } = route.params; // ✅ Selected plan data

    // GST 18% calculation
    const gst = (plan.price * 0.18).toFixed(2);
    const total = (plan.price + parseFloat(gst)).toFixed(2);

    const handlePayNow = async () => {
        try {
            // Step 1: Create order on backend
            const orderResponse = await createOrder({ amount: total })
            console.log(orderResponse);



            if (!orderResponse.id) {
                Alert.alert("Error", "Order creation failed");
                return;
            }

            // Step 2: Open Razorpay Checkout
            const options = {
                description: `Ad Slot Purchase: ${plan.name}`,
                image: "https://yourcdn.com/logo.png",
                currency: "INR",
                key: "rzp_test_w7eHbASEFZ4b09",
                amount: orderResponse.amount,
                order_id: orderResponse.id,
                name: "Dial Karaikudi",
                prefill: {
                    email: "user@example.com",
                    contact: "9876543210",
                    name: "Business Owner",
                },
                theme: { color: "#2b6cb0" },
            };

            console.log(options);

            RazorpayCheckout.open(options)
                .then(async (response) => {

                    const data = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        planId: plan._id,
                        amount: total,
                    }

                    const verifyResponse = await verifyPayment(data)

                    console.log(verifyResponse, "Verify response");

                    if (verifyResponse.success) {
                        Alert.alert("Success", "Payment Verified & Slot Purchased 🎉");
                    } else {
                        Alert.alert("Failed", "Payment verification failed");
                    }
                })
                .catch((error) => {
                    Alert.alert("Payment Cancelled", error.description);
                });
        } catch (err) {
            console.error("Payment error:", err);
            Alert.alert("Error", "Something went wrong, try again");
        }
    };

    return (
        <View className="flex-1 bg-gray-100 p-4">
            {/* Card */}
            <View className="bg-white rounded-2xl shadow-lg p-6">
                <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
                    Checkout Summary
                </Text>

                {/* Plan Info */}
                <View className="mb-3">
                    <Text className="text-base text-gray-700 font-semibold">{plan.name}</Text>
                    <Text className="text-gray-600">Duration: {plan.adDurationInDays} days</Text>
                </View>

                {/* Pricing */}
                <View className="border-t border-gray-200 mt-3 pt-3">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-700">Base Price</Text>
                        <Text className="text-gray-800 font-medium">₹{plan.price}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-700">GST (18%)</Text>
                        <Text className="text-gray-800 font-medium">₹{gst}</Text>
                    </View>
                    <View className="flex-row justify-between mt-2 border-t border-gray-300 pt-2">
                        <Text className="text-lg font-bold text-gray-900">Total</Text>
                        <Text className="text-lg font-bold text-green-600">₹{total}</Text>
                    </View>
                </View>
            </View>

            {/* Buy Now Button */}
            <TouchableOpacity
                className="bg-green-600 py-3 rounded-2xl mt-6 shadow-md"
                onPress={handlePayNow}
            >
                <Text className="text-white text-center text-lg font-semibold">
                    Buy Now
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Checkout;
