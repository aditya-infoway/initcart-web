import React, { useState, useEffect } from "react";
import { publicAxios } from "../api/axios";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories from API
const fetchCategories = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await publicAxios.get("ecommerce/public/categories/");



    if (response.data && Array.isArray(response.data)) {
      const formattedCategories = response.data.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon_url,  // ✅ Use icon_url for full URL
        description: category.description || "",
        status: category.status,
        product_count: category.product_count || 0  // ✅ Product count available
      }));

      setCategories(formattedCategories);
      setFilteredCategories(formattedCategories);
    }
  } catch (err) {
      console.error("❌ Error fetching categories:", err);

      if (err.response?.status === 404) {
        setError(`Categories endpoint not found (404). Please check backend routes.`);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Authentication required for categories API.");
      } else if (err.request) {
        setError("Cannot connect to server. Please check if backend is running.");
      } else {
        setError("Failed to load categories. Please try again.");
      }

      // Fallback to sample data if API fails
      loadSampleCategories();
    } finally {
      setLoading(false);
    }
  };

  // Sample categories data for fallback
  const loadSampleCategories = () => {
    const sampleCategories = [
      { id: 1, name: "Men's Fashion", icon: null },
      { id: 2, name: "Women's Fashion", icon: null },
      { id: 3, name: "Kid's Fashion", icon: null },
      { id: 4, name: "Health & Beauty", icon: null },
      { id: 5, name: "Home & Kitchen", icon: null },
      { id: 6, name: "Electronics", icon: null },
      { id: 7, name: "Sports & Outdoor", icon: null },
      { id: 8, name: "Books & Stationery", icon: null },
    ];

    setCategories(sampleCategories);
    setFilteredCategories(sampleCategories);
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {

      fetchCategories();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get category display with icon/image
  const getCategoryDisplay = (category) => {
    if (category.icon) {
      return (
        <div className="relative">
          <img
            src={category.icon}
            alt={category.name}
            className="w-12 h-12 object-contain rounded-lg mb-3"
            onError={(e) => {

              e.target.style.display = 'none';
              const fallback = document.getElementById(`fallback-${category.id}`);
              if (fallback) fallback.style.display = 'block';
            }}
          />
          <div 
            id={`fallback-${category.id}`}
            className="text-4xl mb-3 hidden"
            style={{display: 'none'}}
          >
            {getFallbackIcon(category.name)}
          </div>
        </div>
      );
    }

    // If no icon, show fallback emoji
    return (
      <div className="text-4xl mb-3">
        {getFallbackIcon(category.name)}
      </div>
    );
  };

  // Fallback icon function
  const getFallbackIcon = (categoryName) => {
    const iconMap = {
      "men": "👔",
      "women": "👗",
      "kid": "👕",
      "child": "👕",
      "health": "💄",
      "beauty": "💄",
      "pet": "🐾",
      "home": "🏠",
      "kitchen": "🏠",
      "baby": "🍼",
      "toddler": "🍼",
      "sports": "⚽",
      "outdoor": "⚽",
      "phone": "📱",
      "gadget": "📱",
      "electronic": "💻",
      "grocery": "🛒",
      "daily": "🛒",
      "music": "🎸",
      "instrument": "🎸",
      "gift": "🎁",
      "craft": "🎁",
      "auto": "🚗",
      "digital": "💿",
      "travel": "🧳",
      "luggage": "🧳",
      "book": "📚",
      "stationery": "📚",
      "fashion": "👗",
    };

    const nameLower = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (nameLower.includes(key)) {
        return icon;
      }
    }

    return "📦"; // Default icon
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold text-gray-800">CATEGORIES</h2>
              <p className="text-sm text-gray-500">Find your favorite categories</p>
            </div>
            <div className="w-full md:w-72 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {[...Array(12)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center text-center"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title + Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-800">CATEGORIES</h2>
            <p className="text-sm text-gray-500">
              Discover products by category {categories.length > 0 && `(${categories.length} categories)`}
            </p>
          </div>

          {/* Search */}
          <div className="flex items-center border rounded-lg bg-white px-3 py-2 w-full md:w-80 shadow-sm">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-700 text-sm font-medium">API Notice</span>
              </div>
              <button
                onClick={fetchCategories}
                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
              >
                Retry
              </button>
            </div>
            <p className="text-yellow-600 text-sm">{error}</p>
            <p className="text-yellow-500 text-xs mt-1">
              Showing sample data for demonstration.
            </p>
          </div>
        )}

        {/* Search Results Info */}
        {searchTerm && filteredCategories.length > 0 && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredCategories.length} of {categories.length} categories matching "{searchTerm}"
            <button
              onClick={() => setSearchTerm("")}
              className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {categories.length === 0 ? "No Categories Available" : "No Categories Found"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {categories.length === 0
                ? "There are no categories available at the moment. Please check back later."
                : `No categories found matching "${searchTerm}". Try a different search term.`
              }
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchCategories}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Try Again
              </button>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Clear Search for products and everything
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 flex flex-col items-center justify-center text-center cursor-pointer group border border-gray-100 hover:border-blue-200"
                  onClick={() => {

                    // Add navigation to category products page here
                    // Example: navigate(`/categories/${category.id}`);
                  }}
                >
                  {getCategoryDisplay(category)}
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </p>
                  
                  {/* Product Count Badge - if available */}
                  {category.product_count > 0 && (
                    <div className="mt-2 px-2 py-1 bg-gray-100 rounded-full">
                      <span className="text-xs text-gray-600">
                        {category.product_count} products
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Auto-refresh indicator */}
            <div className="flex flex-col items-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Categories auto-update every 30 seconds</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryList;