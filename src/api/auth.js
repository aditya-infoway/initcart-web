// src/api/auth.js
import { axiosInstance } from './axios';

export const authAPI = {
  // Forgot password
  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post('/ecommerce/customer/forgot-password/', {
        email: email.trim().toLowerCase()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Verify reset token
  verifyResetToken: async (uid, token) => {
    try {
      const response = await axiosInstance.post('/ecommerce/customer/verify-reset-token/', {
        uid,
        token
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Reset password
  resetPassword: async (uid, token, newPassword, confirmPassword) => {
    try {
      const response = await axiosInstance.post('/ecommerce/customer/reset-password/', {
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // Test email
  testEmail: async (email) => {
    try {
      const response = await axiosInstance.post('/ecommerce/customer/test-email/', {
        email: email.trim().toLowerCase()
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  }
};