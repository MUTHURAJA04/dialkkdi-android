import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import axios from "axios";
import { youtubeAd } from "../../services/apiClient"

export default function YoutubeAdSlide() {
    const [videoId, setVideoId] = useState(null);
    const [playing, setPlaying] = useState(true);
    const [loading, setLoading] = useState(true);

    // 🩵 DEFAULT AD (fallback – always safe)
    const DEFAULT_VIDEO_ID = "dQw4w9WgXcQ"; // nee venumna change panniko

    const getYoutubeAd = async () => {
        try {
            const res = await youtubeAd();
            console.log(res.data[0].youtubeId, "098765");

            if (res.success && res.data?.length) {
                setVideoId(res.data[0].youtubeId);
            } else {
                setVideoId(DEFAULT_VIDEO_ID);
            }
        } catch (err) {
            console.log("YouTube Ad fetch error:", err);
            setVideoId(DEFAULT_VIDEO_ID); // 🔥 fallback if API fails
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getYoutubeAd();
    }, []);

    const onStateChange = useCallback((state) => {
        // 🔁 Auto loop
        if (state === "ended") {
            setPlaying(false);
            setTimeout(() => setPlaying(true), 100);
        }
    }, []);

    if (loading) {
        return (
            <View className="w-full h-64 items-center justify-center bg-black">
                <ActivityIndicator color="white" />
            </View>
        );
    }

    if (!videoId) return null;

    return (
        <View className="w-full h-64 bg-black overflow-hidden">
            <YoutubePlayer
                height={256}
                play={playing}
                videoId={videoId}
                mute={true}          // 🔇 autoplay rule
                controls={0}         // 🚫 hide controls
                modestbranding={1}
                onChangeState={onStateChange}
            />
        </View>
    );
}
