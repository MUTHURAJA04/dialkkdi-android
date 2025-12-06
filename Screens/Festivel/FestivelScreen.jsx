import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Image,
    TextInput,
    FlatList,
    ActivityIndicator,
    StatusBar,
    Share
} from "react-native";
// import { launchImageLibrary } from "react-native-image-picker";
import { launchCamera } from "react-native-image-picker";

import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient, { createFestivelFeed, getFestivelfeed } from "../../services/apiClient";

export default function FestivelScreen() {

    const [uploadModal, setUploadModal] = useState(false);
    const [image, setImage] = useState(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [feedData, setFeedData] = useState([]);

    const [showHeart, setShowHeart] = useState(null);
    const [infoModal, setInfoModal] = useState(false);

    let lastTap = null;

    const IMAGE_PREFIX = "https://livecdn.dialkaraikudi.com/";

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    // 📌 PICK IMAGE
    // 📌 PICK IMAGE (camera only)
    const pickImage = () => {
        const options = {
            mediaType: "photo",
            cameraType: "back",
            saveToPhotos: true,
            quality: 0.8,
        };

        launchCamera(options, (res) => {
            if (!res.didCancel && res.assets) {
                setImage(res.assets[0]);
            }
        });
    };


    // 📌 CREATE POST
    const submitPost = async () => {
        if (!name || !phone || !image) return alert("Fill all fields!");

        if (name.trim().length < 3) {
            return alert("Enter a valid name!");
        }

        if (!/^[6-9]\d{9}$/.test(phone)) {
            return alert("Enter a valid 10-digit phone number starting with 6-9!");
        }

        setLoading(true);

        const user = await AsyncStorage.getItem("userData");
        const parsed = JSON.parse(user);
        const userId = parsed._id;

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("name", name);
        formData.append("phone", phone);

        // IMPORTANT → must match Multer field name
        formData.append("festivel", {
            uri: image.uri,
            name: image.fileName,
            type: image.type,
        });

        try {
            const res = await createFestivelFeed(formData);
            console.log("API RESPONSE ===>", res);

            if (res.success) {
                alert(res.message || "Post submitted!");
                setModalVisible(false);
                setName("");
                setPhone("");
                setImage(null);
            } else {
                alert(res.message || "Something went wrong!");
            }
        } catch (err) {
            console.log(err);
            alert(err.message || "Error submitting post");
        }

        setLoading(false);
    };

    // 📌 GET FEED
    const fetchFeed = async () => {
        try {
            const res = await getFestivelfeed();
            setFeedData(res);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    // 📌 LIKE TOGGLE
    const toggleLike = async (postId) => {
        try {
            const token = await AsyncStorage.getItem("token");

            const user = await AsyncStorage.getItem("userData");
            console.log(user);

            const parsed = JSON.parse(user);
            const userId = parsed.id;

            const res = await apiClient.put(
                `/festivel/like/${postId}`,
                { userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setFeedData((prev) =>
                prev.map((p) =>
                    p._id === postId ? { ...p, likesCount: res.data.likesCount } : p
                )
            );
        } catch (err) {
            console.log("Like Error:", err);
        }
    };

    // 📌 DOUBLE TAP DETECT
    const handleDoubleTap = (postId) => {
        const now = Date.now();
        if (lastTap && (now - lastTap) < 300) {
            toggleLike(postId);
            setShowHeart(postId);
            setTimeout(() => setShowHeart(null), 700);
        }
        lastTap = now;
    };

    const handleShare = async (item) => {
        try {
            const msg =
                `🎉 ${item.name} posted!\n\n` +
                `Check this picture:\n` +
                `https://play.google.com/store/apps/details?id=com.dialkaraikudi`;

            await Share.share({ message: msg });
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <View className="flex-1 bg-gray-100">

            {/* HEADER */}
            <View className="bg-green-500 flex-row justify-between items-center px-5 py-4">
                <Text className="text-white text-xl font-bold">Festivel Feed</Text>

                <View className="flex-row items-center">

                    {/* ℹ️ INFO BUTTON */}
                    <TouchableOpacity
                        onPress={() => setInfoModal(true)}
                        className="bg-white rounded-full px-2 py-1 mr-3"
                    >
                        <Text className="text-purple-700 text-2xl font-bold">i</Text>
                    </TouchableOpacity>

                    {/* ➕ UPLOAD BUTTON */}
                    <TouchableOpacity
                        onPress={() => setUploadModal(true)}
                        className="bg-white rounded-full px-3 py-1"
                    >
                        <Text className="text-purple-700 text-2xl font-bold">+</Text>
                    </TouchableOpacity>

                </View>
            </View>

            {/* ℹ️ INFORMATION MODAL */}
            <Modal visible={infoModal} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="bg-white w-11/12 rounded-xl p-6">

                        <Text className="text-xl font-bold text-center mb-3">
                            Festival Rules & Info
                        </Text>

                        <Text className="text-gray-700 mb-1">• Photos must be clear and original</Text>
                        <Text className="text-gray-700 mb-1">• Highest likes will decide the daily winner</Text>
                        <Text className="text-gray-700 mb-1">• Beautiful kolam, clarity and creativity are considered</Text>
                        <Text className="text-gray-700 mb-1">• Each post will stay live for 7 days</Text>
                        <Text className="text-gray-700 mb-1">• People can share your post to get more likes</Text>
                        <Text className="text-gray-700 mb-1">• A winner is selected every day</Text>
                        <Text className="text-gray-700 mb-1">• Grand Prize ceremony on Jan 25 at Planiyappa Chettiar Hall</Text>
                        <Text className="text-gray-700 mb-1">• Overall performer award will also be given</Text>

                        <TouchableOpacity
                            onPress={() => setInfoModal(false)}
                            className="bg-purple-600 p-3 rounded-lg mt-5"
                        >
                            <Text className="text-center text-white font-bold">Close</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>

            {/* FEED LIST */}
            <FlatList
                data={feedData}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View className="bg-white m-3 p-3 rounded-xl shadow">

                        {/* DOUBLE TAP LIKE */}
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => handleDoubleTap(item._id)}
                        >
                            <View className="relative">
                                <Image
                                    source={{ uri: `${IMAGE_PREFIX}${item.imageUrl}` }}
                                    className="w-full h-64 rounded-xl"
                                />

                                {/* ❤️ Heart animation */}
                                {showHeart === item._id && (
                                    <View className="absolute inset-0 justify-center items-center">
                                        <Text style={{ fontSize: 90, opacity: 0.9 }}>❤️</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                        <View className="flex-row justify-between mt-3">
                            {/* NAME */}
                            <Text className=" text-lg text-black font-bold">{item.name}</Text>

                            <TouchableOpacity
                                onPress={() => handleShare(item)}
                                className="bg-purple-600 px-3 py-1 rounded"
                            >
                                <Text className="text-white">Share</Text>
                            </TouchableOpacity>
                        </View>

                        {/* LIKE BUTTON */}
                        <TouchableOpacity
                            onPress={() => toggleLike(item._id)}
                            className="mt-2"
                        >
                            <View className="flex flex-row justify-between">
                                <Text className="text-xl text-gray-700">
                                    ❤️ {item.likesCount || 0} Likes
                                </Text>
                                <Text style={{ marginTop: 5, color: "#555", fontSize: 12 }}>
                                    {formatTime(item.updatedAt)}
                                </Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                )}
            />

            {/* UPLOAD MODAL */}
            <Modal visible={uploadModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="bg-white w-11/12 rounded-xl p-5">

                        <Text className="text-xl font-bold">Upload Post</Text>

                        <TextInput
                            placeholder="Name"
                            value={name}
                            onChangeText={(text) => {
                                const onlyLetters = text.replace(/[^A-Za-z ]/g, "");
                                setName(onlyLetters);
                            }}
                            className="border border-gray-300 rounded-lg p-3 mt-4"
                        />

                        <TextInput
                            placeholder="Phone"
                            value={phone}
                            onChangeText={(text) => {
                                let num = text.replace(/[^0-9]/g, "");
                                if (num.length === 1 && !/[6-9]/.test(num)) {
                                    return;
                                }
                                if (num.length <= 10) setPhone(num);
                            }}
                            keyboardType="numeric"
                            maxLength={10}
                            className="border border-gray-300 rounded-lg p-3 mt-3"
                        />


                        {image && (
                            <Image
                                source={{ uri: image.uri }}
                                className="w-32 h-32 rounded-lg mt-4"
                            />
                        )}

                        <TouchableOpacity
                            onPress={pickImage}
                            className="bg-gray-700 rounded-lg p-3 mt-4 items-center"
                        >
                            <Text className="text-white">Choose Image</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={submitPost}
                            className="bg-purple-700 rounded-lg p-4 mt-5 items-center"
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-bold">Submit</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setUploadModal(false)}
                            className="mt-4 items-center"
                        >
                            <Text className="text-red-500 font-bold">Close</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Modal>
        </View>
    );
}
