// services/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.dialkaraikudi.com';

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🐞 Debug Interceptors
apiClient.interceptors.request.use(request => {
  console.log(
    '📡 Request:',
    request.method?.toUpperCase(),
    request.url,
    request.data,
  );
  return request;
});

apiClient.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.data);
    return response;
  },
  error => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  },
);

export const googleSSOLogin = async (idToken) => {
  console.log('📡 googleSSOLogin() called with ID Token:', idToken);

  try {
    const response = await apiClient.post('/user/googleauth', {
      credential: idToken,
    });

    console.log('✅ Google SSO Success Response:', response.data);

    const { token, user } = response.data;

    // ✅ Save to AsyncStorage
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));

    console.log('✅ Token and user data stored in AsyncStorage');

    const userToken = await AsyncStorage.getItem('userToken');
    const userData = await AsyncStorage.getItem('userData');

    console.log('🔑 Token:', userToken);
    console.log('👤 User Data:', userData);

    return response.data;
  } catch (error) {
    console.error('❌ Google SSO API call failed:', {
      message: error.message,
      response: error.response?.data,
    });
    throw error;
  }
};



/** ✅ Sign Up / Register */
export const signupUser = async (name, email, phone, password) => {
  console.log(' [API] signupUser called:', { name, email, phone, password });

  try {
    const response = await apiClient.post('/user/signup', {
      name,
      email,
      phone,
      password,
    });

    console.log(' [API] Signup Success:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      ' [API] Signup Failed:',
      error.response?.data || error.message
    );
    throw error;
  }
};


