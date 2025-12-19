import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RazorpayCheckout from "react-native-razorpay";

import {
    getSeat,
    getTicketSetting,
    seatHold,
    createPayment,
    verifyPayment,
    confirmBooking,
    ticketverifyPayment,
} from "../../services/apiClient";

const HOLD_TIME = 300;

const MusicScreen = ({ route }) => {
    const { concertId, concertName } = route.params;

    const [seatRows, setSeatRows] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [timer, setTimer] = useState(null);
    const [setting, setSetting] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [userId, setUserId] = useState(null);

    // 🔹 INIT
    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const userData = await AsyncStorage.getItem("userData");
        console.log(userData, "User Data");

        const parsed = JSON.parse(userData);
        setUserId(parsed._id || parsed.id || parsed.userId);

        fetchSeats();
        fetchTicketSetting();
    };

    const fetchSeats = async () => {
        try {
            const res = await getSeat(concertId);
            setSeatRows(res.data);
        } catch (error) {
            console.log(error);
        }

    };

    const fetchTicketSetting = async () => {

        try {
            const res = await getTicketSetting();
            setSetting(res.data);
        } catch (error) {
            console.log(error);
        }

    };

    // ⏱ HOLD TIMER
    useEffect(() => {
        if (timer === null) return;

        if (timer === 0) {
            Alert.alert("Hold expired");
            setSelectedSeats([]);
            setBookingId(null);
            fetchSeats();
            setTimer(null);
            return;
        }

        const i = setInterval(() => {
            setTimer(t => t - 1);
        }, 1000);

        return () => clearInterval(i);
    }, [timer]);

    // 🪑 seat toggle
    const toggleSeat = (seatNo, status) => {
        if (status !== "AVAILABLE") return;

        setSelectedSeats(prev =>
            prev.includes(seatNo)
                ? prev.filter(s => s !== seatNo)
                : [...prev, seatNo]
        );
    };

    // 🔒 HOLD SEATS
    const holdSeats = async () => {
        if (!selectedSeats.length) {
            Alert.alert("Select seats");
            return;
        }

        const res = await seatHold({
            userId,
            concertId,
            seats: selectedSeats,
        });

        setBookingId(res.data._id);
        setTimer(HOLD_TIME);
        fetchSeats();

        Alert.alert("Seats held ⏱️");
    };

    // 💰 CALCULATION
    const calculateTotal = () => {
        let subtotal = 0;

        seatRows.forEach(row => {
            selectedSeats.forEach(seat => {
                if (row.seats.find(s => s.seatNo === seat)) {
                    subtotal += row.basePrice;
                }
            });
        });

        const gstPercent = setting?.gstAmount || 18;
        const gst = Math.round(subtotal * gstPercent / 100);

        return {
            subtotal,
            gst,
            total: subtotal + gst,
        };
    };

    // 💳 PAYMENT
    const payNow = async () => {
        try {

            if (selectedSeats.length > setting.maxValue) {
                Alert.alert(`Only Allow ${setting.maxValue} Seat`)
                return
            }

            const { subtotal, total } = calculateTotal();

            // 1️⃣ CREATE PAYMENT
            const paymentRes = await createPayment({
                userId,
                concertId,
                seats: selectedSeats,
                subtotal,
                gstPercent: setting?.gstAmount || 18,
            });

            console.log(paymentRes, "BusinessDetailScreen");


            const { orderId, amount, bookingId } = paymentRes.data;

            // 2️⃣ OPEN RAZORPAY ✅
            RazorpayCheckout.open({
                key: "rzp_test_w7eHbASEFZ4b09",   // ✅ STRING
                order_id: orderId,
                amount: amount,                 // ✅ already in paise
                currency: "INR",
                name: concertName,
                description: "Ticket Booking",
                theme: { color: "#2563eb" },
            })
                .then(async (razorpayRes) => {

                    // 3️⃣ CONFIRM BOOKING
                    await confirmBooking({
                        bookingId,
                        razorpayOrderId: razorpayRes.razorpay_order_id,
                        razorpayPaymentId: razorpayRes.razorpay_payment_id,
                        razorpaySignature: razorpayRes.razorpay_signature,
                        amountPaid: total,
                    });

                    Alert.alert("Booking Confirmed 🎉");
                    reset();
                })
                .catch(err => {
                    console.log("Razorpay Error:", err);
                    Alert.alert("Payment cancelled");
                });

        } catch (err) {
            console.log(err);
            Alert.alert(err.message);
        }
    };



    const reset = () => {
        setSelectedSeats([]);
        setBookingId(null);
        setTimer(null);
        fetchSeats();
    };

    // 🎫 Seat UI
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
                <Text className="text-white font-bold">{seat.seatNo}</Text>
            </TouchableOpacity>
        );
    };

    const renderRow = ({ item }) => (
        <View className="mb-6">
            <Text className="font-bold text-lg mb-2">
                Row {item.rowId} – ₹{item.basePrice}
            </Text>
            <View className="flex-row flex-wrap">
                {item.seats.map(seat => (
                    <SeatItem key={seat.seatNo} seat={seat} />
                ))}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 p-4 mt-6">
            <Text className="text-2xl font-bold">{concertName}</Text>

            {timer !== null && (
                <Text className="text-red-600 font-semibold mb-2">
                    Hold: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                </Text>
            )}

            <FlatList
                data={seatRows}
                keyExtractor={item => item._id}
                renderItem={renderRow}
            />

            {/* <TouchableOpacity
                onPress={holdSeats}
                className="bg-blue-600 py-4 rounded-xl mb-3"
            >
                <Text className="text-white text-center font-bold">HOLD SEATS</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
                onPress={payNow}
                className="bg-green-600 py-4 rounded-xl"
            >
                <Text className="text-white text-center font-bold">
                    PAY ₹{calculateTotal().subtotal} + GST
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default MusicScreen;
