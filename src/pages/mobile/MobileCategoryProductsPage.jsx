import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { publicAxios } from "../../api/axios";
import { FiSearch, FiX, FiFilter, FiClock, FiShoppingBag, FiSliders, FiCheck, FiArrowLeft } from "react-icons/fi";

const FONTS = {
  pageTitle: "text-[16px] font-bold",
  pageSubtitle: "text-[11px] font-normal",
  searchInput: "text-[13px] font-normal",
  cardTitle: "text-[13px] font-semibold",
  cardSub: "text-[10px] font-normal",
  badge: "text-[10px] font-semibold",
  filterTitle: "text-[14px] font-semibold",
  filterItem: "text-[13px] font-normal",
  emptyTitle: "text-[15px] font-bold",
  emptySubtitle: "text-[12px] font-normal",
};

// Star Rating Component
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((star) => (
      <svg key={star} width="10" height="10" viewBox="0 0 20 20" fill={star <= rating ? "#F59E0B" : "none"} stroke={star <= rating ? "#F59E0B" : "#D1D5DB"} strokeWidth="1.5">
        <path fillRule="evenodd" d="M10.868 2.884c.325-.795 1.48-.795 1.805 0l1.931 4.707 5.176.425c.801.066 1.129 1.055.518 1.574l-3.922 3.23.957 5.063c.15.795-.658 1.455-1.378 1.014L10 16.03l-4.717 2.842c-.72.441-1.528-.219-1.378-1.014l.957-5.063-3.922-3.23c-.611-.519-.283-1.508.518-1.574l5.176-.425 1.931-4.707z" clipRule="evenodd" />
      </svg>
    ))}
  </div>
);

