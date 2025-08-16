import React, { useState } from "react";
import { View, Text, Dimensions, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const DashboardCharts = ({ dashboard }) => {
    const [selectedView, setSelectedView] = useState("overall"); // for VIEWS
    const [selectedReview, setSelectedReview] = useState("overall"); // for REVIEWS

    if (!dashboard) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="blue" />
            </View>
        );
    }

    // -------------------- 📊 VIEWS DATA --------------------
    const weeklyData = dashboard?.views?.weekly?.breakdown?.map((item) => item.totalViews) || [];
    const monthlyData = dashboard?.views?.monthly?.breakdown?.map((item) => item.totalViews) || [];
    const yearlyData = dashboard?.views?.yearly?.breakdown?.map((item) => item.totalViews) || [];
    const yearlyLabels = dashboard?.views?.yearly?.breakdown?.map((item) => {
        const [year, month] = item.date.split("-"); // e.g. "2025-05"
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthNames[parseInt(month, 10) - 1];
    }) || [];
    const overallViews = dashboard?.views?.alltime?.totalViews || 0;

    // -------------------- ⭐ REVIEWS DATA --------------------
    const overallBreakdown = dashboard?.reviews?.reviewStatsYearly?.ratingBreakdown || {};
    const monthlyBreakdown = dashboard?.reviews?.reviewStatsMonthly?.ratingBreakdown || {};
    const weeklyBreakdown = dashboard?.reviews?.reviewStatsWeekly?.ratingBreakdown || {};

    const convertToPieData = (breakdown) => {
        return Object.entries(breakdown).map(([rating, count], index) => {
            const colors = ["#f44336", "#ff9800", "#ffc107", "#4caf50", "#2196f3", "#9c27b0"];
            return {
                name: `${rating}★`,
                population: count,
                color: colors[index % colors.length],
                legendFontColor: "#333",
                legendFontSize: 14,
            };
        });
    };

    const createdDate = dashboard.business.createdDate;
    const onlyDate = new Date(createdDate).toISOString().split("T")[0];

    // -------------------- RENDER VIEWS CHART --------------------
    const renderViewsChart = () => {
        if (selectedView === "overall") {
            return (
                <>
                    <Text style={{ textAlign: "center", fontSize: 18, marginVertical: 10 }}>📊 Overall Views</Text>
                    <BarChart
                        data={{
                            labels: ["Total"],
                            datasets: [{ data: [overallViews] }],
                        }}
                        width={screenWidth - 16}
                        height={220}
                        chartConfig={{
                            backgroundGradientFrom: "#eff3ff",
                            backgroundGradientTo: "#efefef",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                        }}
                        style={{ marginVertical: 10, borderRadius: 10, alignSelf: "center" }}
                    />
                </>
            );
        } else if (selectedView === "weekly") {
            return (
                <>
                    <Text style={{ textAlign: "center", fontSize: 18, marginVertical: 10 }}>📈 Weekly Views</Text>
                    <LineChart
                        data={{
                            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                            datasets: [{ data: weeklyData }],
                        }}
                        width={screenWidth - 16}
                        height={220}
                        chartConfig={{
                            backgroundGradientFrom: "#fb8c00",
                            backgroundGradientTo: "#ffa726",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                        }}
                        bezier
                        style={{ marginVertical: 10, borderRadius: 10, alignSelf: "center" }}
                    />
                </>
            );
        } else if (selectedView === "yearly") {
            return (
                <>
                    <Text style={{ textAlign: "center", fontSize: 18, marginVertical: 10 }}>📈 Yearly Views</Text>
                    <LineChart
                        data={{
                            labels: yearlyLabels,
                            datasets: [{ data: yearlyData }],
                        }}
                        width={screenWidth - 16}
                        height={220}
                        chartConfig={{
                            backgroundGradientFrom: "#43a047",
                            backgroundGradientTo: "#2e7d32",
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                        }}
                        bezier
                        style={{ marginVertical: 10, borderRadius: 10, alignSelf: "center" }}
                    />
                </>
            );
        }
    };

    // -------------------- RENDER REVIEWS PIE --------------------
    const renderReviewsChart = () => {
        let data = [];
        let totalReviews = 0;

        if (selectedReview === "overall") {
            data = convertToPieData(overallBreakdown);
            totalReviews = dashboard?.reviews?.count || 0;
        } else if (selectedReview === "monthly") {
            data = convertToPieData(monthlyBreakdown);
            totalReviews = dashboard?.reviews?.reviewStatsMonthly?.totalReviews || 0;
        } else if (selectedReview === "weekly") {
            data = convertToPieData(weeklyBreakdown);
            totalReviews = dashboard?.reviews?.reviewStatsWeekly?.totalReviews || 0;
        }

        return (
            <>
                <Text style={{ textAlign: "center", fontSize: 18, marginVertical: 10 }}>
                    ⭐ {selectedReview.toUpperCase()} Ratings
                </Text>

                {/* 🔢 Show Total Reviews Count */}
                <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
                    Total Reviews: {totalReviews}
                </Text>

                <PieChart
                    data={data}
                    width={screenWidth - 16}
                    height={220}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    absolute
                />
            </>
        );
    };

    return (
        <ScrollView>

            <View className="p-4">
                <Text className="text-3xl">
                    {dashboard.business.businessName}
                </Text>
                <Text>
                   Your Dialkaraikudi Journey Started on {onlyDate}
                </Text>
            </View>

            <View className="flex-row flex-wrap gap-4 mb-6 p-2 mt-3 items-center justify-center">
                <View className="bg-blue-500 p-4 rounded-2xl w-[45%]">
                    <Text className="text-white text-lg font-bold">Total Views</Text>
                    <Text className="text-white text-2xl">{dashboard.views.alltime.totalViews}</Text>
                </View>
                <View className="bg-green-500 p-4 rounded-2xl w-[45%]">
                    <Text className="text-white text-lg font-bold">Total Reviews</Text>
                    <Text className="text-white text-2xl">{dashboard.reviews.count}</Text>
                </View>
                <View className="bg-purple-500 p-4 rounded-2xl w-[45%]">
                    <Text className="text-white text-lg font-bold">Average Rating</Text>
                    <Text className="text-white text-2xl">{dashboard.reviews.averageRating} </Text>
                </View>
                <View className="bg-orange-500 p-4 rounded-2xl w-[45%]">
                    <Text className="text-white text-lg font-bold">Favourites</Text>
                    <Text className="text-white text-2xl">{dashboard.favourites}</Text>
                </View>
            </View>
            {/* 🔘 VIEWS Section */}
            <Text style={{ textAlign: "center", fontSize: 20, fontWeight: "bold", marginTop: 10 }}> Views</Text>
            <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 10 }}>
                {["overall", "weekly", "yearly"].map((option) => (
                    <TouchableOpacity
                        key={option}
                        onPress={() => setSelectedView(option)}
                        style={{
                            backgroundColor: selectedView === option ? "blue" : "gray",
                            paddingVertical: 8,
                            paddingHorizontal: 15,
                            borderRadius: 20,
                            marginHorizontal: 5,
                        }}
                    >
                        <Text style={{ color: "white", fontWeight: "bold" }}>{option.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {renderViewsChart()}

            {/* 🔘 REVIEWS Section */}
            <Text style={{ textAlign: "center", fontSize: 20, fontWeight: "bold", marginTop: 20 }}> Reviews</Text>
            <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 10 }}>
                {["overall", "monthly", "weekly"].map((option) => (
                    <TouchableOpacity
                        key={option}
                        onPress={() => setSelectedReview(option)}
                        style={{
                            backgroundColor: selectedReview === option ? "blue" : "gray",
                            paddingVertical: 8,
                            paddingHorizontal: 15,
                            borderRadius: 20,
                            marginHorizontal: 5,
                        }}
                    >
                        <Text style={{ color: "white", fontWeight: "bold" }}>{option.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {renderReviewsChart()}
        </ScrollView>
    );
};

export default DashboardCharts;
