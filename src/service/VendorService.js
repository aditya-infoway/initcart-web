// src/service/VendorService.js
import axios from "axios";

const API_URL = "https://api.initcart.in/api/ecommerce/vendors/";

export const registerVendor = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}register/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(" Vendor Registered:", response.data);
    return response.data;
  } catch (error) {
    console.error("Vendor Registration Error:", error.response?.data || error);
    throw error.response?.data || error;
  }
};
