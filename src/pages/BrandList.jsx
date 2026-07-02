import React, { useState, useEffect } from "react";
import { 
  FiRefreshCw, 
  FiX, 
  FiStar, 
  FiChevronRight, 
  FiChevronLeft,
  FiShoppingBag,
  FiSearch
} from "react-icons/fi";
import { publicAxios } from "../api/axios";
import { Link } from "react-router-dom";
import MobileBrandListPage from "./mobile/MobileBrandList";

const BrandList = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(16);

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
          description: brand.description || "Premium quality products",
          status: brand.status,
          category: brand.category || ["Fashion", "Electronics", "Sports", "Lifestyle"][Math.floor(Math.random() * 4)],
          rating: (Math.random() * 1 + 4).toFixed(1),
          discount: Math.floor(Math.random() * 30) + 10,
          isFeatured: Math.random() > 0.7
        }));


        
        setBrands(formattedBrands);
        setFilteredBrands(formattedBrands);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.error("Error fetching brands:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 404) {
        setError("Brands endpoint not found at /ecommerce/public/brands/");
      } else if (err.response?.status === 500) {
        setError("Server error. Please check backend logs.");
      } else if (err.response?.data) {
        setError(`API Error: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        setError("Cannot connect to server. Is backend running on https://api.initcart.in?");
      } else {
        setError(`Failed to load brands: ${err.message}`);
      }

      setBrands([]);
      setFilteredBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, brands]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const getBrandDisplay = (brand) => {
    if (brand.logo) {
      return (
        <img
          src={brand.logo}
          alt={brand.name}
          className="w-16 h-16 object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = `
              <div class="w-16 h-16 flex items-center justify-center text-2xl">
                ${getFallbackIcon(brand.name)}
              </div>
            `;
          }}
        />
      );
    }

    return (
      <div className="w-16 h-16 flex items-center justify-center text-2xl">
        {getFallbackIcon(brand.name)}
      </div>
    );
  };

  const getFallbackIcon = (brandName) => {
    const iconMap = {
      "nike": "👟",
      "adidas": "⚡",
      "puma": "🐆",
      "reebok": "🔥",
      "apple": "🍎",
      "samsung": "📱",
      "sony": "🎮",
      "lg": "📺",
      "dell": "💻",
      "hp": "🖨️",
    };

    const nameLower = brandName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (nameLower.includes(key)) {
        return icon;
      }
    }

    return "🏷️";
  };

  if (isMobile) {
    return <MobileBrandListPage />;
  }

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Brands</h2>
            <div className="w-64 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4">
                <div className="h-2 bg-gray-200 rounded mb-4"></div>
                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-3 animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                <div className="w-16 h-3 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white py-8">
      {/* Header Spacer - Matches Header component */}
      <div style={{ height: 35 }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section - Matches Header alignment */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Brands</h2>
          
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
              <button
                onClick={fetchBrands}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 inline-flex items-center gap-2"
              >
                <FiRefreshCw className="h-4 w-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Brands Grid */}
        {filteredBrands.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="text-5xl mb-4">🏭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {brands.length === 0 ? "No Brands Available" : "No Brands Found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {brands.length === 0
                ? "There are no brands available at the moment."
                : `No brands found matching "${searchTerm}".`
              }
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchBrands}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <FiRefreshCw className="h-4 w-4" />
                Refresh
              </button>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 inline-flex items-center gap-2"
                >
                  <FiX className="h-4 w-4" />
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
              {currentBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-blue-200 group"

                >
                  {/* Top Blue Bar */}
                  <div className="h-1.5 bg-blue-600"></div>
                  
                  {/* Content */}
                  <div className="p-4">
                    {/* Logo */}
                    <div className="flex justify-center mb-3">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100 flex items-center justify-center group-hover:shadow-sm transition-shadow">
                        {getBrandDisplay(brand)}
                      </div>
                    </div>
                    
                    {/* Brand Name */}
                    <h3 className="font-semibold text-gray-900 text-center text-xs mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {brand.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-[10px] text-gray-500 text-center mb-3 line-clamp-2">
                      {brand.description}
                    </p>
                    
                    {/* Stats Row */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex flex-col items-center">
                        <div className="text-blue-600 font-bold text-xs">{brand.product_count}</div>
                        <div className="text-gray-500 text-[9px]">Products</div>
                      </div>
                      
                      <div className="h-5 w-px bg-gray-200"></div>
                      
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5">
                          <FiStar className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="font-bold text-gray-900 text-xs">{brand.rating}</span>
                        </div>
                        <div className="text-gray-500 text-[9px]">Rating</div>
                      </div>
                    </div>
                    
                    {/* Shop Button */}
<Link to={`/brand-products/?brand=${brand.id}`}>
  <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-xs rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-sm hover:shadow-md inline-flex items-center justify-center gap-1.5">
    <FiShoppingBag className="h-3 w-3" />
    Shop Now
  </button>
</Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded-md inline-flex items-center gap-1 text-sm ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
                    }`}
                  >
                    <FiChevronLeft className="h-3 w-3" />
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNumber = i + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`px-3 py-1.5 rounded-md text-sm ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-1 text-gray-500 text-sm">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 rounded-md inline-flex items-center gap-1 text-sm ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 shadow-sm'
                    }`}
                  >
                    Next
                    <FiChevronRight className="h-3 w-3" />
                  </button>
                </div>
                
                {/* Page Info */}
                <div className="text-center text-xs text-gray-500 mt-4">
                  Page {currentPage} of {totalPages} • Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBrands.length)} of {filteredBrands.length} brands
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrandList; 