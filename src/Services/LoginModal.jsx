// src/components/reviews/LoginModal.jsx
// ── Common login popup that triggers from review section ──────────────────

import React, { useState, useEffect } from "react";
import { FiX, FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus } from "react-icons/fi";
import { axiosInstance } from "../api/axios";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState("login");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ username: "", password: "" });
      setError("");
      setTab("login");
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) { setError("Email / phone / username required"); return; }
    if (!formData.password) { setError("Password required"); return; }

    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.post("/ecommerce/customer/login/", {
        username: formData.username.trim(),
        password: formData.password,
      });

      if (res.data.success && res.data.token && res.data.user) {
        localStorage.setItem("customer_token", res.data.token);
        localStorage.setItem("customer_user", JSON.stringify(res.data.user));
        if (res.data.access)  localStorage.setItem("access_token",  res.data.access);
        if (res.data.refresh) localStorage.setItem("refresh_token", res.data.refresh);
        window.dispatchEvent(new Event("authChanged"));
        onLoginSuccess(res.data.user);
        onClose();
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        const first = Object.values(data.errors)[0];
        setError(Array.isArray(first) ? first[0] : first);
      } else {
        setError(data?.message || "Login failed. Check credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar - Blue */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="px-8 pt-6 pb-8">
          {/* Icon + heading */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-3 border border-blue-100">
              <FiLogIn className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Login to Write a Review</h2>
            <p className="text-sm text-gray-500 mt-1">Share your experience about this service</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border-l-4 border-red-500 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Email / Phone / Username
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your email or phone"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                <>
                  <FiLogIn className="h-4 w-4" /> Sign In & Review
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                href="/customer/registration"
                className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                onClick={onClose}
              >
                <FiUserPlus className="h-3.5 w-3.5" /> Register Now
              </a>
            </p>
            <a
              href="/forgot-password"
              className="text-xs text-gray-400 hover:text-blue-500 mt-2 inline-block"
              onClick={onClose}
            >
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}