/** Email/Password Login */
export const loginWithEmail = async (email, password, type) => {
  console.log(' loginWithEmail() called with:', { email, password });
  try {
    if (type == 'user') {
      const response = await apiClient.post('/user/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      console.log(' Email/Password Login Success:', response.data);

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      return response.data;
    } else {
      const response = await apiClient.post('/business/login', {
        email,
        password,
      });
      console.log(' Email/Password Login Success:', response.data);

      const { token, business } = response.data;

      await AsyncStorage.setItem('businessToken', token);
      await AsyncStorage.setItem('businessData', JSON.stringify(business));
      console.log(business, "1234567");


      return response.data;
    }
  } catch (error) {
    console.error('Email/Password Login API failed:', {
      message: error.message,
      response: error.response?.data,
    });
    throw error;
  }
};


/** ✅ Verify OTP & Create Account */
export const verifyOtpAndCreateAccount = async (email, otp, type) => {
  try {
    console.log(type);

    if (type == 'business') {
      const response = await apiClient.post('/business/verifyOtpAndCreateBusiness', {
        email,
        otp,
      });
      return response.data;
    } else {
      const response = await apiClient.post('/user/verifyOtpAndCreateAccount', {
        email,
        otp,
      });
      return response.data;
    }

  } catch (error) {
    console.error('Verify OTP & Create Account API Error:', error.response?.data || error.message);
    throw error;
  }
};

/** ✅ Resend OTP (Signup) */
export const resendRegisterOtp = async (email, type) => {
  try {
    if (type == 'business') {
      const response = await apiClient.post('/business/resendBusinessOtp', {
        email,
      });
      return response.data;
    } else {
      const response = await apiClient.post('/user/resendregisterotp', {
        email,
      });
      return response.data;
    }

  } catch (error) {
    console.error('Resend OTP API Error:', error.response?.data || error.message);
    throw error;
  }
};


//get categories

export const getCategories = async () => {
  try {
    const response = await apiClient.get('/categories');
    return response.data;
  } catch (error) {
    console.error('❌ Google SSO API call failed:', {
      message: error.message,
      response: error.response?.data,
    });
  }
};



// Get search suggestions
export const getSearchSuggestions = async (query) => {
  try {
    const response = await apiClient.get('/business/searchsuggestions', {
      params: { query } // Make sure this matches your backend expectation
    });
    return response.data?.suggestions || { categories: [], businesses: [] };
  } catch (error) {
    console.error("❌ Search Suggestions API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Search businesses
export const searchBusinesses = async (query) => {
  try {
    const response = await apiClient.get('/business/search', {
      params: { query }
    });
    return response.data?.businesses || [];
  } catch (error) {
    console.error("❌ Search Businesses API Error:", error.response?.data || error.message);
    throw error;
  }
};





export const businessList = async (categoryId) => {
  try {
    const response = await apiClient.get(`/business/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('❌ businessList API call failed:', {
      message: error.message,
      response: error.response?.data,
    });
    return null;
  }
};


// ✅ Get business by ID
export const getBusinessById = async (businessId) => {
  try {
    console.log(`📡 Fetching business detail from: ${API_BASE_URL}/business/${businessId}`);
    const response = await apiClient.get(`/business/${businessId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching business by ID:', {
      message: error.message,
      response: error.response?.data,
    });
    throw error;
  }
};

export const review = async (businessId, reviewData) => {
  try {
    // ⬇️ Get user and token from storage
    const userData = await AsyncStorage.getItem('userData');
    const token = await AsyncStorage.getItem('userToken');

    if (!userData || !token) {
      console.error('❌ No user data or token found in AsyncStorage.');
      throw new Error('Not authenticated');
    }

    const user = JSON.parse(userData);

    // Build the payload
    const payload = {
      rating: reviewData.rating,
      comment: reviewData.comment,
      user: user.id,
      business: businessId,
    };

    console.log('📤 Review payload:', payload, reviewData);

    let response;
    if (reviewData.oldUser === true && reviewData.reviewId) {
      // 🔄 Update existing review
      response = await apiClient.put(`/reviews/${reviewData.reviewId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      // 🆕 Create new review
      response = await apiClient.post('/reviews', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    console.log('✅ Review submitted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Review API failed:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};


export const getCities = async () => {
  try {
    const response = await apiClient.get('/cities');
    return response.data;
  } catch (error) {
    console.error('❌ Google SSO API call failed:', {
      message: error.message,
      response: error.response?.data,
    });
  }
};
export const getads = async () => {
  try {
    const response = await apiClient.get(`/adverts`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Google SSO API call failed:', {
      message: error.message,
      response: error.response?.data,
    });
  }
};

// Fetch feed
export const Dialogram = async () => {
  try {
    // Get user token for authenticated request
    const userToken = await AsyncStorage.getItem('userToken');
    const headers = {};

    if (userToken) {
      headers.Authorization = `Bearer ${userToken}`;
      console.log('[Dialogram API] 🔐 Using authenticated request');
    } else {
      console.log('[Dialogram API] ⚠️ No user token found, using unauthenticated request');
    }

    const res = await apiClient.get("/feeds", { headers });
    console.log("[Dialogram API] ✅ Feed fetched:", res.data);

    // Log the first post structure to debug
    if (res.data && Array.isArray(res.data) && res.data.length > 0) {
      console.log('[Dialogram API] 📋 First post structure:', {
        id: res.data[0]._id,
        allProperties: Object.keys(res.data[0]),
        hasLikes: 'likes' in res.data[0],
        hasLikesCount: 'likesCount' in res.data[0],
        hasIsLiked: 'isLiked' in res.data[0],
        likesValue: res.data[0].likes,
        likesCountValue: res.data[0].likesCount,
        isLikedValue: res.data[0].isLiked
      });
    }

    return res.data;
  } catch (error) {
    console.error("[Dialogram API] ❌ Error fetching feed:", error.response?.data || error.message);
    throw error;
  }
};

// Like/Unlike post
export const DialogramLike = async (postId) => {
  try {
    console.log('[DialogramLike API] 🔄 Starting like/unlike process for post:', postId);

    // Get user data from AsyncStorage
    const userDataString = await AsyncStorage.getItem("userData");
    console.log('[DialogramLike API] 📦 Raw user data from storage:', userDataString);

    if (!userDataString) {
      console.error('[DialogramLike API] ❌ No user data found in AsyncStorage');
      throw new Error('User not authenticated. Please login again.');
    }

    const userData = JSON.parse(userDataString);
    console.log('[DialogramLike API] 👤 Parsed user data:', userData);

    // Check for user ID - try different possible properties
    const userId = userData._id || userData.id || userData.userId;
    const userType = "User";

    console.log('[DialogramLike API] 🔍 Extracted user info:', { userId, userType });

    if (!userId) {
      console.error('[DialogramLike API] ❌ No user ID found in user data:', userData);
      throw new Error('Invalid user data. Please login again.');
    }

    const payload = {
      userId: userId,
      userType: userType,
    };

    console.log('[DialogramLike API] 📤 Sending payload:', payload);

    const res = await apiClient.put(`/feeds/${postId}/like`, payload);
    console.log(`[DialogramLike API] ✅ Post ${postId} toggled like:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`[DialogramLike API] ❌ Error for ${postId}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

// Add to Favourites
export const addToFavourites = async (businessId) => {
  try {
    // Get token & user data from storage
    const token = await AsyncStorage.getItem("userToken");
    const userDataString = await AsyncStorage.getItem("userData");


    if (!token || !userDataString) {
      throw new Error("User not authenticated. Please log in.");
    }

    const userData = JSON.parse(userDataString);
    const userId = userData._id || userData.id;

    if (!userId) {
      throw new Error("Invalid user data: No user ID found.");
    }

    // Payload for API
    const payload = {
      user: userId,
      business: businessId
    };

    console.log("[addToFavourites] 📤 Sending:", payload);

    // Send POST request
    const res = await apiClient.post("/favourites/add", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[addToFavourites] ✅ Success:", res.data);
    return res.data;

  } catch (error) {
    console.error("[addToFavourites] ❌ Error:", error.response?.data || error.message);
    throw error;
  }
};

export const removeFromFavourites = async (businessId) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) throw new Error('Not authenticated');
    const userDataString = await AsyncStorage.getItem("userData");

    const userData = JSON.parse(userDataString);
    const userId = userData._id || userData.id;

    const payload = {
      user: userId,
      business: businessId
    };

    const response = await apiClient.post(
      '/favourites/remove',
      payload,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (error) {
    console.error('❌ Remove from Favourites API failed:', error.response?.data || error.message);
    throw error;
  }
};

export const checkFavoriteStatus = async (businessId) => {
  try {
    // Get token & user data from storage
    const token = await AsyncStorage.getItem("userToken");
    const userDataString = await AsyncStorage.getItem("userData");

    if (!token || !userDataString) {
      throw new Error("User not authenticated. Please log in.");
    }

    const userData = JSON.parse(userDataString);
    const userId = userData._id || userData.id;

    if (!userId) {
      throw new Error("Invalid user data: No user ID found.");
    }

    console.log("[checkFavoriteStatus] 📤 Sending params:", {
      user: userId,
      business: businessId,
    });

    // Send GET request
    const res = await apiClient.get("/favourites/check", {
      params: {
        user: userId,
        business: businessId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[checkFavoriteStatus] ✅ Success:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "[checkFavoriteStatus] ❌ Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getFavoriteStatus = async () => {
  try {
    // Get token & user data from storage
    const token = await AsyncStorage.getItem("userToken");
    const userDataString = await AsyncStorage.getItem("userData");

    if (!token || !userDataString) {
      throw new Error("User not authenticated. Please log in.");
    }

    const userData = JSON.parse(userDataString);
    const userId = userData._id || userData.id;

    if (!userId) {
      throw new Error("Invalid user data: No user ID found.");
    }

    console.log("[checkFavoriteStatus] 📤 Sending params:", {
      user: userId,
    });

    // Send GET request
    const res = await apiClient.get(`favourites/user?user=${userId}`, {

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("[checkFavoriteStatus] ✅ Success:", res.data.data);
    return res.data.data;
  } catch (error) {
    console.error(
      "[checkFavoriteStatus] ❌ Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getArea = async (cityId) => {
  try {
    const response = await apiClient.get(`/areas?city=${cityId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Google SSO API call failed:', {
      message: error.message,
      response: error.response?.data,
    });
  }
};

export const postBusiness = async (payload) => {
  try {
    const response = await apiClient.post('/business/signup', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    },
    )
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
  }
}

export const editBusiness = async (payload) => {
  try {
    const businessDataString = await AsyncStorage.getItem("businessData");
    const token = await AsyncStorage.getItem("businessToken");

    if (!businessDataString || !token) {
      throw new Error("Business not authenticated. Please login again.");
    }

    const businessData = JSON.parse(businessDataString);
    const businessId = businessData.id;

    if (!businessId) {
      throw new Error("Invalid business data. Please login again.");
    }

    // Detect FormData
    const isFormData =
      payload &&
      typeof payload === "object" &&
      (typeof FormData !== "undefined" && payload instanceof FormData);

    console.log("📤 [editBusiness] Payload type:", isFormData ? "FormData" : "JSON");

    const response = await apiClient.put(
      `/business/${businessId}`,
      isFormData ? payload : JSON.stringify(payload),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(isFormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" }),
        },
        transformRequest: (data) => data, // 👈 don’t let axios mess with FormData
      }
    );

    console.log('✅ [editBusiness] Success response:', response.data);

    if (response && response.data) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: "Unknown error" };
    }
  } catch (error) {
    console.error("❌ [editBusiness] API Error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
};



export const civicFeeds = async () => {
  try {
    const response = await apiClient.get(`/civicfeeds`);
    return response.data;
  } catch (error) {
    console.error('❌ civicFeeds API call failed:', {
      message: error.message,
      response: error.response?.data,
    });
    return null;
  }
};

export const civicFeedUser = async () => {
  const businessDataString = await AsyncStorage.getItem("businessData");
  const businessData = JSON.parse(businessDataString);
  const businessId = businessData?.id;

  const userDataString = await AsyncStorage.getItem("userData");
  const userData = JSON.parse(userDataString);
  const userId = userData?._id || userData?.id;

  const usertoken = await AsyncStorage.getItem("userToken");
  const businesstoken = await AsyncStorage.getItem("businessToken");

  const token = businesstoken || usertoken;
  console.log("🧩 Token:", token);

  try {
    const id = userId || businessId;
    const type = userId ? "User" : "Business";

    const response = await apiClient.get(`/civicfeeds/poster/${id}?type=${type}`, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;

  } catch (error) {
    console.error("❌ Don't fetch Civic Post", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
  }
};

export const civicFeedUpdate = async ({ posterId, formData }) => {
  try {
    const businessDataString = await AsyncStorage.getItem("businessData");
    const businessData = businessDataString ? JSON.parse(businessDataString) : null;
    const businessId = businessData?.id;

    const userDataString = await AsyncStorage.getItem("userData");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.id;

    const usertoken = await AsyncStorage.getItem("userToken");
    const businesstoken = await AsyncStorage.getItem("businessToken");

    const token = businesstoken ? businesstoken : usertoken

    let LoginId = businessId ? businessId : userId;
    let isAdmin = businessId ? true : false;

    // append userId & isAdmin into formData
    formData.append("userId", LoginId);
    formData.append("isAdmin", isAdmin);

    const response = await apiClient.put(`/civicfeeds/${posterId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Dont fetch Civic Post ❌", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const civicPost = async (postData) => {
  // 1. Get user/business data from AsyncStorage
  const businessDataString = await AsyncStorage.getItem("businessData");
  const businessData = businessDataString ? JSON.parse(businessDataString) : null;

  const userDataString = await AsyncStorage.getItem("userData");
  const userData = userDataString ? JSON.parse(userDataString) : null;

  let loginId = businessData?.id || userData?.id;
  let userType = businessData ? "Business" : "User";

  const usertoken = await AsyncStorage.getItem("userToken");
  const businesstoken = await AsyncStorage.getItem("businessToken");

  const token = businesstoken ? businesstoken : usertoken

  const dataToSend = new FormData();

  dataToSend.append("title", postData.title);
  dataToSend.append("description", postData.description);

  if (postData.imageUrl && postData.imageUrl.startsWith('file://')) {
    dataToSend.append("civic", {
      uri: postData.imageUrl,
      name: `civic_${Date.now()}.jpg`,
      type: "image/jpeg",
    });
  }

  dataToSend.append("posterType", userType);
  dataToSend.append("postedBy", loginId);
  dataToSend.append("isAdmin", false);

  try {
    console.log("👉 Sending Form Data:", dataToSend, token);
    const response = await apiClient.post(`/civicfeeds`, dataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Civic Post failed:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const civicPostDelete = async (postId) => {
  try {
    const businessDataString = await AsyncStorage.getItem("businessData");
    const businessData = businessDataString ? JSON.parse(businessDataString) : null;
    const businessId = businessData?.id;
    const businessToken = await AsyncStorage.getItem("businessToken");

    const userDataString = await AsyncStorage.getItem("userData");
    const userData = userDataString ? JSON.parse(userDataString) : null;
    const userId = userData?.id;
    const userToken = await AsyncStorage.getItem("userToken");

    let LoginId = businessId ? businessId : userId;
    let token = businessToken ? businessToken : userToken;

    const response = await apiClient.delete(`civicfeeds/${postId}?user=${LoginId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error("Error ❌", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;

  }
}

export const civicLikeUnlike = async (postId) => {
  try {
    console.log('[civicLikeUnlike API] 🔄 Starting like/unlike process for post:', postId);

    // Get user data from AsyncStorage
    const userDataString = await AsyncStorage.getItem("userData");
    const businessDataString = await AsyncStorage.getItem("businessData");
    console.log('[civicLikeUnlike API] 📦 Raw user data from storage:', userDataString);

    if (!userDataString) {
      console.error('[civicLikeUnlike API] ❌ No user data found in AsyncStorage');
      throw new Error('User not authenticated. Please login again.');
    }

    const userData = JSON.parse(userDataString);
    const businessData = JSON.parse(businessDataString);

    console.log('[civicLikeUnlike API] 👤 Parsed user data:', userData);

    const usertoken = await AsyncStorage.getItem("userToken");
    const businesstoken = await AsyncStorage.getItem("businessToken");

    const token = businesstoken ? businesstoken : usertoken

    const userId = businessData ? businessData._id || businessData.id : userData._id || userData.id || userData.userId;
    const userType = businesstoken ? "Business" : "User";


    console.log('[civicLikeUnlike API] 🔍 Extracted user info:', { userId, userType });

    if (!userId) {
      console.error('[civicLikeUnlike API] ❌ No user ID found in user data:', userData);
      throw new Error('Invalid user data. Please login again.');
    }

    const payload = {
      userId: userId,
      userType: userType,
    };

    console.log('[civicLikeUnlike API] 📤 Sending payload:', payload);

    const res = await apiClient.patch(`/civicfeeds/${postId}/like`, payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(`[civicLikeUnlike API] ✅ Post ${postId} toggled like:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`[civicLikeUnlike API] ❌ Error for ${postId}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const civicComments = async (postId, text) => {
  try {
    console.log('[civicComments API] 🔄 Starting civicComments process for post:', postId);

    // Get user data and token from AsyncStorage
    const userDataString = await AsyncStorage.getItem("userData");
    const userToken = await AsyncStorage.getItem("userToken");
    console.log('[civicComments API] 📦 Raw user data from storage:', userDataString);

    if (!userDataString || !userToken) {
      console.error('[civicComments API] ❌ No user data or token found in AsyncStorage');
      throw new Error('User not authenticated. Please login again.');
    }

    const userData = JSON.parse(userDataString);
    console.log('[civicComments API] 👤 Parsed user data:', userData);

    // Check for user ID - try different possible properties
    const userId = userData._id || userData.id || userData.userId;
    const userType = "User";

    console.log('[civicComments API] 🔍 Extracted user info:', { userId, userType });

    if (!userId) {
      console.error('[civicComments API] ❌ No user ID found in user data:', userData);
      throw new Error('Invalid user data. Please login again.');
    }

    const payload = {
      userId: userId,
      userType: userType,
      name: userData.name,
      postId: postId,
      text: text,
    };

    console.log('[civicComments API] 📤 Sending payload:', payload);

    const res = await apiClient.post(`/civicfeeds/${postId}/add-comment`, payload, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    console.log(`[civicComments API] ✅ Post ${postId} Comments:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`[civicComments API] ❌ Error for ${postId}:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};

export const GetComments = async (postId) => {
  try {
    const response = await apiClient.get(`/civicfeeds/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error('❌ GetComments API call failed:', {
      message: error.message,
      response: error.response?.data,
    });
    return null;
  }
};

export const deleteComment = async (commentId) => {
  try {
    console.log(`[DeleteComment API] 🔄 Deleting comment: ${commentId}`);

    const userDataString = await AsyncStorage.getItem("userData");
    const userToken = await AsyncStorage.getItem("userToken");

    if (!userDataString || !userToken) {
      throw new Error("User not authenticated. Please login again.");
    }

    const userData = JSON.parse(userDataString);
    const userId = userData._id || userData.id || userData.userId;

    if (!userId) {
      throw new Error("Invalid user data. Please login again.");
    }

    const res = await apiClient.delete(
      `/civicfeeds/delete-comment/${commentId}?user=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    console.log(`[DeleteComment API] ✅ Comment deleted:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`[DeleteComment API] ❌ Delete failed:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};


export const getbusinessDashboard = async () => {
  try {
    console.log("Get business Dashboard");

    const businessDataString = await AsyncStorage.getItem("businessData");
    const businessToken = await AsyncStorage.getItem("businessToken");

    console.log(businessDataString, businessToken, "1214245");


    if (!businessDataString || !businessToken) {
      throw new Error("User not authenticated. Please login again.");
    }

    const businessData = JSON.parse(businessDataString);
    const businessId = businessData.id

    if (!businessId) {
      throw new Error("Invalid user data. Please login again.");
    }

    const res = await apiClient.get(
      `/business/dashboard/${businessId}`,
      {
        headers: {
          Authorization: `Bearer ${businessToken}`,
        },
      }
    );

    console.log(`[Get Dashboard API] ✅ Comment deleted:`, res.data);
    return res.data;

  } catch (error) {
    console.error(`[Get Dashboard API] ❌ Delete failed:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}

export const getbusinessDetails = async () => {
  try {
    console.log("Get business Dashboard");

    const businessDataString = await AsyncStorage.getItem("businessData");
    const businessToken = await AsyncStorage.getItem("businessToken");

    console.log(businessDataString, businessToken, "1214245");


    if (!businessDataString || !businessToken) {
      throw new Error("User not authenticated. Please login again.");
    }

    const businessData = JSON.parse(businessDataString);
    const businessId = businessData.id

    if (!businessId) {
      throw new Error("Invalid user data. Please login again.");
    }

    const res = await apiClient.get(
      `/business/getbusinessforpanel/${businessId}`,
      {
        headers: {
          Authorization: `Bearer ${businessToken}`,
        },
      }
    );

    console.log(`[Get Dashboard API] ✅ Comment deleted:`, res.data);
    return res.data.data;

  } catch (error) {
    console.error(`[Get Dashboard API] ❌ Delete failed:`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
}


export const postFeed = async (payload) => {
  try {
    console.log(payload, "12553");

    const response = await apiClient.post('/feeds', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    },
    )
    if (response) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: "Unknown error" };
    }

  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message,
    };
  }
}

export const getBusinessFeed = async (businessId) => {
  try {

    const businessDataString = await AsyncStorage.getItem("businessData");
    const businessData = JSON.parse(businessDataString);
    const businessId = businessData.id

    const response = await apiClient.get(`/feeds/business/${businessId}`)
    console.log(response, "get particular business feed");

    return response.data;

  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
  }
}

export const getBusinessFeedDelete = async (postId) => {
  try {

    const businessDataString = await AsyncStorage.getItem("businessData");
    const businessData = JSON.parse(businessDataString);
    const businessId = businessData.id

    console.log(postId);

    const response = await apiClient.delete(`/feeds/${postId}?businessId=${businessId}`)
    console.log(response, "Delete Successfully ");
    return response.data;

  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
  }
}

export const updatefeed = async (editPostId, formData) => {
  try {
    const response = await apiClient.put(`/feed/${editPostId}/edit`, formData);

    if (response && response.data) {
      return response.data;
    } else {
      return { success: false, message: "No response data" };
    }
  } catch (error) {
    if (error.response) {
      // server returned an error
      return { success: false, message: error.response.data?.message || "Server Error" };
    } else if (error.request) {
      // no response received
      return { success: false, message: "No response from server" };
    } else {
      // other errors
      return { success: false, message: error.message };
    }
  }
};


export const fetchadverts = async () => {
  try {
    const response = await apiClient.get('/advertslots')
    return response.data;
  } catch (error) {
    if (error.response) {
      // server returned an error
      return { success: false, message: error.response.data?.message || "Server Error" };
    } else if (error.request) {
      // no response received
      return { success: false, message: "No response from server" };
    } else {
      // other errors
      return { success: false, message: error.message };
    }
  }
}

export const createOrder = async (amount) => {
  try {
    const response = await apiClient.post('/payment/createorder', amount)
    if (response && response.data) {
      return response.data;
    } else {
      return { success: false, message: "No response data" };
    }
  } catch (error) {
    if (error.response) {
      // server returned an error
      return { success: false, message: error.response.data?.message || "Server Error" };
    } else if (error.request) {
      // no response received
      return { success: false, message: "No response from server" };
    } else {
      // other errors
      return { success: false, message: error.message };
    }
  }
}

export const verifyPayment = async (data) => {
  try {

    const response = await apiClient.post('/payment/verifypayment', data)
    if (response && response.data) {
      return response.data;
    } else {
      return { success: false, message: "No response data" };
    }
  } catch (error) {
    if (error.response) {
      // server returned an error
      return { success: false, message: error.response.data?.message || "Server Error" };
    } else if (error.request) {
      // no response received
      return { success: false, message: "No response from server" };
    } else {
      // other errors
      return { success: false, message: error.message };
    }
  }
}

export const assignSlot = async (data) => {
  try {

    const token = await AsyncStorage.getItem("businessToken");

    const response = await apiClient.post('/advertslots/assignbusiness', data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    )

    if (response && response.data) {
      return response.data;
    } else {
      return { success: false, message: "No response data" };
    }

  } catch (error) {

    if (error.response) {

      return { success: false, message: error.response.data?.message || "Server Error" };
    } else if (error.request) {

      return { success: false, message: "No response from server" };
    } else {

      return { success: false, message: error.message };
    }
  }
}

export const assignSlotpurchase = async (data) => {

  try {

    const token = await AsyncStorage.getItem("businessToken");

    const response = await apiClient.post('/slotPurchases', data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (response && response.data) {
      return response.data;
    } else {
      return { success: false, message: "No response data" };
    }

  } catch (error) {
    if (error.response) {

      return { success: false, message: error.response.data?.message || "Server Error" };
    } else if (error.request) {

      return { success: false, message: "No response from server" };
    } else {

      return { success: false, message: error.message };
    }
  }
}



export const deleteAccount = async (reason) => {
  try {
    // 🧠 Fetch all stored data
    const businessDataString = await AsyncStorage.getItem("businessData");
    const businessData = JSON.parse(businessDataString);
    const businessId = businessData?.id;

    const userDataString = await AsyncStorage.getItem("userData");
    const userData = JSON.parse(userDataString);
    const userId = userData?._id || userData?.id;

    const userToken = await AsyncStorage.getItem("userToken");
    const businessToken = await AsyncStorage.getItem("businessToken");

    // 🔹 Determine which account type is logged in
    const id = userId || businessId;
    const type = userId ? "user" : "business";
    const token = businessToken || userToken;

    console.log("🧩 Account Type:", type);
    console.log("🧩 Account ID:", id);
    console.log("🧩 Token:", token);

    if (!id || !token) {
      return { success: false, message: "Missing account info or token." };
    }

    // 🔹 Set Authorization header dynamically
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    // 🔹 Construct endpoint
    const endpoint = `/accountUtils/${type}/${id}`;

    // 🔹 Make delete request
    const response = await apiClient.delete(endpoint, {
      headers,
      data: { reason },
    });

    if (response && response.data) {
      return response.data;
    } else {
      return { success: false, message: "No response from server." };
    }
  } catch (error) {
    console.error("❌ Account deletion error:", error);
    if (error.response) {
      return {
        success: false,
        message:
          error.response.data?.message ||
          `Failed to delete account.`,
      };
    } else if (error.request) {
      return { success: false, message: "No response from server." };
    } else {
      return { success: false, message: error.message };
    }
  }
};


export default apiClient;
