import React, { useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { ticketCancel } from "../../services/apiClient";

const reasons = [
    "Plan changed",
    "Booked by mistake",
    "Health issue",
    "Other",
];

const CancelTicketModal = ({ ticket, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [accepted, setAccepted] = useState(false);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [reason, setReason] = useState("");
    const [showPolicy, setShowPolicy] = useState(true);

    const toggleSeat = (seat) => {
        setSelectedSeats((prev) =>
            prev.includes(seat)
                ? prev.filter((s) => s !== seat)
                : [...prev, seat]
        );
    };

    const submitCancel = async () => {
        if (selectedSeats.length === 0) {
            return Alert.alert("Select seats to cancel");

        }


        if (!accepted) {
            Alert.alert("Accept Required", "Please accept the policy to continue");
            return;
        }


        if (!reason) {
            return Alert.alert("Select cancellation reason");
        }

        try {
            await ticketCancel({
                bookingId: ticket._id,
                seats: selectedSeats,
                reason,
            });

            Alert.alert("Cancelled", "Seats cancelled successfully");
            onClose();
            onSuccess();
        } catch (err) {
            Alert.alert("Error", err.message || "Cancel failed");
        }
    };

    return (
        <Modal transparent animationType="slide">
            <View className="flex-1 bg-black/50 justify-center px-4">
                <View className="bg-white rounded-2xl p-5 max-h-[85%]">

                    {/* STEP 1️⃣ TERMS */}
                    {step === 1 && (
                        <>
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
                                        className={`w-5 h-5 border rounded mr-2 ${accepted ? "bg-black" : "bg-white"
                                            }`}
                                    />
                                    <Text>I have read and accept the policy</Text>
                                </TouchableOpacity>


                            </ScrollView>

                            <TouchableOpacity
                                className={`py-2 my-6 rounded-lg ${accepted ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                onPress={() => {
                                    if (!accepted) {
                                        Alert.alert("Accept Required", "Please accept the policy to continue");
                                        return;
                                    }
                                    setStep(2);
                                }}
                            >
                                <Text className="text-center text-white font-semibold">
                                    Accept & Continue
                                </Text>
                            </TouchableOpacity>
                        </>

                    )}

                    {/* STEP 2️⃣ SELECT SEAT + REASON */}
                    {step === 2 && (
                        <>
                            <Text className="text-lg font-bold mb-3">
                                Cancel Seats
                            </Text>

                            <Text className="text-sm text-gray-600">
                                Select Seats
                            </Text>

                            <View className="flex-row flex-wrap mt-2">
                                {ticket.seats.map((seat) => (
                                    <TouchableOpacity
                                        key={seat}
                                        className={`px-3 py-1 rounded-full mr-2 mb-2 ${selectedSeats.includes(seat)
                                            ? "bg-red-500"
                                            : "bg-gray-200"
                                            }`}
                                        onPress={() => toggleSeat(seat)}
                                    >
                                        <Text
                                            className={`${selectedSeats.includes(seat)
                                                ? "text-white"
                                                : "text-black"
                                                }`}
                                        >
                                            {seat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-sm text-gray-600 mt-3">
                                Reason
                            </Text>

                            {reasons.map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    className={`mt-2 p-2 rounded-lg border ${reason === r
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                    onPress={() => setReason(r)}
                                >
                                    <Text>{r}</Text>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                className="mt-4 bg-red-500 py-2 rounded-lg"
                                onPress={submitCancel}
                            >
                                <Text className="text-center text-white font-semibold">
                                    Confirm Cancellation
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="mt-3"
                                onPress={onClose}
                            >
                                <Text className="text-center text-gray-500">
                                    Back
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                </View>
            </View >
        </Modal >
    );
};

export default CancelTicketModal;
