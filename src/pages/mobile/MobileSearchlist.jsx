// ecommerce/frontend/src/pages/mobile/MobileSearchlistPage.jsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { publicAxios, axiosInstance } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  FiArrowLeft,
  FiFilter,
  FiSearch,
  FiX,
  FiStar,
  FiShoppingBag,
  FiEye,
  FiTag,
  FiChevronDown,
  FiChevronUp,
  FiSliders,
  FiPackage,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiCheck,
  FiZap
} from "react-icons/fi";

// ─── Font Tokens (Same as other mobile pages) ──────────────────────────────
const F = {
  pageTitle: { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle: { fontSize: 14, fontWeight: 600 },
  cardSub: { fontSize: 11, fontWeight: 400 },
  badge: { fontSize: 10, fontWeight: 600 },
  pill: { fontSize: 11, fontWeight: 600 },
  statNum: { fontSize: 13, fontWeight: 700 },
  statLabel: { fontSize: 9, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLetter: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 },
  emptyTitle: { fontSize: 15, fontWeight: 700 },
  emptySubtitle: { fontSize: 12, fontWeight: 400 },
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
          onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-auto"
          style={{ zIndex: 2 }}
        />
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={STEP}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
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
              value={minInput}
              onChange={(e) => {
                setMinInput(e.target.value);
                const val = Number(e.target.value);
                if (!isNaN(val)) setMinPrice(Math.min(val, maxPrice));
              }}
              onBlur={() => setMinPrice(Math.min(Number(minInput) || 0, maxPrice))}
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
              value={maxInput}
              onChange={(e) => {
                setMaxInput(e.target.value);
                const val = Number(e.target.value);
                if (!isNaN(val)) setMaxPrice(Math.max(val, minPrice));
              }}
              onBlur={() => setMaxPrice(Math.max(Number(maxInput) || 0, minPrice))}
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

// Product Card Component
const MobileProductCard = ({ product, onAddToCart, onViewDetails, hasCoupons, onViewCoupons }) => {
  const [imgError, setImgError] = useState(false);

  const getImageUrl = (product) => {
    let image = product?.stocks?.[0]?.variant_image || product?.main_image || product?.thumbnail_image;
    if (!image) return "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image";
    if (image.startsWith("http")) return image;
    const cleanPath = image.replace(/^\/+/, "");
    return `https://api.initcart.in/${cleanPath}`;
  };

  const getProductPrice = () => {
    if (product.stocks && product.stocks.length > 0) {
      const stock = product.stocks[0];
      return stock.final_price > 0 ? stock.final_price : stock.selling_price;
    }
    return product.price || 0;
  };

  const getOldPrice = () => {
    if (product.stocks && product.stocks.length > 0) return product.stocks[0].mrp || 0;
    return product.old_price || 0;
  };

  const price = parseFloat(getProductPrice());
  const oldPrice = parseFloat(getOldPrice());
  const discount = oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });

    useEffect(() => {
    publicAxios.get("/api/all-review/", { 
      params: { model: "product", object_id: product.id } 
    })
    .then(res => {
      setReviewStats({
        avg: res.data.average_rating || 0,
        count: res.data.reviews?.length || 0
      });
    })
    .catch(() => {});
  }, [product.id]);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm active:scale-[0.98] transition-all duration-150 cursor-pointer">
      <div className="relative bg-gray-50">
        <div className="aspect-square p-2">
          <img
            src={getImageUrl(product)}
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
        {hasCoupons && (
          <div className="absolute top-0 right-0">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">
              <FiZap size={8} className="inline mr-0.5" /> OFFER
            </div>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug min-h-[2.5em]">
          {product.product_name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
  <StarRating rating={Math.round(reviewStats.avg) || 0} />
  <span className="text-[9px] text-gray-400">({reviewStats.count})</span>
</div>
     
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-[14px] font-bold text-gray-900">₹{price.toFixed(0)}</span>
          {oldPrice > price && (
            <span className="text-[10px] text-gray-400 line-through">₹{oldPrice.toFixed(0)}</span>
          )}
        </div>
        {hasCoupons && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewCoupons(product); }}
            className="mt-2 w-full py-1.5 bg-blue-50 rounded-lg text-[10px] font-medium text-blue-600 flex items-center justify-center gap-1 active:bg-blue-100"
          >
            <FiTag size={10} /> View Offers
          </button>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
            className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 active:bg-blue-700"
          >
            <FiShoppingBag size={12} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onViewDetails(product); }}
            className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 active:bg-gray-200"
          >
            <FiEye size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Filter Bottom Sheet
const FilterBottomSheet = ({ isOpen, onClose, filters, onApply, onClear }) => {
  const [activeTab, setActiveTab] = useState("price");
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice);
  const [localCategories, setLocalCategories] = useState([...filters.selectedCategories]);
  const [localBrands, setLocalBrands] = useState([...filters.selectedBrands]);
  const [localConditions, setLocalConditions] = useState([...filters.selectedConditions]);

  useEffect(() => {
    if (isOpen) {
      setLocalMinPrice(filters.minPrice);
      setLocalMaxPrice(filters.maxPrice);
      setLocalCategories([...filters.selectedCategories]);
      setLocalBrands([...filters.selectedBrands]);
      setLocalConditions([...filters.selectedConditions]);
    }
  }, [isOpen, filters]);

  const tabs = [
    { id: "price", label: "Price" },
    { id: "category", label: "Category" },
    { id: "brand", label: "Brand" },
    { id: "condition", label: "Condition" },
  ];

  const activeCount = (localMinPrice > 0 ? 1 : 0) + (localMaxPrice < MAX_PRICE ? 1 : 0) + localCategories.length + localBrands.length + localConditions.length;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slideUp">
        {/* Header */}
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

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-[11px] font-semibold whitespace-nowrap transition-all ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Price Tab */}
          {activeTab === "price" && (
            <PriceRangeFilter
              minPrice={localMinPrice}
              maxPrice={localMaxPrice}
              setMinPrice={setLocalMinPrice}
              setMaxPrice={setLocalMaxPrice}
            />
          )}

          {/* Category Tab */}
          {activeTab === "category" && filters.categories.length > 0 && (
            <div className="space-y-2">
              {filters.categories.map(cat => {
                const isChecked = localCategories.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between py-2 cursor-pointer active:bg-gray-50 rounded-lg px-2"
                    onClick={() => {
                      if (isChecked) {
                        setLocalCategories(localCategories.filter(id => id !== cat.id));
                      } else {
                        setLocalCategories([...localCategories, cat.id]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                        {isChecked && <FiCheck size={12} className="text-white" />}
                      </div>
                      <span className={`text-[13px] ${isChecked ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">{cat.product_count || 0}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Brand Tab */}
          {activeTab === "brand" && filters.brands.length > 0 && (
            <div className="space-y-2">
              {filters.brands.map(brand => {
                const isChecked = localBrands.includes(brand.id);
                return (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between py-2 cursor-pointer active:bg-gray-50 rounded-lg px-2"
                    onClick={() => {
                      if (isChecked) {
                        setLocalBrands(localBrands.filter(id => id !== brand.id));
                      } else {
                        setLocalBrands([...localBrands, brand.id]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                        {isChecked && <FiCheck size={12} className="text-white" />}
                      </div>
                      <span className={`text-[13px] ${isChecked ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                        {brand.brand_name}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">{brand.product_count || 0}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Condition Tab */}
          {activeTab === "condition" && (
            <div className="space-y-2">
              {["New", "Used", "Refurbished", "Like New"].map(cond => {
                const isChecked = localConditions.includes(cond.toLowerCase());
                return (
                  <div
                    key={cond}
                    className="flex items-center justify-between py-2 cursor-pointer active:bg-gray-50 rounded-lg px-2"
                    onClick={() => {
                      if (isChecked) {
                        setLocalConditions(localConditions.filter(c => c !== cond.toLowerCase()));
                      } else {
                        setLocalConditions([...localConditions, cond.toLowerCase()]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                        {isChecked && <FiCheck size={12} className="text-white" />}
                      </div>
                      <span className={`text-[13px] ${isChecked ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                        {cond}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <button
            onClick={() => {
              onClear();
              setLocalMinPrice(0);
              setLocalMaxPrice(MAX_PRICE);
              setLocalCategories([]);
              setLocalBrands([]);
              setLocalConditions([]);
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
                selectedCategories: localCategories,
                selectedBrands: localBrands,
                selectedConditions: localConditions
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

// Sort Bottom Sheet
const SortBottomSheet = ({ isOpen, onClose, sortBy, onSortChange }) => {
  const options = [
    { value: "", label: "Default" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "rating_desc", label: "Rating: High to Low" },
    { value: "newest", label: "Newest First" },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl animate-slideUp">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />
        <p className="text-center text-[12px] font-bold text-gray-800 mb-3">Sort By</p>
        <div className="divide-y divide-gray-100">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onSortChange(opt.value); onClose(); }}
              className={`w-full px-5 py-3 text-left text-[12px] font-medium flex items-center justify-between transition ${sortBy === opt.value ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}
            >
              {opt.label}
              {sortBy === opt.value && <FiCheck size={14} className="text-blue-600" />}
            </button>
          ))}
        </div>
        <div className="h-6" />
      </div>
    </>
  );
};

// Main Component
const MobileSearchlistPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const keywords = new URLSearchParams(location.search).get("keywords") || "";

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(keywords);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [productCoupons, setProductCoupons] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kw = params.get("keywords") || "";
    setSearchTerm(kw);

    const conditions = ["new", "used", "refurbished", "like new"];
    if (conditions.includes(kw.toLowerCase())) {
      setSelectedConditions([kw.toLowerCase()]);
    }
  }, [location.search]);

  useEffect(() => {
    fetchFilters();
    if (keywords) fetchProducts(keywords);
    else if (selectedConditions.length > 0 || sortBy) fetchProductsByCondition();
    else setLoading(false);
  }, []);

  // Hide bottom navigation
  useEffect(() => {
    document.body.classList.add('search-page');
    const style = document.createElement('style');
    style.id = 'search-page-hide-nav';
    style.textContent = `
      .fixed.bottom-0.left-0.right-0.z-\\[100\\], .md\\:hidden.fixed.bottom-0 { display: none !important; }
      @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .animate-slideUp { animation: slideUp 0.3s ease-out; }
      .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    `;
    document.head.appendChild(style);
    return () => {
      document.body.classList.remove('search-page');
      const styleEl = document.getElementById('search-page-hide-nav');
      if (styleEl) styleEl.remove();
    };
  }, []);

  const fetchFilters = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        publicAxios.get("ecommerce/public/categories/"),
        publicAxios.get("ecommerce/public/brands/")
      ]);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (brandsRes.data) setBrands(brandsRes.data);
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };

  const fetchProducts = async (keyword) => {
    try {
      setLoading(true);
      let productsArray = [];

      const productResponse = await publicAxios.get(`/ecommerce/public/search-product/?keywords=${encodeURIComponent(keyword)}`);
      productsArray = productResponse.data.products || productResponse.data || [];

      const formattedProducts = productsArray.map(product => {
        const stock = product.stocks?.[0];
        const fixImageUrl = (imgPath) => {
          if (!imgPath) return null;
          if (imgPath.startsWith('http')) return imgPath;
          const cleanPath = imgPath.replace(/^\/+/, '');
          return `https://api.initcart.in/${cleanPath}`;
        };

        return {
          ...product,
          price: stock?.final_price || stock?.selling_price || product.price || 0,
          old_price: stock?.mrp || product.old_price || 0,
          main_image: fixImageUrl(product.main_image),
          vendor_details: {
            id: product.vendor_details?.id || product.vendor,
            business_name: product.vendor_details?.business_name || "Vendor"
          },
          stocks: product.stocks || []
        };
      });

      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCondition = async () => {
    try {
      setLoading(true);
      const condParam = selectedConditions.join(",");
      const sortParam = sortBy || "";
      let url = `/ecommerce/public/products-by-condition/?`;
      if (condParam) url += `condition=${condParam}&`;
      if (sortParam) url += `sort=${sortParam}`;

      const res = await publicAxios.get(url);
      const formatted = res.data.map(p => {
        const stock = p.stocks?.[0];
        const fixImageUrl = (imgPath) => {
          if (!imgPath) return null;
          if (imgPath.startsWith('http')) return imgPath;
          const cleanPath = imgPath.replace(/^\/+/, '');
          return `https://api.initcart.in/${cleanPath}`;
        };
        return {
          ...p,
          price: stock?.final_price || stock?.selling_price || 0,
          main_image: fixImageUrl(p.main_image),
          vendor_details: p.vendor_details || { business_name: "Vendor" },
          stocks: p.stocks || []
        };
      });
      setProducts(formatted);
      setFilteredProducts(formatted);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!isAuthenticated()) {
      addToast('Please login to add items to cart', 'warning');
      navigate('/customer/login');
      return;
    }
    const stockId = product.stocks?.[0]?.id;
    if (!stockId) { addToast('Stock not available', 'error'); return; }
    try {
      const response = await axiosInstance.post('api/public/cart/', { product_stock: stockId, quantity: 1 });
      if (response.data.success) addToast('Added to cart!', 'success');
    } catch (err) {
      addToast('Failed to add to cart', 'error');
    }
  };

  const viewProductDetails = (product) => navigate(`/product/${product.id}`);
  const viewCoupons = (product) => navigate(`/product/${product.id}?showCoupons=true`);

  const applyFilters = () => {
    let filtered = [...products];

    filtered = filtered.filter(p => {
      let price = p.price || 0;
      return price >= minPrice && price <= maxPrice;
    });

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => p.category && selectedCategories.includes(p.category));
    }

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => p.brand && selectedBrands.includes(p.brand));
    }

    if (selectedConditions.length > 0) {
      filtered = filtered.filter(p => selectedConditions.includes((p.product_condition || "New").toLowerCase()));
    }

    if (sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating_desc") filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === "newest") filtered.sort((a, b) => b.id - a.id);

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [products, minPrice, maxPrice, selectedCategories, selectedBrands, selectedConditions, sortBy]);

  const clearAllFilters = () => {
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedConditions([]);
    setSortBy("");
    if (keywords) fetchProducts(keywords);
    else fetchProductsByCondition();
  };

  const activeFilterCount = (minPrice > 0 ? 1 : 0) + (maxPrice < MAX_PRICE ? 1 : 0) + selectedCategories.length + selectedBrands.length + selectedConditions.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex-1 h-5 bg-gray-200 rounded animate-pulse w-32" />
        </div>
        <div className="p-4">
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse mb-4" />
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

  const sortLabels = {
    "": "Default",
    price_asc: "Price ↑",
    price_desc: "Price ↓",
    rating_desc: "Top Rated",
    newest: "Newest"
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Sticky Header with Back Button */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200">
            <FiArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-[16px] font-bold text-gray-900">Search Results</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">{filteredProducts.length} products found</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-[13px] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* Filter and Sort Row */}
        <div className="px-4 pb-3 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowFilters(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${activeFilterCount > 0 ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
          >
            <FiFilter size={14} className={activeFilterCount > 0 ? 'text-white' : 'text-gray-700'} />
            <span className={`text-[11px] font-medium ${activeFilterCount > 0 ? 'text-white' : 'text-gray-700'}`}>Filter</span>
            {activeFilterCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">{activeFilterCount}</span>
            )}
          </button>

          <button
            onClick={() => setShowSortSheet(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white"
          >
            <span className="text-[11px] font-medium text-gray-700">{sortLabels[sortBy]}</span>
            <FiChevronDown size={12} className="text-gray-500" />
          </button>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5 border-b border-gray-100">
            {(minPrice > 0 || maxPrice < MAX_PRICE) && (
              <span className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 shrink-0">
                <span className="text-[9px] text-gray-700">₹{minPrice} - {maxPrice === MAX_PRICE ? 'Any' : `₹${maxPrice}`}</span>
                <button onClick={() => { setMinPrice(0); setMaxPrice(MAX_PRICE); }}><FiX size={9} /></button>
              </span>
            )}
            {selectedCategories.slice(0, 2).map(catId => {
              const cat = categories.find(c => c.id === catId);
              return cat && (
                <span key={catId} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 shrink-0">
                  <span className="text-[9px] text-gray-700">{cat.name}</span>
                  <button onClick={() => setSelectedCategories(prev => prev.filter(id => id !== catId))}><FiX size={9} /></button>
                </span>
              );
            })}
            {selectedCategories.length > 2 && (
              <span className="text-[9px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full">+{selectedCategories.length - 2}</span>
            )}
            {selectedBrands.slice(0, 2).map(brandId => {
              const brand = brands.find(b => b.id === brandId);
              return brand && (
                <span key={brandId} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 shrink-0">
                  <span className="text-[9px] text-gray-700">{brand.brand_name}</span>
                  <button onClick={() => setSelectedBrands(prev => prev.filter(id => id !== brandId))}><FiX size={9} /></button>
                </span>
              );
            })}
            {selectedBrands.length > 2 && (
              <span className="text-[9px] bg-gray-100 text-gray-700 px-2 py-1 rounded-full">+{selectedBrands.length - 2}</span>
            )}
            {selectedConditions.length > 0 && (
              <span className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 shrink-0">
                <span className="text-[9px] text-gray-700">{selectedConditions[0].replace("_", " ")}</span>
                <button onClick={() => setSelectedConditions([])}><FiX size={9} /></button>
              </span>
            )}
            <button onClick={clearAllFilters} className="text-[9px] text-blue-600 font-medium">Clear All</button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiSearch size={28} className="text-gray-400" />
            </div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-1">No Products Found</h3>
            <p className="text-[11px] text-gray-500 max-w-xs">
              Try adjusting your search or filters
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
              <MobileProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onViewDetails={viewProductDetails}
                onViewCoupons={viewCoupons}
                hasCoupons={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={{
          minPrice, maxPrice,
          selectedCategories, selectedBrands, selectedConditions,
          categories, brands
        }}
        onApply={(newFilters) => {
          setMinPrice(newFilters.minPrice);
          setMaxPrice(newFilters.maxPrice);
          setSelectedCategories(newFilters.selectedCategories);
          setSelectedBrands(newFilters.selectedBrands);
          setSelectedConditions(newFilters.selectedConditions);
        }}
        onClear={clearAllFilters}
      />

      {/* Sort Bottom Sheet */}
      <SortBottomSheet
        isOpen={showSortSheet}
        onClose={() => setShowSortSheet(false)}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
    </div>
  );
};

export default MobileSearchlistPage;