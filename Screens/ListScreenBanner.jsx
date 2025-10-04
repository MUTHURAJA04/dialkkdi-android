import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    Dimensions,
    Animated,
    Pressable,
    Image,
} from "react-native";
import { getads } from "../services/apiClient";

// ✅ Local fallback images
import banner1 from "../assets/Banners/Banner1.jpg";
import banner2 from "../assets/Banners/Banner2.jpg";
import banner3 from "../assets/Banners/Banner3.jpg";
import banner4 from "../assets/Banners/Banner4.jpg";
import banner5 from "../assets/Banners/Banner5.jpg";

const { width: screenWidth } = Dimensions.get("window");

// 🟦 API Base URLs
const BASE_URL = "https://livecdn.dialkaraikudi.com";
// 👈 change if needed

const ListScreenBanner = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const opacityAnim1 = useRef(new Animated.Value(1)).current;
    const opacityAnim2 = useRef(new Animated.Value(0)).current;
    const opacityAnim3 = useRef(new Animated.Value(0)).current;

    const fallbackBanners = [
        { url: banner1 },
        { url: banner2 },
        { url: banner3 },
        { url: banner4 },
        { url: banner5 },
    ];

    // 🧠 Fetch ads from API
    const getAdverts = async () => {
        try {
            const response = await getads();
            const data = response || [];
            const filtered = data
                .filter(
                    (ad) =>
                        ad.slotId?._id === "68283ba4158ec22d9c5bae48" && ad.isActive
                )
                .map((ad) => ({
                    url: ad.mobileContentUrl
                        ? `${BASE_URL}/${ad.mobileContentUrl}` : null,
                    businessId: ad.businessId || null,
                }))
                .filter((ad) => ad.url);

            const merged = filtered.length
                ? [
                    ...filtered.slice(0, 3),
                    ...fallbackBanners.slice(0, Math.max(0, 3 - filtered.length)),
                ]
                : fallbackBanners.slice(0, 3);

            setBanners(merged);
        } catch (error) {
            console.error("Error loading ads:", error);
            setBanners(fallbackBanners.slice(0, 3));
        }
    };

    useEffect(() => {
        getAdverts();
    }, []);

    // 🕒 Auto change banners
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // 🌀 Fade animation
    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacityAnim1, {
                toValue: currentIndex === 0 ? 1 : 0,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim2, {
                toValue: currentIndex === 1 ? 1 : 0,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim3, {
                toValue: currentIndex === 2 ? 1 : 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();
    }, [currentIndex]);

    const imgHeight = screenWidth * 0.45;

    // 🧩 Pick valid sources
    const getImageSource = (item) =>
        typeof item?.url === "string" ? { uri: item.url } : item?.url;

    const img1 = getImageSource(banners[0]);
    const img2 = getImageSource(banners[1]);
    const img3 = getImageSource(banners[2]);

    return (
        <View className="w-full">

            <Pressable
                className="w-full mb-3 mx-auto relative overflow-hidden rounded-xl shadow-lg"
                style={{ height: imgHeight }}
            >
                {img1 && (
                    <Animated.Image
                        source={img1}
                        className="absolute w-full h-full"
                        style={{ opacity: opacityAnim1 }}
                        resizeMode="cover"
                    />
                )}
                {img2 && (
                    <Animated.Image
                        source={img2}
                        className="absolute w-full h-full"
                        style={{ opacity: opacityAnim2 }}
                        resizeMode="cover"
                    />
                )}
                {img3 && (
                    <Animated.Image
                        source={img3}
                        className="absolute w-full h-full"
                        style={{ opacity: opacityAnim3 }}
                        resizeMode="cover"
                    />
                )}
            </Pressable>
        </View>
    );
};

export default ListScreenBanner;
