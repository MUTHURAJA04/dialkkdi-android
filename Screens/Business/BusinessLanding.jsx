import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Home, User, Instagram, MessageCircle, Play, LogOut } from 'react-native-feather';
import { getbusinessDashboard, getbusinessDetails, syncFcmToken } from '../../services/apiClient';
import DashboardCharts from './Dashboard';
import BusinessProfileScreen from './BusinessProfile/BusinessProfileScreen';
import ImageUpload from './Dilogram/Upload';
import CivicCrud from './CivicCrud/CivicCrud';
import Addon from './Adverts/Addon';

const Tab = createBottomTabNavigator();

const BusinessLanding = () => {
    const navigation = useNavigation();

    const [dashboard, setDashboard] = useState(null);
    const [businessPanel, setBusinessPanel] = useState(null);

    useEffect(() => {
         syncFcmToken();
         console.log("syncFcmToken called in bussnies")
        const getDashBoard = async () => {
            try {
                const response = await getbusinessDashboard();
                setDashboard(response)
            } catch (error) {
                console.error(error);
            }
        };
        getDashBoard();
    }, [])

    useEffect(() => {
        const getBusinessDetails = async () => {
            try {
                const response = await getbusinessDetails();
                setBusinessPanel(response)
            } catch (error) {
                console.error(error);
            }
        };
        getBusinessDetails();
    }, [])



    const handleLogout = async () => {
        await AsyncStorage.clear();
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
                        <TouchableOpacity
                            onPress={handleHome}
                            className='bg-green-600 text-white p-2 rounded-full'
                        >
                            <Home color={"white"} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLogout}
                            className='bg-orange-500 p-2 rounded-full'
                        >
                            <LogOut color={"white"} />
                        </TouchableOpacity>
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
                options={{
                    tabBarIcon: ({ color }) => <User color={color} width={20} height={20} />,
                }}
            >
                {() => <BusinessProfileScreen businessPanel={businessPanel} />}
            </Tab.Screen>
            <Tab.Screen
                name="Advert"
                component={Addon}
                options={{
                    tabBarIcon: ({ color }) => <Play color={color} width={20} height={20} />,
                }}
            />
            <Tab.Screen
                name="Dialogram"
                options={{
                    tabBarIcon: ({ color }) => <Instagram color={color} width={20} height={20} />,
                }}
            >
                {() => <ImageUpload />}
            </Tab.Screen>
            <Tab.Screen
                name="Talk of the Town"
                options={{
                    tabBarIcon: ({ color }) => <MessageCircle color={color} width={20} height={20} />,
                }}
            >
                {() => <CivicCrud />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default BusinessLanding;
