// ecommerce/frontend/src/pages/mobile/MobileBrandProductsPage.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { publicAxios } from "../../api/axios";
import { 
  FiArrowLeft, 
  FiFilter, 
  FiStar, 
  FiShoppingBag,
  FiX,
  FiCheck,
  FiSliders,
  FiPackage,
  FiClock,
  FiTrendingUp,
  FiAward
} from "react-icons/fi";

// ─── Font Tokens (Same as other mobile pages) ──────────────────────────────
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle:    { fontSize: 14, fontWeight: 600 },
  cardSub:      { fontSize: 11, fontWeight: 400 },
  badge:        { fontSize: 10, fontWeight: 600 },
  pill:         { fontSize: 11, fontWeight: 600 },
  statNum:      { fontSize: 13, fontWeight: 700 },
  statLabel:    { fontSize:  9, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLetter:{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

const MIN_PRICE = 0;
const MAX_PRICE = 200000;

// Star Rating Component
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        width="10"
        height="10"
        viewBox="0 0 20 20"
        fill={star <= Math.round(rating) ? "#F59E0B" : "none"}
        stroke={star <= Math.round(rating) ? "#F59E0B" : "#D1D5DB"}
        strokeWidth="1.5"
      >
        <path
          fillRule="evenodd"
          d="M10.868 2.884c.325-.795 1.48-.795 1.805 0l1.931 4.707 5.176.425c.801.066 1.129 1.055.518 1.574l-3.922 3.23.957 5.063c.15.795-.658 1.455-1.378 1.014L10 16.03l-4.717 2.842c-.72.441-1.528-.219-1.378-1.014l.957-5.063-3.922-3.23c-.611-.519-.283-1.508.518-1.574l5.176-.425 1.931-4.707z"
          clipRule="evenodd"
        />
      </svg>
    ))}
  </div>
);

