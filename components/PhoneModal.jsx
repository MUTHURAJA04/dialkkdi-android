import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import Input from "../components/CustomInput";
import { editUser } from '../services/apiClient';

export default function PhoneModal({ visible, onClose }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const indianPhoneRegex = /^[6-9]\d{9}$/;

const handleSubmit = async () => {
  if (!phone.trim()) {
    setError("Phone number is required.");
    return;
  }

  if (!indianPhoneRegex.test(phone)) {
    setError("Enter valid phone number.");
    return;
  }

  console.log("📞 Valid Phone:", phone);

  const response = await editUser({ phone }); // ← FIXED

  if (response.success) {
    console.log("Updated:", response);
    navigation.navigate('Home');

  } else {
    console.log("Error:", response.error);
  }

  setError("");
  onClose();
};


  return (
    <Modal visible={visible} transparent animationType="slide">
      <StatusBar barStyle="dark-content" backgroundColor="#0b0b0c" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center items-center bg-black/65"
      >
        <View className="w-[90%] bg-white p-6 rounded-3xl">
          <Text className="text-2xl font-bold mb-4 text-center">
            Enter Your Phone Number
          </Text>

          <Input
            placeholder="Phone Number"
            keyboardType="number-pad"
            maxLength={10}
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              setError("");
              console.log("Typing:", t);
            }}
          />

          {error !== "" && (
            <Text className="text-red-600 mt-2 mb-2">{error}</Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            className={`py-3 rounded-xl mt-4 ${
              phone.trim() ? "bg-orange-500" : "bg-orange-400"
            }`}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Submit
            </Text>
          </TouchableOpacity>

        
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
