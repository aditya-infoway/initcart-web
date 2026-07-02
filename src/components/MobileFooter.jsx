// ecommerce/frontend/src/components/MobileFooter.jsx

import React from 'react';

const MobileFooter = () => {
  return (
    <footer className="bg-white py-5 px-4 text-center border-t border-gray-100 z-100">
      <div className="max-w-sm mx-auto">
        {/* Logo */}
        <div className="mb-2">
          <span className="text-[22px] font-black bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            initcart
          </span>
        </div>
        
        {/* Tagline */}
        <p className="text-[11px] text-gray-400 font-medium tracking-wide">
          India's Biggest MarketPlace
        </p>
        
        {/* Small Divider */}
        <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mx-auto my-2"></div>
        
        {/* Footer Links */}
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-[8px] text-gray-400">© 2025</span>
          <span className="text-[8px] text-gray-300">•</span>
          <span className="text-[8px] text-gray-400">All rights reserved</span>
        </div>
      </div>
    </footer>
  );
};

export default MobileFooter;