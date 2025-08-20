import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    TextInput,
    FlatList,
    Dimensions,
    Modal,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { getBusinessFeed, getBusinessFeedDelete, postFeed, updatefeed } from "../../../services/apiClient";
import { Trash2, Heart, Edit } from "react-native-feather";

const ImageUpload = () => {
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState(null)
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [editPost, setEditPost] = useState(null);
    const [editDescription, setEditDescription] = useState("");



    useEffect(() => {
        const getFeed = async () => {
            try {
                const response = await getBusinessFeed();
                setPosts(response)
            } catch (error) {
                console.log(error, "Dont gett Postss");
            }
        }
        getFeed();
    }, [])

    const handleDelete = (id) => {
        Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await getBusinessFeedDelete(id)
                        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
                        Alert.alert("Success", "Successfully Deleted");
                    } catch (error) {
                        console.log(error);
                    }
                },
            },
        ]);
    };


    // Pick image from gallery
    const handlePickImage = () => {
        launchImageLibrary(
            { mediaType: "photo", quality: 1 },
            (response) => {
                if (response.didCancel) {
                    console.log("User cancelled image picker");
                } else if (response.errorCode) {
                    console.log("Image Picker Error:", response.errorMessage);
                    Alert.alert("Error", response.errorMessage || "Picker error");
                } else if (response.assets && response.assets.length > 0) {
                    const picked = response.assets[0]; // ✅ get first asset
                    setImage(picked);
                    console.log("Picked image:", picked);
                }
            }
        );
    };

    const handleEdit = (post) => {
        setEditPost(post);
        setEditDescription(post.description); // pre-fill description
        setEditModalVisible(true);
    };


    const handleUpload = async () => {
        if (!image && !editPost) {
            Alert.alert("Error", "Please select an image first");
            return;
        }
        if (!description.trim() && !editPost) {
            Alert.alert("Error", "Please enter a description");
            return;
        }

        try {
            setLoading(true);

            const businessData = await AsyncStorage.getItem("businessData");
            const parsedBusiness = businessData ? JSON.parse(businessData) : null;

            if (!parsedBusiness || !parsedBusiness.id) {
                Alert.alert("Error", "Business ID not found");
                setLoading(false);
                return;
            }


            const formData = new FormData();
            formData.append("businessId", parsedBusiness.id);

            if (editPost) {
                formData.append("description", editDescription);

                const response = await updatefeed(editPost._id, formData);
                Alert.alert("Success", "Post updated successfully!");
                console.log("✅ successfully updated", response);

            } else {
                formData.append("post", {
                    uri: image.uri,
                    type: image.type,
                    name: image.fileName || "upload.jpg",
                });
                formData.append("description", description);

                const res = await postFeed(formData);
                if (res.success) {
                    console.log("✅ Feed posted:", res.data);
                } else {
                    Alert.alert("Error", res.error?.message || res.error);
                }
            }

            // Refresh feed
            const refreshedFeed = await getBusinessFeed();
            setPosts(refreshedFeed);

            // Reset fields
            setImage(null);
            setDescription("");
            setEditPost(null);
            setEditDescription("");

        } catch (error) {
            Alert.alert("Error", "Something went wrong while uploading");
        } finally {
            setLoading(false);
        }
    };



    const Img_Url = "https://livecdn.dialkaraikudi.com"

    const { width } = Dimensions.get("window");
    const imageSize = (width - 40) / 2;

    return (
        <View className="flex-1 bg-gray-100 p-4">
            <Text className="text-xl font-bold text-gray-800 mb-4">
                Create a Post
            </Text>

            {/* Pick Image Button */}
            <TouchableOpacity
                onPress={handlePickImage}
                className="bg-blue-600 rounded-xl p-4 flex-row items-center mb-4"
            >
                <Text className="text-white font-semibold ml-2">Pick Image</Text>
            </TouchableOpacity>

            {/* Show Preview */}
            {image && (
                <View className="items-center mb-4">
                    <Image
                        source={{ uri: image.uri }}
                        className="w-40 h-40 rounded-lg border border-gray-300"
                    />
                    <Text className="mt-2 text-gray-600">{image.fileName}</Text>
                </View>
            )}

            {/* Caption Input */}
            <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Write a caption..."
                placeholderTextColor={'black'}
                multiline
                maxLength={250}
                className="border border-gray-300 rounded-lg p-3 text-gray-800 mb-4 bg-white"
            />

            {/* Upload Button */}
            <TouchableOpacity
                onPress={handleUpload}
                disabled={loading}
                className={`rounded-xl p-4 flex-row items-center justify-center ${loading ? "bg-gray-400" : "bg-green-600"
                    }`}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className="text-white font-semibold ml-2">Upload</Text>
                )}
            </TouchableOpacity>

            <Text className="text-xl font-semibold my-4">
                Posts
            </Text>

            <View className="flex-1 bg-gray-100 p-1">
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item._id?.toString()}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    renderItem={({ item }) => (
                        <View
                            className="bg-white rounded overflow-hidden mb-3 shadow-md relative"
                            style={{ width: imageSize }}
                        >
                            <Image
                                source={{ uri: `${Img_Url}/${item.imageUrl}` }}
                                style={{ width: "100%", height: imageSize }}
                                resizeMode="cover"
                            />

                            {/* Like count */}
                            <View className="absolute bottom-2 left-2 flex-row items-center bg-black/50 px-2 py-1 rounded-full">
                                <Heart color="white" width={16} height={16} />
                                <Text className="ml-1 text-white text-xs">{item.likeCount}</Text>
                            </View>

                            {/* Edit button */}
                            {/* <TouchableOpacity
                                onPress={() => handleEdit(item)}
                                className="absolute left-2 top-2 bg-white/50 p-1 shadow"
                            >
                                <Edit width={16} height={16} color="blue" />
                            </TouchableOpacity> */}

                            {/* Delete button */}
                            <TouchableOpacity
                                onPress={() => handleDelete(item._id)}
                                className="absolute right-2 top-2 bg-white/50 p-1 shadow"
                            >
                                <Trash2 width={16} height={16} color="red" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>


            <Modal visible={isEditModalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="bg-white p-5 rounded-xl w-11/12 h-[80%]">
                        <Text className="text-lg font-bold text-black mb-3">Edit Post</Text>

                        {editPost && (
                            <View className="flex-1 justify-center items-center">
                                <Image
                                    source={{ uri: `${Img_Url}/${editPost.imageUrl}` }}
                                    style={{ width: "100%", height: "70%" }}
                                    resizeMode="contain"   // ✅ keeps original aspect ratio
                                />
                            </View>
                        )}

                        <TextInput
                            value={editDescription}
                            onChangeText={setEditDescription}
                            placeholder="Edit description..."
                            placeholderTextColor="gray"
                            multiline
                            className="border border-gray-500 rounded-lg p-3 mb-3 text-black bg-white"
                        />

                        <View className="flex-row justify-end gap-4 space-x-3">
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                className="px-4 py-2 bg-gray-300 rounded-lg"
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUpload}
                                className="px-4 py-2 bg-green-600 rounded-lg"
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text className="text-white">Update</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


        </View>
    );
};

export default ImageUpload;
