import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import HeroSlide from "./Home/HeroSlide";
import Banner from "./Home/Banner";
import ServicesOn from "./Home/ServicesOn";
import Categories from "./Home/Categories";
import LimitedOffers from "./Home/LimitedOffers";
import Recognized from "./Home/Recognized";
import { getads } from "../services/apiClient";
import banner1 from "../assets/Banners/Banner1.jpg"
import banner2 from "../assets/Banners/Banner2.jpg"
import banner3 from "../assets/Banners/Banner3.jpg"
import banner4 from "../assets/Banners/Banner4.jpg"
import banner5 from "../assets/Banners/Banner5.jpg"

const Home = () => {
  const [homeBanners, setHomeBanners] = useState([]);
  const [limitedOffers, setLimitedOffers] = useState([]);
  const imgUrl = "https://livecdn.dialkaraikudi.com/";

  // ✅ Local fallback images
  const fallbackBanners = [
    { url: (banner1), businessId: null },
    { url: (banner2), businessId: null },
    { url: (banner3), businessId: null },
    { url: (banner4), businessId: null },
    { url: (banner5), businessId: null },
  ];

  const fallbackOffers = [
    { url: (banner1), businessId: null },
    { url: (banner2), businessId: null },
    { url: (banner3), businessId: null },
    { url: (banner4), businessId: null },
    { url: (banner5), businessId: null },
  ];

  useEffect(() => {
    const getAdverts = async () => {
      try {
        const response = await getads();

        // ✅ Hero Banners
        const homeAds = response.filter(
          (ad) => ad.slotId._id === "68272bafa52bbd6718f881f7" && ad.isActive
        );

        let banners = homeAds.map((ad) => ({
          url: imgUrl + ad.mobileContentUrl,
          businessId: ad.businessId,
        }));

        if (banners.length < 5) {
          const needed = 5 - banners.length;
          banners = [...banners, ...fallbackBanners.slice(0, needed)];
        }

        setHomeBanners(banners);

        // ✅ Limited Offers
        const offersAds = response.filter(
          (ad) => ad.slotId.name.includes("Limited Offer") && ad.isActive
        );

        let offers = offersAds.map((ad) => ({
          url: imgUrl + ad.contentUrl,
          businessId: ad.businessId,
        }));

        if (offers.length < 5) {
          const needed = 5 - offers.length;
          offers = [...offers, ...fallbackOffers.slice(0, needed)];
        }

        setLimitedOffers(offers);

      } catch (error) {
        console.error("Error loading ads:", error);
        setHomeBanners(fallbackBanners.slice(0, 5));
        setLimitedOffers(fallbackOffers.slice(0, 5));
      }
    };

    getAdverts();
  }, []);

  return (
    <ScrollView>
      <HeroSlide images={homeBanners} />
      <Banner />
      <ServicesOn />
      <Categories />
      <LimitedOffers offers={limitedOffers} />
      <Recognized />
    </ScrollView>
  );
};

export default Home;
