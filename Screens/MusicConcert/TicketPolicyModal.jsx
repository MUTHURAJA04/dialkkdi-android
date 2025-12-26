import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";

const TicketPolicyScreen = ({ navigation }) => {
    const [accepted, setAccepted] = useState(false);

    const handleContinue = () => {
        if (!accepted) {
            Alert.alert("Accept Required", "Please accept the policy to continue");
            return;
        }
        navigation.replace("ConcertListScreen"); // 👈 next screen
    };

    return (
        <View className="flex-1 bg-white pt-6">
            <View className="p-4 border-b">
                <Text className="text-xl font-bold text-center">
                    Ticket Booking & Cancellation Policy
                </Text>
            </View>

            {/* Content */}
            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                {/* 1 */}
                <Text className="font-bold mb-2">1. Booking Limits</Text>
                <Text className="mb-1">• One User, One Ticket per registered mobile number.</Text>
                <Text className="mb-1">• A valid mobile number is mandatory.</Text>
                <Text className="mb-3 text-red-500">• Ticket transfer is strictly not allowed.</Text>

                {/* 2 */}
                <Text className="font-bold mb-2">2. Online Cancellation Process</Text>
                <Text className="mb-1">
                    • If you are unable to attend, click the “Cancel Ticket” button in the app.
                </Text>

                {/* Table */}
                <View className="border rounded-lg mt-3 mb-3 overflow-hidden">
                    <View className="flex-row bg-gray-200 p-2">
                        <Text className="flex-1 font-semibold">Cancellation Date</Text>
                        <Text className="font-semibold">Deduction</Text>
                    </View>

                    <View className="flex-row p-2 border-t">
                        <Text className="flex-1">Jan 5, 2026</Text>
                        <Text>25%</Text>
                    </View>

                    <View className="flex-row p-2 border-t">
                        <Text className="flex-1">Jan 15, 2026</Text>
                        <Text>75%</Text>
                    </View>

                    <View className="flex-row p-2 border-t">
                        <Text className="flex-1">Jan 20, 2026</Text>
                        <Text>90%</Text>
                    </View>
                </View>

                <Text className="mb-3">
                    • Once cancelled online, the ticket will be immediately deactivated
                    and cannot be used for entry.
                </Text>

                {/* 3 */}
                <Text className="font-bold mb-2">3. Offline Refund Policy</Text>
                <Text className="mb-1">• No online refunds to bank or UPI.</Text>
                <Text className="mb-1">
                    • Refund must be collected in person at the official office in Karaikudi.
                </Text>
                <Text className="font-semibold mt-2 mb-1">Verification Required:</Text>
                <Text className="ml-2 mb-1">
                    1. DialKaraikudi app with cancelled ticket status.
                </Text>
                <Text className="ml-2 mb-2">
                    2. Cancellation confirmation email.
                </Text>
                <Text className="text-red-500 mb-3">
                    • Refund window: Jan 27 – Jan 31, 2026.
                    Failure to collect → amount forfeited.
                </Text>

                {/* 4 */}
                <Text className="font-bold mb-2">4. Processing Fees</Text>
                <Text className="mb-1">• Ticket amount refunded offline only.</Text>
                <Text className="mb-3">
                    • Internet / convenience fees are non-refundable.
                </Text>

                {/* 5 */}
                <Text className="font-bold mb-2">
                    5. Ticket Transfer & Event Cancellation
                </Text>
                <Text className="mb-10">
                    • Ticket transfer is not allowed.{"\n"}
                    • If the event is cancelled due to government orders, artist health
                    issues, or natural disasters, a full face value refund will be issued.
                </Text>

                <TouchableOpacity
                    onPress={() => setAccepted(!accepted)}
                    className="flex-row items-center mb-4"
                >
                    <View
                        className={`w-5 h-5 border rounded mr-2 items-center justify-center ${accepted ? "bg-black border-black" : "bg-white border-gray-400"
                            }`}
                    >
                        {accepted && (
                            <Text className="text-white text-xs font-bold">✓</Text>
                        )}
                    </View>

                    <Text>I have read and accept the policy</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Bottom Button */}
            <TouchableOpacity
                onPress={handleContinue}
                className={`m-4 py-3 rounded-lg ${accepted ? "bg-black" : "bg-gray-400"
                    }`}
            >
                <Text className="text-white text-center font-semibold">
                    Accept & Continue
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default TicketPolicyScreen;
