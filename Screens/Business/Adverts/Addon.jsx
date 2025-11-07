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
    Animated,
    Easing
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchadverts } from "../../../services/apiClient";
import { Zap, Award, Clock, ChevronRight, AlertCircle } from "react-native-feather";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";

const { width } = Dimensions.get("window");

const Addon = () => {
    const [adverts, setAdverts] = useState([]);
    const [business, setBusiness] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [fadeAnim] = useState(new Animated.Value(0));

    const navigation = useNavigation();

    useEffect(() => {
        init();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true
        }).start();
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

    const getGradientColors = (index) => {
        const gradients = [
            ["#6366F1", "#8B5CF6", "#EC4899"], // Indigo to purple to pink
            ["#0EA5E9", "#3B82F6", "#6366F6"], // Sky to blue to indigo
            ["#EC4899", "#8B5CF6", "#6366F1"], // Pink to purple to indigo
            ["#10B981", "#3B82F6", "#0EA5E9"], // Emerald to blue to sky
            ["#F59E0B", "#EF4444", "#EC4899"], // Amber to red to pink
        ];
        return gradients[index % gradients.length];
    };

    // AnimatedBorder Component with pulse effect
    const AnimatedBorder = ({ index, children, isPurchased }) => {
        const [rotation] = useState(new Animated.Value(0));
        const [pulse] = useState(new Animated.Value(1));
        
        useEffect(() => {
            // Rotating border animation
            const animateBorder = () => {
                Animated.loop(
                    Animated.timing(rotation, {
                        toValue: 1,
                        duration: 2500,
                        easing: Easing.linear,
                        useNativeDriver: true
                    })
                ).start();
            };
            
            // Pulsing effect for all cards
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, {
                        toValue: 1.02,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true
                    }),
                    Animated.timing(pulse, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true
                    })
                ])
            ).start();
            
            animateBorder();
        }, []);

        const rotateInterpolation = rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        return (
            <View className="rounded-3xl overflow-hidden" style={{ position: 'relative' }}>
                {/* Enhanced Water Flow Shadow */}
                <Animated.View 
                    style={{ 
                        transform: [{ rotate: rotateInterpolation }],
                        position: 'absolute',
                        width: '200%',
                        height: '200%',
                        top: '-50%',
                        left: '-50%',
                        zIndex: 0,
                        opacity: 0.8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 25,
                        elevation: 25,
                    }}
                >
                    <LinearGradient
                        colors={getGradientColors(index)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </Animated.View>
                
                {/* Main Border - Thicker and more visible */}
                <Animated.View 
                    style={{ 
                        transform: [{ rotate: rotateInterpolation }],
                        position: 'absolute',
                        width: '200%',
                        height: '200%',
                        top: '-50%',
                        left: '-50%',
                        zIndex: 1
                    }}
                >
                    <LinearGradient
                        colors={getGradientColors(index)}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </Animated.View>
                
                {/* Content Container with pulse effect for all cards */}
                <Animated.View 
                    className="bg-white rounded-3xl overflow-hidden m-1.5" 
                    style={{ 
                        zIndex: 2,
                        transform: [{ scale: pulse }]
                    }}
                >
                    {children}
                </Animated.View>
            </View>
        );
    };

    // Floating particles animation (only in header area)
    const FloatingParticles = ({ index }) => {
        const [animations] = useState(() => {
            return Array(3).fill().map(() => new Animated.Value(0));
        });

        useEffect(() => {
            animations.forEach((anim, i) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 2000 + i * 500,
                            easing: Easing.inOut(Easing.quad),
                            useNativeDriver: true,
                            delay: i * 300
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 2000 + i * 500,
                            easing: Easing.inOut(Easing.quad),
                            useNativeDriver: true
                        })
                    ])
                ).start();
            });
        }, []);

        return (
            <>
                {animations.map((anim, i) => {
                    const left = 5 + Math.random() * 90;
                    const top = 5 + Math.random() * 90;
                    
                    const translateY = anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10 - i * 3]
                    });
                    
                    const opacity = anim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.2, 0.5, 0.2]
                    });

                    return (
                        <Animated.View
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${left}%`,
                                top: `${top}%`,
                                width: 3 + i,
                                height: 3 + i,
                                borderRadius: 50,
                                backgroundColor: getGradientColors(index)[0],
                                opacity,
                                transform: [{ translateY }],
                                zIndex: 3
                            }}
                        />
                    );
                })}
            </>
        );
    };

    const renderCard = (item, index) => {
        const isPurchased = item.allowedBusinesses.includes(business?.id);
        const isFull = item.allowedBusinesses.length >= item.maxAds;

        let buttonText = "Buy Slot";
        let buttonColor = "bg-emerald-500";
        let disabled = false;

        if (isPurchased) {
            buttonText = "Purchased";
            buttonColor = "bg-blue-500";
            disabled = true;
        } else if (isFull) {
            buttonText = "Slots Full";
            buttonColor = "bg-rose-500";
            disabled = true;
        }

        return (
            <Animated.View 
                className="mb-8"
                style={{ 
                    opacity: fadeAnim,
                    transform: [{
                        translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0]
                        })
                    }]
                }}
            >
            
                <View style={{ position: 'relative' }}>
                    <AnimatedBorder index={index} isPurchased={isPurchased}>
                        {/* Header with enhanced gradient */}
                        <LinearGradient
                            colors={getGradientColors(index)}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="px-6 py-5 flex-row justify-between items-center relative"
                        >
                            {/* Floating particles only in header */}
                            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
                                <FloatingParticles index={index} />
                            </View>
                            
                            <Text className="text-white font-bold text-xl">{item.name}</Text>
                            <View className="bg-white/20 rounded-xl px-4 py-2">
                                <Text className="text-white font-semibold">
                                    ₹{item.price}
                                    <Text className="text-sm text-white/80"> /{item.adDurationInDays}d</Text>
                                </Text>
                            </View>
                        </LinearGradient>

                        {/* Content */}
                        <View className="p-6">
                            <Text className="text-slate-600 text-base mb-4 leading-6">{item.description}</Text>

                            {/* Features with subtle animations */}
                            <View className="space-y-4 mb-6">
                                <View className="flex-row items-center">
                                    <Animated.View className="bg-indigo-100 p-2 rounded-full mr-3" 
                                        style={{ transform: [{ rotate: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['-10deg', '0deg']
                                        })}] }}>
                                        <Zap width={18} height={18} color="#6366F1" />
                                    </Animated.View>
                                    <Text className="text-slate-700 font-medium">{item.slotType}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Animated.View className="bg-amber-100 p-2 rounded-full mr-3"
                                        style={{ transform: [{ rotate: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['10deg', '0deg']
                                        })}] }}>
                                        <Clock width={18} height={18} color="#F59E0B" />
                                    </Animated.View>
                                    <Text className="text-slate-700 font-medium">{item.adDurationInDays} days duration</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Animated.View className="bg-emerald-100 p-2 rounded-full mr-3"
                                        style={{ transform: [{ rotate: fadeAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['-5deg', '0deg']
                                        })}] }}>
                                        <Award width={18} height={18} color="#10B981" />
                                    </Animated.View>
                                    <Text className="text-slate-700 font-medium">
                                        {item.allowedBusinesses.length}/{item.maxAds} slots filled
                                    </Text>
                                </View>
                            </View>

                            {/* Progress bar with animated fill */}
                            <View className="mb-6">
                                <View className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <Animated.View
                                        className="h-full rounded-full"
                                        style={{
                                            width: fadeAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', `${(item.allowedBusinesses.length / item.maxAds) * 100}%`]
                                            })
                                        }}
                                    >
                                        <LinearGradient
                                            colors={getGradientColors(index)}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </Animated.View>
                                </View>
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-slate-500 text-sm">Available slots</Text>
                                    <Text className="text-slate-600 text-sm font-medium">
                                        {item.maxAds - item.allowedBusinesses.length} remaining
                                    </Text>
                                </View>
                            </View>

                            {/* Button with hover effect */}
                            <TouchableOpacity
                                disabled={disabled}
                                onPress={() => !disabled && handleButton(item)}
                                activeOpacity={0.8}
                                className={`py-4 rounded-xl ${buttonColor} ${disabled ? "opacity-70" : ""} flex-row items-center justify-center shadow-lg`}
                            >
                                <Text className="text-center text-white font-bold text-base mr-2">{buttonText}</Text>
                                {!disabled && <ChevronRight width={18} height={18} color="white" />}
                            </TouchableOpacity>
                        </View>
                    </AnimatedBorder>
                </View>
            </Animated.View>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar backgroundColor="#0f172a" barStyle="light-content" />

            <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
                <Text className="text-3xl font-bold text-slate-800 mb-2">Premium Ad Slots</Text>
                <Text className="text-slate-500 mb-6">Boost your visibility with our exclusive advertisement plans</Text>
                
                {adverts.length > 0 ? (
                    <FlatList
                        data={adverts}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item, index }) => renderCard(item, index)}
                        scrollEnabled={false}
                        contentContainerStyle={{ paddingBottom: 30 }}
                    />
                ) : (
                    <View className="items-center justify-center py-10">
                        <Text className="text-slate-400">Loading premium plans...</Text>
                    </View>
                )}
            </ScrollView>

            {/* Enhanced Modal */}
            <Modal
                visible={!!selectedPlan}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedPlan(null)}
            >
                <View className="flex-1 bg-black/80 items-center justify-center px-4">
                    <View className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl">
                        <View className="flex-row items-center mb-4">
                            <View className="bg-amber-100 p-2 rounded-full mr-3">
                                <AlertCircle width={20} height={20} color="#F59E0B" />
                            </View>
                            <Text className="text-xl font-bold text-slate-800">
                                Important Information
                            </Text>
                        </View>
                        
                        <ScrollView className="mb-5 max-h-72">
                            {[
                                "All advertisements are subject to review and approval.",
                                "Pricing is applicable per advertisement for the specified duration.",
                                "Advertisement content must comply with our advertising policies.",
                                "Ad placement is subject to availability and display priority.",
                                "Only one slot per type is allowed per business.",
                                "Each slot type has limited positions .",
                                "If slots are full, contact us to reserve your spot.",
                                "Refunds are not available once an advertisement becomes active.",
                                "For further queries, contact us at: +91 94423 38670",
                            ].map((rule, index) => (
                                <View key={index} className="flex-row items-start mb-3">
                                    <Text className="text-emerald-500 mr-3 mt-1">•</Text>
                                    <Text className="text-slate-700 text-sm flex-1 leading-5">{rule}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate("Checkout", { plan: selectedPlan });
                                setSelectedPlan(null);
                            }}
                            className="bg-emerald-500 p-4 rounded-xl mb-3 shadow-md"
                        >
                            <Text className="text-center text-white font-bold text-base">Continue to Payment</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setSelectedPlan(null)}
                            className="bg-slate-100 p-4 rounded-xl"
                        >
                            <Text className="text-center text-slate-700 font-medium">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Addon;