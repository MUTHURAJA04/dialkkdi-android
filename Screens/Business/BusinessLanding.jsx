import React from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Home, User, Instagram, MessageCircle } from 'react-native-feather';

const Tab = createBottomTabNavigator();

const DashboardScreen = () => (
    <ScrollView className="flex-1 p-4 bg-white">
        <Text className="text-lg font-bold mb-4">Dashboard</Text>
        <View className="bg-gray-100 p-4 rounded-lg mb-4">
            <Text>Total Views: 2134</Text>
            <Text>Total Reviews: 6</Text>
            <Text>Average Rating: 3.8 ⭐</Text>
            <Text>Favorites: 3</Text>
        </View>
    </ScrollView>
);

const BusinessProfileScreen = () => (
    <View className="flex-1 justify-center items-center bg-white">
        <Text>Business Profile</Text>
    </View>
);

const DialogramScreen = () => (
    <View className="flex-1 justify-center items-center bg-white">
        <Text>Dialogram</Text>
    </View>
);

const TalkScreen = () => (
    <View className="flex-1 justify-center items-center bg-white">
        <Text>Talk of the Town</Text>
    </View>
);

const BusinessLanding = () => {
    const navigation = useNavigation();

    const handleLogout = async () => {
        await AsyncStorage.removeItem('businessData');
        navigation.replace('Landing');
    };

    return (
        <Tab.Navigator
            screenOptions={{
                headerRight: () => (
                    <Button title="Logout" color="red" onPress={handleLogout} />
                ),
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarIcon: ({ color }) => <Home color={color} width={20} height={20} />,
                }}
            />
            <Tab.Screen
                name="Business Profile"
                component={BusinessProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => <User color={color} width={20} height={20} />,
                }}
            />
            <Tab.Screen
                name="Dialogram"
                component={DialogramScreen}
                options={{
                    tabBarIcon: ({ color }) => <Instagram color={color} width={20} height={20} />,
                }}
            />
            <Tab.Screen
                name="Talk of the Town"
                component={TalkScreen}
                options={{
                    tabBarIcon: ({ color }) => <MessageCircle color={color} width={20} height={20} />,
                }}
            />
        </Tab.Navigator>
    );
};

export default BusinessLanding;
