import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { getConcert } from "../../services/apiClient";
import TicketPolicyModal from "./TicketPolicyModal";

const ConcertListScreen = ({ navigation }) => {
    const [data, setData] = useState([]);
    const [showPolicy, setShowPolicy] = useState(false);

    // Format date & time
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    console.log(formatTime, "formate");


    // Fetch concerts (only once)
    useEffect(() => {
        fetchConcert();
    }, []);

    // Show modal whenever screen comes into focus
    useFocusEffect(
        useCallback(() => {
            setShowPolicy(true);
        }, [])
    );

    const fetchConcert = async () => {
        try {
            const res = await getConcert();
            setData(res.data || []);
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to fetch concerts");
        }
    };

    return (
        <View className="flex-1 bg-gray-100 p-4 mt-2">
            {/* Policy Modal */}
            <Text className="text-2xl font-bold my-4">
                Upcoming Concerts
            </Text>

            <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 90, // 🔥 button height + space
                }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-white p-4 rounded-xl mb-3 shadow"
                        onPress={() =>
                            navigation.navigate("MusicScreen", {
                                concertId: item._id,
                                concertName: item.concertName,
                            })
                        }
                    >
                        <Text className="text-lg font-bold">
                            {item.concertName}
                        </Text>

                        <Text className="text-gray-600 mt-1">
                            {formatTime(item.concertDate)}
                        </Text>

                        <Text className="text-gray-500">
                            {item.concertPlace}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            <TouchableOpacity
                className="bg-black py-3 rounded-lg mb-4"
                onPress={() => navigation.navigate("MyTicketScreen")}
            >
                <Text className="text-white text-center font-semibold">
                    View My Ticket
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ConcertListScreen;
