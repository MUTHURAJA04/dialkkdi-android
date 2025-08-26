import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Alert,
    Modal,
    SafeAreaView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { civicFeedUpdate, civicFeedUser } from "../../services/apiClient";

export default function CivicCrud() {
    const [form, setForm] = useState({ title: "", description: "", imageUrl: null });
    const [posts, setPosts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [userType, setUserType] = useState("guest");

    const Img_Url = "https://livecdn.dialkaraikudi.com";

    useEffect(() => {
        fetchPosts();
        fetchUserType();
    }, []);

    const fetchUserType = async () => {
        try {
            const userData = await AsyncStorage.getItem("userData");
            const businessData = await AsyncStorage.getItem("businessData");

            if (userData) {
                setUserType("user");
            } else if (businessData) {
                setUserType("business");
            } else {
                setUserType("guest");
            }
        } catch (e) {
            console.log("Error reading userType:", e);
        }
    };

    const fetchPosts = async () => {
        try {
            const fetchCivicPosts = await civicFeedUser();
            setPosts(fetchCivicPosts);
        } catch (error) {
            console.log(error);
        }
    };

    const handleAddPhoto = () => {
        launchImageLibrary(
            { mediaType: "photo", selectionLimit: 1 },
            (response) => {
                if (!response.didCancel && response.assets?.length > 0) {
                    setForm({ ...form, imageUrl: response.assets[0].uri });
                }
            }
        );
    };

    const validateForm = () => {
        if (!form.title.trim()) {
            Alert.alert("Validation Error", "Please enter a title");
            return false;
        }
        if (!form.description.trim()) {
            Alert.alert("Validation Error", "Please enter a description");
            return false;
        }
        if (!form.imageUrl) {
            Alert.alert("Validation Error", "Please upload an image");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const formData = new FormData();

            formData.append("title", form.title);
            formData.append("description", form.description);

            // ✅ If picked image is local (file://), append as file
            if (form.imageUrl && form.imageUrl.startsWith("file:///")) {
                formData.append("image", {
                    uri: form.imageUrl,
                    name: `civic_${Date.now()}.jpg`,
                    type: "image/jpeg",
                });
            }

            console.log("👉 Form Data:", formData);

            let response;

            if (editingId) {
                // ✅ Pass posterId & formData in an object
                response = await civicFeedUpdate({ posterId: editingId, formData });
                Alert.alert("Success", "Post updated successfully");
                fetchPosts();
            } else {
                response = await civicFeedUser(formData);
                Alert.alert("Success", "Post created successfully");

                setPosts((prev) => [...prev, response.data]); // take server response
            }

            // Reset form
            setForm({ title: "", description: "", imageUrl: null });
            setEditingId(null);
        } catch (err) {
            console.error("❌ Submit Error:", err);
            Alert.alert("Error", "Something went wrong while saving");
        }
    };



    const handleEdit = (post) => {
        setForm({ title: post.title, description: post.description, imageUrl: post.imageUrl });
        setEditingId(post._id);
    };

    const handleDelete = () => {
        setPosts((prev) => prev.filter((p) => p._id !== confirmDelete));
        setConfirmDelete(null);
        Alert.alert("Deleted", "Post removed successfully");
    };

    const getImageUrl = (url) => {
        // If url already full http link, return as is
        return url?.startsWith("http") ? url : `${Img_Url}/${url}`;
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-white mx-4 p-4 rounded-2xl shadow">
                <Text className="text-xl font-semibold text-blue-600 mb-3">
                    {editingId ? "Edit Post" : "Create Post"}
                </Text>

                <TextInput
                    placeholder="Title"
                    value={form.title}
                    onChangeText={(t) => setForm({ ...form, title: t })}
                    className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
                />

                <TextInput
                    placeholder="Description"
                    value={form.description}
                    onChangeText={(t) => setForm({ ...form, description: t })}
                    className="border border-gray-300 rounded-lg px-3 py-2 mb-3 h-24"
                    multiline
                />

                <TouchableOpacity
                    className="border border-blue-500 rounded-lg px-4 py-2 items-center mb-3"
                    onPress={handleAddPhoto}
                >
                    <Text className="text-blue-600 font-medium">Upload Image</Text>
                </TouchableOpacity>

                {form.imageUrl && (
                    <View className="flex-row justify-center">
                        <Image source={{ uri: getImageUrl(form.imageUrl) }} className="w-24 h-24 rounded-lg my-2" />
                    </View>
                )}

                <View className="flex-row justify-between mt-3">
                    <TouchableOpacity
                        className="bg-gray-500 px-4 py-2 rounded-lg"
                        onPress={() => {
                            setForm({ title: "", description: "", imageUrl: null });
                            setEditingId(null);
                        }}
                    >
                        <Text className="text-white font-semibold">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-blue-600 px-4 py-2 rounded-lg"
                        onPress={handleSubmit}
                    >
                        <Text className="text-white font-semibold">
                            {editingId ? "Update" : "Create"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text className="text-2xl font-bold text-center text-orange-600 my-4">
                My Civic Events & Issues
            </Text>

            <FlatList
                data={posts}
                keyExtractor={(item) => item._id?.toString() || item.id?.toString()}
                contentContainerStyle={{ paddingHorizontal: 16 }}
                renderItem={({ item }) => (
                    <View className="bg-white p-4 rounded-xl mb-3 shadow">
                        <Text className="text-lg mb-2 font-semibold">{item.title}</Text>

                        {item.imageUrl && (
                            <Image source={{ uri: getImageUrl(item.imageUrl) }} className="w-24 h-24 rounded mb-2" />
                        )}

                        <Text className="text-sm my-2 text-gray-600">{item.description}</Text>

                        <Text
                            className={`self-start px-2 py-1 rounded mt-1 mb-2 text-sm ${item.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : item.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                        >
                            {item.status}
                        </Text>

                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                className="border border-gray-400 px-3 py-1 rounded"
                                onPress={() => handleEdit(item)}
                            >
                                <Text>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-red-600 px-3 py-1 rounded"
                                onPress={() => setConfirmDelete(item._id)}
                            >
                                <Text className="text-white">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Confirm Delete Modal */}
            <Modal visible={!!confirmDelete} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="bg-white p-6 rounded-2xl w-10/12">
                        <Text className="text-lg font-medium mb-4 text-center">
                            Are you sure you want to delete this post?
                        </Text>
                        <View className="flex-row justify-around">
                            <TouchableOpacity
                                className="bg-red-600 px-4 py-2 rounded-lg"
                                onPress={handleDelete}
                            >
                                <Text className="text-white font-semibold">Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-gray-400 px-4 py-2 rounded-lg"
                                onPress={() => setConfirmDelete(null)}
                            >
                                <Text className="text-white font-semibold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
