import React, { useState, useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-l-4 border-green-400 text-green-700',
    error: 'bg-red-50 border-l-4 border-red-400 text-red-700',
    warning: 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700',
    info: 'bg-blue-50 border-l-4 border-blue-400 text-blue-700'
  };

  const iconColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  };

  const icon = {
    success: <FiCheckCircle className={`h-5 w-5 ${iconColor[type]}`} />,
    error: <FiXCircle className={`h-5 w-5 ${iconColor[type]}`} />,
    warning: <FiAlertCircle className={`h-5 w-5 ${iconColor[type]}`} />,
    info: <FiInfo className={`h-5 w-5 ${iconColor[type]}`} />
  };

  return (
    <div className={`transform transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
      <div className={`${bgColor[type]} px-4 py-3 rounded shadow-lg flex items-start gap-3 min-w-[300px] max-w-md`}>
        <div className="flex-shrink-0 pt-0.5">{icon[type]}</div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(), 300);
          }}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <FiXCircle className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;