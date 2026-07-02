// src/service/CustomerService.js
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'https://api.initcart.in';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    // Always use customer_token for customer APIs
    const token = localStorage.getItem('customer_token');
    console.log('📡 API Request - Token:', token ? 'Present' : 'Missing');
    
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing auth');
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
    }
    
    return Promise.reject(error);
  }
);

// Customer Registration
export const registerCustomer = async (customerData) => {
  console.log('📝 Register Customer:', customerData);
  
  try {
    const response = await api.post('/ecommerce/customer/register/', customerData);
    console.log('✅ Registration response:', response.data);
    
    if (response.data.success && response.data.token) {
      // Call external login function if provided
      if (window.handleLoginSuccess) {
        window.handleLoginSuccess(response.data.user, response.data.token);
      }
      
      return response.data;
    }
    
    throw new Error(response.data.message || 'Registration failed');
    
  } catch (error) {
    console.error('❌ Registration error:', error.response?.data || error.message);
    throw error.response?.data || { 
      success: false, 
      message: error.message || 'Registration failed' 
    };
  }
};


//customerlogin
export const loginCustomer = async (credentials) => {
  try {
    console.log('🔑 Login Customer API call:', { 
      username: credentials.username, 
      password: '***' 
    });
    
    const response = await api.post('/ecommerce/customer/login/', credentials);
    console.log('✅ Login API response:', response.data);
    
    if (response.data.success && response.data.token) {
      // IMPORTANT: Save user data properly
      const userData = {
        id: response.data.user?.id,
        username: response.data.user?.username,
        email: response.data.user?.email,
        phone: response.data.user?.phone,
        role: response.data.user?.role,
        user_type: response.data.user?.user_type || 'customer'
      };
      
      console.log('👤 User data to save:', userData);
      
      // Save to localStorage
      localStorage.setItem('customer_token', response.data.token);
      localStorage.setItem('customer_user', JSON.stringify(userData));
      
      console.log('✅ Auth data saved to localStorage');
      
      return {
        ...response.data,
        user: userData  // Return formatted user data
      };
    }
    
    throw new Error(response.data.message || 'Login failed');
    
  } catch (error) {
    console.error('❌ Login API error:', error.response?.data || error.message);
    throw error.response?.data || { 
      success: false, 
      message: error.message || 'Login failed' 
    };
  }
};

// Customer Logout
export const logoutCustomer = async () => {
  console.log('🚪 Logout Customer');
  
  try {
    const response = await api.post('/ecommerce/customer/logout/');
    console.log('✅ Logout response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error.response?.data || { 
      success: false, 
      message: 'Logout failed' 
    };
  } finally {
    // Always clear localStorage
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
  }
};

// Get Customer Profile
export const getCustomerProfile = async () => {
  console.log('👤 Get Customer Profile');
  
  try {
    const response = await api.get('/ecommerce/customer/profile/');
    console.log('✅ Profile response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Profile error:', error);
    throw error.response?.data || { 
      success: false, 
      message: 'Failed to fetch profile' 
    };
  }
};

// Check if customer is authenticated
export const isCustomerAuthenticated = () => {
  const token = localStorage.getItem('customer_token');
  const user = localStorage.getItem('customer_user');
  const isAuth = !!(token && user);
  
  console.log('🔐 Customer Auth Check:', { token: !!token, user: !!user, isAuth });
  return isAuth;
};

// Get current customer
export const getCurrentCustomer = () => {
  const userStr = localStorage.getItem('customer_user');
  
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('👤 Current Customer:', user);
      return user;
    } catch (e) {
      console.error('❌ Error parsing user data:', e);
      return null;
    }
  }
  
  return null;
};

// Get customer token
export const getCustomerToken = () => {
  const token = localStorage.getItem('customer_token');
  console.log('🔑 Customer Token:', token ? 'Present' : 'Missing');
  return token;
};

// Update customer profile
export const updateCustomerProfile = async (profileData) => {
  console.log('✏️ Update Customer Profile:', profileData);
  
  try {
    const response = await api.put('/ecommerce/customer/profile/update/', profileData);
    console.log('✅ Profile update response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Profile update error:', error);
    throw error.response?.data || { 
      success: false, 
      message: 'Failed to update profile' 
    };
  }
};

// Utility to sync auth with context
export const syncAuthWithContext = (authContext) => {
  console.log('🔄 Syncing auth with context');
  
  const token = localStorage.getItem('customer_token');
  const userStr = localStorage.getItem('customer_user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (authContext.login) {
        authContext.login(user, token, 'customer');
      }
    } catch (e) {
      console.error('❌ Error syncing auth:', e);
    }
  }
};