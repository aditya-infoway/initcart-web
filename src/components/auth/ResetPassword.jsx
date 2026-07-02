import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { axiosInstance } from "../../api/axios";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [valid, setValid] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axiosInstance.post('/ecommerce/customer/verify-reset-token/', {
          uid,
          token
        });
        
        if (response.data.success && response.data.valid) {
          setValid(true);
          setEmail(response.data.email || "User");
        } else {
          setError(response.data.message || "Invalid or expired reset link");
        }
      } catch (error) {
        if (error.response?.data) {
          const data = error.response.data;
          setError(data.message || "Invalid or expired reset link");
        } else {
          setError("Invalid or expired reset link");
        }
      } finally {
        setVerifying(false);
      }
    };
    
    if (uid && token) {
      verifyToken();
    } else {
      setError("Invalid reset link");
      setVerifying(false);
    }
  }, [uid, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/\d/.test(password)) {
      errors.push("One number");
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.new_password || !formData.confirm_password) {
      setError("All fields are required");
      return;
    }
    
    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    
    const passwordErrors = validatePassword(formData.new_password);
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(", ")}`);
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      const response = await axiosInstance.post('/ecommerce/customer/reset-password/', {
        uid,
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });
      
      if (response.data.success) {
        addToast("Password reset successful! You can now login.", "success");
        setTimeout(() => {
          navigate('/customer/login', { 
            state: { 
              message: "Password reset successful! Please login with your new password." 
            } 
          });
        }, 2000);
      } else {
        setError(response.data.message || "Failed to reset password");
      }
      
    } catch (error) {
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else if (data.message) {
          setError(data.message);
        } else {
          setError("Something went wrong. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Invalid Reset Link</h3>
            <p className="text-gray-600 mb-6">
              {error || "This password reset link is invalid or has expired."}
            </p>
            
            <div className="space-y-3">
              <Link
                to="/forgot-password"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium transition text-center"
              >
                Request New Reset Link
              </Link>
              <Link
                to="/manual-reset"
                className="block w-full border border-blue-300 hover:bg-blue-50 text-blue-600 py-2.5 rounded-md font-medium transition text-center"
              >
                Enter Link Manually
              </Link>
              <Link
                to="/login"
                className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-md font-medium transition text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.91-6c-.49 0-.9.36-.98.85C16.52 11.17 14.47 13 12 13s-4.52-1.83-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Create New Password</h1>
          <p className="text-gray-600 mt-2">Enter a strong password for your account</p>
          {email && <p className="text-sm text-blue-600 mt-1">For: {email}</p>}
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  name="new_password"
                  placeholder="Enter new password (min. 8 characters)"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 pr-10"
                  value={formData.new_password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                  tabIndex="-1"
                >
                  {showPassword.new ? "🙈" : "👁️"}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.new_password && (
                <div className="mt-3">
                  <div className="flex items-center mb-1">
                    <div className="h-1 flex-1 bg-gray-200 rounded-full mr-2">
                      <div 
                        className={`h-full rounded-full ${
                          formData.new_password.length >= 8 ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(formData.new_password.length * 10, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">
                      {formData.new_password.length < 8 ? "Weak" : 
                       formData.new_password.length < 12 ? "Good" : "Strong"}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    {[
                      { check: formData.new_password.length >= 8, text: "8+ characters" },
                      { check: /[A-Z]/.test(formData.new_password), text: "Uppercase" },
                      { check: /[a-z]/.test(formData.new_password), text: "Lowercase" },
                      { check: /\d/.test(formData.new_password), text: "Number" },
                    ].map((req, idx) => (
                      <div key={idx} className="flex items-center">
                        <span className={`mr-1 ${req.check ? "text-green-500" : "text-gray-400"}`}>
                          {req.check ? "✓" : "○"}
                        </span>
                        <span>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  name="confirm_password"
                  placeholder="Confirm new password"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 pr-10"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                  tabIndex="-1"
                >
                  {showPassword.confirm ? "🙈" : "👁️"}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {formData.confirm_password && (
                <div className="mt-2 text-sm">
                  {formData.new_password === formData.confirm_password ? (
                    <span className="text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Passwords match
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${
                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              } text-white py-3 rounded-md font-medium transition flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Back to Login
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ResetPassword;