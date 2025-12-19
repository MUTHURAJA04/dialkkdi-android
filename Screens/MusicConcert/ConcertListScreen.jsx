import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, SafeAreaViewBase } from "react-native";
import { getConcert } from '../../services/apiClient'

const ConcertListScreen = ({ navigation }) => {

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    useEffect(() => {
        fetchConcert()
    }, [])


    const [data, setData] = useState()

    const fetchConcert = async () => {
        try {
            const res = await getConcert()
            console.log(res);
            setData(res.data)

        } catch (error) {
            console.log(error);
            Alert.alert(error)
        }
    }

    return (
        <View className="flex-1 bg-gray-100 p-4 mt-2">

            <Text className="text-2xl font-bold my-4">
                Upcoming Concerts
            </Text>

            <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-white p-4 rounded-xl mb-3 shadow"
                        onPress={() =>
                            navigation.navigate("MusicScreen", {
                                concertId: item._id,
                                concertName: item._concertName // 👈 ONLY ID
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
                className="mt-3 bg-black py-2 rounded-lg"
                onPress={() =>
                    navigation.navigate("MyTicketScreen")
                }
            >
                <Text className="text-white text-center font-semibold">
                    View My Ticket
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default ConcertListScreen;