// Mobile Header
const MobileHeader = ({ title, subtitle, showBack = true }) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-100">
      <div className="px-3 py-2">
        <div className="flex items-center gap-2">
          {showBack && (
            <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center active:bg-gray-100">
              <FiArrowLeft className="w-4 h-4 text-gray-700" />
            </button>
          )}
          <div>
            <h1 className={`${FONTS.pageTitle} text-gray-900`}>{title}</h1>
            {subtitle && <p className={`${FONTS.pageSubtitle} text-gray-400`}>{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Card
const MobileProductCard = ({ product, onClick }) => {
  const getProductPrice = () => {
    if (product.is_in_campaign && product.campaign_price) return Number(product.campaign_price);
    if (product.stocks?.length > 0) {
      const stock = product.stocks[0];
      return stock.final_price > 0 ? Number(stock.final_price) : Number(stock.selling_price);
    }
    if (product.min_price) return Number(product.min_price);
    return 0;
  };

  const getOldPrice = () => {
    if (product.is_in_campaign && product.campaign_details?.original_price) return Number(product.campaign_details.original_price);
    if (product.stocks?.length > 0) return Number(product.stocks[0].mrp) || 0;
    return 0;
  };

  const getDiscount = () => {
    const current = getProductPrice();
    const old = getOldPrice();
    if (old > current && old > 0) return Math.round(((old - current) / old) * 100);
    return 0;
  };

  const getImageUrl = (image) => {
    if (!image) return "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image";
    if (image.startsWith('http')) return image;
    return `https://api.initcart.in${image.startsWith('/') ? '' : '/'}${image}`;
  };

  const price = getProductPrice();
  const oldPrice = getOldPrice();
  const discount = getDiscount();
  const mainImage = product.main_image || (product.stocks?.[0]?.variant_image) || product.thumbnail_image;

  return (
    <div onClick={onClick} className="cursor-pointer">
      <div className="bg-white rounded-xl border border-gray-100 active:scale-95 transition-all duration-150 overflow-hidden shadow-sm">
        <div className="relative bg-gray-50 p-2">
          <div className="h-28 w-full">
            <img src={getImageUrl(mainImage)} alt={product.product_name} className="w-full h-full object-contain" onError={(e) => e.target.src = "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image"} />
          </div>
          {discount > 0 && (
            <div className="absolute top-1 left-1">
              <span className="bg-red-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">{discount}% OFF</span>
            </div>
          )}
          {product.is_in_campaign && (
            <div className="absolute top-1 left-1">
              <span className="bg-blue-600 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">DEAL</span>
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="text-[12px] font-semibold text-gray-800 line-clamp-1">{product.product_name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <StarRating rating={product.rating || 4} />
            <span className="text-[9px] text-gray-400">({product.review_count || 0})</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[14px] font-bold text-gray-900">₹{price.toFixed(0)}</span>
            {oldPrice > price && <span className="text-[10px] text-gray-400 line-through">₹{oldPrice.toFixed(0)}</span>}
          </div>
          <button className="w-full mt-2 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 active:bg-blue-700">
            <FiShoppingBag className="w-3 h-3" /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

// Price Range Filter
const MobilePriceRangeFilter = ({ minPrice, maxPrice, setMinPrice, setMaxPrice }) => {
  const MIN_PRICE = 0;
  const MAX_PRICE = 1000000;

  const getPercentage = (value) => ((value - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;

  return (
    <div className="py-2">
      <div className="relative h-2 bg-gray-200 rounded-full mb-6">
        <div className="absolute h-2 bg-blue-500 rounded-full" style={{ left: `${getPercentage(minPrice)}%`, right: `${100 - getPercentage(maxPrice)}%` }} />
        <input type="range" min={MIN_PRICE} max={MAX_PRICE} step={500} value={minPrice} onChange={(e) => { const val = Number(e.target.value); if (val <= maxPrice) setMinPrice(val); }} className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto" style={{ zIndex: 2 }} />
        <input type="range" min={MIN_PRICE} max={MAX_PRICE} step={500} value={maxPrice} onChange={(e) => { const val = Number(e.target.value); if (val >= minPrice) setMaxPrice(val); }} className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto" style={{ zIndex: 2 }} />
        <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md -top-1.5 pointer-events-none" style={{ left: `calc(${getPercentage(minPrice)}% - 10px)` }} />
        <div className="absolute w-5 h-5 bg-white border-2 border-blue-500 rounded-full shadow-md -top-1.5 pointer-events-none" style={{ left: `calc(${getPercentage(maxPrice)}% - 10px)` }} />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 block mb-1">Min Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))} className="w-full pl-7 pr-3 py-2 bg-gray-50 rounded-lg text-[13px] border border-gray-100 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-gray-500 block mb-1">Max Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
            <input type="number" value={maxPrice === MAX_PRICE ? '' : maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : MAX_PRICE)} placeholder="Any" className="w-full pl-7 pr-3 py-2 bg-gray-50 rounded-lg text-[13px] border border-gray-100 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
      </div>
      <style>{`
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: transparent; cursor: pointer; }
        input[type=range]::-moz-range-thumb { width: 20px; height: 20px; background: transparent; cursor: pointer; }
      `}</style>
    </div>
  );
};

// Filter Sheet
const MobileFilterSheet = ({ isOpen, onClose, filters, onApply, onClear }) => {
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice);
  const [localBrands, setLocalBrands] = useState([...filters.selectedBrands]);

  useEffect(() => {
    setLocalMinPrice(filters.minPrice);
    setLocalMaxPrice(filters.maxPrice);
    setLocalBrands([...filters.selectedBrands]);
  }, [filters.minPrice, filters.maxPrice, filters.selectedBrands]);

  const activeFilterCount = (localMinPrice > 0 ? 1 : 0) + (localMaxPrice < 1000000 ? 1 : 0) + localBrands.length;

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl transform transition-transform duration-300 z-50 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className={`${FONTS.filterTitle} text-gray-900`}>Filters</h3>
            {activeFilterCount > 0 && <p className="text-[11px] text-blue-600 mt-0.5">{activeFilterCount} filters applied</p>}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <button onClick={() => { onClear(); setLocalMinPrice(0); setLocalMaxPrice(1000000); setLocalBrands([]); }} className="text-[12px] text-blue-600 font-medium">Clear All</button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><FiX className="w-4 h-4 text-gray-600" /></button>
          </div>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Price Section */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3"><FiSliders className="w-4 h-4 text-blue-600" /><h4 className={`${FONTS.filterTitle} text-gray-800`}>Price Range</h4></div>
            <MobilePriceRangeFilter minPrice={localMinPrice} maxPrice={localMaxPrice} setMinPrice={setLocalMinPrice} setMaxPrice={setLocalMaxPrice} />
          </div>
          {/* Brands Section */}
{/* Brands Section - CORRECTED */}
{filters.brands.length > 0 && (
  <div className="mb-5">
    <h4 className={`${FONTS.filterTitle} text-gray-800 mb-3`}>Brands</h4>
    <div className="space-y-2 max-h-52 overflow-y-auto">
      {filters.brands.map(brand => (
        <label 
          key={brand.id} 
          className="flex items-center justify-between py-2 px-1 rounded-lg active:bg-gray-50 cursor-pointer"
        >
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={localBrands.includes(brand.id.toString())}
              onChange={(e) => {
                if (e.target.checked) {
                  setLocalBrands([...localBrands, brand.id.toString()]);
                } else {
                  setLocalBrands(localBrands.filter(id => id !== brand.id.toString()));
                }
              }}
            />
            <span className={`${FONTS.filterItem} text-gray-700`}>{brand.name}</span>
          </div>
          <span className="text-[11px] text-gray-400">{brand.count || 0}</span>
        </label>
      ))}
    </div>
  </div>
)}
        </div>
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium active:bg-gray-200">Cancel</button>
          <button onClick={() => { onApply({ minPrice: localMinPrice, maxPrice: localMaxPrice, selectedBrands: localBrands }); onClose(); }} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-medium active:bg-blue-700">Apply Filters</button>
        </div>
      </div>
    </>
  );
};

// Applied Filters Chips
const AppliedFilters = ({ filters, onRemove, onClearAll }) => {
  const chips = [];
  if (filters.minPrice > 0) chips.push({ id: 'min-price', label: `Min: ₹${filters.minPrice}`, type: 'price' });
  if (filters.maxPrice < 1000000) chips.push({ id: 'max-price', label: `Max: ₹${filters.maxPrice}`, type: 'price' });
  filters.selectedBrands.forEach(brandId => {
    const brand = filters.brands.find(b => b.id.toString() === brandId);
    if (brand) chips.push({ id: brandId, label: brand.name, type: 'brand' });
  });
  if (chips.length === 0) return null;
  return (
    <div className="px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-gray-500">Applied Filters</span>
        <button onClick={onClearAll} className="text-[11px] text-blue-600 font-medium">Clear All</button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map(chip => (
          <div key={chip.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
            <span className="text-[11px] text-gray-700">{chip.label}</span>
            <button onClick={() => onRemove(chip)} className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-gray-300"><FiX className="w-2.5 h-2.5 text-gray-500" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ✅ MAIN COMPONENT
export default function MobileCategoryProductsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const categoryId = queryParams.get("category");
  const subcategoryId = queryParams.get("subcategory");
  const subsubcategoryId = queryParams.get("subsubcategory");

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pageTitle, setPageTitle] = useState("Products");
  
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [allBrands, setAllBrands] = useState([]);

  // Fetch products and category info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = { status: "approved" };
        if (categoryId) params.category = categoryId;
        if (subcategoryId) params.subcategory = subcategoryId;
        if (subsubcategoryId) params.subsubcategory = subsubcategoryId;

        // Fetch category info
        if (categoryId) {
          try {
            const catRes = await publicAxios.get("/ecommerce/public/categories/");
            const category = catRes.data?.find(c => c.id == categoryId);
            if (category) setPageTitle(category.name);
          } catch {}
        }
        if (subcategoryId) {
          try {
            const subRes = await publicAxios.get("/ecommerce/public/subcategories/");
            const subcategory = subRes.data?.find(s => s.id == subcategoryId);
            if (subcategory) setPageTitle(subcategory.name);
          } catch {}
        }
        if (subsubcategoryId) {
          try {
            const subsubRes = await publicAxios.get("/ecommerce/public/subsubcategories/");
            const subsubcategory = subsubRes.data?.find(ss => ss.id == subsubcategoryId);
            if (subsubcategory) setPageTitle(subsubcategory.name);
          } catch {}
        }

        // Fetch products
        const productsResponse = await publicAxios.get("/ecommerce/public/category-products/", { params });
        let productsData = [];
        if (Array.isArray(productsResponse.data)) productsData = productsResponse.data;
        else if (productsResponse.data?.results) productsData = productsResponse.data.results;
        setProducts(productsData);
        setFilteredProducts(productsData);

        // Fetch brands
        const brandsResponse = await publicAxios.get("/ecommerce/public/brands/");
        if (Array.isArray(brandsResponse.data)) setAllBrands(brandsResponse.data);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, subcategoryId, subsubcategoryId]);

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

  // ✅ FIXED: Apply all filters including BRANDS
  useEffect(() => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(product => {
      let price = 0;
      if (product.stocks?.length > 0) {
        price = product.stocks[0].final_price > 0 ? Number(product.stocks[0].final_price) : Number(product.stocks[0].selling_price);
      } else if (product.min_price) {
        price = Number(product.min_price);
      }
      return price >= minPrice && price <= maxPrice;
    });

    // ✅ FIXED: Brand filter - product.brand_details?.id check
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => {
        const productBrandId = product.brand_details?.id?.toString() || product.brand?.toString();
        return productBrandId && selectedBrands.includes(productBrandId);
      });
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.product_name?.toLowerCase().includes(term) ||
        product.brand_details?.brand_name?.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(filtered);
  }, [products, minPrice, maxPrice, selectedBrands, searchTerm]);

  // Get unique brands from products with counts
  const getUniqueBrandsFromProducts = () => {
    const brandMap = {};
    products.forEach(product => {
      const brandId = product.brand_details?.id || product.brand;
      const brandName = product.brand_details?.brand_name;
      if (brandId && brandName) {
        if (!brandMap[brandId]) {
          brandMap[brandId] = { id: brandId, name: brandName, count: 0 };
        }
        brandMap[brandId].count++;
      }
    });
    return Object.values(brandMap);
  };

  const handleRemoveFilter = (chip) => {
    if (chip.type === 'price') {
      if (chip.id === 'min-price') setMinPrice(0);
      if (chip.id === 'max-price') setMaxPrice(1000000);
    } else if (chip.type === 'brand') {
      setSelectedBrands(prev => prev.filter(id => id !== chip.id));
    }
  };

  const handleClearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(1000000);
    setSelectedBrands([]);
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="sticky top-0 bg-white border-b border-gray-100"><div className="px-3 py-2"><div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse"></div><div className="h-5 w-24 bg-gray-100 rounded animate-pulse"></div></div><div className="mt-2 h-10 bg-gray-100 rounded-lg animate-pulse"></div></div></div>
        <div className="px-3 py-2"><div className="grid grid-cols-2 gap-2">{[...Array(6)].map(i => (<div key={i} className="bg-gray-50 rounded-xl p-2 animate-pulse"><div className="h-28 bg-gray-200 rounded-lg mb-2"></div><div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div><div className="h-2 bg-gray-100 rounded w-1/2"></div></div>))}</div></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center"><div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3"><svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><h3 className={`${FONTS.emptyTitle} text-gray-800 mb-1`}>Oops!</h3><p className={`${FONTS.emptySubtitle} text-gray-400 mb-4`}>{error}</p><button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium">Try Again</button></div>
      </div>
    );
  }

  const uniqueBrands = getUniqueBrandsFromProducts();
  const filterState = { minPrice, maxPrice, selectedBrands, brands: uniqueBrands };

  return (
    <div className="min-h-screen bg-white pb-20">
      <MobileFilterSheet isOpen={showFilters} onClose={() => setShowFilters(false)} filters={filterState} onApply={(newFilters) => { setMinPrice(newFilters.minPrice); setMaxPrice(newFilters.maxPrice); setSelectedBrands(newFilters.selectedBrands); }} onClear={handleClearAllFilters} />
      <MobileHeader title={pageTitle} subtitle={`${filteredProducts.length} products`} showBack={true} />
      
      {/* Search and Filter Bar */}
      <div className="px-3 pt-2 pb-1">
        <div className="flex gap-2">
          <div className={`flex-1 transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-blue-500 rounded-xl' : ''}`}>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} className="w-full pl-9 pr-8 py-2.5 bg-gray-50 rounded-xl text-[14px] placeholder:text-gray-400 focus:outline-none" />
              {searchTerm && <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2"><FiX className="w-4 h-4 text-gray-400" /></button>}
            </div>
          </div>
          <button onClick={() => setShowFilters(true)} className="px-3 rounded-xl bg-gray-50 flex items-center justify-center gap-1.5 active:bg-gray-100">
            <FiFilter className="w-4 h-4 text-gray-700" />
            <span className="text-[13px] font-medium text-gray-700">Filter</span>
            {(minPrice > 0 || maxPrice < 1000000 || selectedBrands.length > 0) && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center">{(minPrice > 0 ? 1 : 0) + (maxPrice < 1000000 ? 1 : 0) + selectedBrands.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* Applied Filters Chips */}
      <AppliedFilters filters={filterState} onRemove={handleRemoveFilter} onClearAll={handleClearAllFilters} />

      {/* Products Grid */}
      <div className="px-3 py-2">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-3"><FiSearch className="w-8 h-8 text-gray-400" /></div>
            <h3 className={`${FONTS.emptyTitle} text-gray-800 mb-1`}>No products found</h3>
            <p className={`${FONTS.emptySubtitle} text-gray-400 text-center text-[12px]`}>Try adjusting your search or filters</p>
            <button onClick={handleClearAllFilters} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium">Clear All Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filteredProducts.map((product) => (
              <MobileProductCard key={product.id} product={product} onClick={() => navigate(`/product/${product.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}