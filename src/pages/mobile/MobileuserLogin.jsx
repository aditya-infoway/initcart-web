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
  FiChevronLeft,
  FiTruck,
  FiHeart,
  FiTag,
  FiShield,
  FiClock,
  FiZap,
  FiArrowRight,
  FiAlertCircle,
  FiShoppingBag,
} from "react-icons/fi";

// ─── Design Tokens (matches InitCart app shell) ────────────────────────────
const C = {
  primary:      "#1857C4", // header / brand blue
  primaryDark:  "#123F92",
  primarySoft:  "#EAF1FF", // light blue tint for chips/badges
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

// Keys used for auth storage. Kept in one place so login/logout/interceptors
// all agree on where the token lives.
const AUTH_KEYS = ["customer_token", "customer_user", "access_token", "refresh_token"];

// Reads a value from sessionStorage first, then localStorage (remembered sessions).
const readAuthValue = (key) => sessionStorage.getItem(key) || localStorage.getItem(key);

// Writes auth values to the correct storage based on "remember me".
// Also clears the other storage so a stale copy can't linger in both places.
const persistAuth = ({ token, user, access, refresh }, rememberMe) => {
  const target = rememberMe ? localStorage : sessionStorage;
  const other = rememberMe ? sessionStorage : localStorage;

  AUTH_KEYS.forEach((k) => other.removeItem(k));

  target.setItem("customer_token", token);
  target.setItem("customer_user", JSON.stringify(user));
  if (access) target.setItem("access_token", access);
  if (refresh) target.setItem("refresh_token", refresh);
};

const clearAuth = () => {
  AUTH_KEYS.forEach((k) => {
    sessionStorage.removeItem(k);
    localStorage.removeItem(k);
  });
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

  const [usernameFocus, setUsernameFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

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
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      setError("Email/Phone is required");
      return;
    }
    if (!formData.password) {
      setError("Password is required");
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

        // Store based on "remember me": sessionStorage (tab-only) by default,
        // localStorage (survives browser restart) only when the user opts in.
        persistAuth({ token, user, access, refresh }, formData.rememberMe);

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

  useEffect(() => {
    const token = readAuthValue("customer_token");
    const userStr = readAuthValue("customer_user");
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        if (login) login(userData, token, "customer");
        const from = location.state?.from || sessionStorage.getItem("redirectAfterLogin") || "/";
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(from, { replace: true });
      } catch (e) {
        console.error("Error parsing user data:", e);
        clearAuth();
      }
    }
    if (localStorage.getItem("remember_me") === "true") {
      setFormData((prev) => ({ ...prev, rememberMe: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const benefits = [
    { icon: <FiTruck size={14} />, label: "Order tracking" },
    { icon: <FiHeart size={14} />, label: "Wishlist" },
    { icon: <FiTag size={14} />, label: "Member offers" },
    { icon: <FiShield size={14} />, label: "Secure payments" },
  ];

  return (
    <div style={{ minHeight: "100dvh", background: C.page, fontFamily: "'Inter', sans-serif" }}>
      {/* Header — solid brand blue, matches app shell header */}
      <div
        style={{
          background: C.primary,
          padding: "14px 16px 16px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => navigate(-1)}
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
            <p style={{ ...F.h1, color: "#FFFFFF", margin: 0 }}>Sign in</p>
            <p style={{ ...F.sub, color: "rgba(255,255,255,0.75)", margin: 0 }}>
              Welcome back to InitCart
            </p>
          </div>
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

          {error && (
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: C.dangerBg,
                borderRadius: 12,
                padding: "10px 12px",
                marginBottom: 16,
              }}
            >
              <FiAlertCircle size={16} color={C.danger} style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 12.5, color: C.danger, margin: 0, fontWeight: 500 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="login-username" style={{ ...F.label, color: C.ink, display: "block", marginBottom: 6 }}>
                Email / Phone / Username
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: C.fieldBg,
                  border: `1.5px solid ${usernameFocus ? C.primary : C.border}`,
                  borderRadius: 14,
                  padding: "0 14px",
                }}
              >
                <FiMail size={17} color={usernameFocus ? C.primary : "#94A3B8"} />
                <input
                  id="login-username"
                  ref={usernameRef}
                  type="text"
                  name="username"
                  placeholder="Enter email or phone"
                  style={{
                    flex: 1,
                    border: "none",
                    padding: "13px 0",
                    outline: "none",
                    background: "transparent",
                    color: C.ink,
                    ...F.input,
                  }}
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setUsernameFocus(true)}
                  onBlur={() => setUsernameFocus(false)}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label htmlFor="login-password" style={{ ...F.label, color: C.ink, display: "block", marginBottom: 6 }}>
                Password
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: C.fieldBg,
                  border: `1.5px solid ${passwordFocus ? C.primary : C.border}`,
                  borderRadius: 14,
                  padding: "0 14px",
                }}
              >
                <FiLock size={17} color={passwordFocus ? C.primary : "#94A3B8"} />
                <input
                  id="login-password"
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  style={{
                    flex: 1,
                    border: "none",
                    padding: "13px 0",
                    outline: "none",
                    background: "transparent",
                    color: C.ink,
                    ...F.input,
                  }}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex" }}
                >
                  {showPassword ? <FiEyeOff size={17} color="#94A3B8" /> : <FiEye size={17} color="#94A3B8" />}
                </button>
              </div>
            </div>

            {/* Remember me / forgot */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 2px 22px" }}>
              <label htmlFor="login-remember" style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
                <input
                  id="login-remember"
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  style={{ width: 16, height: 16, margin: 0, accentColor: C.primary }}
                />
                <span style={{ ...F.small, color: C.sub }}>Remember me</span>
              </label>
              <Link to="/forgot-password" style={{ ...F.small, color: C.primary, fontWeight: 700, textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px",
                background: loading ? "#93B4EE" : C.primary,
                color: "#FFFFFF",
                border: "none",
                borderRadius: 14,
                ...F.button,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: "2px solid #FFFFFF",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "muc-spin 0.7s linear infinite",
                      display: "inline-block",
                    }}
                  />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in <FiArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 18 }}>
            <p style={{ ...F.small, color: C.sub, margin: 0 }}>
              Don't have an account?{" "}
              <Link to="/customer/registration" style={{ color: C.primary, fontWeight: 700, textDecoration: "none" }}>
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Member benefits — same pill language as "Our Services" on home */}
        <div style={{ marginTop: 16, marginBottom: 24 }}>
          <p style={{ ...F.label, color: C.ink, margin: "0 2px 10px" }}>Member benefits</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {benefits.map((b, i) => (
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
                  {b.icon}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes muc-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MobileUserLogin;