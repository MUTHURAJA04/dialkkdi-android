import React, { useEffect, useRef } from 'react';
import { Modal, View, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { X } from 'react-native-feather';

const { width } = Dimensions.get('window');

const ImageViewerModal = ({ visible, onClose }) => { // remove imageUrl if not needed
    const scale = useRef(new Animated.Value(0.5)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();

            const timer = setTimeout(onClose, 5000); // auto close after 5 sec
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>

                {/* Red placeholder instead of image */}
                <Animated.View
                    style={{
                        width: width * 0.9,
                        height: width * 0.9,
                        borderRadius: 20,
                        backgroundColor: 'red',
                        transform: [{ scale }],
                        opacity,
                    }}
                />

                <TouchableOpacity
                    onPress={onClose}
                    style={{ position: 'absolute', top: 50, right: 20, padding: 10 }}
                >
                    <X color="#fff" width={30} height={30} />
                </TouchableOpacity>
            </View>
        </Modal>
    );
};

export default ImageViewerModal;
