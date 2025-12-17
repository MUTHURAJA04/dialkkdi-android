import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import banner from '../../assets/Banners/Banner1.jpg';

const MusicBanner = () => {
    const navigation = useNavigation();

    return (
        <View>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ConcertListScreen')} // 👈 target screen
            >
                <Image
                    source={banner}
                    style={{
                        width: '100%',
                        height: 180,
                        borderRadius: 12,
                    }}
                    resizeMode="cover"
                />
            </TouchableOpacity>
        </View>
    );
};

export default MusicBanner;
