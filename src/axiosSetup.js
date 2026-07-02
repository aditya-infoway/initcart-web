//src/axiosSetup.js
import axios from "axios";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("vendor_access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
