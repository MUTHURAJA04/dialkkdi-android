import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import {
    getTicket,
    getCancelTicket,
    getTicketHistory,
    ticketPartner,
} from "../../services/apiClient";
import CancelTicketModal from "./CancelTicketModal";
import { Image } from "react-native";
// import Image1 from "../../assets/Logo/Dial_karaikudi.jpg"
// import Image2 from "../../assets/Logo/Dial_pudukkottai.jpg"
// import Image3 from "../../assets/Logo/Digiaiquest.jpg"
// import Image4 from "../../assets/Logo/Digitaly_jobs.jpg"

const MyTicketScreen = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketPartnerImages, setTicketPartnerImages] = useState([]);


    useEffect(() => {
        getTicketPartner()
    }, [])


    const CDN_PREFIX = "https://livecdn.dialkaraikudi.com";

    const getTicketPartner = async () => {
        try {
            const res = await ticketPartner()
            console.log(res);
            const partner = res?.[0];

            if (partner) {
                const images = [
                    partner.image1,
                    partner.image2,
                    partner.image3,
                    partner.image4,
                ]
                    .filter(Boolean) // null / empty remove
                    .map(img => `${CDN_PREFIX}/${img}`);

                setTicketPartnerImages(images);
                console.log(ticketPartnerImages, images, "final images");
            }


        } catch (error) {
            console.log(error);
        }
    }

    // const sponser_Images = [
    //     Image1, Image2, Image3, Image4
    // ]

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);

            // ✅ CONFIRMED BOOKINGS
            const bookingRes = await getTicketHistory();

            console.log(bookingRes, "0987665444");


            const confirmedTickets = (bookingRes.data || []).map(t => ({
                ...t,
                type: "BOOKING",
                // status: "CONFIRMED",
            }));

            console.log(confirmedTickets, "..........");


            // ❌ CANCELLED TICKETS
            const cancelRes = await getCancelTicket();

            const cancelledTickets = (cancelRes.data || []).map(t => ({
                _id: t._id,
                concertId: t.concertId,
                seats: t.seats,
                reason: t.reason,
                createdAt: t.createdAt,
                type: "CANCELLED",
                status: "CANCELLED",
            }));

            // 🔥 MERGE BOTH
            setTickets([...confirmedTickets, ...cancelledTickets]);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-100 p-4"
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: tickets.length === 0 ? "center" : "flex-start",
            }}
        >
            {tickets.length === 0 && (
                <View className="items-center">
                    <Text className="text-gray-500">No Tickets Found</Text>
                </View>
            )}

            {tickets.map((ticket) => (
                <View
                    key={ticket._id}
                    className="bg-white rounded-2xl p-5 shadow mb-4"
                >
                    {/* 🔁 MAIN ROW */}
                    <View className="flex-row">
                        {/* ⬅️ LEFT CONTENT */}
                        <View className="flex-1 pr-3">
                            {/* 🎵 Concert */}
                            <Text className="text-xl font-bold text-center">
                                🎵 {ticket.concertId.concertName}
                            </Text>

                            <Text className="text-center text-gray-500 mt-1">
                                {new Date(ticket.concertId.concertDate).toDateString()}
                            </Text>

                            <View className="border-b border-dashed my-4" />

                            {/* 📍 Venue */}
                            <View className="flex-row justify-between">
                                <View className="">
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
                                </View>



                            </View>
                        </View>

                        {/* ➡️ RIGHT SIDE IMAGES */}

                    </View>

                    <View className="border-b border-dashed my-4" />

                    {/* 💰 Amount */}
                    {ticket.type === "BOOKING" && (
                        <>
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
                                <Text className="font-bold">
                                    ₹{ticket.totalAmount}
                                </Text>
                            </View>
                        </>
                    )}

                    {/* ❌ Cancel Reason */}
                    {ticket.type === "CANCELLED" && (
                        <View className="mt-3 bg-red-50 p-3 rounded-lg">
                            <Text className="text-red-600 font-semibold">
                                ❌ Ticket Cancelled
                            </Text>
                            <Text className="text-sm mt-1">
                                Reason: {ticket.reason}
                            </Text>
                        </View>
                    )}

                    {/* ✅ / ❌ STATUS */}
                    <View
                        className={`mt-4 py-2 rounded-lg ${ticket.status === "CONFIRMED"
                            ? "bg-green-100"
                            : "bg-red-100"
                            }`}
                    >
                        <Text
                            className={`text-center font-semibold ${ticket.status === "CONFIRMED"
                                ? "text-green-700"
                                : "text-red-700"
                                }`}
                        >
                            {ticket.status === "CONFIRMED"
                                ? "✅ Booking Confirmed"
                                : "❌ Ticket Cancelled"}
                        </Text>
                    </View>

                    {/* ❌ Cancel Button */}
                    {ticket.type === "BOOKING" && ticket.status === "CONFIRMED" && (
                        <TouchableOpacity
                            className="mt-4 bg-red-500 py-2 rounded-lg"
                            onPress={() => setSelectedTicket(ticket)}
                        >
                            <Text className="text-center text-white font-semibold">
                                Cancel Ticket
                            </Text>
                        </TouchableOpacity>
                    )}
                    <View className="mt-4">
                        <Text className="text-xs underline text-red-600 mb-3">
                            Ticket Partner
                        </Text>

                        <View className="flex-row flex-wrap justify-between">
                            {ticketPartnerImages.map((img, i) => (
                                <View
                                    key={i}
                                    className="w-[20%] h-16 mb-2 rounded-md overflow-hidden "
                                >
                                    <Image
                                        source={{ uri: img }}
                                        className="w-full h-full"
                                        resizeMode="contain"
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

            ))}

            {/* 🔥 CANCEL MODAL */}
            {selectedTicket && (
                <CancelTicketModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onSuccess={fetchTickets}
                />
            )}
        </ScrollView>
    );
};

export default MyTicketScreen;
