import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiStar, FiShoppingBag, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import { publicAxios } from "../../api/axios";
import { FONTS, MobileHeader } from "../../style/mobileStyles";

export default function MobileBrandListPage() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicAxios.get("/ecommerce/public/brands/");

      if (response.data && Array.isArray(response.data)) {
        const formattedBrands = response.data.map((brand) => ({
          id: brand.id,
          name: brand.brand_name,
          logo: brand.brand_logo_url || brand.brand_logo,
          product_count: brand.product_count || 0,
          rating: (Math.random() * 1 + 4).toFixed(1),
        }));
        
        setBrands(formattedBrands);
        setFilteredBrands(formattedBrands);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      setError("Failed to load brands");
      setBrands([]);
      setFilteredBrands([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Add class to body to hide bottom navigation via CSS
    document.body.classList.add('mpd-page');
    
    // Also add inline style as backup
    const style = document.createElement('style');
    style.id = 'mpd-inline-hide';
    style.textContent = `
      .fixed.bottom-0.left-0.right-0.z-\\[100\\],
      .md\\:hidden.fixed.bottom-0 {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.body.classList.remove('mpd-page');
      const styleEl = document.getElementById('mpd-inline-hide');
      if (styleEl) styleEl.remove();
    };
  }, []);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [searchTerm, brands]);

  const getBrandLogo = (brand) => {
    if (brand.logo) {
      return (
        <img
          src={brand.logo}
          alt={brand.name}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl">🏷️</div>`;
          }}
        />
      );
    }
    return <div className="w-full h-full flex items-center justify-center text-2xl">🏷️</div>;
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-gray-100">
          <div className="px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gray-100 rounded-full animate-pulse"></div>
              <div>
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 w-12 bg-gray-50 rounded mt-0.5 animate-pulse"></div>
              </div>
            </div>
            <div className="mt-2 h-8 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-gray-50 rounded-lg p-2 animate-pulse">
                <div className="h-16 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-1"></div>
                <div className="h-2 bg-gray-100 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className={`${FONTS.emptyTitle} text-gray-800 mb-1`}>Oops!</h3>
          <p className={`${FONTS.emptySubtitle} text-gray-400 mb-4`}>{error}</p>
          <button
            onClick={fetchBrands}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-[12px] font-medium flex items-center gap-1 mx-auto"
          >
            <FiRefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header - Fixed: No extra top spacing */}
      <MobileHeader 
        title="Brands" 
        subtitle={`${filteredBrands.length} brands`}
        showBack={true}
      />

      {/* Search Bar */}
      <div className="px-3 pt-2 pb-2">
        <div className={`transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={`w-full pl-8 pr-7 py-1.5 bg-gray-50 rounded-lg ${FONTS.searchInput} placeholder:text-gray-400 focus:outline-none`}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2"
              >
                <FiX className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-3 py-1">
        {filteredBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-2">
              <FiSearch className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className={`${FONTS.emptyTitle} text-gray-800 mb-0.5`}>No brands found</h3>
            <p className={`${FONTS.emptySubtitle} text-gray-400 text-center`}>
              "{searchTerm}" not found
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-lg text-[12px] font-medium"
            >
              Clear
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredBrands.map((brand, index) => (
              <div
                key={brand.id}
                onClick={() => navigate(`/brand-products/?brand=${brand.id}`)}
                className="group cursor-pointer"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="bg-white rounded-lg border border-gray-100 active:scale-95 transition-all duration-150 overflow-hidden shadow-sm">
                  
                  {/* Logo */}
                  <div className="bg-gray-50/50 p-2">
                    <div className="h-16 w-full">
                      <div className="w-full h-full rounded flex items-center justify-center">
                        {getBrandLogo(brand)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-2">
                    <h3 className={`${FONTS.cardTitle} text-gray-800 text-center truncate`}>
                      {brand.name}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <div className="flex items-center gap-0.5">
                        <FiStar className="w-2.5 h-2.5 text-yellow-500 fill-current" />
                        <span className={`${FONTS.cardSub} text-gray-600`}>{brand.rating}</span>
                      </div>
                      <span className="text-gray-300 text-[8px]">•</span>
                      <span className={`${FONTS.cardSub} text-gray-400`}>
                        {brand.product_count} items
                      </span>
                    </div>
                    
                    <button className="w-full mt-2 py-1 bg-blue-600 text-white rounded-md text-[11px] font-medium flex items-center justify-center gap-1 active:bg-blue-700">
                      <FiShoppingBag className="w-2.5 h-2.5" />
                      Shop
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .group {
          animation: fadeIn 0.2s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}