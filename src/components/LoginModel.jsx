import React from 'react';
import { FiAlertTriangle, FiLogIn, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose, message = "Please login to continue" }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleLogin = () => {
        onClose();
        navigate('/customer/login', { 
            state: { from: window.location.pathname }
        });
    };

    const handleRegister = () => {
        onClose();
        navigate('/customer/register', {
            state: { from: window.location.pathname }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>
                
                <p className="text-gray-600 mb-6">
                    {message}
                </p>
                
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleLogin}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                        <FiLogIn /> Login Now
                    </button>
                    
                    <button
                        onClick={handleRegister}
                        className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
                    >
                        Create New Account
                    </button>
                    
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-gray-500 hover:text-gray-700 transition"
                    >
                        Continue browsing
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;