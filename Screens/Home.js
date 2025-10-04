import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import HeroSlide from "./Home/HeroSlide";
import Banner from "./Home/Banner";
import ServicesOn from "./Home/ServicesOn";
import Categories from "./Home/Categories";
import LimitedOffers from "./Home/LimitedOffers";
import Recognized from "./Home/Recognized";
import { getads } from "../services/apiClient";
import banner1 from "../assets/Banners/Banner1.jpg";
import banner2 from "../assets/Banners/Banner2.jpg";
import banner3 from "../assets/Banners/Banner3.jpg";
import banner4 from "../assets/Banners/Banner4.jpg";
import banner5 from "../assets/Banners/Banner5.jpg";

const Home = () => {
  const [homeBanners, setHomeBanners] = useState([]);
  const [limitedOffers1, setLimitedOffers1] = useState([]);
  const [limitedOffers2, setLimitedOffers2] = useState([]);

  const imgUrl = "https://livecdn.dialkaraikudi.com/";

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

  useEffect(() => {
    const getAdverts = async () => {
      try {
        const response = await getads();

        // 🟩 HERO BANNERS
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

        // 🟨 LIMITED OFFERS 1
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

        // 🟦 LIMITED OFFERS 2
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
      } catch (error) {
        console.error("Error loading ads:", error);
        setHomeBanners(fallbackBanners);
        setLimitedOffers1(fallbackOffers);
        setLimitedOffers2(fallbackOffers);
      }
    };

    getAdverts();
  }, []);

  // 🔧 Helper function to always return exactly 2 offers
  const getTwoOffers = (offers, fallback) => {
    if (offers.length >= 2) return offers.slice(0, 2);
    if (offers.length === 1) return [offers[0], fallback[0]];
    return fallback.slice(0, 2);
  };

  return (
    <ScrollView>
      <HeroSlide images={homeBanners} />
      <Banner />
      <ServicesOn />
      <Categories />
      <LimitedOffers offers1={limitedOffers1} offers2={limitedOffers2} />
      <Recognized />
    </ScrollView>
  );
};

export default Home;
