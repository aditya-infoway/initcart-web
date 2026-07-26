// ecommerce/frontend/src/pages/mobile/MobileCustomerRegistration.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../../api/axios";
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
  FiTag,
  FiShield,
  FiClock,
  FiArrowRight,
  FiMapPin,
  FiHome,
  FiGlobe,
  FiAlertCircle,
  FiShoppingBag,
} from "react-icons/fi";

// ─── Design Tokens (matches InitCart app shell / MobileUserLogin) ─────────
const C = {
  primary:      "#1857C4",
  primaryDark:  "#123F92",
  primarySoft:  "#EAF1FF",
  ink:          "#0F172A",
  sub:          "#64748B",
  border:       "#E7EAF0",
  fieldBg:      "#F6F8FB",
  danger:       "#DC2626",
  dangerBg:     "#FEF2F2",
  success:      "#16A34A",
  page:         "#F4F6F9",
};

const F = {
  h1:     { fontSize: 20, fontWeight: 700, letterSpacing: -0.2 },
  sub:    { fontSize: 13, fontWeight: 400 },
  label:  { fontSize: 12, fontWeight: 600 },
  input:  { fontSize: 15, fontWeight: 500 },
  button: { fontSize: 15, fontWeight: 700 },
  small:  { fontSize: 11.5, fontWeight: 500 },
};

const STEP_TITLES = ["Personal info", "Security", "Address"];

// Reusable field so all three steps stay visually identical
const Field = ({ id, icon, label, error, focused, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label htmlFor={id} style={{ ...F.label, color: C.ink, display: "block", marginBottom: 6 }}>
      {label}
    </label>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: C.fieldBg,
        border: `1.5px solid ${error ? C.danger : focused ? C.primary : C.border}`,
        borderRadius: 14,
        padding: "0 14px",
      }}
    >
      {icon}
      {children}
    </div>
    {error && (
      <p role="alert" style={{ fontSize: 11.5, color: C.danger, marginTop: 6, marginLeft: 2, fontWeight: 500 }}>
        {error}
      </p>
    )}
  </div>
);

const inputStyle = {
  flex: 1,
  border: "none",
  padding: "13px 0",
  outline: "none",
  background: "transparent",
  color: C.ink,
  ...F.input,
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

  const [focus, setFocus] = useState({});
  const setF = (name, val) => setFocus((f) => ({ ...f, [name]: val }));

  const navigate = useNavigate();

  useEffect(() => {
    const savedCode = localStorage.getItem("referral_code");
    if (savedCode) setReferralCode(savedCode.trim().toUpperCase());
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  useEffect(() => {
    if (formData.password && formData.confirm_password) {
      setPasswordMatch(formData.password === formData.confirm_password);
    }
  }, [formData.password, formData.confirm_password]);

  const validateStep = (stepNum) => {
    const newErrors = {};

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
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 3));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo(0, 0);
  };

  // Enter key on steps 1 & 2 used to do nothing, since the "Continue" buttons
  // are type="button" and there's no submit button until step 3. This makes
  // Enter behave like tapping "Continue" on those steps, and lets step 3
  // submit normally through handleSubmit.
  const handleFormKeyDown = (e) => {
    if (e.key === "Enter" && step !== 3) {
      e.preventDefault();
      nextStep();
    }
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

    if (referralCode) registrationData.referral_code = referralCode;

    try {
      setLoading(true);
      setErrors({});

      // Uses the shared axios instance (same base URL, interceptors, timeout
      // handling as the rest of the app) instead of a hardcoded fetch() URL.
      const response = await axiosInstance.post("/ecommerce/customer/register/", registrationData);

      if (response.data.success) {
        localStorage.removeItem("referral_code");
        navigate("/customer/login", { state: { message: "Registration successful! Please login." } });
      } else {
        if (response.data.errors) setErrors(response.data.errors);
        else alert(response.data.message || "Registration failed");
      }
    } catch (error) {
      // Handles both API-returned validation errors and network/server errors
      // (e.g. a 500 page that isn't valid JSON), which the old fetch()
      // implementation would have thrown on uncaught.
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors) setErrors(data.errors);
        else alert(data.message || "Registration failed");
      } else {
        console.error("Error:", error);
        alert("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", background: C.page, fontFamily: "'Inter', sans-serif" }}>
      {/* Header — solid brand blue, matches app shell header */}
      <div style={{ background: C.primary, padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => (step === 1 ? navigate(-1) : prevStep())}
            aria-label="Go back"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(255,255,255,0.16)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <FiChevronLeft size={20} color="#FFFFFF" />
          </button>
          <div>
            <p style={{ ...F.h1, color: "#FFFFFF", margin: 0 }}>Create account</p>
            <p style={{ ...F.sub, color: "rgba(255,255,255,0.75)", margin: 0 }}>
              Step {step} of 3 &middot; {STEP_TITLES[step - 1]}
            </p>
          </div>
        </div>

        {/* Step progress */}
        <div style={{ display: "flex", gap: 6, marginTop: 18 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: step >= s ? "#FFFFFF" : "rgba(255,255,255,0.3)",
                transition: "background 0.25s ease",
              }}
            />
          ))}
        </div>
      </div>

      {/* Extra gap between header and card */}
      <div style={{ height: 16 }}></div>

      {/* Card */}
      <div style={{ padding: "0 16px" }}>
        <div
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            padding: "22px 18px 20px",
            boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
            border: `1px solid ${C.border}`,
          }}
        >
          {/* Brand mark */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: C.primarySoft,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FiShoppingBag size={24} color={C.primary} />
            </div>
          </div>

          {/* Referral banner */}
          {referralCode && (
            <div
              style={{
                background: C.primarySoft,
                borderRadius: 12,
                padding: "10px 12px",
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <FiTag size={17} color={C.primary} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.primaryDark, margin: 0 }}>Referral applied</p>
                <p style={{ fontSize: 11, color: C.primary, margin: 0 }}>Code: {referralCode}</p>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  background: C.primary,
                  padding: "3px 8px",
                  borderRadius: 8,
                }}
              >
                Active
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown}>
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div>
                <Field
                  id="reg-username"
                  icon={<FiUser size={17} color={focus.username ? C.primary : "#94A3B8"} />}
                  label="Username"
                  error={errors.username}
                  focused={focus.username}
                >
                  <input
                    id="reg-username"
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    style={inputStyle}
                    value={formData.username}
                    onChange={handleChange}
                    onFocus={() => setF("username", true)}
                    onBlur={() => setF("username", false)}
                    autoComplete="username"
                  />
                </Field>

                <Field
                  id="reg-full-name"
                  icon={<FiUser size={17} color={focus.full_name ? C.primary : "#94A3B8"} />}
                  label="Full name"
                  error={errors.full_name}
                  focused={focus.full_name}
                >
                  <input
                    id="reg-full-name"
                    type="text"
                    name="full_name"
                    placeholder="Your full name"
                    style={inputStyle}
                    value={formData.full_name}
                    onChange={handleChange}
                    onFocus={() => setF("full_name", true)}
                    onBlur={() => setF("full_name", false)}
                    autoComplete="name"
                  />
                </Field>

                <Field
                  id="reg-email"
                  icon={<FiMail size={17} color={focus.email ? C.primary : "#94A3B8"} />}
                  label="Email address"
                  error={errors.email}
                  focused={focus.email}
                >
                  <input
                    id="reg-email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    style={inputStyle}
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setF("email", true)}
                    onBlur={() => setF("email", false)}
                    autoComplete="email"
                  />
                </Field>

                <Field
                  id="reg-phone"
                  icon={<FiPhone size={17} color={focus.phone ? C.primary : "#94A3B8"} />}
                  label="Phone number"
                  error={errors.phone}
                  focused={focus.phone}
                >
                  <input
                    id="reg-phone"
                    type="tel"
                    name="phone"
                    placeholder="10-digit mobile number"
                    style={inputStyle}
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => setF("phone", true)}
                    onBlur={() => setF("phone", false)}
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </Field>

                <button type="button" onClick={nextStep} style={primaryBtnStyle}>
                  Continue <FiArrowRight size={16} />
                </button>
              </div>
            )}

            {/* STEP 2: Security */}
            {step === 2 && (
              <div>
                <Field
                  id="reg-password"
                  icon={<FiLock size={17} color={focus.password ? C.primary : "#94A3B8"} />}
                  label="Password"
                  error={errors.password}
                  focused={focus.password}
                >
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="At least 8 characters"
                    style={inputStyle}
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setF("password", true)}
                    onBlur={() => setF("password", false)}
                    autoComplete="new-password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex" }}
                  >
                    {showPassword ? <FiEyeOff size={17} color="#94A3B8" /> : <FiEye size={17} color="#94A3B8" />}
                  </button>
                </Field>
                {!errors.password && formData.password && (
                  <p style={{ fontSize: 11, color: C.sub, marginTop: -10, marginBottom: 16, marginLeft: 2 }}>
                    Minimum 8 characters
                  </p>
                )}

                <Field
                  id="reg-confirm-password"
                  icon={<FiLock size={17} color={focus.confirm_password ? C.primary : "#94A3B8"} />}
                  label="Confirm password"
                  error={errors.confirm_password}
                  focused={focus.confirm_password}
                >
                  <input
                    id="reg-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    placeholder="Re-enter password"
                    style={inputStyle}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    onFocus={() => setF("confirm_password", true)}
                    onBlur={() => setF("confirm_password", false)}
                    autoComplete="new-password"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex" }}
                  >
                    {showConfirmPassword ? <FiEyeOff size={17} color="#94A3B8" /> : <FiEye size={17} color="#94A3B8" />}
                  </button>
                </Field>
                {formData.password && formData.confirm_password && !errors.confirm_password && (
                  <div style={{ marginTop: -10, marginBottom: 18, marginLeft: 2 }}>
                    {passwordMatch ? (
                      <span style={{ fontSize: 11.5, color: C.success, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                        <FiCheckCircle size={13} /> Passwords match
                      </span>
                    ) : (
                      <span style={{ fontSize: 11.5, color: C.danger, fontWeight: 600 }}>Passwords don't match</span>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                  <button type="button" onClick={prevStep} style={secondaryBtnStyle}>
                    Back
                  </button>
                  <button type="button" onClick={nextStep} style={primaryBtnStyle}>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Address & Terms */}
            {step === 3 && (
              <div>
                <Field
                  id="reg-address"
                  icon={<FiHome size={17} color={focus.address ? C.primary : "#94A3B8"} />}
                  label="Full address"
                  error={errors.address}
                  focused={focus.address}
                >
                  <input
                    id="reg-address"
                    type="text"
                    name="address"
                    placeholder="House / street / area"
                    style={inputStyle}
                    value={formData.address}
                    onChange={handleChange}
                    onFocus={() => setF("address", true)}
                    onBlur={() => setF("address", false)}
                    autoComplete="street-address"
                  />
                </Field>

                <Field
                  id="reg-city"
                  icon={<FiMapPin size={17} color={focus.city ? C.primary : "#94A3B8"} />}
                  label="City"
                  error={errors.city}
                  focused={focus.city}
                >
                  <input
                    id="reg-city"
                    type="text"
                    name="city"
                    placeholder="Your city"
                    style={inputStyle}
                    value={formData.city}
                    onChange={handleChange}
                    onFocus={() => setF("city", true)}
                    onBlur={() => setF("city", false)}
                    autoComplete="address-level2"
                  />
                </Field>

                <Field
                  id="reg-state"
                  icon={<FiGlobe size={17} color={focus.state ? C.primary : "#94A3B8"} />}
                  label="State"
                  error={errors.state}
                  focused={focus.state}
                >
                  <input
                    id="reg-state"
                    type="text"
                    name="state"
                    placeholder="Your state"
                    style={inputStyle}
                    value={formData.state}
                    onChange={handleChange}
                    onFocus={() => setF("state", true)}
                    onBlur={() => setF("state", false)}
                    autoComplete="address-level1"
                  />
                </Field>

                <div style={{ marginBottom: 20 }}>
                  <label htmlFor="reg-accept-terms" style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input
                      id="reg-accept-terms"
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      style={{ marginTop: 2, width: 17, height: 17, accentColor: C.primary }}
                    />
                    <span style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>
                      I agree to the <span style={{ color: C.primary, fontWeight: 600 }}>Terms of Service</span> and{" "}
                      <span style={{ color: C.primary, fontWeight: 600 }}>Privacy Policy</span>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p role="alert" style={{ fontSize: 11.5, color: C.danger, marginTop: 8, fontWeight: 500 }}>
                      {errors.acceptTerms}
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={prevStep} style={secondaryBtnStyle}>
                    Back
                  </button>
                  <button type="submit" disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.75 : 1 }}>
                    {loading ? (
                      <>
                        <span
                          style={{
                            width: 15,
                            height: 15,
                            border: "2px solid #FFFFFF",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            animation: "mcr-spin 0.7s linear infinite",
                            display: "inline-block",
                          }}
                        />
                        Creating…
                      </>
                    ) : (
                      "Create account"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div style={{ textAlign: "center", marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <p style={{ ...F.small, color: C.sub, margin: 0 }}>
              Already have an account?{" "}
              <Link to="/customer/login" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Why join — same pill language as "Our Services" on home */}
        <div style={{ marginTop: 16, marginBottom: 24 }}>
          <p style={{ ...F.label, color: C.ink, margin: "0 2px 10px" }}>Why join InitCart</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { icon: <FiTruck size={14} />, label: "Free shipping" },
              { icon: <FiTag size={14} />, label: "Exclusive deals" },
              { icon: <FiShield size={14} />, label: "Secure payment" },
              { icon: <FiClock size={14} />, label: "24/7 support" },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#FFFFFF",
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: "12px 12px",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: C.primarySoft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.primary,
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes mcr-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const primaryBtnStyle = {
  flex: 1,
  width: "100%",
  padding: "15px",
  background: C.primary,
  color: "#FFFFFF",
  border: "none",
  borderRadius: 14,
  fontSize: 15,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  cursor: "pointer",
};

const secondaryBtnStyle = {
  flex: 1,
  padding: "15px",
  background: C.fieldBg,
  color: C.ink,
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  fontSize: 15,
  fontWeight: 700,
  cursor: "pointer",
};

export default MobileCustomerRegistration;