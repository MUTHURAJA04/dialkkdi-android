import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { X, Clock } from "react-native-feather";

const BusinessTimingEditModal = ({ visible, onClose, timings, onUpdate }) => {
    const [localTimings, setLocalTimings] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const timeSlots = [
        '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
        '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
    ];

    useEffect(() => {
        if (visible) {
        
            
            // Initialize with default timings if none exist
            const defaultTimings = {};
            days.forEach(day => {
                defaultTimings[day] = timings[day] || { 
                    isOpen: false, 
                    openTime: "09:00", 
                    closeTime: "18:00" 
                };
            });
            setLocalTimings(defaultTimings);
        }
    }, [visible, timings]);

    const handleTimingChange = (day, field, value) => {
        setLocalTimings(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
      

        setIsSubmitting(true);
        try {
            await onUpdate(localTimings);
        } catch (error) {
            console.error('❌ [BusinessTimingEditModal] Failed to save timings:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 bg-black/50">
                    {/* Header (match BusinessEditModal) */}
                    <View className="flex-row items-center justify-between bg-white px-6 py-4 rounded-t-3xl mt-20">
                        <View className="flex-row items-center">
                            <Clock size={24} color="#3B82F6" />
                            <Text className="text-xl font-bold text-gray-800 ml-3">Edit Business Timings</Text>
                        </View>
                
                    </View>

                    {/* Content container */}
                    <View className="flex-1 bg-white rounded-t-3xl -mt-2">
                        {/* Timings List */}
                        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                            {/* Debug Info (optional) */}
                            <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4 mt-4">
                                <Text className="text-sm text-yellow-700 text-center">
                                    Debug: {Object.keys(localTimings).length} days configured
                                </Text>
                            </View>
                            
                            {days.map((day) => {
                                const dayTiming = localTimings[day] || { isOpen: false, openTime: "09:00", closeTime: "18:00" };
                                
                                return (
                                    <View key={day} className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                                        <View className="flex-row items-center justify-between mb-3">
                                            <Text className="text-lg font-semibold text-gray-800 capitalize">
                                                {day.charAt(0).toUpperCase() + day.slice(1)}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => handleTimingChange(day, 'isOpen', !dayTiming.isOpen)}
                                                className={`px-4 py-2 rounded-full ${dayTiming.isOpen ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}
                                            >
                                                <Text className={`font-medium ${dayTiming.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                                                    {dayTiming.isOpen ? '🟢 Open' : '🔴 Closed'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        {dayTiming.isOpen && (
                                            <View className="space-y-3">
                                                <View>
                                                    <Text className="text-sm font-medium text-gray-600 mb-2">Opening Time</Text>
                                                    <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                                        <Picker
                                                            selectedValue={dayTiming.openTime}
                                                            onValueChange={(value) => handleTimingChange(day, 'openTime', value)}
                                                            style={{
                                                                color: "#374151",
                                                                fontSize: 16,
                                                                height: Platform.OS === "ios" ? 150 : 50,
                                                            }}
                                                        >
                                                            {timeSlots.map((time) => (
                                                                <Picker.Item
                                                                    key={time}
                                                                    label={time}
                                                                    value={time}
                                                                />
                                                            ))}
                                                        </Picker>
                                                    </View>
                                                </View>

                                                <View>
                                                    <Text className="text-sm font-medium text-gray-600 mb-2">Closing Time</Text>
                                                    <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
                                                        <Picker
                                                            selectedValue={dayTiming.closeTime}
                                                            onValueChange={(value) => handleTimingChange(day, 'closeTime', value)}
                                                            style={{
                                                                color: "#374151",
                                                                fontSize: 16,
                                                                height: Platform.OS === "ios" ? 150 : 50,
                                                            }}
                                                        >
                                                            {timeSlots.map((time) => (
                                                                <Picker.Item
                                                                    key={time}
                                                                    label={time}
                                                                    value={time}
                                                                />
                                                            ))}
                                                        </Picker>
                                                    </View>
                                                </View>

                                                <View className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                    <Text className="text-xs text-blue-700 text-center">
                                                        Business Hours: {dayTiming.openTime} - {dayTiming.closeTime}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>

                        {/* Footer (match BusinessEditModal) */}
                        <View className="px-6 pb-6 pt-4 border-t border-gray-200">
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={handleClose}
                                    className="flex-1 bg-gray-200 rounded-xl py-4 items-center"
                                    disabled={isSubmitting}
                                >
                                    <Text className="text-gray-700 font-semibold text-base">Cancel</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    onPress={handleSave}
                                    className="flex-1 bg-blue-500 rounded-xl py-4 items-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <Text className="text-white font-semibold text-base">Save Changes</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default BusinessTimingEditModal;
