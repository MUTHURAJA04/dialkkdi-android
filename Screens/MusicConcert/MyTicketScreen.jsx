import React, { useEffect, useState, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Image
} from "react-native";
import {
    getCancelTicket,
    getTicketHistory,
    ticketPartner,
} from "../../services/apiClient";
import CancelTicketModal from "./CancelTicketModal";
import ViewShot from "react-native-view-shot";
import RNFS from "react-native-fs";

const MyTicketScreen = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketPartnerImages, setTicketPartnerImages] = useState([]);
    const [isDownloading, setIsDownloading] = useState(null); // Track which ID is downloading

    const viewShotRefs = useRef({});

    useEffect(() => {
        getTicketPartner();
        fetchTickets();
    }, []);

    const downloadTicket = async (ticketId) => {
        try {
            // 1. Hide buttons before capturing
            setIsDownloading(ticketId);

            // Give it a tiny delay to ensure UI updates
            setTimeout(async () => {
                const uri = await viewShotRefs.current[ticketId].capture();
                const fileName = `Ticket_${ticketId.substring(0, 5)}.jpg`;
                const path = `${RNFS.DownloadDirectoryPath}/${fileName}`;

                await RNFS.copyFile(uri, path);

                // 2. Show buttons back
                setIsDownloading(null);
                Alert.alert("Success", "Ticket saved to Downloads!");
            }, 100);
        } catch (error) {
            setIsDownloading(null);
            console.log(error);
            Alert.alert("Error", "Could not save ticket");
        }
    };

    const CDN_PREFIX = "https://livecdn.dialkaraikudi.com";

    const getTicketPartner = async () => {
        try {
            const res = await ticketPartner();
            const partner = res?.[0];
            if (partner) {
                const images = [partner.image1, partner.image2, partner.image3, partner.image4]
                    .filter(Boolean)
                    .map(img => `${CDN_PREFIX}/${img}`);
                setTicketPartnerImages(images);
            }
        } catch (error) { console.log(error); }
    };

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const bookingRes = await getTicketHistory();
            const confirmedTickets = (bookingRes.data || []).map(t => ({ ...t, type: "BOOKING" }));
            const cancelRes = await getCancelTicket();
            const cancelledTickets = (cancelRes.data || []).map(t => ({
                ...t,
                type: "CANCELLED",
                status: "CANCELLED",
            }));
            setTickets([...confirmedTickets, ...cancelledTickets]);
        } catch (err) { console.log(err); } finally { setLoading(false); }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#EAB308" />
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-100 p-4">
            {tickets.length === 0 && (
                <View className="items-center mt-20">
                    <Text className="text-gray-500">No Tickets Found</Text>
                </View>
            )}

            {tickets.map((ticket) => (
                <ViewShot
                    key={ticket._id}
                    ref={(el) => (viewShotRefs.current[ticket._id] = el)}
                    options={{ format: "jpg", quality: 1.0 }}
                    // Fixed: Adding background color so white text is visible in saved image
                    style={{ backgroundColor: "#000000", borderRadius: 12, marginBottom: 20 }}
                >
                    <View className="p-5">
                        {/* 🎵 Concert Header */}
                        <Text className="text-xl font-bold text-center text-white">
                            🎵 {ticket.concertId?.concertName}
                        </Text>
                        <Text className="text-center text-gray-400 mt-1">
                            {new Date(ticket.concertId?.concertDate).toDateString()}
                        </Text>

                        <View className="border-b border-dashed border-gray-600 my-4" />

                        {/* 📍 Details */}
                        <View>
                            <Text className="text-sm text-gray-400">Venue</Text>
                            <Text className="font-semibold text-white mb-3">{ticket.concertId?.concertPlace}</Text>

                            <Text className="text-sm text-gray-400">Customer Name</Text>
                            <Text className="font-semibold text-white mb-3">{ticket?.userId?.name}</Text>


                            <Text className="text-sm text-gray-400">Seats</Text>
                            <Text className="font-bold text-white mb-3">{ticket.seats.join(", ")}</Text>

                            <Text className="text-sm text-gray-400">Booking ID</Text>
                            <Text className="text-xs text-white">{ticket._id}</Text>
                        </View>

                        <View className="border-b border-dashed border-gray-600 my-4" />

                        {/* ✅ Status Badge - Always keep this */}
                        <View className={`py-2 rounded-lg ${ticket.status === "CONFIRMED" ? "bg-green-900" : "bg-red-900"}`}>
                            <Text className={`text-center font-bold ${ticket.status === "CONFIRMED" ? "text-green-400" : "text-red-400"}`}>
                                {ticket.status === "CONFIRMED" ? "✅ Booking Confirmed" : "❌ Ticket Cancelled"}
                            </Text>
                        </View>

                        {/* 🔘 BUTTONS - Hidden during download */}
                        {isDownloading !== ticket._id && (
                            <View>
                                <TouchableOpacity
                                    onPress={() => downloadTicket(ticket._id)}
                                    className="mt-4 bg-yellow-500 rounded py-2"
                                >
                                    <Text className="text-center font-bold text-black">Download Tickets</Text>
                                </TouchableOpacity>

                                {ticket.type === "BOOKING" && ticket.status === "CONFIRMED" && (
                                    <TouchableOpacity
                                        className="mt-4 bg-red-600 py-2 rounded-lg"
                                        onPress={() => setSelectedTicket(ticket)}
                                    >
                                        <Text className="text-center text-white font-semibold">Cancel Ticket</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* 🤝 Partners */}
                        <View className="mt-6">
                            <Text className="text-xs underline text-red-500 mb-3">Ticket Partner</Text>
                            <View className="flex-row flex-wrap justify-between">
                                {ticketPartnerImages.map((img, i) => (
                                    <View key={i} className="w-[20%] h-12 mb-2 bg-white rounded p-1">
                                        <Image source={{ uri: img }} className="w-full h-full" resizeMode="contain" />
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </ViewShot>
            ))}

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