import React from 'react';
// FaWallet is imported here instead of FaShieldAlt
import { FaTruck, FaWallet, FaSyncAlt } from 'react-icons/fa';
import { AiOutlineSafetyCertificate } from 'react-icons/ai'; 

const features = [
  { icon: FaTruck, title: 'Fast Delivery all across the country' },
  // Icon updated to FaWallet
  { icon: FaWallet, title: 'Safe Payment' }, 
  { icon: FaSyncAlt, title: '7 Days Return Policy' },
  { icon: AiOutlineSafetyCertificate, title: '100% Authentic Products' },
];

const FeatureBoxesStyled = () => {
  const iconContainerClasses = 'p-4 rounded-full bg-white text-blue-600 mb-4 inline-flex items-center justify-center shadow-md';
  const iconClasses = 'w-8 h-8 md:w-10 md:h-10';
  
  return (
    <div className="bg-blue-50 my-5 py-5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 border border-blue-400 rounded-lg shadow-lg transition duration-300 bg-transparent transform hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <div className={iconContainerClasses}>
                <feature.icon className={iconClasses} /> 
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureBoxesStyled;