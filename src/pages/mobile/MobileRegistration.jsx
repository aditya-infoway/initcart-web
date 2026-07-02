// ecommerce/frontend/src/pages/mobile/MobileCustomerRegistration.jsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiChevronLeft,
  FiCheckCircle,
  FiTruck,
  FiHeart,
  FiTag,
  FiShield,
  FiClock,
  FiAward,
  FiArrowRight,
  FiMapPin,
  FiHome,
  FiGlobe,
  FiFileText
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

const MobileCustomerRegistration = () => {
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: "",
    address: "",
    city: "",
    state: "",
    acceptTerms: false,
  });

  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Animation states for floating labels
  const [usernameFocus, setUsernameFocus] = useState(false);
  const [fullnameFocus, setFullnameFocus] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [phoneFocus, setPhoneFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);
  const [addressFocus, setAddressFocus] = useState(false);
  const [cityFocus, setCityFocus] = useState(false);
  const [stateFocus, setStateFocus] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedCode = localStorage.getItem("referral_code");
    if (savedCode) {
      setReferralCode(savedCode.trim().toUpperCase());
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) setErrors({ ...errors, [name]: null });

    if (name === "password" || name === "confirm_password") {
      if (formData.password && formData.confirm_password) {
        setPasswordMatch(formData.password === formData.confirm_password);
      }
    }
  };

  const validateStep = (stepNum) => {
    const newErrors = {};
    setShakeError(false);

    if (stepNum === 1) {
      if (!formData.username.trim()) newErrors.username = "Username is required";
      if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!emailRegex.test(formData.email)) newErrors.email = "Enter valid email";
      const phoneRegex = /^\d{10}$/;
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!phoneRegex.test(formData.phone.replace(/\D/g, "")))
        newErrors.phone = "Enter valid 10-digit phone number";
    }

    if (stepNum === 2) {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
      if (!formData.confirm_password) newErrors.confirm_password = "Please confirm password";
      else if (formData.password !== formData.confirm_password)
        newErrors.confirm_password = "Passwords do not match";
    }

    if (stepNum === 3) {
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.acceptTerms) newErrors.acceptTerms = "Accept terms to continue";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const registrationData = {
      username: formData.username.trim(),
      full_name: formData.full_name.trim(),
      phone: formData.phone.replace(/\D/g, ""),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      confirm_password: formData.confirm_password,
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
    };

    if (referralCode) {
      registrationData.referral_code = referralCode;
    }

    try {
      setLoading(true);
      setErrors({});

      const response = await fetch("https://api.initcart.in/ecommerce/customer/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.removeItem("referral_code");
        navigate("/customer/login", { state: { message: "Registration successful! Please login." } });
      } else {
        if (data.errors) setErrors(data.errors);
        else alert(data.message || "Registration failed");
        setShakeError(true);
        setTimeout(() => setShakeError(false), 500);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.password && formData.confirm_password) {
      setPasswordMatch(formData.password === formData.confirm_password);
    }
  }, [formData.password, formData.confirm_password]);

  // Get value states for floating labels
  const usernameValue = formData.username;
  const fullnameValue = formData.full_name;
  const emailValue = formData.email;
  const phoneValue = formData.phone;
  const passwordValue = formData.password;
  const confirmPasswordValue = formData.confirm_password;
  const addressValue = formData.address;
  const cityValue = formData.city;
  const stateValue = formData.state;

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
        <div className="reg-bg-circle-1"></div>
        <div className="reg-bg-circle-2"></div>
        <div className="reg-bg-circle-3"></div>
        <div className="reg-bg-circle-4"></div>
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
            onClick={() => step === 1 ? navigate(-1) : prevStep()}
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
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(241,245,249,0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <FiChevronLeft size={22} color="#1E293B" />
          </button>
        </div>

        {/* Main Content */}
        <div style={{ padding: '24px 20px', paddingBottom: 60, flex: 1 }}>
          
          {/* Welcome Section */}
          <div className="reg-welcome-section" style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 10px 25px rgba(37,99,235,0.3)',
            }}>
              <FiUser size={28} color="#FFFFFF" />
            </div>
            <h1 style={{ ...F.pageTitle, fontSize: 22, color: '#FFFFFF', marginBottom: 4, fontWeight: 700 }}>
              Create Account
            </h1>
            <p style={{ ...F.pageSubtitle, color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
              Step {step} of 3: {step === 1 ? "Personal Info" : step === 2 ? "Security" : "Address"}
            </p>
          </div>

          {/* Progress Steps */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ flex: 1, maxWidth: 80, textAlign: 'center' }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    background: step >= s ? '#2563EB' : 'rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    transition: 'all 0.3s ease',
                  }}>
                    <span style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600 }}>{s}</span>
                  </div>
                  <div style={{
                    height: 4,
                    background: step > s ? '#2563EB' : 'rgba(255,255,255,0.3)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                  }} />
                </div>
              ))}
            </div>
          </div>

          {/* Card Container */}
          <div className={`reg-card-container ${shakeError ? 'shake-animation' : ''}`} style={{
            background: '#FFFFFF',
            borderRadius: 28,
            padding: '28px 20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }}>
            
            {/* Referral Banner */}
            {referralCode && (
              <div style={{
                background: '#EFF6FF',
                borderRadius: 16,
                padding: '12px 16px',
                marginBottom: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: '1px solid #BFDBFE',
              }}>
                <FiTag size={20} color="#2563EB" />
                <div style={{ flex: 1 }}>
                  <p style={{ ...F.cardSub, fontWeight: 600, color: '#1E40AF' }}>Referral Applied!</p>
                  <p style={{ ...F.badge, color: '#3B82F6' }}>Code: {referralCode}</p>
                </div>
                <div style={{ background: '#2563EB', padding: '4px 8px', borderRadius: 8 }}>
                  <span style={{ fontSize: 10, color: '#FFFFFF', fontWeight: 600 }}>Active</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div>
                  {/* Username Field */}
                  <div className="input-group" style={{ marginBottom: 20 }}>
                    <div className={`input-wrapper ${usernameFocus || usernameValue ? 'focused' : ''}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F8FAFC',
                      border: `2px solid ${errors.username ? '#EF4444' : (usernameFocus ? '#2563EB' : '#E2E8F0')}`,
                      borderRadius: 16,
                      padding: '0 16px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}>
                      <FiUser size={18} color={usernameFocus ? '#2563EB' : '#94A3B8'} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          name="username"
                          placeholder=" "
                          style={{
                            width: '100%',
                            border: 'none',
                            padding: '14px 12px 14px 12px',
                            fontSize: 15,
                            outline: 'none',
                            background: 'transparent',
                            color: '#1E293B',
                          }}
                          value={formData.username}
                          onChange={handleChange}
                          onFocus={() => setUsernameFocus(true)}
                          onBlur={() => setUsernameFocus(false)}
                        />
                        <label className="floating-label" style={{
                          position: 'absolute',
                          left: 12,
                          top: usernameFocus || usernameValue ? -10 : 14,
                          fontSize: usernameFocus || usernameValue ? 10 : 15,
                          color: errors.username ? '#EF4444' : (usernameFocus ? '#2563EB' : '#94A3B8'),
                          background: '#F8FAFC',
                          padding: '0 4px',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          pointerEvents: 'none',
                        }}>
                          Username
                        </label>
                      </div>
                    </div>
                    {errors.username && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6, marginLeft: 4 }}>{errors.username}</p>}
                  </div>

                  {/* Full Name Field */}
                  <div className="input-group" style={{ marginBottom: 20 }}>
                    <div className={`input-wrapper ${fullnameFocus || fullnameValue ? 'focused' : ''}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F8FAFC',
                      border: `2px solid ${errors.full_name ? '#EF4444' : (fullnameFocus ? '#2563EB' : '#E2E8F0')}`,
                      borderRadius: 16,
                      padding: '0 16px',
                    }}>
                      <FiUser size={18} color={fullnameFocus ? '#2563EB' : '#94A3B8'} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          name="full_name"
                          placeholder=" "
                          style={{
                            width: '100%',
                            border: 'none',
                            padding: '14px 12px 14px 12px',
                            fontSize: 15,
                            outline: 'none',
                            background: 'transparent',
                            color: '#1E293B',
                          }}
                          value={formData.full_name}
                          onChange={handleChange}
                          onFocus={() => setFullnameFocus(true)}
                          onBlur={() => setFullnameFocus(false)}
                        />
                        <label className="floating-label" style={{
                          position: 'absolute',
                          left: 12,
                          top: fullnameFocus || fullnameValue ? -10 : 14,
                          fontSize: fullnameFocus || fullnameValue ? 10 : 15,
                          color: errors.full_name ? '#EF4444' : (fullnameFocus ? '#2563EB' : '#94A3B8'),
                          background: '#F8FAFC',
                          padding: '0 4px',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          Full Name
                        </label>
                      </div>
                    </div>
                    {errors.full_name && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6, marginLeft: 4 }}>{errors.full_name}</p>}
                  </div>

                  {/* Email Field */}
                  <div className="input-group" style={{ marginBottom: 20 }}>
                    <div className={`input-wrapper ${emailFocus || emailValue ? 'focused' : ''}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F8FAFC',
                      border: `2px solid ${errors.email ? '#EF4444' : (emailFocus ? '#2563EB' : '#E2E8F0')}`,
                      borderRadius: 16,
                      padding: '0 16px',
                    }}>
                      <FiMail size={18} color={emailFocus ? '#2563EB' : '#94A3B8'} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="email"
                          name="email"
                          placeholder=" "
                          style={{
                            width: '100%',
                            border: 'none',
                            padding: '14px 12px 14px 12px',
                            fontSize: 15,
                            outline: 'none',
                            background: 'transparent',
                            color: '#1E293B',
                          }}
                          value={formData.email}
                          onChange={handleChange}
                          onFocus={() => setEmailFocus(true)}
                          onBlur={() => setEmailFocus(false)}
                        />
                        <label className="floating-label" style={{
                          position: 'absolute',
                          left: 12,
                          top: emailFocus || emailValue ? -10 : 14,
                          fontSize: emailFocus || emailValue ? 10 : 15,
                          color: errors.email ? '#EF4444' : (emailFocus ? '#2563EB' : '#94A3B8'),
                          background: '#F8FAFC',
                          padding: '0 4px',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          Email Address
                        </label>
                      </div>
                    </div>
                    {errors.email && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6, marginLeft: 4 }}>{errors.email}</p>}
                  </div>

                  {/* Phone Field */}
                  <div className="input-group" style={{ marginBottom: 24 }}>
                    <div className={`input-wrapper ${phoneFocus || phoneValue ? 'focused' : ''}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F8FAFC',
                      border: `2px solid ${errors.phone ? '#EF4444' : (phoneFocus ? '#2563EB' : '#E2E8F0')}`,
                      borderRadius: 16,
                      padding: '0 16px',
                    }}>
                      <FiPhone size={18} color={phoneFocus ? '#2563EB' : '#94A3B8'} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="tel"
                          name="phone"
                          placeholder=" "
                          style={{
                            width: '100%',
                            border: 'none',
                            padding: '14px 12px 14px 12px',
                            fontSize: 15,
                            outline: 'none',
                            background: 'transparent',
                            color: '#1E293B',
                          }}
                          value={formData.phone}
                          onChange={handleChange}
                          onFocus={() => setPhoneFocus(true)}
                          onBlur={() => setPhoneFocus(false)}
                        />
                        <label className="floating-label" style={{
                          position: 'absolute',
                          left: 12,
                          top: phoneFocus || phoneValue ? -10 : 14,
                          fontSize: phoneFocus || phoneValue ? 10 : 15,
                          color: errors.phone ? '#EF4444' : (phoneFocus ? '#2563EB' : '#94A3B8'),
                          background: '#F8FAFC',
                          padding: '0 4px',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          Phone Number
                        </label>
                      </div>
                    </div>
                    {errors.phone && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6, marginLeft: 4 }}>{errors.phone}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: 20,
                      fontSize: 15,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      marginTop: 8,
                    }}
                  >
                    Continue <FiArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* STEP 2: Security */}
              {step === 2 && (
                <div>
                  {/* Password Field */}
                  <div className="input-group" style={{ marginBottom: 20 }}>
                    <div className={`input-wrapper ${passwordFocus || passwordValue ? 'focused' : ''}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F8FAFC',
                      border: `2px solid ${errors.password ? '#EF4444' : (passwordFocus ? '#2563EB' : '#E2E8F0')}`,
                      borderRadius: 16,
                      padding: '0 16px',
                    }}>
                      <FiLock size={18} color={passwordFocus ? '#2563EB' : '#94A3B8'} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder=" "
                          style={{
                            width: '100%',
                            border: 'none',
                            padding: '14px 12px 14px 12px',
                            fontSize: 15,
                            outline: 'none',
                            background: 'transparent',
                            color: '#1E293B',
                          }}
                          value={formData.password}
                          onChange={handleChange}
                          onFocus={() => setPasswordFocus(true)}
                          onBlur={() => setPasswordFocus(false)}
                        />
                        <label className="floating-label" style={{
                          position: 'absolute',
                          left: 12,
                          top: passwordFocus || passwordValue ? -10 : 14,
                          fontSize: passwordFocus || passwordValue ? 10 : 15,
                          color: errors.password ? '#EF4444' : (passwordFocus ? '#2563EB' : '#94A3B8'),
                          background: '#F8FAFC',
                          padding: '0 4px',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          Password
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                      >
                        {showPassword ? <FiEyeOff size={18} color="#94A3B8" /> : <FiEye size={18} color="#94A3B8" />}
                      </button>
                    </div>
                    {errors.password && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6, marginLeft: 4 }}>{errors.password}</p>}
                    {!errors.password && passwordValue && <p style={{ fontSize: 10, color: '#64748B', marginTop: 6, marginLeft: 4 }}>Minimum 8 characters</p>}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="input-group" style={{ marginBottom: 24 }}>
                    <div className={`input-wrapper ${confirmPasswordFocus || confirmPasswordValue ? 'focused' : ''}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F8FAFC',
                      border: `2px solid ${errors.confirm_password ? '#EF4444' : (confirmPasswordFocus ? '#2563EB' : '#E2E8F0')}`,
                      borderRadius: 16,
                      padding: '0 16px',
                    }}>
                      <FiLock size={18} color={confirmPasswordFocus ? '#2563EB' : '#94A3B8'} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirm_password"
                          placeholder=" "
                          style={{
                            width: '100%',
                            border: 'none',
                            padding: '14px 12px 14px 12px',
                            fontSize: 15,
                            outline: 'none',
                            background: 'transparent',
                            color: '#1E293B',
                          }}
                          value={formData.confirm_password}
                          onChange={handleChange}
                          onFocus={() => setConfirmPasswordFocus(true)}
                          onBlur={() => setConfirmPasswordFocus(false)}
                        />
                        <label className="floating-label" style={{
                          position: 'absolute',
                          left: 12,
                          top: confirmPasswordFocus || confirmPasswordValue ? -10 : 14,
                          fontSize: confirmPasswordFocus || confirmPasswordValue ? 10 : 15,
                          color: errors.confirm_password ? '#EF4444' : (confirmPasswordFocus ? '#2563EB' : '#94A3B8'),
                          background: '#F8FAFC',
                          padding: '0 4px',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          Confirm Password
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
                      >
                        {showConfirmPassword ? <FiEyeOff size={18} color="#94A3B8" /> : <FiEye size={18} color="#94A3B8" />}
                      </button>
                    </div>
                    {errors.confirm_password && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6, marginLeft: 4 }}>{errors.confirm_password}</p>}
                    {passwordValue && confirmPasswordValue && !errors.confirm_password && (
                      <div style={{ marginTop: 8 }}>
                        {passwordMatch ? (
                          <span style={{ fontSize: 11, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiCheckCircle size={12} /> Passwords match
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                            Passwords don't match
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={prevStep}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: '#F1F5F9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: 20,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 20,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Address & Terms */}
              {step === 3 && (
                <div>
                  {/* Address Field */}
                  <div className="input-group" style={{ marginBottom: 20 }}>
                    <div className={`input-wrapper ${addressFocus || addressValue ? 'focused' : ''}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F8FAFC',
                      border: `2px solid ${errors.address ? '#EF4444' : (addressFocus ? '#2563EB' : '#E2E8F0')}`,
                      borderRadius: 16,
                      padding: '0 16px',
                    }}>
                      <FiHome size={18} color={addressFocus ? '#2563EB' : '#94A3B8'} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          name="address"
                          placeholder=" "
                          style={{
                            width: '100%',
                            border: 'none',
                            padding: '14px 12px 14px 12px',
                            fontSize: 15,
                            outline: 'none',
                            background: 'transparent',
                            color: '#1E293B',
                          }}
                          value={formData.address}
                          onChange={handleChange}
                          onFocus={() => setAddressFocus(true)}
                          onBlur={() => setAddressFocus(false)}
                        />
                        <label className="floating-label" style={{
                          position: 'absolute',
                          left: 12,
                          top: addressFocus || addressValue ? -10 : 14,
                          fontSize: addressFocus || addressValue ? 10 : 15,
                          color: errors.address ? '#EF4444' : (addressFocus ? '#2563EB' : '#94A3B8'),
                          background: '#F8FAFC',
                          padding: '0 4px',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          Full Address
                        </label>
                      </div>
                    </div>
                    {errors.address && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6, marginLeft: 4 }}>{errors.address}</p>}
                  </div>

                  {/* City Field */}
                  <div className="input-group" style={{ marginBottom: 20 }}>
                    <div className={`input-wrapper ${cityFocus || cityValue ? 'focused' : ''}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F8FAFC',
                      border: `2px solid ${errors.city ? '#EF4444' : (cityFocus ? '#2563EB' : '#E2E8F0')}`,
                      borderRadius: 16,
                      padding: '0 16px',
                    }}>
                      <FiMapPin size={18} color={cityFocus ? '#2563EB' : '#94A3B8'} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          name="city"
                          placeholder=" "
                          style={{
                            width: '100%',
                            border: 'none',
                            padding: '14px 12px 14px 12px',
                            fontSize: 15,
                            outline: 'none',
                            background: 'transparent',
                            color: '#1E293B',
                          }}
                          value={formData.city}
                          onChange={handleChange}
                          onFocus={() => setCityFocus(true)}
                          onBlur={() => setCityFocus(false)}
                        />
                        <label className="floating-label" style={{
                          position: 'absolute',
                          left: 12,
                          top: cityFocus || cityValue ? -10 : 14,
                          fontSize: cityFocus || cityValue ? 10 : 15,
                          color: errors.city ? '#EF4444' : (cityFocus ? '#2563EB' : '#94A3B8'),
                          background: '#F8FAFC',
                          padding: '0 4px',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          City
                        </label>
                      </div>
                    </div>
                    {errors.city && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6, marginLeft: 4 }}>{errors.city}</p>}
                  </div>

                  {/* State Field */}
                  <div className="input-group" style={{ marginBottom: 20 }}>
                    <div className={`input-wrapper ${stateFocus || stateValue ? 'focused' : ''}`} style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#F8FAFC',
                      border: `2px solid ${errors.state ? '#EF4444' : (stateFocus ? '#2563EB' : '#E2E8F0')}`,
                      borderRadius: 16,
                      padding: '0 16px',
                    }}>
                      <FiGlobe size={18} color={stateFocus ? '#2563EB' : '#94A3B8'} />
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          name="state"
                          placeholder=" "
                          style={{
                            width: '100%',
                            border: 'none',
                            padding: '14px 12px 14px 12px',
                            fontSize: 15,
                            outline: 'none',
                            background: 'transparent',
                            color: '#1E293B',
                          }}
                          value={formData.state}
                          onChange={handleChange}
                          onFocus={() => setStateFocus(true)}
                          onBlur={() => setStateFocus(false)}
                        />
                        <label className="floating-label" style={{
                          position: 'absolute',
                          left: 12,
                          top: stateFocus || stateValue ? -10 : 14,
                          fontSize: stateFocus || stateValue ? 10 : 15,
                          color: errors.state ? '#EF4444' : (stateFocus ? '#2563EB' : '#94A3B8'),
                          background: '#F8FAFC',
                          padding: '0 4px',
                          pointerEvents: 'none',
                          transition: 'all 0.2s ease',
                        }}>
                          State
                        </label>
                      </div>
                    </div>
                    {errors.state && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 6, marginLeft: 4 }}>{errors.state}</p>}
                  </div>

                  {/* Terms & Conditions */}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        style={{ marginTop: 2, width: 18, height: 18, accentColor: '#2563EB' }}
                      />
                      <span style={{ ...F.cardSub, color: '#475569' }}>
                        I agree to the <span style={{ color: '#2563EB' }}>Terms of Service</span> and <span style={{ color: '#2563EB' }}>Privacy Policy</span>
                      </span>
                    </label>
                    {errors.acceptTerms && <p style={{ fontSize: 11, color: '#EF4444', marginTop: 8 }}>{errors.acceptTerms}</p>}
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      type="button"
                      onClick={prevStep}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: '#F1F5F9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: 20,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '14px',
                        background: loading ? '#93C5FD' : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 20,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                      }}
                    >
                      {loading ? (
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                          <div style={{ width: 16, height: 16, border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                          Creating...
                        </span>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Login Link */}
            <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
              <p style={{ ...F.cardSub, color: '#64748B' }}>
                Already have an account?{' '}
                <Link to="/customer/login" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div style={{
            marginTop: 20,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 20,
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <FiAward size={18} color="#FFFFFF" />
              <span style={{ ...F.cardSub, fontWeight: 600, color: '#FFFFFF' }}>Why Join Us?</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {[
                { icon: <FiTruck size={12} />, label: "Free Shipping" },
                { icon: <FiTag size={12} />, label: "Exclusive Deals" },
                { icon: <FiShield size={12} />, label: "Secure Payment" },
                { icon: <FiClock size={12} />, label: "24/7 Support" },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 20 }}>
                  <span style={{ color: '#FFFFFF' }}>{item.icon}</span>
                  <span style={{ fontSize: 10, color: '#FFFFFF' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake-animation { animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
        
        @keyframes float1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, -30px); } }
        @keyframes float2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, 30px); } }
        @keyframes float3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, -20px); } }
        @keyframes float4 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-40px, 40px); } }
        
        .reg-bg-circle-1 {
          position: absolute; top: -100px; right: -100px; width: 250px; height: 250px;
          background: radial-gradient(circle, rgba(37,99,235,0.25) 0%, rgba(37,99,235,0) 70%);
          border-radius: 50%; animation: float1 20s ease-in-out infinite;
        }
        .reg-bg-circle-2 {
          position: absolute; bottom: -100px; left: -100px; width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(29,78,216,0.25) 0%, rgba(29,78,216,0) 70%);
          border-radius: 50%; animation: float2 25s ease-in-out infinite;
        }
        .reg-bg-circle-3 {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, rgba(37,99,235,0) 70%);
          border-radius: 50%; animation: float3 30s ease-in-out infinite;
        }
        .reg-bg-circle-4 {
          position: absolute; bottom: 20%; right: -80px; width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(96,165,250,0.12) 0%, rgba(96,165,250,0) 70%);
          border-radius: 50%; animation: float4 22s ease-in-out infinite;
        }
        
        .reg-welcome-section { animation: fadeInDown 0.6s ease; }
        .reg-card-container { animation: slideUp 0.5s ease 0.2s both; }
        
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .input-wrapper {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-wrapper.focused {
          animation: inputPulse 0.4s ease;
        }
        @keyframes inputPulse {
          0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.4); }
          70% { box-shadow: 0 0 0 6px rgba(37,99,235,0); }
          100% { box-shadow: 0 0 0 0 rgba(37,99,235,0); }
        }
      `}</style>
    </div>
  );
};

export default MobileCustomerRegistration;