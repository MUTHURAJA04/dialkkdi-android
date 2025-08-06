// services/apiClient.js
import axios from 'axios';

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

// ✅ Google SSO login function
export const googleSSOLogin = async idToken => {
  console.log('📡 googleSSOLogin() called with ID Token:', idToken);

  try {
    const response = await apiClient.post('/user/googleauth', {
      credential: idToken,
    });

    console.log('✅ Google SSO Success Response:', response.data);

    const data = response.data;

    return data;
  } catch (error) {
    console.error('❌ Google SSO API call failed:', {
      message: error.message,
      response: error.response?.data,
    });
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

/** Verify OTP */
export const verifyOtpAndCreateAccount = async (email, otp) => {
  try {
    const response = await apiClient.post('/user/verify-otp', {
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error('OTP Verification API failed:', error.response?.data || error.message);
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


export default apiClient;
