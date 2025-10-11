import React, { useRef, useState, useEffect } from "react";
import { View } from "react-native";
import Video from "react-native-video";

export default function VideoSlide({ videos = [] }) {
  const videoRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // 🩵 Default fallback video
  const fallbackVideo = [
    { url: "https://www.w3schools.com/html/mov_bbb.mp4", businessId: null },
  ];

  // ✅ Ensure at least one video
  const videoList = videos?.length ? videos : fallbackVideo;

  // 🎬 Handle end — switch or loop silently
  const handleVideoEnd = () => {
    if (videoList.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % videoList.length);
      setIsReady(false);
    } else {
      // Replay same video smoothly
      videoRef.current?.seek(0);
    }
  };

  return (
    <View className="w-full h-64 bg-black overflow-hidden">
      <Video
        ref={videoRef}
        source={{ uri: videoList[currentIndex]?.url }}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "black",
        }}
        resizeMode="cover"
        muted
        paused={false}
        repeat={false} // manually handled
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        controls={false}         // 🚫 hide native player controls
        disableFocus={true}      // ✅ prevent focus-based UI triggers
        preventsDisplaySleepDuringVideoPlayback={false}
        onLoad={() => setIsReady(true)}
        onEnd={handleVideoEnd}
        onError={(e) => console.error("Video Error:", e)}
      />
    </View>
  );
}
