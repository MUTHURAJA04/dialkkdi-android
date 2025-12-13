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
    Share,
    Alert
} from "react-native";
// import { launchImageLibrary } from "react-native-image-picker";
import { launchCamera } from "react-native-image-picker";
import { Grid, Info } from 'react-native-feather';

import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient, { createFestivelFeed, getFestivelfeed } from "../../services/apiClient";
import YoutubePlayer from "react-native-youtube-iframe";

export default function FestivelScreen() {
    const [uploadModal, setUploadModal] = useState(false);
    const [image, setImage] = useState(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [feedData, setFeedData] = useState([]);

    const [address, setAddress] = useState("");
    const [ward, setWard] = useState("");
    const [wardList, setWardList] = useState([]);
    const [showWardDropdown, setShowWardDropdown] = useState(false);


    const [showHeart, setShowHeart] = useState(null);
    const [infoModal, setInfoModal] = useState(false);


    useEffect(() => {

        let arr = [];
        for (let i = 1; i <= 100; i++) arr.push(i);
        setWardList(arr);
    }, []);



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

        if (name.trim().length < 2) {
            return Alert.alert("Name must be at least 2 characters!");
        }

        if (!/^[6-9]\d{9}$/.test(phone)) {
            return Alert.alert("Enter a valid 10-digit phone number starting with 6-9!");
        }

        setLoading(true);

        const user = await AsyncStorage.getItem("userData");
        const parsed = JSON.parse(user);
        const userId = parsed.id;

        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("name", name);
        formData.append("phone", phone);
        formData.append("address", address);
        formData.append("wardNo", ward);

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
                Alert.alert(
                    "Success",
                    res.message || "Post submitted!",
                    [
                        {
                            text: "OK",
                            onPress: () => {

                                setName("");
                                setPhone("");
                                setImage(null);
                                setInfoModal(false);
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(
                    "Error",
                    res.message || "Something went wrong!",
                    [
                        {
                            text: "OK",
                            onPress: () => setInfoModal(false)
                        }
                    ]
                );
            }

        } catch (err) {
            console.log(err);
            Alert.alert(
                "Error",
                err.message || "Error submitting post",
                [
                    {
                        text: "OK",
                        onPress: () => setModalVisible(false)
                    }
                ]
            );
        } finally {
            setLoading(false)
        }


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
                `🎉கோலம் திருவிழா\n` +
                `${item.name} Like my kolam on the link\n` +
                `https://play.google.com/store/apps/details?id=com.dialkaraikudi`;

            await Share.share({ message: msg });
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <View className="flex-1 bg-gray-100">

            {/* HEADER */}
            <View className="bg-orange-500 flex-row justify-between items-center px-5 pt-6 pb-2">
                <Text className="mt-3 text-white text-xl font-bold">கோலம் திருவிழா</Text>

                <View className="flex-row items-center">

                    {/* ℹ️ INFO BUTTON */}
                    <TouchableOpacity
                        onPress={() => setInfoModal(true)}
                        className=" rounded-full px-2 py-1 mr-3 mt-4"
                    >
                        <Text className="text-purple-700 text-2xl font-bold">
                            <Info
                                // stroke={isDarkMode ? "#ffffff" : "#000000"}
                                width={32}
                                height={32}
                                color={"white"}
                            />
                        </Text>
                    </TouchableOpacity>

                    {/* ➕ UPLOAD BUTTON */}
                    <TouchableOpacity
                        onPress={() => setUploadModal(true)}
                        className="bg-white rounded-full px-3 py-1 mt-4"
                    >
                        <Text className="text-purple-700 text-2xl font-bold">+</Text>
                    </TouchableOpacity>

                </View>
            </View>

            {/* ℹ️ INFORMATION MODAL */}
            <Modal visible={infoModal} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="bg-white w-11/12 rounded-xl p-6">

                        {/* YOUTUBE VIDEO */}
                        <View style={{ width: "100%", height: 220 }}>
                            <YoutubePlayer
                                height={220}
                                play={false}
                                videoId={"Lj7yOn76BUw"}
                            />
                        </View>


                        {/* TITLE */}
                        <Text className="text-xl font-bold text-center mb-3">
                            Festival Rules & Info
                        </Text>

                        {/* RULES */}
                        <Text className="text-gray-700 mb-1">• Photos must be clear and original</Text>
                        <Text className="text-gray-700 mb-1">• Highest likes will decide the daily winner</Text>
                        <Text className="text-gray-700 mb-1">• Beautiful kolam, clarity and creativity are considered</Text>
                        <Text className="text-gray-700 mb-1">• Each post will stay live for 7 days</Text>
                        <Text className="text-gray-700 mb-1">• People can share your post to get more likes</Text>
                        <Text className="text-gray-700 mb-1">• A winner is selected every day</Text>
                        <Text className="text-gray-700 mb-1">• Grand Prize ceremony on Jan 25 at L.CT.L Palaniyappa chettiyar Auditorium</Text>

                        {/* CLOSE BUTTON */}
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
                showsVerticalScrollIndicator={true}
                renderItem={({ item }) => (
                    <View className="bg-gray-200 m-3 p-3 rounded-xl shadow">

                        {/* DOUBLE TAP LIKE */}
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => handleDoubleTap(item._id)}
                        >
                            <View className="relative w-full" style={{ aspectRatio: 1 }}>
                                <Image
                                    source={{ uri: `${IMAGE_PREFIX}${item.imageUrl}` }}
                                    className="w-full h-full rounded-xl"
                                    resizeMode="contain"
                                />

                                {showHeart === item._id && (
                                    <View className="absolute inset-0 justify-center items-center">
                                        <Text style={{ fontSize: 90, opacity: 0.9 }}>❤️</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                        <View className="flex-row justify-between mt-3">
                            <Text className=" text-lg text-black font-bold">{item.name}</Text>

                            <TouchableOpacity
                                onPress={() => handleShare(item)}
                                className="bg-purple-600 px-3 py-1 rounded"
                            >
                                <Text className="text-white">Share</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => toggleLike(item._id)} className="mt-2">
                            <View className="flex flex-row justify-between">
                                <Text className="text-xl text-gray-700">
                                    {item.likesCount || 0} Likes
                                </Text>
                                <Text style={{ marginTop: 5, color: "#555", fontSize: 12 }}>
                                    {formatTime(item.updatedAt)}
                                </Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                )}

                /** 👇 THIS PART ADDED */
                ListEmptyComponent={() => (
                    <View style={{ padding: 50, alignItems: "center" }}>
                        <Text style={{ fontSize: 18, color: "#777" }}>
                            No posts available
                        </Text>
                    </View>
                )}
            />


            {/* UPLOAD MODAL */}
            <Modal visible={uploadModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="bg-white w-11/12 rounded-xl p-5">

                        <Text className="text-xl font-bold">Upload Post</Text>

                        {/* NAME FIELD */}
                        <Text className="text-sm font-semibold mt-4 mb-1 text-gray-700">
                            Name
                        </Text>

                        <TextInput
                            placeholder="Enter your name"
                            placeholderTextColor="#888"
                            value={name}
                            maxLength={30}
                            onChangeText={(text) => {
                                let clean = text.replace(/^[ ]+/, "");
                                clean = clean.replace(/[^A-Za-z ]/g, "");
                                setName(clean);
                            }}
                            className="border border-gray-300 rounded-lg p-3"
                        />

                        {/* PHONE FIELD */}
                        <Text className="text-sm font-semibold mt-4 mb-1 text-gray-700">
                            Phone Number
                        </Text>

                        <TextInput
                            placeholder="Enter phone number"
                            placeholderTextColor="#888"
                            value={phone}
                            onChangeText={(text) => {
                                let num = text.replace(/[^0-9]/g, "");
                                if (num.length === 1 && !/[6-9]/.test(num)) return;
                                if (num.length <= 10) setPhone(num);
                            }}
                            keyboardType="numeric"
                            maxLength={10}
                            className="border border-gray-300 rounded-lg p-3"
                        />

                        {/* ADDRESS FIELD */}


                        {/* WARD DROPDOWN */}
                        <Text className="text-sm font-semibold mt-4 mb-1 text-gray-700">
                            Ward
                        </Text>

                        <TouchableOpacity
                            onPress={() => setShowWardDropdown(!showWardDropdown)}
                            className="border border-gray-300 rounded-lg p-3"
                        >
                            <Text>{ward ? `Ward ${ward}` : "Select Ward"}</Text>
                        </TouchableOpacity>

                        {showWardDropdown && (
                            <View className="max-h-40 border border-gray-300 rounded-lg mt-2 bg-white">
                                <FlatList
                                    data={wardList}
                                    keyExtractor={(i) => i.toString()}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setWard(item);
                                                setShowWardDropdown(false);
                                            }}
                                            className="p-3 border-b border-gray-200"
                                        >
                                            <Text>Ward {item}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        )}

                        <Text className="text-sm font-semibold mt-4 mb-1 text-gray-700">
                            Address
                        </Text>

                        <TextInput
                            placeholder="Enter Address"
                            placeholderTextColor="#888"
                            value={address}
                            multiline
                            numberOfLines={3}
                            onChangeText={(t) => setAddress(t)}
                            className="border border-gray-300 rounded-lg p-3 h-24"
                        />

                        {/* IMAGE PREVIEW */}
                        {image && (
                            <Image
                                source={{ uri: image.uri }}
                                className="w-32 h-32 rounded-lg mt-4"
                            />
                        )}

                        {/* PICK IMAGE */}
                        <TouchableOpacity
                            onPress={pickImage}
                            className="bg-gray-700 rounded-lg p-3 mt-4 items-center"
                        >
                            <Text className="text-white">Take Photo</Text>
                        </TouchableOpacity>

                        {/* SUBMIT */}
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

                        {/* CLOSE */}
                        <TouchableOpacity
                            onPress={() => {
                                setUploadModal(false);
                                setName("");
                                setPhone("");
                                setAddress("");
                                setWard("");
                                setImage(null);
                            }}
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
