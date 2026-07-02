import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

const ResetSuccess = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    addToast("Password reset successful!", "success");
  }, [addToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md">
        
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-green-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Password Reset Successful!</h1>
          <p className="text-gray-600 mt-2">Your password has been changed successfully</p>
        </div>

        {/* Success Message */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Login</h3>
            <p className="text-gray-600 mb-6">
              Your password has been updated successfully. You can now login to your account with your new password.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong> What happens next?</strong>
              <br/>
              • You'll be redirected to login page
              <br/>
              • Use your new password to login
              <br/>
              • All existing sessions have been logged out
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/customer/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-medium transition"
            >
              Go to Login
            </button>
            <Link
              to="/"
              className="block w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-md font-medium transition text-center"
            >
              Return to Home
            </Link>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700 text-center">
            <strong> Security Notice:</strong>
            <br/>
            For security reasons, we logged out all your active sessions.
            You need to login again with your new password.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetSuccess;