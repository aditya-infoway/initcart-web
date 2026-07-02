// ecommerce/frontend/src/pages/UserLogin.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { axiosInstance } from "../api/axios";
import MobileUserLogin from "./mobile/MobileuserLogin";
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiLogIn, 
  FiUserPlus,
  FiCheckCircle,
  FiTruck,
  FiHeart,
  FiTag,
  FiShield,
  FiTrendingUp,
  FiAward,
  FiClock
} from "react-icons/fi";

const UserLogin = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setError("");
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) { setError("Email/Phone is required"); return; }
    if (!formData.password) { setError("Password is required"); return; }

    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.post("/ecommerce/customer/login/", {
        username: formData.username.trim(),
        password: formData.password,
      });

      if (response.data.success && response.data.token && response.data.user) {
        _finishLogin(response.data);
      } else {
        setError(response.data.message || "Login failed");
      }

    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (data.errors) {
          const first = Object.values(data.errors)[0];
          setError(Array.isArray(first) ? first[0] : first);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Login failed. Please check credentials.");
        }
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const _finishLogin = (data) => {
    const { user, token, access, refresh } = data;

    localStorage.setItem("customer_token", token);
    localStorage.setItem("customer_user", JSON.stringify(user));
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);

    window.dispatchEvent(new Event("authChanged"));
    if (login) login(user, token, "customer");

    if (formData.rememberMe) {
      localStorage.setItem("remember_me", "true");
    } else {
      localStorage.removeItem("remember_me");
    }

    addToast("Login successful!", "success");
    window.dispatchEvent(new Event("cartUpdated"));

    const from = location.state?.from || sessionStorage.getItem("redirectAfterLogin") || "/";
    sessionStorage.removeItem("redirectAfterLogin");
    navigate(from, { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("customer_token");
    const userStr = localStorage.getItem("customer_user");
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (login) login(userData, token, "customer");
        const from = location.state?.from || sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(from, { replace: true });
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    if (localStorage.getItem("remember_me") === "true") {
      setFormData(prev => ({ ...prev, rememberMe: true }));
    }
  }, [navigate, location, login]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) {
    return <MobileUserLogin />;
  }

  // ─── Desktop Render with Better Design ──────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="w-full max-w-5xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            {/* Left Side - Login Form */}
            <div className="p-8 md:p-10">
              {/* Logo/Header */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                  <FiLogIn className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email / Phone / Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="username"
                      placeholder="Enter email, phone or username"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    loading 
                      ? "bg-blue-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-600 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <FiLogIn className="h-5 w-5" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/customer/registration" className="text-blue-500 hover:text-blue-600 font-semibold">
                    Create Account
                  </Link>
                </p>
              </div>
            </div>

            {/* Right Side - Benefits & Features */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 md:p-10 text-white">
              <div className="h-full flex flex-col">
                {/* Welcome Message */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiAward className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Member Benefits</h3>
                  <p className="text-blue-100">Exclusive perks for registered members</p>
                </div>

                {/* Benefits List */}
                <div className="space-y-5 flex-1">
                  {[
                    { icon: <FiTruck className="h-5 w-5" />, title: "Track Your Orders", desc: "View and manage all your purchases in one place" },
                    { icon: <FiHeart className="h-5 w-5" />, title: "Smart Wishlist", desc: "Save your favorite products and get price alerts" },
                    { icon: <FiTag className="h-5 w-5" />, title: "Exclusive Offers", desc: "Get special discounts and early access to sales" },
                    { icon: <FiShield className="h-5 w-5" />, title: "Secure Shopping", desc: "100% safe and secure payment gateway" },
                    { icon: <FiTrendingUp className="h-5 w-5" />, title: "Reward Points", desc: "Earn points on every purchase" },
                    { icon: <FiClock className="h-5 w-5" />, title: "24/7 Support", desc: "Dedicated customer support team" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/10 transition">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-blue-100 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;