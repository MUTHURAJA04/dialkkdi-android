import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    StyleSheet,
} from "react-native";

const ImageViewerModal = ({ visible, onClose, item }) => {
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            {/* Background clickable to close */}
            <TouchableOpacity style={styles.flexFill} onPress={onClose} activeOpacity={1} />

            {/* Popup */}
            <Animated.View style={[styles.popup, { transform: [{ translateY: slideAnim }] }]}>
                <Text style={styles.title}>{item?.businessName || item?.type || "Details"}</Text>
                <Text>{JSON.stringify(item, null, 2)}</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    flexFill: { flex: 1 },
    popup: {
        backgroundColor: "white",
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "70%",
    },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    closeBtn: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#3b82f6",
        borderRadius: 10,
    },
    closeText: { color: "#fff", textAlign: "center" },
});

export default ImageViewerModal;
