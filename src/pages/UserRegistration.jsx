import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaEnvelope, FaPhone, FaLock, FaCheck, FaTimes,
  FaHome, FaCity, FaMapMarkerAlt, FaTruck, FaGift,
  FaShieldAlt, FaBolt, FaSpinner, FaArrowRight, FaArrowLeft,
  FaKey, FaUserCheck, FaTag,
} from "react-icons/fa";
import {
  MdLocationCity, MdOutlineLocalShipping, MdPayment,
} from "react-icons/md";
import { RiSecurePaymentLine } from "react-icons/ri";
import { GiSpeedometer } from "react-icons/gi";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import MobileCustomerRegistration from "./mobile/MobileRegistration";

export default function CustomerRegistration() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
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

  // ── Referral code from URL (saved by App.jsx) ──────────────────────────────
  const [referralCode, setReferralCode] = useState("");
  const [referralAgentName, setReferralAgentName] = useState("");

  useEffect(() => {
    const savedCode = localStorage.getItem("referral_code");
    if (savedCode) {
      setReferralCode(savedCode.trim().toUpperCase());

    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // ── Input handler ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    setFormData(updatedData);

    if (errors[name]) setErrors({ ...errors, [name]: null });

    if (name === "password" || name === "confirm_password") {
      if (updatedData.password && updatedData.confirm_password) {
        setPasswordMatch(updatedData.password === updatedData.confirm_password);
      } else {
        setPasswordMatch(true);
      }
    }
  };

  // ── Step validation ───────────────────────────────────────────────────────
  const validateStep = (stepNum) => {
    const newErrors = {};

    if (stepNum === 1) {
      if (!formData.username.trim()) newErrors.username = "Username is required";
      if (!formData.full_name.trim()) newErrors.full_name = "Full name is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address";
      const phoneRegex = /^\d{10}$/;
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!phoneRegex.test(formData.phone.replace(/\D/g, "")))
        newErrors.phone = "Please enter a valid 10-digit phone number";
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
      if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) { setStep(step + 1); window.scrollTo(0, 0); }
  };
  const prevStep = () => { setStep(step - 1); window.scrollTo(0, 0); };

  // ── Submit ────────────────────────────────────────────────────────────────
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

    // ── Attach referral code if present ──
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
        // ── Clear referral code after successful registration ──
        localStorage.removeItem("referral_code");
        alert("🎉 Registration Successful! Welcome to our community!");
        setTimeout(() => navigate("/customer/login"), 1500);
      } else {
        if (data.errors) setErrors(data.errors);
        else alert(data.message || "Registration failed");
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

    useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

    if (isMobile) {
    return <MobileCustomerRegistration />;
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Create Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-900 bg-clip-text text-transparent">
              Customer Account
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Welcome to User Registration</p>
        </div>

        {/* ── Referral banner ──────────────────────────────────────────────── */}
        {referralCode && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-3 max-w-2xl mx-auto">
            <FaTag className="text-green-600 text-xl flex-shrink-0" />
            <div>
              <p className="text-green-800 font-semibold text-sm">
                You were referred by a friend! 
              </p>
              <p className="text-green-600 text-xs mt-0.5">
                Referral code <span className="font-mono font-bold">{referralCode}</span> will be
                applied automatically on registration.
              </p>
            </div>
            {/* <button
              type="button"
              onClick={() => {
                setReferralCode("");
                localStorage.removeItem("referral_code");
              }}
              className="ml-auto text-green-400 hover:text-green-600 text-xs underline"
            >
              Remove
            </button> */}
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                    step >= stepNum
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-300 bg-white text-gray-400"
                  } font-bold text-lg z-10`}
                >
                  {stepNum}
                </div>
                <span
                  className={`mt-2 text-sm font-medium ${
                    step >= stepNum ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {stepNum === 1 ? "Personal Info" : stepNum === 2 ? "Security" : "Address"}
                </span>
                {stepNum < 3 && (
                  <div
                    className={`absolute top-6 left-full w-24 h-1 ${
                      step > stepNum ? "bg-blue-600" : "bg-gray-300"
                    } -ml-12`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel – Benefits */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl p-6 text-white shadow-xl h-full">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Why Register With Us?</h2>
                <div className="space-y-4">
                  {[
                    { icon: <MdOutlineLocalShipping className="text-xl" />, title: "Free Shipping", desc: "On orders above ₹499" },
                    { icon: <FaGift className="text-xl" />, title: "Exclusive Deals", desc: "Special prices for members" },
                    { icon: <RiSecurePaymentLine className="text-xl" />, title: "Secure Payment", desc: "100% safe transactions" },
                    { icon: <GiSpeedometer className="text-xl" />, title: "Fast Checkout", desc: "Save your shipping details" },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex items-start space-x-3">
                      <div className="bg-white/20 p-2 rounded-lg">{icon}</div>
                      <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="text-sm text-blue-100">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-white/10 rounded-xl">
                <h3 className="font-bold mb-2">Already Registered?</h3>
                <p className="text-sm text-blue-100 mb-4">Welcome back! Sign in to access your account.</p>
                <Link
                  to="/customer/login"
                  className="flex items-center justify-center w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg text-center hover:bg-blue-50 transition"
                >
                  <FaUserCheck className="mr-2" />
                  Sign In Now
                </Link>
              </div>
            </div>
          </div>

          {/* Right Panel – Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <form onSubmit={handleSubmit}>

                {/* ── STEP 1: Personal Info ── */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
                      <p className="text-gray-600">Tell us about yourself</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaUser className="inline mr-1" /> Username *
                        </label>
                        <input
                          type="text" name="username"
                          placeholder="Choose a username"
                          className={`w-full px-4 py-3 rounded-lg border-2 ${errors.username ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                          value={formData.username} onChange={handleChange}
                        />
                        {errors.username && <p className="mt-1 text-sm text-red-600 flex items-center"><AiOutlineExclamationCircle className="mr-1" />{errors.username}</p>}
                      </div>

                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaUser className="inline mr-1" /> Full Name *
                        </label>
                        <input
                          type="text" name="full_name"
                          placeholder="Enter your full name"
                          className={`w-full px-4 py-3 rounded-lg border-2 ${errors.full_name ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                          value={formData.full_name} onChange={handleChange}
                        />
                        {errors.full_name && <p className="mt-1 text-sm text-red-600 flex items-center"><AiOutlineExclamationCircle className="mr-1" />{errors.full_name}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaEnvelope className="inline mr-1" /> Email Address *
                        </label>
                        <input
                          type="email" name="email"
                          placeholder="you@example.com"
                          className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                          value={formData.email} onChange={handleChange}
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center"><AiOutlineExclamationCircle className="mr-1" />{errors.email}</p>}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaPhone className="inline mr-1" /> Phone Number *
                        </label>
                        <input
                          type="tel" name="phone"
                          placeholder="10-digit phone number"
                          className={`w-full px-4 py-3 rounded-lg border-2 ${errors.phone ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                          value={formData.phone} onChange={handleChange}
                        />
                        {errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center"><AiOutlineExclamationCircle className="mr-1" />{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <button type="button" onClick={nextStep}
                        className="flex items-center bg-gradient-to-r from-blue-600 to-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
                        Continue <FaArrowRight className="ml-2" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: Security ── */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FaKey className="mr-2" /> Security Settings
                      </h2>
                      <p className="text-gray-600">Create a secure password</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaLock className="inline mr-1" /> Password *
                        </label>
                        <input
                          type="password" name="password"
                          placeholder="Minimum 8 characters"
                          className={`w-full px-4 py-3 rounded-lg border-2 ${errors.password ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                          value={formData.password} onChange={handleChange}
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600 flex items-center"><AiOutlineExclamationCircle className="mr-1" />{errors.password}</p>}
                        <p className="mt-2 text-xs text-gray-500">Use at least 8 characters with mix of letters and numbers</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaLock className="inline mr-1" /> Confirm Password *
                        </label>
                        <input
                          type="password" name="confirm_password"
                          placeholder="Re-enter your password"
                          className={`w-full px-4 py-3 rounded-lg border-2 ${errors.confirm_password ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                          value={formData.confirm_password} onChange={handleChange}
                        />
                        {errors.confirm_password && <p className="mt-1 text-sm text-red-600 flex items-center"><AiOutlineExclamationCircle className="mr-1" />{errors.confirm_password}</p>}
                        {formData.password && formData.confirm_password && (
                          <div className="mt-2">
                            {passwordMatch
                              ? <span className="text-green-600 text-sm flex items-center"><FaCheck className="mr-1" />Passwords match</span>
                              : <span className="text-red-600 text-sm flex items-center"><FaTimes className="mr-1" />Passwords don't match</span>}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button type="button" onClick={prevStep}
                        className="flex items-center px-8 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                        <FaArrowLeft className="mr-2" /> Back
                      </button>
                      <button type="button" onClick={nextStep}
                        className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition">
                        Continue <FaArrowRight className="ml-2" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: Address & Terms ── */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <FaHome className="mr-2" /> Delivery Address &amp; Terms
                      </h2>
                      <p className="text-gray-600">Where should we deliver your orders?</p>
                    </div>

                    <div className="space-y-6">
                      {/* Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FaMapMarkerAlt className="inline mr-1" /> Full Address *
                        </label>
                        <input
                          type="text" name="address"
                          placeholder="House no, Street, Area"
                          className={`w-full px-4 py-3 rounded-lg border-2 ${errors.address ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                          value={formData.address} onChange={handleChange}
                        />
                        {errors.address && <p className="mt-1 text-sm text-red-600 flex items-center"><AiOutlineExclamationCircle className="mr-1" />{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MdLocationCity className="inline mr-1" /> City *
                          </label>
                          <input
                            type="text" name="city"
                            placeholder="Your city"
                            className={`w-full px-4 py-3 rounded-lg border-2 ${errors.city ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                            value={formData.city} onChange={handleChange}
                          />
                          {errors.city && <p className="mt-1 text-sm text-red-600 flex items-center"><AiOutlineExclamationCircle className="mr-1" />{errors.city}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FaCity className="inline mr-1" /> State *
                          </label>
                          <input
                            type="text" name="state"
                            placeholder="Your state"
                            className={`w-full px-4 py-3 rounded-lg border-2 ${errors.state ? "border-red-500" : "border-gray-300"} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition`}
                            value={formData.state} onChange={handleChange}
                          />
                          {errors.state && <p className="mt-1 text-sm text-red-600 flex items-center"><AiOutlineExclamationCircle className="mr-1" />{errors.state}</p>}
                        </div>
                      </div>

                      {/* Referral code read-only display */}
                      {referralCode && (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                          <FaTag className="text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Referral code applied</p>
                            <p className="text-xs text-green-600 font-mono">{referralCode}</p>
                          </div>
                          <span className="ml-auto text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Active</span>
                        </div>
                      )}

                      {/* Terms */}
                      <div className="mt-8">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox" name="acceptTerms" id="acceptTerms"
                            checked={formData.acceptTerms} onChange={handleChange}
                            className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="acceptTerms" className="text-gray-700">
                            <FaCheck className="inline mr-1 text-green-600" />
                            I agree to the{" "}
                            <Link to="/terms" className="text-blue-600 hover:underline font-medium">Terms of Service</Link>{" "}
                            and{" "}
                            <Link to="/privacy" className="text-blue-600 hover:underline font-medium">Privacy Policy</Link>
                          </label>
                        </div>
                        {errors.acceptTerms && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AiOutlineExclamationCircle className="mr-1" />{errors.acceptTerms}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button type="button" onClick={prevStep}
                        className="flex items-center px-8 py-3 rounded-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                        <FaArrowLeft className="mr-2" /> Back
                      </button>
                      <button type="submit" disabled={loading}
                        className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50">
                        {loading ? (
                          <span className="flex items-center">
                            <FaSpinner className="animate-spin h-5 w-5 mr-2" /> Creating Account...
                          </span>
                        ) : (
                          <> Create Account <FaCheck className="ml-2" /> </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-600">
                  Already have an account?{" "}
                  <Link to="/customer/login" className="text-blue-600 font-bold hover:underline inline-flex items-center">
                    <FaUserCheck className="mr-1" /> Sign In Here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          {[
            { icon: <FaLock className="text-green-600" />, label: "100% Secure" },
            { icon: <FaShieldAlt className="text-blue-600" />, label: "Data Protected" },
            { icon: <FaEnvelope className="text-orange-600" />, label: "No Spam" },
            { icon: <MdPayment className="text-purple-600" />, label: "Safe Payments" },
          ].map(({ icon, label }) => (
            <div key={label} className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center space-x-2">
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}