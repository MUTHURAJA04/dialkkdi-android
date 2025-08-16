import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Home, User, Instagram, MessageCircle, Play } from 'react-native-feather';
import { getbusinessDashboard } from '../../services/apiClient';
import DashboardCharts from './Dashboard';

const Tab = createBottomTabNavigator();


const BusinessProfileScreen = () => (
    <View className="flex-1 justify-center items-center bg-white">
        <Text>Business Profile</Text>
    </View>
);

const AddOn = () => (
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

    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        const getDashBoard = async () => {
            try {
                const response = await getbusinessDashboard();
                console.log(response, "sucessfully get Data");
                setDashboard(response)
            } catch (error) {
                console.log(error);
            }
        };
        getDashBoard();
    }, [])

    const handleLogout = async () => {
        await AsyncStorage.removeItem('businessData');
        navigation.replace('Landing');
    };

    const handleHome = () => {
        navigation.replace('Home')
    }

    return (
        <Tab.Navigator
            screenOptions={{
                headerRight: () => (
                    <View className='flex-row gap-2 pr-2'>
                        <Button title="Home" color="green" onPress={handleHome} />
                        <Button title="Logout" color="red" onPress={handleLogout} />
                    </View>
                ),
            }}
        >
            <Tab.Screen
                name="Dashboard"
                options={{
                    tabBarIcon: ({ color }) => <Home color={color} width={20} height={20} />,
                }}
            >
                {() => <DashboardCharts dashboard={dashboard} />}
            </Tab.Screen>
            <Tab.Screen
                name="Business Profile"
                component={BusinessProfileScreen}
                options={{
                    tabBarIcon: ({ color }) => <User color={color} width={20} height={20} />,
                }}
            />
            <Tab.Screen
                name="Advert"
                component={AddOn}
                options={{
                    tabBarIcon: ({ color }) => <Play color={color} width={20} height={20} />,
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
