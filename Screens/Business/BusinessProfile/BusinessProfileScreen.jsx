import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    View,
    TouchableOpacity,
    FlatList,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import BusinessEditModal from "./BusinessEditModal";



const BusinessProfileScreen = ({ businessPanel }) => {
    const [sortOrder, setSortOrder] = useState("highest");
    const [showmore, setShowmore] = useState(false);
    const [editVisible, setEditVisible] = useState(false);

    if (!businessPanel) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    const Img_Url = "https://livecdn.dialkaraikudi.com";

    const createdDate = businessPanel.business.createdDate;
    const dateObj = new Date(createdDate);
    const onlyDate = `${dateObj.getDate().toString().padStart(2, "0")}-${(dateObj.getMonth() + 1)
        .toString().padStart(2, "0")}-${dateObj.getFullYear()}`;

    const days = Object.entries(businessPanel.business.businessTimings);


    const sortedReviews = [...businessPanel.reviews].sort((a, b) =>
        sortOrder === "highest" ? b.rating - a.rating : a.rating - b.rating
    );
    const handleSave = (updatedData) => {
        console.log("Updated Form Data:", updatedData);
        // API call ku send panna logic inga podanum
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white shadow-md p-5 rounded-b-3xl flex-row justify-between items-center">
                <View>
                    <Text className="text-3xl font-bold text-gray-800">
                        {businessPanel.business.businessName}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                        Your Dialkaraikudi Journey Started on{" "}
                        <Text className="font-medium text-gray-700">{onlyDate}</Text>
                    </Text>
                </View>

                {/* Edit Button */}

            </View>

            {/* Images */}
            <View className="mt-5 px-4">
                <Text className="text-xl font-semibold text-gray-800 mb-2">Images</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                    {businessPanel.business.photos.map((src, i) => (
                        <Image
                            key={i}
                            source={{ uri: `${Img_Url}/${src}` }}
                            resizeMode="cover"
                            className="w-40 h-28 mr-3 rounded-xl bg-gray-200"
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Business Details */}
            <View className="mt-6 px-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl font-semibold text-gray-800">Business Details</Text>
                    <TouchableOpacity onPress={() => setEditVisible(true)}>
                        <Text className="text-blue-500">Edit</Text>
                    </TouchableOpacity>
                </View>
                <View className="bg-white rounded-2xl p-4 shadow flex gap-3">
                    <Text className="text-lg font-bold text-gray-900">
                        {businessPanel.business.businessName}
                    </Text>
                    <Text className="text-gray-700">{businessPanel.business.description}</Text>
                    <Text className="font-semibold text-gray-800">
                        Email: <Text className="font-medium text-gray-600">{businessPanel.business.email}</Text>
                    </Text>
                    <Text className="font-semibold text-gray-800">
                        GST No: <Text className="font-medium text-gray-600">{businessPanel.business.gst || "-"}</Text>
                    </Text>
                    <Text className="font-semibold text-gray-800">
                        Phone No: <Text className="font-medium text-gray-600">{businessPanel.business.contactDetails?.phone}</Text>
                    </Text>
                    <Text className="font-semibold text-gray-800">
                        WhatsApp: <Text className="font-medium text-gray-600">{businessPanel.business.contactDetails?.whatsup || "-"}</Text>
                    </Text>
                    <Text className="font-semibold text-gray-800">
                        Address: <Text className="font-medium text-gray-600">{businessPanel.business.address?.formattedAddress}</Text>
                    </Text>
                </View>
            </View>

            {/* Business Timings */}
            <View className="mt-6 px-4">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xl font-semibold text-gray-800">Business Timing</Text>
                    <TouchableOpacity onPress={() => setEditVisible(true)}>
                        <Text className="text-blue-500">Edit</Text>
                    </TouchableOpacity>
                </View>
                <View className="bg-white rounded-2xl shadow-md divide-y divide-gray-200">
                    {days.map(([day, { isOpen, openTime, closeTime }], index) => (
                        <View key={index} className="flex-row justify-between items-center px-4 py-3">
                            <Text className="text-base font-semibold text-gray-700 capitalize">
                                {day.charAt(0).toUpperCase() + day.slice(1)}
                            </Text>
                            {isOpen ? (
                                <Text className="text-base text-green-600 font-medium">
                                    {openTime} - {closeTime}
                                </Text>
                            ) : (
                                <Text className="text-base text-red-500 font-medium">Closed</Text>
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* Reviews Section (same as before) */}
            <View className="mt-6 px-4 mb-10">
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-xl font-semibold text-gray-800">Reviews</Text>

                    {/* Filter Buttons */}
                    <View className="flex-row space-x-2 gap-2">

                        <TouchableOpacity
                            onPress={() => setSortOrder("highest")}
                            className={`px-3 py-1 rounded-full bg-gray-200 ${sortOrder === 'highest' ? 'bg-gray-400' : 'bg-gray-200'
                                }`}
                        >
                            <Text>
                                Highest
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setSortOrder("lowest")}
                            className={`px-3 py-1 rounded-full bg-gray-200 ${sortOrder === 'lowest' ? 'bg-gray-400' : 'bg-gray-200'}`}
                        >
                            <Text>
                                Lowest
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Reviews List */}
                <FlatList
                    data={showmore ? sortedReviews : sortedReviews.slice(0, 3)}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View className="bg-white rounded-xl shadow p-4 mb-3">
                            <Text className="text-lg font-semibold text-gray-800">
                                {item.user?.name || "Anonymous"}
                            </Text>
                            <Text className="text-gray-500 text-sm mb-1">
                                {item.user?.email || "No email"}
                            </Text>

                            {/* Rating */}
                            <Text className="text-yellow-500 font-bold mb-1">
                                ⭐ {item.rating}/5
                            </Text>

                            {/* Comment */}
                            <Text className="text-gray-700">{item.comment}</Text>
                        </View>
                    )}
                />

                <View className="flex-1 justify-center items-center bg-gray-200">
                    <TouchableOpacity
                        onPress={() => setShowmore(!showmore)}
                    >
                        <Text className="p-2">
                            {showmore ? "Less" : "Show More"}
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>s

            {/* Modal */}
            <BusinessEditModal
                visible={editVisible}
                onClose={() => setEditVisible(false)}
                business={businessPanel.business}
            />
        </ScrollView>
    );
};

export default BusinessProfileScreen;
