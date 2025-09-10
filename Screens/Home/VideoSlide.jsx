// components/VideoPlayer.jsx
import React, { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Video from 'react-native-video';

const PlayPauseIcon = ({ isPlaying, color = 'white', size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    {isPlaying ? (
      <Path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    ) : (
      <Path d="M8 5v14l11-7L8 5z" />
    )}
  </Svg>
);

const MuteUnmuteIcon = ({ isMuted, color = 'white', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 512 512" fill={color}>
    {isMuted ? (
      <Path d="M420.842 396.885L91.116 67.157l-24 24 90.499 90.413H64v128h85.334L256 431.543V280l94.915 94.686C335.795 387.443 318 397.213 299 403.022V448c31-7.172 58.996-22.163 82.315-42.809l39.61 39.693 24-24.043-24.002-24.039z" />
    ) : (
      <Path d="M256 80.458l-51.021 52.48H64v128h85.334L256 431.543V80.458z" />
    )}
  </Svg>
);

export default function VideoSlide() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    let timer;
    if (controlsVisible) {
      timer = setTimeout(() => setControlsVisible(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [controlsVisible]);

  return (
    <View className="w-full h-64 bg-black relative">
      <TouchableOpacity
        activeOpacity={1}
        className="w-full h-full"
        onPress={() => setControlsVisible(!controlsVisible)}
      >
        <Video
          ref={videoRef}
          source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
          style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
          paused={!isPlaying}
          muted={isMuted || !videoLoaded}  // ✅ Always mute until loaded
          repeat
          resizeMode="cover"
          onLoad={() => {
            setVideoLoaded(true);
          }}
          onError={(error) => console.error('Video Error:', error)}
        />

        {controlsVisible && (
          <View className="absolute inset-0 bg-black/20" />
        )}
      </TouchableOpacity>

      {controlsVisible && (
        <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4 flex-row items-center justify-between">
          <View className="flex-row space-x-4">
            <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
              <PlayPauseIcon isPlaying={isPlaying} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsMuted(!isMuted)}>
              <MuteUnmuteIcon isMuted={isMuted} />
            </TouchableOpacity>
          </View>
          <Text className="text-white text-sm">Video 1 of 1</Text>
        </View>
      )}
    </View>
  );
}
