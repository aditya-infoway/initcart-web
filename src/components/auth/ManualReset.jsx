import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const ManualReset = () => {
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  const extractUidTokenFromUrl = (url) => {
    try {
      // Extract UID and token from URL
      // Format: http://localhost:3000/reset-password/UID/TOKEN/
      const urlParts = url.split('/');
      
      // Find the reset-password segment
      const resetIndex = urlParts.indexOf('reset-password');
      if (resetIndex === -1) {
        throw new Error("Invalid reset link format");
      }
      
      const uid = urlParts[resetIndex + 1];
      const token = urlParts[resetIndex + 2];
      
      if (!uid || !token) {
        throw new Error("Could not extract UID and token from link");
      }
      
      return { uid, token };
    } catch (err) {
      throw new Error("Invalid reset link format. Please check the link.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!resetLink.trim()) {
      setError("Please enter the reset link");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      // Extract UID and token
      const { uid, token } = extractUidTokenFromUrl(resetLink);
      
      // Navigate to reset password page
      navigate(`/reset-password/${uid}/${token}`);
      
    } catch (err) {
      setError(err.message);
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
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Enter Reset Link</h1>
          <p className="text-gray-600 mt-2">Paste the password reset link from your email</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Reset Link *
              </label>
              <textarea
                placeholder="Paste the complete reset link from your email here..."
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 h-32 resize-none"
                value={resetLink}
                onChange={(e) => setResetLink(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                Copy the entire link from the password reset email
              </p>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong> Where to find the link:</strong>
                <br/>
                1. Open the password reset email
                <br/>
                2. Look for a link starting with: <code className="text-blue-900">https://initcart.in/reset-password/</code>
                <br/>
                3. Copy the entire link and paste it above
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
                  Processing Link...
                </>
              ) : (
                "Continue to Reset Password"
              )}
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <Link
              to="/forgot-password"
              className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-md font-medium transition text-center"
            >
              Back to Forgot Password
            </Link>
            <Link
              to="/customer/login"
              className="block text-center text-blue-600 hover:underline font-medium text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ManualReset;