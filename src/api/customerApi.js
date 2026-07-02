// src/api/customerAPI.js
import axiosInstance from './axios';

export const customerAPI = {
  // Get customer profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/ecommerce/customer/profile/');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update customer profile
  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/ecommerce/customer/profile/', 
        { profile: profileData }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Apply for agent
  applyForAgent: async (formData) => {
    try {
      const response = await axiosInstance.post('/ecommerce/customers/apply-agent/', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error applying for agent:', error);
      throw error;
    }
  },

    // Get orders
  getOrders: async () => {
    try {
      const response = await axiosInstance.get('/ecommerce/orders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },
  

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.post('/ecommerce/customer/change-password/', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};