import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import banner from '../../assets/Banners/Music_concert.jpg';

const MusicBanner = () => {
    const navigation = useNavigation();

    return (
        <View className=' border-b-slate-400'>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('TicketPolicyScreen')} // 👈 target screen
            >
                <Image
                    source={banner}
                    style={{
                        width: '100%',
                        height: 100,
                        borderColor: "#000"
                    }}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        </View>
    );
};

export default MusicBanner;
