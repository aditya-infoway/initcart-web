import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { axiosInstance } from "../../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      const response = await axiosInstance.post('/ecommerce/customer/forgot-password/', {
        email: email.trim().toLowerCase()
      });
      
      if (response.data.success) {
        setSuccess(true);
        addToast("Password reset link sent to your email!", "success");
      } else {
        setError(response.data.message || "Failed to send reset link");
      }
      
    } catch (error) {
      if (error.response?.data) {
        const data = error.response.data;
        if (data.errors?.email) {
          setError(data.errors.email[0]);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md">
        
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Reset Your Password</h1>
          <p className="text-gray-600 mt-2">
            {success 
              ? "Check your email for reset instructions" 
              : "Enter your email to receive reset link"}
          </p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</h3>
            <p className="text-gray-600 mb-6">
              We've sent password reset instructions to <span className="font-medium text-blue-600">{email}</span>
            </p>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-800">
                <strong>Didn't receive the email?</strong>
                <br/>
                • Check your spam folder
                <br/>
                • Make sure you entered the correct email
                <br/>
                • Wait a few minutes and try again
                <br/>
                • <Link to="/manual-reset" className="text-blue-700 underline">Enter reset link manually</Link>
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/customer/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium transition"
              >
                Back to Login
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-md font-medium transition"
              >
                Try Another Email
              </button>
            </div>
          </div>
        ) : (
          /* Reset Form */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter the email associated with your customer account
                </p>
              </div>
              
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
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link to="/customer/login" className="text-blue-600 hover:underline font-medium">
                  Back to Login
                </Link>
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Or{" "}
                <Link to="/manual-reset" className="text-blue-600 hover:underline">
                  enter reset link manually
                </Link>
              </p>
            </div>
          </div>
        )}
        
        {/* Security Note */}
        <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong> Your security is important to us</strong>
            <br/>
            We'll never ask for your password via email or phone
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;