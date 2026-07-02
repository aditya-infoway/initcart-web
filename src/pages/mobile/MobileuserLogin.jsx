// ecommerce/frontend/src/pages/mobile/MobileUserLogin.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { axiosInstance } from "../../api/axios";
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiLogIn, 
  FiUserPlus,
  FiChevronLeft,
  FiCheckCircle,
  FiTruck,
  FiHeart,
  FiTag,
  FiShield,
  FiTrendingUp,
  FiAward,
  FiClock,
  FiStar,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";

// ─── Font Tokens ──────────────────────────────────────────────────────────
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle:    { fontSize: 14, fontWeight: 600 },
  cardSub:      { fontSize: 11, fontWeight: 400 },
  badge:        { fontSize: 10, fontWeight: 600 },
  pill:         { fontSize: 11, fontWeight: 600 },
  statNum:      { fontSize: 13, fontWeight: 700 },
  statLabel:    { fontSize:  9, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLetter:{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

const MobileUserLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showBenefits, setShowBenefits] = useState(false);
  
  // Animation states
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [usernameValue, setUsernameValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [buttonHover, setButtonHover] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    setError("");
    
    if (name === "username") setUsernameValue(value);
    if (name === "password") setPasswordValue(value);
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) { 
      setError("Email/Phone is required");
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return; 
    }
    if (!formData.password) { 
      setError("Password is required");
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return; 
    }

    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.post("/ecommerce/customer/login/", {
        username: formData.username.trim(),
        password: formData.password,
      });

      if (response.data.success && response.data.token && response.data.user) {
        const { user, token, access, refresh } = response.data;

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
      } else {
        setError(response.data.message || "Login failed");
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
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
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    } finally {
      setLoading(false);
    }
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

  return (
    <div style={{ 
      minHeight: '100dvh', 
      background: 'linear-gradient(135deg, #1E3A5F 0%, #0F2B45 100%)',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflowX: 'hidden',
    }}>
      
      {/* Animated Background Circles - Blue Theme */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
      }}>
        <div className="bg-circle-1"></div>
        <div className="bg-circle-2"></div>
        <div className="bg-circle-3"></div>
        <div className="bg-circle-4"></div>
        <div className="bg-circle-5"></div>
      </div>

      {/* Main Container */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Sticky Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(226,232,240,0.5)',
          padding: '12px 16px',
        }}>
          <button
            onClick={() => navigate(-1)}
            className="back-button"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: 'rgba(241,245,249,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(241,245,249,0.9)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <FiChevronLeft size={22} color="#1E293B" />
          </button>
        </div>

        {/* Main Content */}
        <div style={{ padding: '32px 24px', paddingBottom: 60, flex: 1 }}>
          
          {/* Welcome Section with Floating Animation */}
          <div className="welcome-section" style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="logo-wrapper">
              <div className="logo-pulse"></div>
              <div style={{
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                borderRadius: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 20px 40px rgba(37,99,235,0.3)',
                position: 'relative',
                zIndex: 2,
              }}>
                <FiLogIn size={36} color="#FFFFFF" />
              </div>
            </div>
            <h1 className="welcome-title" style={{ ...F.pageTitle, fontSize: 28, color: '#FFFFFF', marginBottom: 8, fontWeight: 700 }}>
              Welcome Back!
            </h1>
            <p className="welcome-subtitle" style={{ ...F.pageSubtitle, color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
              Sign in to continue your journey
            </p>
          </div>

          {/* Card Container */}
          <div className={`card-container ${shakeError ? 'shake-animation' : ''}`} style={{
            background: '#FFFFFF',
            borderRadius: 32,
            padding: '28px 20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }}>
            
            {/* Error Message */}
            {error && (
              <div className="error-message" style={{
                background: '#FEF2F2',
                borderLeft: `4px solid #EF4444`,
                borderRadius: 16,
                padding: '14px 16px',
                marginBottom: 24,
              }}>
                <p style={{ fontSize: 13, color: '#DC2626', margin: 0, fontWeight: 500 }}>{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              {/* Username Field with Floating Label */}
              <div className="input-group" style={{ marginBottom: 24 }}>
                <div className={`input-wrapper ${usernameFocus || usernameValue ? 'focused' : ''}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  border: `2px solid ${usernameFocus ? '#2563EB' : '#E2E8F0'}`,
                  borderRadius: 20,
                  padding: '0 18px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: usernameFocus ? 'scale(1.02)' : 'scale(1)',
                }}>
                  <FiMail size={20} color={usernameFocus ? '#2563EB' : '#94A3B8'} style={{ transition: 'all 0.3s ease' }} />
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      ref={usernameRef}
                      type="text"
                      name="username"
                      placeholder=" "
                      style={{
                        width: '100%',
                        border: 'none',
                        padding: '16px 12px 16px 12px',
                        fontSize: 16,
                        outline: 'none',
                        background: 'transparent',
                        color: '#1E293B',
                      }}
                      value={formData.username}
                      onChange={handleChange}
                      onFocus={() => setUsernameFocus(true)}
                      onBlur={() => setUsernameFocus(false)}
                      disabled={loading}
                      autoComplete="username"
                    />
                    <label className="floating-label" style={{
                      position: 'absolute',
                      left: 12,
                      top: usernameFocus || usernameValue ? -10 : 16,
                      fontSize: usernameFocus || usernameValue ? 11 : 16,
                      color: usernameFocus ? '#2563EB' : '#94A3B8',
                      background: '#F8FAFC',
                      padding: '0 4px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      pointerEvents: 'none',
                    }}>
                      Email / Phone / Username
                    </label>
                  </div>
                </div>
              </div>

              {/* Password Field with Floating Label */}
              <div className="input-group" style={{ marginBottom: 20 }}>
                <div className={`input-wrapper ${passwordFocus || passwordValue ? 'focused' : ''}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F8FAFC',
                  border: `2px solid ${passwordFocus ? '#2563EB' : '#E2E8F0'}`,
                  borderRadius: 20,
                  padding: '0 18px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: passwordFocus ? 'scale(1.02)' : 'scale(1)',
                }}>
                  <FiLock size={20} color={passwordFocus ? '#2563EB' : '#94A3B8'} style={{ transition: 'all 0.3s ease' }} />
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder=" "
                      style={{
                        width: '100%',
                        border: 'none',
                        padding: '16px 12px 16px 12px',
                        fontSize: 16,
                        outline: 'none',
                        background: 'transparent',
                        color: '#1E293B',
                      }}
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setPasswordFocus(true)}
                      onBlur={() => setPasswordFocus(false)}
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <label className="floating-label" style={{
                      position: 'absolute',
                      left: 12,
                      top: passwordFocus || passwordValue ? -10 : 16,
                      fontSize: passwordFocus || passwordValue ? 11 : 16,
                      color: passwordFocus ? '#2563EB' : '#94A3B8',
                      background: '#F8FAFC',
                      padding: '0 4px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      pointerEvents: 'none',
                    }}>
                      Password
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="eye-button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 8,
                      borderRadius: 10,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#E2E8F0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {showPassword ? <FiEyeOff size={18} color="#94A3B8" /> : <FiEye size={18} color="#94A3B8" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="custom-checkbox"
                    style={{ width: 18, height: 18, margin: 0, accentColor: '#2563EB' }}
                  />
                  <span style={{ ...F.cardSub, color: '#64748B' }}>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-link" style={{ ...F.cardSub, color: '#2563EB', fontWeight: 500, textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button with Ripple Effect - Blue */}
              <button
                type="submit"
                disabled={loading}
                className={`login-button ${loading ? 'loading' : ''}`}
                onMouseEnter={() => setButtonHover(true)}
                onMouseLeave={() => setButtonHover(false)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 24,
                  fontSize: 16,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: 24,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: buttonHover && !loading ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: buttonHover && !loading ? '0 10px 25px rgba(37,99,235,0.4)' : '0 4px 14px rgba(37,99,235,0.3)',
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: 20, height: 20, border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Signing In...
                  </>
                ) : (
                  <>
                    <FiLogIn size={18} />
                    Sign In
                    <FiArrowRight size={16} className="arrow-icon" style={{ transition: 'transform 0.3s ease' }} />
                  </>
                )}
                {!loading && <div className="ripple-effect"></div>}
              </button>
            </form>

            {/* Create Account Link */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ ...F.cardSub, color: '#64748B' }}>
                Don't have an account?{' '}
                <Link to="/customer/registration" className="create-link" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                  Create Account
                </Link>
              </p>
            </div>

            {/* Benefits Accordion */}
            <button
              onClick={() => setShowBenefits(!showBenefits)}
              className="benefits-toggle"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 20,
                cursor: 'pointer',
                marginBottom: showBenefits ? 16 : 0,
                transition: 'all 0.3s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FiZap size={18} color="#2563EB" />
                <span style={{ ...F.cardTitle, fontSize: 14, color: '#0F172A' }}>Member Benefits</span>
              </div>
              <span className={`chevron ${showBenefits ? 'rotated' : ''}`} style={{ fontSize: 18, color: '#94A3B8', transition: 'transform 0.3s ease' }}>▼</span>
            </button>

            {/* Benefits Content with Staggered Animation - Blue Theme */}
            {showBenefits && (
              <div className="benefits-content" style={{
                background: '#F8FAFC',
                borderRadius: 20,
                padding: '20px',
                marginBottom: 24,
                animation: 'slideDown 0.4s ease',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { icon: <FiTruck size={14} />, title: "Track Orders", desc: "Real-time order tracking", color: "#2563EB", bg: "#EFF6FF" },
                    { icon: <FiHeart size={14} />, title: "Wishlist", desc: "Save favorite products", color: "#2563EB", bg: "#EFF6FF" },
                    { icon: <FiTag size={14} />, title: "Exclusive Offers", desc: "Special member discounts", color: "#2563EB", bg: "#EFF6FF" },
                    { icon: <FiShield size={14} />, title: "Secure Payment", desc: "100% safe transactions", color: "#2563EB", bg: "#EFF6FF" },
                    { icon: <FiZap size={14} />, title: "Quick Delivery", desc: "Fast shipping guaranteed", color: "#2563EB", bg: "#EFF6FF" },
                    { icon: <FiClock size={14} />, title: "24/7 Support", desc: "Round the clock assistance", color: "#2563EB", bg: "#EFF6FF" },
                  ].map((item, i) => (
                    <div key={i} className="benefit-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '8px',
                      borderRadius: 14,
                      transition: 'all 0.3s ease',
                      animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
                    }}>
                      <div style={{ width: 36, height: 36, background: item.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: item.color }}>{item.icon}</span>
                      </div>
                      <div>
                        <p style={{ ...F.cardSub, fontWeight: 600, color: '#0F172A', marginBottom: 2 }}>{item.title}</p>
                        <p style={{ ...F.badge, color: '#64748B' }}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Powerful CSS Animations */}
      <style>{`
        /* Spin Animation */
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }

        /* Shake Animation for Error */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake-animation {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }

        /* Background Circles Animation - Blue Theme */
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-30px, -30px) rotate(180deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(30px, 30px) rotate(180deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-40px, 40px) rotate(360deg); }
        }
        @keyframes float5 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, -20px) scale(0.9); }
        }

        .bg-circle-1 {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(37,99,235,0) 70%);
          border-radius: 50%;
          animation: float1 20s ease-in-out infinite;
        }
        .bg-circle-2 {
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(29,78,216,0.25) 0%, rgba(29,78,216,0) 70%);
          border-radius: 50%;
          animation: float2 25s ease-in-out infinite;
        }
        .bg-circle-3 {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0) 70%);
          border-radius: 50%;
          animation: float3 30s ease-in-out infinite;
        }
        .bg-circle-4 {
          position: absolute;
          top: 20%;
          left: -50px;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0) 70%);
          border-radius: 50%;
          animation: float4 18s ease-in-out infinite;
        }
        .bg-circle-5 {
          position: absolute;
          bottom: 20%;
          right: -80px;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(96,165,250,0.12) 0%, rgba(96,165,250,0) 70%);
          border-radius: 50%;
          animation: float5 22s ease-in-out infinite;
        }

        /* Welcome Section Animations */
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .logo-wrapper {
          position: relative;
          display: inline-block;
        }
        .logo-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          background: rgba(37,99,235,0.4);
          border-radius: 50%;
          animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .welcome-section {
          animation: fadeInDown 0.6s ease;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .welcome-title {
          animation: titleGlow 2s ease-in-out infinite;
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 0px rgba(255,255,255,0); }
          50% { text-shadow: 0 0 20px rgba(255,255,255,0.3); }
        }
        .welcome-subtitle {
          animation: fadeInUp 0.6s ease 0.2s both;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Card Animation */
        .card-container {
          animation: slideUp 0.5s ease 0.3s both;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Input Focus Animations */
        .input-wrapper {
          position: relative;
        }
        .input-wrapper.focused {
          animation: inputPulse 0.4s ease;
        }
        @keyframes inputPulse {
          0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
          70% { box-shadow: 0 0 0 8px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }

        /* Button Hover Ripple Effect */
        .login-button {
          position: relative;
          overflow: hidden;
        }
        .login-button:hover .arrow-icon {
          transform: translateX(4px);
        }
        .ripple-effect {
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.3);
          width: 100px;
          height: 100px;
          margin-top: -50px;
          margin-left: -50px;
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        }
        @keyframes ripple {
          from {
            transform: scale(0);
            opacity: 0.5;
          }
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        /* Benefit Items Hover */
        .benefit-item {
          cursor: pointer;
        }
        .benefit-item:hover {
          transform: translateX(8px);
          background: #EFF6FF;
        }

        /* Benefits Toggle */
        .benefits-toggle:hover {
          background: #EFF6FF;
          transform: scale(1.01);
        }
        .chevron.rotated {
          transform: rotate(180deg);
        }

        /* Slide Down Animation */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Fade In Up Staggered */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Error Message Animation */
        .error-message {
          animation: fadeInRight 0.4s ease;
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Branch Note Hover */
        .branch-note:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(37,99,235,0.15);
        }

        /* Checkbox Custom Animation */
        .custom-checkbox {
          transition: all 0.2s ease;
        }
        .custom-checkbox:checked {
          animation: checkPop 0.2s ease;
        }
        @keyframes checkPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        /* Forgot Link Hover */
        .forgot-link, .create-link {
          position: relative;
          transition: all 0.3s ease;
        }
        .forgot-link:hover, .create-link:hover {
          color: #1D4ED8 !important;
          transform: translateX(2px);
        }

        /* Back Button Hover Animation */
        .back-button:hover {
          animation: bounce 0.3s ease;
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-5px); }
        }
      `}</style>
    </div>
  );
};

export default MobileUserLogin;