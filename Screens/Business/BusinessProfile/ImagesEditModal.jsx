import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { X, Plus, Trash2 } from "react-native-feather";
import { editBusiness } from "../../../services/apiClient";

const IMAGE_PREFIX = "https://livecdn.dialkaraikudi.com/";

const ImagesEditModal = ({ visible, onClose, images = [], onUpdate }) => {
  const [localImages, setLocalImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [photosToAdd, setPhotosToAdd] = useState([]);
  const [deletedPhotos, setDeletedPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      const validImages = images.filter((img) => img && typeof img === "string");
      setLocalImages([...validImages]);
      setOriginalImages([...validImages]);
      setPhotosToAdd([]);
      setDeletedPhotos([]);
    }
  }, [visible, images]);

  const resolveImageUri = (src) => {
    if (!src || typeof src !== "string") return null;
    if (src.startsWith("http") || src.startsWith("file://")) return src;
    return `${IMAGE_PREFIX}${src}`;
  };

  const toRelativePath = (src) => {
    if (!src) return null;
    if (src.startsWith(IMAGE_PREFIX)) return src.substring(IMAGE_PREFIX.length);
    if (src.startsWith("http")) return src;
    return src;
  };

  const handleAddImage = () => {
    if (localImages.length >= 6) return;

    launchImageLibrary({ mediaType: "photo", selectionLimit: 6 - localImages.length }, (response) => {
      if (response.didCancel || !response.assets?.length) return;
      const picked = response.assets.map((asset) => asset);
      setLocalImages((prev) => [...prev, ...picked]);
      setPhotosToAdd((prev) => [...prev, ...picked]);
    });
  };

  const handleRemoveImage = (index) => {
    if (localImages.length <= 1) {
      Alert.alert("Cannot remove", "You must have at least one image.");
      return;
    }

    const src = localImages[index];
    const normalizedSrc = typeof src === "object" ? src.uri : src;
    const relativePath = toRelativePath(normalizedSrc);

    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setLocalImages((prev) => prev.filter((_, i) => i !== index));
          setPhotosToAdd((prev) => prev.filter((u) => (u?.uri || u) !== normalizedSrc));

          const existedOriginally = originalImages.some((img) => {
            const original = typeof img === "object" ? img.uri : img;
            return original === normalizedSrc || original === relativePath;
          });

          if (existedOriginally && relativePath) {
            setDeletedPhotos((prev) => [...prev, relativePath]);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (photosToAdd.length === 0 && deletedPhotos.length === 0) {
      Alert.alert("No Changes", "You didn't add or remove any images.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();

      photosToAdd.forEach((photo, index) => {
        const file = typeof photo === "object" ? photo : { uri: photo };
        formData.append("photos", {
          uri: file.uri,
          name: file.fileName || `photo_${index + 1}.jpg`,
          type: file.type || "image/jpeg",
        });
      });

      if (deletedPhotos.length > 0) {
        formData.append("deletedPhotos", JSON.stringify(deletedPhotos));
      }

      const response = await editBusiness(formData);

      if (response.success) {
        Alert.alert("Success", "Images updated successfully.");
        onUpdate && onUpdate(response.data.images || localImages); // update parent immediately
        onClose && onClose();
      } else {
        Alert.alert("Error", response.error || "Failed to update images");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update images. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white w-11/12 rounded-2xl p-5" style={{ maxHeight: "90%", minHeight: "60%" }}>
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-800">Edit Images</Text>
            <TouchableOpacity onPress={onClose} className="p-2 rounded-full bg-gray-100">
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Images Grid */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <View className="flex-row flex-wrap gap-3 mb-4">
              {localImages.map((src, index) => {
                const resolved = typeof src === "object" ? src.uri : src;
                return (
                  <View key={index} className="relative">
                    <Image
                      source={{ uri: resolveImageUri(resolved) }}
                      className="w-24 h-24 rounded-lg bg-gray-200"
                      resizeMode="cover"
                    />
                    <TouchableOpacity onPress={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                      <Trash2 size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                );
              })}

              {/* Add Image Button (only if less than 6) */}
              {localImages.length < 6 && (
                <TouchableOpacity onPress={handleAddImage} className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg justify-center items-center bg-gray-50">
                  <Plus size={24} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            {/* Image Count */}
            <View className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-2">
              <Text className="text-sm text-blue-700 text-center">
                {localImages.length} image{localImages.length !== 1 ? "s" : ""} selected
              </Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity onPress={onClose} className="flex-1 bg-gray-200 rounded-xl py-3 items-center" disabled={isSubmitting}>
              <Text className="text-gray-700 font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} className="flex-1 bg-blue-500 rounded-xl py-3 items-center" disabled={isSubmitting}>
              {isSubmitting ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-semibold">Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ImagesEditModal;
