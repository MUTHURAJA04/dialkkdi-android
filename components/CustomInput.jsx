import React from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'react-native-feather';

const Input = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    isPassword = false,
    showPassword,
    togglePasswordVisibility,
    keyboardType,
    error,
    maxLength,
    ...props
}) => {
    return (
        <View className="mb-4 w-full">
            <View className="flex-row items-center border border-gray-300 rounded-md px-3 bg-white">
                <TextInput
                    className="flex-1 text-base text-black pr-2"
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !showPassword}
                    keyboardType={keyboardType}
                    maxLength={maxLength}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity onPress={togglePasswordVisibility}>
                        {showPassword ? (
                            <Eye width={20} height={20} stroke="gray" />
                        ) : (
                            <EyeOff width={20} height={20} stroke="gray" />
                        )}
                    </TouchableOpacity>
                )}
            </View>
            {error ? <Text className="text-red-500 text-sm mt-1">{error}</Text> : null}
        </View>
    );
};

export default Input;
