// services/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://dev-api.dialkaraikudi.com';

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
export const loginWithEmail = async (email, password) => {
  console.log(' loginWithEmail() called with:', { email, password });
  try {
    const response = await apiClient.post('/user/login', {
      email,
      password,
    });

    console.log(' Email/Password Login Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('Email/Password Login API failed:', {
      message: error.message,
      response: error.response?.data,
    });
    throw error;
  }
};


/** ✅ Verify OTP & Create Account */
export const verifyOtpAndCreateAccount = async (email, otp) => {
  try {
    const response = await apiClient.post('/user/verifyOtpAndCreateAccount', {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error('Verify OTP & Create Account API Error:', error.response?.data || error.message);
    throw error;
  }
};

/** ✅ Resend OTP (Signup) */
export const resendRegisterOtp = async (email) => {
  try {
    const response = await apiClient.post('/user/resendregisterotp', {
      email,
    });
    return response.data;
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

    // ⬇️ Build the final payload
    const payload = {
      ...reviewData,
      user: user.id,
      business: businessId,
    };

    console.log('📤 Review payload:', payload);

    const response = await apiClient.post('/reviews', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Review submitted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Review API failed:', {
      message: error.message,
      url: '/reviews',
      response: error.response?.data,
      status: error.response?.status,
    });
    throw error;
  }
};



export default apiClient;
