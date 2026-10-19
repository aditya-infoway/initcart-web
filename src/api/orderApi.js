// src/api/orderApi.js
// Order pages ke liye isolated GET helper. Shared axiosInstance/interceptors ko touch nahi karta.
import axios from "axios";

const BASE = "http://localhost:8000";
const plain = axios.create({ baseURL: BASE, timeout: 30000 }); // no interceptors

const buildAuthList = () => {
  const list = [];
  const drf = localStorage.getItem("customer_token");
  const access = localStorage.getItem("access_token");
  if (drf) list.push(`Token ${drf}`);       // DRF token expire nahi hota -> pehle try
  if (access) list.push(`Bearer ${access}`); // JWT fallback (agent-only login ke liye)
  return list;
};

const refreshAccess = async () => {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;
  try {
    const res = await plain.post("/api/token/refresh/", { refresh });
    localStorage.setItem("access_token", res.data.access);
    return `Bearer ${res.data.access}`;
  } catch {
    return null;
  }
};

export const orderGet = async (url, params) => {
  const auths = buildAuthList();
  if (auths.length === 0) {
    const e = new Error("Not logged in");
    e.response = { status: 401, data: { message: "Please login again" } };
    throw e;
  }

  let lastErr;
  for (const auth of auths) {
    try {
      return await plain.get(url, { params, headers: { Authorization: auth } });
    } catch (err) {
      lastErr = err;
      if (err.response?.status !== 401) throw err;

      // JWT expired ho sakta hai -> refresh karke ek baar retry
      if (auth.startsWith("Bearer")) {
        const fresh = await refreshAccess();
        if (fresh) {
          try {
            return await plain.get(url, { params, headers: { Authorization: fresh } });
          } catch (e2) {
            lastErr = e2;
          }
        }
      }
    }
  }
  throw lastErr;
};