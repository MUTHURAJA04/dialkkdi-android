import React, { useEffect, useState } from "react";
import { View, Modal, Image, Text, TouchableOpacity, ScrollView } from "react-native";
import HeroSlide from "./Home/HeroSlide";
import VideoSlide from "./Home/VideoSlide";
import Banner from "./Home/Banner";
import ServicesOn from "./Home/ServicesOn";
import Categories from "./Home/Categories";
import LimitedOffers from "./Home/LimitedOffers";
import Recognized from "./Home/Recognized";
import { getads, syncFcmToken } from "../services/apiClient";
import banner1 from "../assets/Banners/Banner1.jpg";
import banner2 from "../assets/Banners/Banner2.jpg";
import banner3 from "../assets/Banners/Banner3.jpg";
import banner4 from "../assets/Banners/Banner4.jpg";
import banner5 from "../assets/Banners/Banner5.jpg";
import popupImg from "../assets/Kolam.jpeg"; // 🔥 create any image
import cancel from "../assets/cancel.jpg"; // 🔥 create any image
import MusicBanner from "./Home/MusicBanner"
import RunningText from "./Home/RunningText"

const Home = ({ navigation }) => {

  const [showPopup, setShowPopup] = useState(false); // 👈 popup control
  const [homeBanners, setHomeBanners] = useState([]);
  const [limitedOffers1, setLimitedOffers1] = useState([]);
  const [limitedOffers2, setLimitedOffers2] = useState([]);
  const [videoAds, setVideoAds] = useState([]);

  const imgUrl = "https://livecdn.dialkaraikudi.com/";

  // 🩵 Fallback banners
  const fallbackBanners = [
    { url: banner1, businessId: null },
    { url: banner2, businessId: null },
    { url: banner3, businessId: null },
    { url: banner4, businessId: null },
    { url: banner5, businessId: null },
  ];

  const fallbackOffers = [
    { url: banner1, businessId: null },
    { url: banner2, businessId: null },
  ];

  const fallbackVideo = [
    {
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      businessId: null,
    },
  ];

  useEffect(() => {
    syncFcmToken();

    setTimeout(() => {
      setShowPopup(true);
    }, 3000);

    const getAdverts = async () => {
      try {
        const response = await getads();

        const homeAds = response.filter(
          (ad) => ad.slotId?._id === "68272bafa52bbd6718f881f7" && ad.isActive
        );

        let banners = homeAds
          .map((ad) => ({
            url: ad.mobileContentUrl ? imgUrl + ad.mobileContentUrl : null,
            businessId: ad.businessId || null,
          }))
          .filter((ad) => ad.url);

        if (banners.length < 5)
          banners = [...banners, ...fallbackBanners.slice(0, 5 - banners.length)];

        setHomeBanners(banners);

        const offers1 = response
          .filter(
            (ad) => ad.slotId?._id === "682c1a7b0c32012c369edade" && ad.isActive
          )
          .map((ad) => ({
            url: ad.contentUrl ? imgUrl + ad.contentUrl : null,
            businessId: ad.businessId || null,
          }))
          .filter((ad) => ad.url);

        setLimitedOffers1(getTwoOffers(offers1, fallbackOffers));

        const offers2 = response
          .filter(
            (ad) => ad.slotId?._id === "682b12797e0c060d62669940" && ad.isActive
          )
          .map((ad) => ({
            url: ad.contentUrl ? imgUrl + ad.contentUrl : null,
            businessId: ad.businessId || null,
          }))
          .filter((ad) => ad.url);

        setLimitedOffers2(getTwoOffers(offers2, fallbackOffers));

        const videos = response
          .filter(
            (ad) => ad.slotId?._id === "682af722344e51b185a45062" && ad.isActive
          )
          .map((ad) => ({
            url: ad.videoUrl
              ? imgUrl + ad.videoUrl
              : ad.contentUrl
                ? imgUrl + ad.contentUrl
                : null,
            businessId: ad.businessId || null,
          }))
          .filter((ad) => ad.url);

        setVideoAds(videos.length ? videos : fallbackVideo);
      } catch (error) {
        setHomeBanners(fallbackBanners);
        setLimitedOffers1(fallbackOffers);
        setLimitedOffers2(fallbackOffers);
        setVideoAds(fallbackVideo);
      }
    };

    getAdverts();
  }, []);

  const getTwoOffers = (offers, fallback) => {
    if (offers.length >= 2) return offers.slice(0, 2);
    if (offers.length === 1) return [offers[0], fallback[0]];
    return fallback.slice(0, 2);
  };

  return (
    <>
      {/* 🔥 POPUP UI */}
      {showPopup &&
        <Modal transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 40,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: "#fff",
                width: "85%",
                borderRadius: 15,
                alignItems: "center",
                position: "relative"
              }}
              onPress={() => {
                setShowPopup(false);
                navigation.navigate("FestivelScreen"); // 👉 your page name
              }}
            >

              <Image
                source={popupImg}
                style={{ width: 320, height: 320, borderRadius: 10 }}
                resizeMode="contain"

              />
              <TouchableOpacity
                className="absolute top-5 right-0"

                onPress={() => {
                  setShowPopup(false); // 👉 your page name
                }}
              >
                <Image
                  source={cancel}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"

                />

              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </Modal>
      }
      {/* 🔥 MAIN HOME PAGE CONTENT */}
      <ScrollView>
        <HeroSlide images={homeBanners} />
        <MusicBanner />
        <RunningText />
        <Banner />
        <ServicesOn />
        <VideoSlide videos={videoAds} />
        <Categories />
        <LimitedOffers offers1={limitedOffers1} offers2={limitedOffers2} />
        <Recognized />
      </ScrollView>
    </>
  );
};

export default Home;
