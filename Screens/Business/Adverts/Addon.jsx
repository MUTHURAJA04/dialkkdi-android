import React, { useCallback, useEffect, useState } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Dimensions,
    StatusBar,
    ScrollView,
    Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchadverts } from "../../../services/apiClient";
import { Zap, Award, Clock } from "react-native-feather";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get('window');

const Addon = () => {
    const [adverts, setAdverts] = useState([]);
    const [business, setBusiness] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const navigation = useNavigation();

    useEffect(() => {
        init();
    }, []);

    useFocusEffect(
        useCallback(() => {
            init();
        }, [])
    );

    const init = async () => {
        try {
            const stored = await AsyncStorage.getItem("businessData");
            if (stored) {
                setBusiness(JSON.parse(stored));
            }

            const res = await fetchadverts();
            setAdverts(res);
        } catch (error) {
            console.error(error);
        }
    };

    const handleButton = (item) => {
        setSelectedPlan(item);
    };

    const renderCard = (item, index) => {
        const isPurchased = item.allowedBusinesses.includes(business?.id);
        const isFull = item.allowedBusinesses.length >= item.maxAds;

        let buttonText = "Buy Slot";
        let buttonColor = "bg-green-600";
        let disabled = false;

        if (isPurchased) {
            buttonText = "Purchased";
            buttonColor = "bg-blue-600";
            disabled = true;
        } else if (isFull) {
            buttonText = "Slots Full";
            buttonColor = "bg-red-600";
            disabled = true;
        }

        return (
            <View className={`relative rounded-lg mb-5 overflow-hidden bg-orange-300 border`}>
                <View className="p-5">
                    {/* Header with price */}
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white font-bold text-xl">{item.name}</Text>
                        <View className="bg-slate-700 rounded-lg px-3 py-1">
                            <Text className="text-white text-base">
                                ₹<Text className="font-bold text-xl">{item.price}</Text>
                                <Text className="text-slate-300 text-xs"> /{item.adDurationInDays}d</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Description */}
                    <Text className="text-black text-base mb-1">{item.description}</Text>

                    {/* Features */}
                    <View className=" mb-6">
                        <View className="flex-row my-2 items-center">
                            <View className="bg-emerald-900 p-1 rounded-full mr-3">
                                <Zap width={16} height={16} color="#10b981" />
                            </View>
                            <Text className="text-slate-600">{item.slotType}</Text>
                        </View>
                        <View className="flex-row my-2 items-center">
                            <View className="bg-amber-900 p-1 rounded-full mr-3">
                                <Clock width={16} height={16} color="#f59e0b" />
                            </View>
                            <Text className="text-slate-600">{item.adDurationInDays} days duration</Text>
                        </View>
                        <View className="flex-row my-2 items-center">
                            <View className="bg-blue-900 p-1 rounded-full mr-3">
                                <Award width={16} height={16} color="#3b82f6" />
                            </View>
                            <Text className="text-slate-600">
                                {item.allowedBusinesses.length}/{item.maxAds} slots filled
                            </Text>
                        </View>
                    </View>

                    {/* Progress bar */}
                    <View className="mb-5">
                        <View className="h-2 bg-white rounded-full overflow-hidden">
                            <View
                                className="h-full bg-emerald-500 rounded-full"
                                style={{
                                    width: `${(item.allowedBusinesses.length / item.maxAds) * 100}%`
                                }}
                            />
                        </View>
                        <View className="flex-row justify-between mt-1">
                            <Text className="text-black text-sm">Available slots</Text>
                            <Text className="text-black text-sm">
                                {item.maxAds - item.allowedBusinesses.length} remaining
                            </Text>
                        </View>
                    </View>

                    {/* Button */}
                    <TouchableOpacity
                        disabled={disabled}
                        onPress={() => !disabled && handleButton(item)}
                        activeOpacity={0.8}
                        className={`py-4 rounded-xl ${buttonColor} ${disabled ? 'opacity-90' : ''}`}
                    >
                        <Text className="text-center text-white font-bold text-base">
                            {buttonText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar backgroundColor="#0f172a" barStyle="light-content" />

            <ScrollView
                className="flex-1 p-4"
                showsVerticalScrollIndicator={false}
            >
                {adverts.length > 0 ? (
                    <FlatList
                        data={adverts}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item, index }) => renderCard(item, index)}
                        scrollEnabled={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <View className="items-center justify-center py-10">
                        <Text className="text-slate-400">Loading advertisement plans...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Modal */}
            <Modal
                visible={!!selectedPlan}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedPlan(null)}
            >
                <View className="flex-1 bg-black/50 items-center justify-center">
                    <View className="bg-white p-6 rounded-2xl w-4/5">
                        <View className="mb-4">
                            {[
                                "All advertisements are subject to review and approval.",
                                "Pricing is applicable per advertisement for the specified duration.",
                                "Advertisement content must comply with our advertising policies.",
                                "Ad placement is subject to availability and display priority.",
                                "Only one slot per type is allowed per business — multiple bookings of the same slot type by one business are not permitted.",
                                "Each slot type has a limited number of available positions (e.g., homepage banner allows max 10 different businesses).",
                                "If all ad slots are currently full, please contact us to reserve your spot for the next availability.",
                                "Refunds are not available once an advertisement becomes active.",
                                "For further queries, contact us at: +91 94423 38670",
                            ].map((rule, index) => (
                                <View key={index} className="flex-row items-start mb-1">
                                    <Text className="text-blue-800 mr-2">•</Text>
                                    <Text className="text-blue-800 text-[12px] flex-1">{rule}</Text>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("Checkout", { plan: selectedPlan });
                                setSelectedPlan(null);
                            }}
                            className="bg-green-600 p-3 rounded-xl mb-3"
                        >
                            <Text className="text-center text-white font-bold">Continue</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setSelectedPlan(null)}
                            className="bg-red-500 p-3 rounded-xl"
                        >
                            <Text className="text-center text-white">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Addon;
