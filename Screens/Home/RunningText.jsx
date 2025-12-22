import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Dimensions, StyleSheet, Easing } from "react-native";

const { width } = Dimensions.get("window");
const SPEED = 60; // Scrolling speed

const RunningText = () => {
    const translateX = useRef(new Animated.Value(0)).current;

    // 1. New Animation Value for "POP" (Scale)
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const [textWidth, setTextWidth] = useState(0);

    // Logic for Scrolling (Existing)
    useEffect(() => {
        if (!textWidth) return;

        const totalDistance = textWidth + 40; // text + gap
        const duration = (totalDistance / SPEED) * 1000;

        const animateScroll = () => {
            translateX.setValue(0);
            Animated.timing(translateX, {
                toValue: -totalDistance,
                duration: duration,
                easing: Easing.linear,
                useNativeDriver: true,
            }).start(() => animateScroll());
        };

        animateScroll();
    }, [textWidth]);

    // 2. Logic for Popping (New Pulse Effect)
    useEffect(() => {
        const animatePop = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.1, // Scale UP (1.1x bigger)
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1, // Scale DOWN (Normal size)
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        animatePop();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    flexDirection: "row",
                    transform: [{ translateX }],
                    alignItems: 'center'
                }}
            >
                {/* TEXT 1 - Added transform scale */}
                <Animated.Text
                    onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
                    numberOfLines={1}
                    style={[
                        styles.text,
                        { transform: [{ scale: scaleAnim }] } // Apply Pop Effect
                    ]}
                >
                    🚀 E-Commerce Launching Soon 🚀
                </Animated.Text>

                {/* GAP */}
                <View style={{ width: 40 }} />

                {/* TEXT 2 - Added transform scale */}
                <Animated.Text
                    numberOfLines={1}
                    style={[
                        styles.text,
                        { transform: [{ scale: scaleAnim }] } // Apply Pop Effect
                    ]}
                >
                    🚀 E-Commerce Launching Soon 🚀
                </Animated.Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 40, // Increased height slightly so pop doesn't get cut
        overflow: "hidden",
        backgroundColor: "#000",
        justifyContent: "center",
    },
    text: {
        fontSize: 14,
        fontWeight: "bold", // Bold looks better for pop
        color: "#FFD700", // Gold color looks more "Launching Soon" vibe
        textTransform: 'uppercase'
    },
});

export default RunningText;