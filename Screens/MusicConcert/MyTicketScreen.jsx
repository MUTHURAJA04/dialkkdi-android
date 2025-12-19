import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { getTicket } from "../../services/apiClient";

const MyTicketScreen = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await getTicket(); // 👈 returns array
            setTickets(res.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" />;

    if (tickets.length === 0) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>No tickets found</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-100 p-4">

            {tickets.map((ticket) => (
                <View
                    key={ticket._id}
                    className="bg-white rounded-2xl p-5 shadow mb-4"
                >

                    {/* 🎵 Concert */}
                    <Text className="text-xl font-bold text-center">
                        🎵 {ticket.concertId.concertName}
                    </Text>

                    <Text className="text-center text-gray-500 mt-1">
                        {new Date(ticket.concertId.concertDate).toDateString()}
                    </Text>

                    <View className="border-b border-dashed my-4" />

                    {/* 📍 Venue */}
                    <Text className="text-sm text-gray-600">Venue</Text>
                    <Text className="font-semibold">
                        {ticket.concertId.concertPlace}
                    </Text>

                    {/* 💺 Seats */}
                    <View className="mt-3">
                        <Text className="text-sm text-gray-600">Seats</Text>
                        <Text className="font-bold">
                            {ticket.seats.join(", ")}
                        </Text>
                    </View>

                    {/* 🆔 Booking ID */}
                    <View className="mt-3">
                        <Text className="text-sm text-gray-600">Booking ID</Text>
                        <Text className="text-xs">{ticket._id}</Text>
                    </View>

                    <View className="border-b border-dashed my-4" />

                    {/* 💰 Invoice */}
                    <View className="flex-row justify-between">
                        <Text>Subtotal</Text>
                        <Text>₹{ticket.subtotal}</Text>
                    </View>

                    <View className="flex-row justify-between mt-1">
                        <Text>GST ({ticket.gstPercent}%)</Text>
                        <Text>₹{ticket.gstAmount}</Text>
                    </View>

                    <View className="flex-row justify-between mt-2">
                        <Text className="font-bold">Total</Text>
                        <Text className="font-bold">₹{ticket.totalAmount}</Text>
                    </View>

                    {/* ✅ Status */}
                    <View className="mt-4 bg-green-100 py-2 rounded-lg">
                        <Text className="text-center text-green-700 font-semibold">
                            ✅ Booking Confirmed
                        </Text>
                    </View>

                </View>
            ))}

        </ScrollView>
    );
};

export default MyTicketScreen;
