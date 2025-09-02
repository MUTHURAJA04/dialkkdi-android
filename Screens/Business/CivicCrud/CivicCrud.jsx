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
    ActivityIndicator, // Import ActivityIndicator for loading state
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { civicFeedUpdate, civicFeedUser, civicPost, civicPostDelete } from "../../../services/apiClient";
import { PlusCircle } from "react-native-feather";

export default function CivicCrud() {
    const [form, setForm] = useState({ title: "", description: "", imageUrl: null });
    const [posts, setPosts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [userType, setUserType] = useState("guest");
    const [openForm, setOpenForm] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true); // New loading state for posts

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
        setLoadingPosts(true); // Set loading to true before fetching
        try {
            const fetchCivicPosts = await civicFeedUser();
            setPosts(fetchCivicPosts);
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to load civic posts.");
        } finally {
            setLoadingPosts(false); // Set loading to false after fetching (success or error)
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
        // Only validate image upload if it's a new post or a local image for update
        if (!form.imageUrl && !editingId) {
            Alert.alert("Validation Error", "Please upload an image");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            // Note: The civicPost and civicFeedUpdate functions should handle FormData creation internally
            // as discussed in previous interactions. Pass the form state directly.

            const formData = new FormData();

            // ✅ Use form values directly
            formData.append("title", form.title);
            formData.append("description", form.description);

            // ✅ Attach image correctly if selected
            if (form.imageUrl && form.imageUrl.startsWith("file://")) {
                formData.append("civic", {
                    uri: form.imageUrl,
                    name: `civic_${Date.now()}.jpg`,
                    type: "image/jpeg",
                });
            }

            let response;
            if (editingId) {
                response = await civicFeedUpdate({ posterId: editingId, formData });
                Alert.alert("Success", "Post updated successfully");
            } else {
                const payload = {
                    title: form.title,
                    description: form.description,
                    imageUrl: form.imageUrl
                };
                response = await civicPost(payload);
                Alert.alert("Success", "Post created successfully");
            }

            // After successful creation/update, refetch posts and reset form
            fetchPosts();
            setForm({ title: "", description: "", imageUrl: null });
            setEditingId(null);
            setOpenForm(false); // Close the form after submission
        } catch (err) {
            console.error("❌ Submit Error:", err);
            Alert.alert("Error", "Something went wrong while saving: " + (err.response?.data?.message || err.message));
        }
    };

    const handleEdit = (post) => {
        setForm({
            title: post.title,
            description: post.description,
            // Only set imageUrl if it exists, and use the raw URL (not getImageUrl)
            imageUrl: post.imageUrl ? getImageUrl(post.imageUrl) : null,
        });
        setEditingId(post._id);
        setOpenForm(true); // Open the form when editing
    };

    const handleDelete = async () => {
        try {
            // Assuming you have a civicPostDelete function in apiClient
            // import { civicPostDelete } from "../../services/apiClient";
            await civicPostDelete(confirmDelete);
            Alert.alert("Deleted", "Post removed successfully");
            fetchPosts();
            setPosts((prev) => prev.filter((p) => p._id !== confirmDelete));
            setConfirmDelete(null);
        } catch (error) {
            console.error("❌ Delete Error:", error);
            Alert.alert("Error", "Post could not be deleted");
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        // If url already full http link, return as is (e.g., from image picker)
        return url.startsWith("http") ? url : `${Img_Url}/${url}`;
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-200">
            {/* Create Post Button (visible when form is closed) */}
            {!openForm && (
                <View className="flex-row justify-end p-4">
                    <TouchableOpacity
                        onPress={() => {
                            setOpenForm(true);
                            setForm({ title: "", description: "", imageUrl: null }); // Clear form on opening for new post
                            setEditingId(null); // Clear editing state
                        }}
                        className="flex-row items-center bg-blue-600 px-4 py-2 rounded-full shadow-md"
                    >
                        <PlusCircle color="white" width={20} height={20} />
                        <Text className="text-white font-semibold ml-2">
                            Create Post
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Post Creation/Edit Form (visible when openForm is true) */}
            {openForm && (
                <View className="bg-white mx-4 p-4 mt-4 rounded-2xl shadow">
                    <Text className="text-xl font-semibold text-blue-600 mb-3">
                        {editingId ? "Edit Post" : "Create Post"}
                    </Text>

                    <TextInput
                        placeholder="Title"
                        placeholderTextColor={"gray"}
                        value={form.title}
                        onChangeText={(t) => setForm({ ...form, title: t })}
                        className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
                    />

                    <TextInput
                        placeholder="Description"
                        placeholderTextColor={"gray"}
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
                        <View className="flex-row justify-center mb-3">
                            <Image
                                source={{
                                    uri: form.imageUrl
                                        ? form.imageUrl
                                        : getImageUrl(form.imageUrl)
                                }}
                                className="w-48 h-48 rounded-lg" // Larger preview image
                                resizeMode="cover"
                            />
                        </View>
                    )}

                    <View className="flex-row justify-between mt-3">
                        <TouchableOpacity
                            className="bg-gray-500 px-4 py-2 rounded-lg"
                            onPress={() => {
                                setForm({ title: "", description: "", imageUrl: null });
                                setEditingId(null);
                                setOpenForm(false); // Close the form
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
            )}

            <Text className="text-2xl font-bold text-center text-orange-600 my-4">
                My Civic Events & Issues
            </Text>

            {loadingPosts ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className="mt-2 text-gray-600">Loading civic posts from Karaikudi...</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item, index) =>
                        item?._id?.toString() || item?.id?.toString() || index.toString()
                    }
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <View className="bg-white rounded mb-6 shadow-xl overflow-hidden">
                            <View className="relative">
                                {item?.imageUrl ? (
                                    <Image
                                        source={{ uri: getImageUrl(item?.imageUrl) }}
                                        className="w-full h-56"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="w-full h-56 bg-gray-100 items-center justify-center">
                                        <Text className="text-gray-400 italic">No Image</Text>
                                    </View>
                                )}

                                <View className="absolute top-3 right-3">
                                    <Text
                                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${item?.status === "approved"
                                            ? "bg-green-500 text-white"
                                            : item?.status === "rejected"
                                                ? "bg-red-500 text-white"
                                                : "bg-yellow-500 text-white"
                                            }`}
                                    >
                                        {item?.status?.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View className="p-5">
                                <Text className="text-xl font-bold text-gray-800 mb-2">
                                    {item?.title}
                                </Text>

                                <Text className="text-gray-600 text-sm leading-relaxed mb-4">
                                    {item?.description}
                                </Text>

                                <View className="flex-row justify-between">
                                    <TouchableOpacity
                                        className="flex-row items-center bg-gray-100 px-4 py-2 rounded"
                                        onPress={() => handleEdit(item)}
                                    >
                                        <Text className="text-gray-700 font-semibold"> Edit</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-row items-center bg-red-500 px-4 py-2 rounded"
                                        onPress={() => setConfirmDelete(item._id)}
                                    >
                                        <Text className="text-white font-semibold"> Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                />

            )}


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