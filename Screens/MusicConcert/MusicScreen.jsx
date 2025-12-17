import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
} from "react-native";
import { getSeat, seatHold } from "../../services/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HOLD_TIME = 300;


const MusicScreen = ({ route }) => {
    const { concertId } = route.params;

    const fetchSeats = async () => {
        try {
            const res = await getSeat(concertId)
            console.log(res);
            setSeatRows(res.data)
        } catch (error) {
            console.log(error);

        }
    }

    const [seatRows, setSeatRows] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [timer, setTimer] = useState(null);

    // 🔹 Fetch seats
    useEffect(() => {
        fetchSeats()
    }, []);

    // ⏱ Hold timer
    useEffect(() => {
        if (timer === null) return;

        if (timer === 0) {
            Alert.alert("Hold Expired", "Seats released");
            setSelectedSeats([]);
            fetchSeats()
            setTimer(null);
            return;
        }

        const i = setInterval(() => {
            setTimer((t) => t - 1);
        }, 1000);

        return () => clearInterval(i);
    }, [timer]);

    // 👉 select seat
    const toggleSeat = (seatNo, status) => {
        if (status !== "AVAILABLE") return;

        setSelectedSeats((prev) =>
            prev.includes(seatNo)
                ? prev.filter((s) => s !== seatNo)
                : [...prev, seatNo]
        );
    };

    // 🔒 HOLD
    const holdSeats = async () => {
        if (selectedSeats.length === 0) {
            Alert.alert("Select seats");
            return;
        }

        const userData = await AsyncStorage.getItem('userData');
        const parsedUserData = JSON.parse(userData);
        const USER_ID = parsedUserData._id || parsedUserData.id || parsedUserData.userId;

        setTimer(HOLD_TIME);

        console.log("HOLD API", {
            userId: USER_ID,
            concertId,
            seats: selectedSeats,
        });

        const data = {
            userId: USER_ID,
            concertId,
            seats: selectedSeats
        }

        const res = await seatHold(data);
        setSelectedSeats([]);
        fetchSeats()
        console.log(res);

        Alert.alert("Seats Held ⏱️");
    };

    // ✅ CONFIRM
    const confirmBooking = () => {
        console.log("CONFIRM API", {
            userId: USER_ID,
            concertId,
            seats: selectedSeats,
        });

        Alert.alert("Booking Confirmed ✅");
        setSelectedSeats([]);
        setTimer(null);
    };

    // 🎫 Seat Item
    const SeatItem = ({ seat }) => {
        const isSelected = selectedSeats.includes(seat.seatNo);

        let seatClass = "bg-gray-300";
        if (seat.status === "HELD") seatClass = "bg-yellow-500";
        if (seat.status === "CONFIRMED") seatClass = "bg-green-600";
        if (isSelected) seatClass = "bg-blue-500";

        return (
            <TouchableOpacity
                onPress={() => toggleSeat(seat.seatNo, seat.status)}
                disabled={seat.status !== "AVAILABLE"}
                className={`w-[22%] m-1 p-3 rounded-lg items-center ${seatClass}`}
            >
                <Text className="text-white font-bold">
                    {seat.seatNo}
                </Text>
            </TouchableOpacity>
        );
    };

    // 🪑 Row UI
    const renderRow = ({ item }) => (
        <View className="mb-6">
            <Text className="font-bold text-lg mb-2">
                Row {item.rowId} – ₹{item.basePrice}
            </Text>

            <View className="flex-row flex-wrap">
                {item.seats.map((seat) => (
                    <SeatItem
                        key={seat.seatNo}
                        seat={seat}
                    />
                ))}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 p-4 mt-6">

            {/* Concert Info */}
            <Text className="text-2xl font-bold">
                ARR Live Concert
            </Text>
            <Text className="text-gray-600 mb-3">
                Concert ID: {concertId}
            </Text>

            {/* Timer */}
            {timer !== null && (
                <Text className="text-red-600 mb-3 font-semibold">
                    Hold Time: {Math.floor(timer / 60)}:
                    {String(timer % 60).padStart(2, "0")}
                </Text>
            )}

            {/* Seats */}
            <FlatList
                data={seatRows}
                keyExtractor={(item) => item._id}
                renderItem={renderRow}
                showsVerticalScrollIndicator={false}
            />

            {/* HOLD */}
            <TouchableOpacity
                onPress={holdSeats}
                className="bg-blue-600 py-4 rounded-xl mb-3"
            >
                <Text className="text-white text-center font-bold">
                    HOLD SEATS
                </Text>
            </TouchableOpacity>

            {/* CONFIRM */}
            <TouchableOpacity
                onPress={confirmBooking}
                className="bg-green-600 py-4 rounded-xl"
            >
                <Text className="text-white text-center font-bold">
                    CONFIRM BOOKING
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default MusicScreen; 
