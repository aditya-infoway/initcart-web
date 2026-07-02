// src/api/axios.js
import axios from "axios";

const API_BASE_URL = "https://api.initcart.in";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const publicAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// =============================
// REQUEST INTERCEPTOR
// =============================
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token");
    const drfToken = localStorage.getItem("customer_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (drfToken) {
      config.headers.Authorization = `Token ${drfToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =============================
// RESPONSE INTERCEPTOR
// =============================
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isJWTRequest =
      originalRequest.headers?.Authorization?.startsWith("Bearer");

    // Only try refresh if JWT was used
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      isJWTRequest
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        logoutUser();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;
        localStorage.setItem("access_token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        logoutUser();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// =============================
// LOGOUT FUNCTION
// =============================
function logoutUser() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("customer_token");
  localStorage.removeItem("customer_user");

  window.dispatchEvent(new Event("authChanged"));
  window.location.href = "/customer/login";
}

export default axiosInstance;