import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
    TextInput,
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
    getTicket,
} from "../../services/apiClient";

const HOLD_TIME = 300;

const MusicScreen = ({ route, navigation }) => {
    const { concertId, concertName } = route.params;

    console.log(concertName);

    const [seatRows, setSeatRows] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [timer, setTimer] = useState(null);
    const [setting, setSetting] = useState(null);
    const [bookingId, setBookingId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [tickets, setTickets] = useState([]);

    const [showUserModal, setShowUserModal] = useState(false);

    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");

    // 🔹 INIT
    useEffect(() => {
        init();
    }, []);

    // useEffect(() => {
    //     fetchTickets();
    // }, []);

    const init = async () => {
        gettingTickets();
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

    const gettingTickets = async () => {
        try {
            const res = await getTicket();
            setTickets(res.data || []);
            console.log(res, "ticket");
        } catch (err) {
            console.log(err);
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

            if (phone.length !== 10) {
                Alert.alert("Invalid phone number");
                return;
            }

            // if (Number(age) < 1 || Number(age) > 99) {
            //     Alert.alert("Invalid age");
            //     return;
            // }

            // if (!gender) {
            //     Alert.alert("Select gender");
            //     return;
            // }

            const { subtotal, total } = calculateTotal();

            // 1️⃣ CREATE PAYMENT
            let paymentRes;
            try {
                paymentRes = await createPayment({
                    userId,
                    userName,
                    concertId,
                    seats: selectedSeats,
                    subtotal,
                    gstPercent: setting?.gstAmount || 18,
                    phone,
                    gender,
                    age,
                });
            } catch (err) {
                Alert.alert("Error", err.message); // 🔴 ONLY alert
                return; // ⛔ STOP HERE
            }

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

                    Alert.alert(
                        "Booking Confirmed 🎉",
                        "View Ticket",
                        [
                            {
                                text: "VIEW",
                                onPress: () => {
                                    navigation.navigate("MyTicketScreen"); // screen name
                                },
                            },
                        ],
                        { cancelable: false }
                    );
                    reset();
                })
                .catch(err => {
                    console.log("Razorpay Error:", err);
                    gettingTickets()
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
        setAge()
        setBookingId()
        setPhone()
    };

    // 🎫 Seat UI
    const SeatItem = ({ seat }) => {
        const isSelected = selectedSeats.includes(seat.seatNo);

        let seatClass = "bg-blue-500";
        if (seat.status === "HELD") seatClass = "bg-yellow-500";
        if (seat.status === "CONFIRMED") seatClass = "bg-gray-300";
        if (isSelected) seatClass = "bg-orange-500";

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

    const now = new Date();

    // const alreadyBooked = tickets.some(ticket => {
    //     if (ticket.concertId?._id !== concertId) return false;

    //     // CONFIRMED / PARTIALLY_CANCELLED → always booked
    //     if (["CONFIRMED", "PARTIALLY_CANCELLED"].includes(ticket.status)) {
    //         return true;
    //     }

    //     // HELD → only if not expired
    //     if (
    //         ticket.status === "HELD" &&
    //         ticket.holdExpiresAt &&
    //         new Date(ticket.holdExpiresAt) > now
    //     ) {
    //         return true;
    //     }

    //     return false;
    // });


    return (
        <View className="flex-1 bg-gray-100 p-4 mt-6">
            <Text className="text-2xl font-bold">{concertName}</Text>
            <View className="flex-row flex-wrap gap-3 py-2 rounded-lg shadow-sm">

                {/* Available */}
                <View className="flex-row items-center">
                    <View className="bg-blue-500 h-2 w-2 rounded-full mr-1" />
                    <Text className="text-[12px] font-bold">Available</Text>
                </View>

                {/* Held */}
                <View className="flex-row items-center">
                    <View className="bg-yellow-500 h-2 w-2 rounded-full mr-1" />
                    <Text className="text-[12px] font-bold">Held</Text>
                </View>

                {/* Booked */}
                <View className="flex-row items-center">
                    <View className="bg-gray-300 h-2 w-2 rounded-full mr-1" />
                    <Text className="text-[12px] font-bold">Booked</Text>
                </View>

                {/* Selected */}
                <View className="flex-row items-center">
                    <View className="bg-orange-500 h-2 w-2 rounded-full mr-1" />
                    <Text className="text-[12px] font-bold">Selected</Text>
                </View>

            </View>


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
            {selectedSeats.length > 0 && (
                <TouchableOpacity
                    onPress={() => setShowUserModal(true)}
                    // disabled={alreadyBooked}
                    className={`py-4 rounded-xl mb-10 bg-green-600
                        `}
                >
                    <Text className="text-white text-center font-bold">
                        PAY ₹{calculateTotal().subtotal} + GST
                    </Text>
                </TouchableOpacity>
            )}


            {showUserModal && (
                <View className="absolute inset-0 bg-black/50 items-center justify-center">
                    <View className="bg-white w-[90%] rounded-2xl p-5">

                        <Text className="text-lg font-bold mb-4">Enter Details</Text>

                        {/* Phone */}
                        <Text className="text-sm mb-1">Name</Text>
                        <TextInput
                            value={userName}
                            keyboardType="default"
                            maxLength={20}
                            onChangeText={(text) => {
                                // allow only numbers
                                if (!/^[A-Za-z ]*$/.test(text)) return;

                                setUserName(text);
                            }}
                            placeholder="Enter your Name"
                            className="border rounded-lg p-2 mb-3"
                        />
                        <Text className="text-sm mb-1">Phone Number</Text>
                        <TextInput
                            value={phone}
                            keyboardType="phone-pad"
                            maxLength={10}
                            onChangeText={(text) => {
                                // allow only numbers
                                if (!/^\d*$/.test(text)) return;

                                // first digit must be 6–9
                                if (text.length === 1 && !/[6-9]/.test(text)) return;

                                setPhone(text);
                            }}
                            placeholder="Enter phone number"
                            className="border rounded-lg p-2 mb-3"
                        />


                        {/* Gender */}
                        {/* <Text className="text-sm mb-1">Gender</Text>
                        <View className="flex-row mb-3">
                            {["Male", "Female", "Other"].map(g => (
                                <TouchableOpacity
                                    key={g}
                                    onPress={() => setGender(g)}
                                    className={`px-4 py-2 mr-2 rounded-full ${gender === g ? "bg-blue-600" : "bg-gray-300"
                                        }`}
                                >
                                    <Text className={gender === g ? "text-white" : "text-black"}>
                                        {g}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View> */}

                        {/* Age */}
                        {/* <Text className="text-sm mb-1">Age</Text>
                        <TextInput
                            value={age}
                            keyboardType="numeric"
                            maxLength={2}
                            onChangeText={(text) => {
                                if (!/^\d*$/.test(text)) return;
                                setAge(text);
                            }}
                            placeholder="Age"
                            className="border rounded-lg p-2 mb-4"
                        /> */}


                        {/* Buttons */}
                        <View className="flex-row justify-between ">
                            <TouchableOpacity
                                onPress={() => setShowUserModal(false)}
                                className="px-4 py-2 bg-gray-400 rounded-lg"
                            >
                                <Text className="text-white">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    if (!phone) {
                                        Alert.alert("Fill all details");
                                        return;
                                    }

                                    setShowUserModal(false);
                                    payNow(); // 🔥 EXISTING FUNCTION ONLY
                                }}
                                className="px-4 py-2 bg-green-600 rounded-lg"
                            >
                                <Text className="text-white">Confirm & Pay</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            )}


        </View>
    );
};

export default MusicScreen;