// Price Range Filter Component
const PriceRangeFilter = ({ minPrice, maxPrice, setMinPrice, setMaxPrice }) => {
  const STEP = 100;
  const [minInput, setMinInput] = useState(minPrice.toString());
  const [maxInput, setMaxInput] = useState(maxPrice.toString());

  useEffect(() => {
    setMinInput(minPrice.toString());
  }, [minPrice]);

  useEffect(() => {
    setMaxInput(maxPrice.toString());
  }, [maxPrice]);

  const getPercentage = (value) => ((value - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  const handleMinChange = (e) => {
    const value = Number(e.target.value);
    if (value <= maxPrice) setMinPrice(value);
  };

  const handleMaxChange = (e) => {
    const value = Number(e.target.value);
    if (value >= minPrice) setMaxPrice(value);
  };

  return (
    <div className="py-2">
      <div className="relative h-2 bg-gray-200 rounded-full mb-6">
        <div 
          className="absolute h-2 bg-blue-500 rounded-full"
          style={{ left: `${getPercentage(minPrice)}%`, right: `${100 - getPercentage(maxPrice)}%` }}
        />
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={STEP}
          value={minPrice}
          onChange={handleMinChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto"
          style={{ zIndex: 2 }}
        />
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={STEP}
          value={maxPrice}
          onChange={handleMaxChange}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto"
          style={{ zIndex: 2 }}
        />
        <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md -top-1.5 pointer-events-none" style={{ left: `calc(${getPercentage(minPrice)}% - 10px)` }} />
        <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md -top-1.5 pointer-events-none" style={{ left: `calc(${getPercentage(maxPrice)}% - 10px)` }} />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 block mb-1">Min Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl py-2 pl-6 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 block mb-1">Max Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
            <input
              type="number"
              value={maxPrice === MAX_PRICE ? '' : maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : MAX_PRICE)}
              placeholder="Any"
              className="w-full border border-gray-200 rounded-xl py-2 pl-6 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: transparent;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

// Filter Bottom Sheet - FIXED CHECKBOXES
const FilterBottomSheet = ({ isOpen, onClose, filters, onApply, onClear }) => {
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice);
  const [localCategories, setLocalCategories] = useState([...filters.selectedCategories]);

  useEffect(() => {
    if (isOpen) {
      setLocalMinPrice(filters.minPrice);
      setLocalMaxPrice(filters.maxPrice);
      setLocalCategories([...filters.selectedCategories]);
    }
  }, [isOpen, filters]);

  const activeCount = (localMinPrice > 0 ? 1 : 0) + (localMaxPrice < MAX_PRICE ? 1 : 0) + localCategories.length;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col animate-slideUp">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FiSliders size={16} className="text-blue-600" />
            <h3 className="text-[16px] font-bold text-gray-800">Filters</h3>
            {activeCount > 0 && (
              <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{activeCount}</span>
              </span>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <FiX size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Price Section */}
          <div>
            <h4 className="text-[13px] font-semibold text-gray-800 mb-3">Price Range</h4>
            <PriceRangeFilter
              minPrice={localMinPrice}
              maxPrice={localMaxPrice}
              setMinPrice={setLocalMinPrice}
              setMaxPrice={setLocalMaxPrice}
            />
          </div>

          {/* Categories Section - FIXED ✅ */}
          {filters.categories.length > 0 && (
            <div>
              <h4 className="text-[13px] font-semibold text-gray-800 mb-3">Categories</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filters.categories.map(cat => {
                  const isChecked = localCategories.includes(cat.id.toString());
                  return (
                    <div 
                      key={cat.id} 
                      className="flex items-center justify-between py-2.5 cursor-pointer active:bg-gray-50 rounded-lg px-2"
                      onClick={() => {
                        if (isChecked) {
                          setLocalCategories(localCategories.filter(id => id !== cat.id.toString()));
                        } else {
                          setLocalCategories([...localCategories, cat.id.toString()]);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}
                        >
                          {isChecked && <FiCheck size={12} className="text-white" />}
                        </div>
                        <span className={`text-[13px] ${isChecked ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                          {cat.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">{cat.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t flex gap-3">
          <button 
            onClick={() => { 
              onClear(); 
              setLocalMinPrice(0); 
              setLocalMaxPrice(MAX_PRICE); 
              setLocalCategories([]); 
            }} 
            className="flex-1 py-3 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-700 active:bg-gray-50"
          >
            Reset All
          </button>
          <button 
            onClick={() => { 
              onApply({ 
                minPrice: localMinPrice, 
                maxPrice: localMaxPrice, 
                selectedCategories: localCategories 
              }); 
              onClose(); 
            }} 
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-[13px] font-semibold active:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

// Product Card Component
const MobileProductCard = ({ product }) => {
  const [imgError, setImgError] = useState(false);

  const getImageUrl = (image) => {
    if (!image) return "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image";
    if (image.startsWith('http')) return image;
    if (image.startsWith('/media/')) return `https://api.initcart.in${image}`;
    return `https://api.initcart.in/media/${image}`;
  };

  const getProductPrice = () => {
    if (product.stocks && product.stocks.length > 0) {
      const stock = product.stocks[0];
      return stock.final_price > 0 ? stock.final_price : stock.selling_price;
    }
    if (product.min_price && product.min_price > 0) return product.min_price;
    return product.price || 0;
  };

  const getOldPrice = () => {
    if (product.mrp) return product.mrp;
    if (product.old_price) return product.old_price;
    if (product.stocks?.[0]?.mrp) return product.stocks[0].mrp;
    return 0;
  };

  const price = parseFloat(getProductPrice());
  const oldPrice = parseFloat(getOldPrice());
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const mainImage = product.main_image || product.thumbnail_image || (product.stocks?.[0]?.variant_image);

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm active:scale-[0.98] transition-all duration-150">
        <div className="relative bg-gray-50">
          <div className="aspect-square p-2">
            <img
              src={getImageUrl(mainImage)}
              alt={product.product_name}
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          </div>
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
              {discount}% OFF
            </div>
          )}
        </div>
        <div className="p-2.5">
          <h3 className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.5em]">
            {product.product_name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <StarRating rating={product.rating || 4} />
            <span className="text-[9px] text-gray-400">({product.review_count || 0})</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-[14px] font-bold text-gray-900">₹{price.toFixed(0)}</span>
            {oldPrice > price && (
              <span className="text-[10px] text-gray-400 line-through">₹{oldPrice.toFixed(0)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// Main Component
const MobileBrandProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const brandId = queryParams.get("brand");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brandInfo, setBrandInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const brandsResponse = await publicAxios.get("/ecommerce/public/brands/");
        const allBrands = Array.isArray(brandsResponse.data) ? brandsResponse.data : [];
        const brand = allBrands.find(b => b.id == brandId);
        if (brand) setBrandInfo(brand);

        const productsResponse = await publicAxios.get("/ecommerce/public/category-products/", {
          params: { brand: brandId, status: "approved" }
        });
        
        let productsData = [];
        if (Array.isArray(productsResponse.data)) productsData = productsResponse.data;
        else if (productsResponse.data?.results) productsData = productsResponse.data.results;
        else if (productsResponse.data) productsData = [productsResponse.data];

        setProducts(productsData);
        setFilteredProducts(productsData);

        const categoryMap = {};
        productsData.forEach(product => {
          if (product.category_details) {
            const catId = product.category_details.id;
            if (!categoryMap[catId]) {
              categoryMap[catId] = {
                id: catId,
                name: product.category_details.name,
                count: 1
              };
            } else {
              categoryMap[catId].count++;
            }
          }
        });
        setCategories(Object.values(categoryMap));

      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    if (brandId) fetchData();
    else { setError("No brand selected"); setLoading(false); }
  }, [brandId]);

  useEffect(() => {
    document.body.classList.add('brand-page');
    const style = document.createElement('style');
    style.id = 'brand-page-hide-nav';
    style.textContent = `
      .fixed.bottom-0.left-0.right-0.z-\\[100\\],
      .md\\:hidden.fixed.bottom-0 {
        display: none !important;
      }
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-slideUp { animation: slideUp 0.3s ease-out; }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.body.classList.remove('brand-page');
      const styleEl = document.getElementById('brand-page-hide-nav');
      if (styleEl) styleEl.remove();
    };
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];
    
    filtered = filtered.filter(product => {
      let price = 0;
      if (product.stocks?.length > 0) {
        price = product.stocks[0].final_price > 0 ? product.stocks[0].final_price : product.stocks[0].selling_price;
      } else if (product.min_price) {
        price = product.min_price;
      }
      return price >= minPrice && price <= maxPrice;
    });

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        product.category_details && selectedCategories.includes(product.category_details.id.toString())
      );
    }

    setFilteredProducts(filtered);
  }, [products, minPrice, maxPrice, selectedCategories]);

  const clearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setSelectedCategories([]);
  };

  const activeFilterCount = (minPrice > 0 ? 1 : 0) + (maxPrice < MAX_PRICE ? 1 : 0) + selectedCategories.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 h-5 bg-gray-200 rounded animate-pulse w-32" />
        </div>
        <div className="p-4">
          <div className="h-32 bg-gray-200 rounded-xl animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-2 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg" />
                <div className="h-3 bg-gray-200 rounded mt-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mt-1" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPackage size={28} className="text-red-500" />
          </div>
          <h3 className="text-[15px] font-bold text-gray-800 mb-2">Error Loading Products</h3>
          <p className="text-[12px] text-gray-500 mb-6">{error}</p>
          <button onClick={() => navigate("/")} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200">
            <FiArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-[16px] font-bold text-gray-900">{brandInfo?.brand_name || "Brand Products"}</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">{filteredProducts.length} products</p>
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className={`relative w-9 h-9 rounded-full flex items-center justify-center active:scale-95 ${activeFilterCount > 0 ? 'bg-blue-600' : 'bg-gray-100'}`}
          >
            <FiFilter size={16} className={activeFilterCount > 0 ? 'text-white' : 'text-gray-700'} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
            {(minPrice > 0 || maxPrice < MAX_PRICE) && (
              <span className="flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1 shrink-0">
                <span className="text-[10px] text-gray-700">₹{minPrice} - ₹{maxPrice === MAX_PRICE ? 'Any' : maxPrice}</span>
                <button onClick={() => { setMinPrice(0); setMaxPrice(MAX_PRICE); }}><FiX size={10} /></button>
              </span>
            )}
            {selectedCategories.map(catId => {
              const cat = categories.find(c => c.id.toString() === catId);
              return cat && (
                <span key={catId} className="flex items-center gap-1 bg-gray-100 rounded-full px-2.5 py-1 shrink-0">
                  <span className="text-[10px] text-gray-700">{cat.name}</span>
                  <button onClick={() => setSelectedCategories(prev => prev.filter(id => id !== catId))}><FiX size={10} /></button>
                </span>
              );
            })}
            <button onClick={clearAllFilters} className="text-[10px] text-blue-600 font-medium shrink-0">Clear All</button>
          </div>
        )}
      </div>

      {/* Brand Header */}
      {brandInfo && (
        <div className="bg-white mx-4 mt-4 rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
              <img
                src={brandInfo.brand_logo_url || "https://placehold.co/100x100/f0f4f8/94a3b8?text=Brand"}
                alt={brandInfo.brand_name}
                className="w-full h-full object-contain"
                onError={(e) => { e.target.src = "https://placehold.co/100x100/f0f4f8/94a3b8?text=Brand"; }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-bold text-gray-900">{brandInfo.brand_name}</h2>
              <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">
                {brandInfo.description || "Explore premium products from this brand"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {brandInfo.product_count || filteredProducts.length} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiPackage size={28} className="text-gray-400" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-1">No Products Found</h3>
            <p className="text-[11px] text-gray-500 max-w-xs">
              {selectedCategories.length > 0 
                ? "No products available in selected categories."
                : "No products available for this brand with current filters."}
            </p>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-[12px] font-semibold">
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={{ minPrice, maxPrice, selectedCategories, categories }}
        onApply={(newFilters) => {
          setMinPrice(newFilters.minPrice);
          setMaxPrice(newFilters.maxPrice);
          setSelectedCategories(newFilters.selectedCategories);
        }}
        onClear={clearAllFilters}
      />

      {/* Benefits Section */}
      <div className="mt-4 bg-white mx-4 rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-[12px] font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FiAward className="w-4 h-4 text-yellow-500" /> Why shop with us?
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-[10px] text-gray-600">Best Prices</span>
          </div>
          <div className="flex items-center gap-2">
            <FiShoppingBag className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] text-gray-600">Authentic Products</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="w-3 h-3 text-orange-500" />
            <span className="text-[10px] text-gray-600">Quick Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <FiStar className="w-3 h-3 text-yellow-500" />
            <span className="text-[10px] text-gray-600">Trusted Brand</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileBrandProductsPage;