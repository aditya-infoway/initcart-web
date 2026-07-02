import React, { useState, useEffect, useMemo, useRef } from "react";
import { publicAxios, axiosInstance } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  Filter, ShoppingCart, Eye, Tag, ChevronRight, Zap,
  Search, X, SlidersHorizontal, ChevronDown, ChevronUp,
  Star, Package, TrendingUp,
  ChevronLeft
} from "lucide-react";

// ─── Font Token System ────────────────────────────────────────────────────────
const T = {
  pageTitle: { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  searchInput: { fontSize: 13, fontWeight: 400 },
  cardTitle: { fontSize: 14, fontWeight: 600 },
  cardSub: { fontSize: 11, fontWeight: 400 },
  badge: { fontSize: 10, fontWeight: 600 },
  pill: { fontSize: 11, fontWeight: 600 },
  statNum: { fontSize: 13, fontWeight: 700 },
  statLabel: { fontSize: 9, fontWeight: 400, textTransform: "uppercase", letterSpacing: "0.05em" },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" },
  emptyTitle: { fontSize: 15, fontWeight: 700 },
  emptySubtitle: { fontSize: 12, fontWeight: 400 },
};

const MIN_PRICE = 0;
const MAX_PRICE = 200000;

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={10}
        fill={i < Math.round(rating) ? "#f59e0b" : "none"}
        stroke={i < Math.round(rating) ? "#f59e0b" : "#d1d5db"}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

// ─── Coupon Modal ─────────────────────────────────────────────────────────────
const CouponsModal = ({ product, coupons, onClose, onApplyCoupon }) => {
  if (!product || !coupons) return null;

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch { }
  };

  const gradientForType = (t) => {
    if (t === "percentage") return "from-blue-500 to-indigo-600";
    if (t === "flat") return "from-sky-500 to-blue-600";
    if (t === "free_shipping") return "from-emerald-500 to-green-600";
    return "from-gray-500 to-gray-700";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl w-full max-h-[88vh] flex flex-col shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <p style={T.pageTitle} className="text-gray-900">Offers & Coupons</p>
            <p style={T.pageSubtitle} className="text-gray-500 mt-0.5 line-clamp-1">{product.product_name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-gray-100 active:bg-gray-200">
            <X size={16} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {coupons.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <Tag size={24} className="text-gray-400" />
              </div>
              <p style={T.emptyTitle} className="text-gray-700">No offers available</p>
              <p style={T.emptySubtitle} className="text-gray-500 mt-1">Check back later for deals!</p>
            </div>
          ) : (
            <>
              {/* Pro tip */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <Zap size={14} className="text-amber-500 shrink-0" />
                <p style={T.cardSub} className="text-amber-800">Apply coupon at checkout for instant discount</p>
              </div>

              {coupons.map((coupon) => (
                <div key={coupon.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                  {/* Discount header */}
                  <div className={`bg-gradient-to-r ${gradientForType(coupon.coupon_type)} px-4 py-2 flex items-center justify-between`}>
                    <p style={{ ...T.badge, color: "white" }}>{coupon.discount_display} OFF</p>
                    <p style={{ ...T.badge, color: "rgba(255,255,255,0.85)" }}>{coupon.validity_display}</p>
                  </div>

                  <div className="p-3 space-y-2.5">
                    <div>
                      <p style={T.cardTitle} className="text-gray-900">{coupon.title}</p>
                      {coupon.description && (
                        <p style={T.cardSub} className="text-gray-500 mt-0.5">{coupon.description}</p>
                      )}
                    </div>

                    {/* Code row */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border border-dashed border-blue-300 bg-blue-50 rounded-lg px-3 py-1.5">
                        <p style={{ ...T.statNum, letterSpacing: "0.12em", color: "#1d4ed8" }}>{coupon.code}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(coupon.code)}
                        className="px-3 py-1.5 bg-blue-600 rounded-lg active:bg-blue-700"
                      >
                        <p style={{ ...T.badge, color: "white" }}>COPY</p>
                      </button>
                    </div>

                    {/* Apply button */}
                    <button
                      onClick={() => { onApplyCoupon(coupon.code); onClose(); }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl active:opacity-90"
                    >
                      <p style={{ ...T.pill, color: "white" }}>Apply Coupon</p>
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 pb-safe">
          <button onClick={onClose} className="w-full py-3 bg-gray-100 rounded-2xl active:bg-gray-200">
            <p style={T.pill} className="text-gray-700">Continue Shopping</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Filter Bottom Sheet ──────────────────────────────────────────────────────
const FilterSheet = ({
  isOpen, onClose,
  minPrice, maxPrice, setMinPrice, setMaxPrice,
  categories, selectedCategoryIds, setSelectedCategoryIds,
  brands, selectedBrands, setSelectedBrands,
  selectedConditions, setSelectedConditions,
  vendorSearch, setVendorSearch,
  onApply
}) => {
  const [activeTab, setActiveTab] = useState("category");
  const totalActive = selectedCategoryIds.length + selectedBrands.length + selectedConditions.length + (vendorSearch ? 1 : 0);

  const tabs = [
    { id: "category", label: "Category" },
    { id: "brand", label: "Brand" },
    { id: "price", label: "Price" },
    { id: "condition", label: "Condition" },
  ];

  const STEP = 1000;

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ maxHeight: "88vh" }}>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-blue-600" />
            <p style={T.pageTitle} className="text-gray-900">Filters</p>
            {totalActive > 0 && (
              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <p style={{ ...T.badge, color: "white" }}>{totalActive}</p>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-gray-100">
            <X size={15} className="text-gray-600" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-100 px-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 transition-colors ${activeTab === tab.id ? "border-b-2 border-blue-600" : ""}`}
            >
              <p style={{ ...T.pill, color: activeTab === tab.id ? "#2563eb" : "#6b7280" }}>{tab.label}</p>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">

          {activeTab === "category" && (
            <div className="space-y-2">
              {categories.length === 0 && (
                <p style={T.cardSub} className="text-gray-400 text-center py-6">No categories available</p>
              )}
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 active:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedCategoryIds.includes(cat.id) ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                      {selectedCategoryIds.includes(cat.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <p style={T.cardTitle} className="text-gray-800">{cat.name}</p>
                  </div>
                  <p style={T.cardSub} className="text-gray-400">{cat.product_count || 0}</p>
                  <input type="checkbox" className="sr-only" checked={selectedCategoryIds.includes(cat.id)}
                    onChange={e => e.target.checked
                      ? setSelectedCategoryIds([...selectedCategoryIds, cat.id])
                      : setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== cat.id))} />
                </label>
              ))}
            </div>
          )}

          {activeTab === "brand" && (
            <div className="space-y-2">
              {brands.length === 0 && (
                <p style={T.cardSub} className="text-gray-400 text-center py-6">No brands available</p>
              )}
              {brands.map(brand => (
                <label key={brand.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedBrands.includes(brand.id) ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                      {selectedBrands.includes(brand.id) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <p style={T.cardTitle} className="text-gray-800">{brand.brand_name}</p>
                  </div>
                  <p style={T.cardSub} className="text-gray-400">{brand.product_count || 0}</p>
                  <input type="checkbox" className="sr-only" checked={selectedBrands.includes(brand.id)}
                    onChange={e => e.target.checked
                      ? setSelectedBrands([...selectedBrands, brand.id])
                      : setSelectedBrands(selectedBrands.filter(id => id !== brand.id))} />
                </label>
              ))}
            </div>
          )}

          {activeTab === "price" && (
            <div className="py-2 space-y-5">
              <div className="flex gap-3">
                <div className="flex-1">
                  <p style={T.sectionLabel} className="text-gray-500 mb-1.5">MIN PRICE</p>
                  <div className="relative">
                    <span style={T.cardSub} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={e => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                      className="w-full border border-gray-200 rounded-xl py-2.5 pl-7 pr-3 bg-gray-50"
                      style={T.searchInput}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p style={T.sectionLabel} className="text-gray-500 mb-1.5">MAX PRICE</p>
                  <div className="relative">
                    <span style={T.cardSub} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={e => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                      className="w-full border border-gray-200 rounded-xl py-2.5 pl-7 pr-3 bg-gray-50"
                      style={T.searchInput}
                    />
                  </div>
                </div>
              </div>

              {/* Quick price pills */}
              <div>
                <p style={T.sectionLabel} className="text-gray-500 mb-2">QUICK SELECT</p>
                <div className="flex flex-wrap gap-2">
                  {[[0, 1000, "Under ₹1K"], [1000, 5000, "₹1K–5K"], [5000, 20000, "₹5K–20K"], [20000, 50000, "₹20K–50K"], [50000, 200000, "₹50K+"]].map(([mn, mx, label]) => (
                    <button key={label} onClick={() => { setMinPrice(mn); setMaxPrice(mx); }}
                      className={`px-3 py-1.5 rounded-full border transition-colors ${minPrice === mn && maxPrice === mx ? "bg-blue-600 border-blue-600" : "border-gray-200 bg-white"}`}>
                      <p style={{ ...T.badge, color: minPrice === mn && maxPrice === mx ? "white" : "#374151" }}>{label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "condition" && (
            <div className="space-y-2 py-1">
              {["New", "Used", "Refurbished", "Like New"].map(cond => (
                <label key={cond} className="flex items-center justify-between py-3 border-b border-gray-50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedConditions.includes(cond) ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                      {selectedConditions.includes(cond) && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <p style={T.cardTitle} className="text-gray-800">{cond}</p>
                  </div>
                  <input type="checkbox" className="sr-only" checked={selectedConditions.includes(cond)}
                    onChange={e => e.target.checked
                      ? setSelectedConditions([...selectedConditions, cond])
                      : setSelectedConditions(selectedConditions.filter(c => c !== cond))} />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 flex gap-3 pb-safe">
          <button
            onClick={() => { setSelectedCategoryIds([]); setSelectedBrands([]); setSelectedConditions([]); setVendorSearch(""); setMinPrice(0); setMaxPrice(0); }}
            className="flex-1 py-3 border border-gray-200 rounded-2xl active:bg-gray-50"
          >
            <p style={T.pill} className="text-gray-600">Reset</p>
          </button>
          <button
            onClick={onApply}
            className="flex-[2] py-3 bg-blue-600 rounded-2xl active:bg-blue-700"
          >
            <p style={{ ...T.pill, color: "white" }}>
              Apply{totalActive > 0 ? ` (${totalActive})` : ""}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Login Modal ──────────────────────────────────────────────────────────────
const LoginModal = ({ isOpen, onClose, onLogin, onRegister }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl w-full p-5 shadow-2xl">
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-lg">🔒</span>
          </div>
          <div>
            <p style={T.pageTitle} className="text-gray-900">Login Required</p>
            <p style={T.pageSubtitle} className="text-gray-500">To add items to your cart</p>
          </div>
        </div>
        <div className="space-y-2.5 mt-4">
          <button onClick={onLogin} className="w-full py-3 bg-blue-600 rounded-2xl active:bg-blue-700">
            <p style={{ ...T.pill, color: "white" }}>Login Now</p>
          </button>
          <button onClick={onRegister} className="w-full py-3 border-2 border-blue-600 rounded-2xl active:bg-blue-50">
            <p style={{ ...T.pill, color: "#2563eb" }}>Create Account</p>
          </button>
          <button onClick={onClose} className="w-full py-2">
            <p style={T.cardSub} className="text-gray-500">Continue browsing</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Quick View Modal ─────────────────────────────────────────────────────────
const QuickViewModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();
  const { addToast } = useToast();

  if (!product) return null;

  const getPrice = () => {
    if (product.is_in_campaign && product.campaign_price) return product.campaign_price;
    if (product.stocks?.[0]) {
      const s = product.stocks[0];
      return s.final_price > 0 ? s.final_price : s.selling_price;
    }
    return product.price || 0;
  };
  const getOld = () => product.stocks?.[0]?.mrp || product.old_price || 0;
  const maxQty = product.stocks?.[0]?.maximum_order_quantity || 10;
  const price = parseFloat(getPrice());
  const old = parseFloat(getOld());
  const disc = old > price ? Math.round(((old - price) / old) * 100) : 0;

  const getImg = () => {
    if (product.main_image) return product.main_image.startsWith("http") ? product.main_image : `https://api.initcart.in${product.main_image}`;
    return "https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image";
  };

  const handleAdd = async () => {
    const stockId = product.stocks?.[0]?.id;
    if (!stockId) { addToast("Not available", "error"); return; }
    await onAddToCart(stockId, qty);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-end transition-all duration-300 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div className={`relative bg-white rounded-t-3xl transition-transform duration-300 ${isOpen ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>
        <div className="px-4 pb-6">
          <div className="flex gap-4">
            <div className="w-28 h-28 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
              <img src={getImg()} alt={product.product_name} className="object-contain w-full h-full p-2"
                onError={e => { e.target.src = "https://placehold.co/200/f0f4f8/94a3b8?text=N/A"; }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={T.cardTitle} className="text-gray-900 line-clamp-2">{product.product_name}</p>
              <div className="flex items-baseline gap-2 mt-1.5">
                <p style={{ fontSize: 18, fontWeight: 700 }} className="text-blue-600">₹{price.toFixed(2)}</p>
                {old > price && <p style={T.cardSub} className="text-gray-400 line-through">₹{old.toFixed(2)}</p>}
                {disc > 0 && <span className="bg-red-50 text-red-600 rounded px-1.5 py-0.5" style={T.badge}>{disc}% OFF</span>}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <StarRating rating={product.rating || 4} />
                <p style={T.cardSub} className="text-gray-400">({product.review_count || 0})</p>
              </div>
            </div>
          </div>

          {/* Qty */}
          <div className="flex items-center justify-between mt-4">
            <p style={T.sectionLabel} className="text-gray-600">QUANTITY</p>
            <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center bg-gray-50 active:bg-gray-100 disabled:opacity-40" disabled={qty <= 1}>
                <span style={T.cardTitle} className="text-gray-700 leading-none">−</span>
              </button>
              <div className="w-9 h-9 flex items-center justify-center border-x border-gray-200">
                <p style={T.statNum} className="text-gray-900">{qty}</p>
              </div>
              <button onClick={() => setQty(q => Math.min(maxQty, q + 1))} className="w-9 h-9 flex items-center justify-center bg-gray-50 active:bg-gray-100 disabled:opacity-40" disabled={qty >= maxQty}>
                <span style={T.cardTitle} className="text-gray-700 leading-none">+</span>
              </button>
            </div>
          </div>
          <p style={T.cardSub} className="text-gray-400 mt-1 text-right">Max {maxQty} units</p>

          <div className="mt-1 flex items-center justify-between">
            <p style={T.sectionLabel} className="text-gray-500">TOTAL</p>
            <p style={{ fontSize: 15, fontWeight: 700 }} className="text-gray-900">₹{(price * qty).toFixed(2)}</p>
          </div>

          <div className="flex gap-2.5 mt-4">
            <button onClick={handleAdd} className="flex-[2] py-3 bg-blue-600 rounded-2xl flex items-center justify-center gap-2 active:bg-blue-700">
              <ShoppingCart size={16} color="white" />
              <p style={{ ...T.pill, color: "white" }}>Add to Cart</p>
            </button>
            <button onClick={() => { onClose(); navigate(`/product/${product.id}`); }}
              className="flex-1 py-3 bg-gray-100 rounded-2xl flex items-center justify-center gap-2 active:bg-gray-200">
              <Eye size={16} className="text-gray-600" />
              <p style={T.pill} className="text-gray-700">View</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, onQuickView, onAddToCart, onLoginRequired, hasCoupons, onViewCoupons }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [countdown, setCountdown] = useState(null);
  const [imgError, setImgError] = useState(false);

  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });

  // ✅ YE useEffect ADD KARO - Rating fetch karne ke liye
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
      .catch(() => { });
  }, [product.id]);

  useEffect(() => {
    if (!product?.is_in_campaign || !product?.campaign_details?.end_datetime) return;
    const tick = () => {
      const dist = new Date(product.campaign_details.end_datetime) - Date.now();
      if (dist <= 0) { setCountdown(null); return; }
      setCountdown({
        h: Math.floor((dist % (86400000)) / 3600000),
        m: Math.floor((dist % 3600000) / 60000),
      });
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [product]);

  const getPrice = () => {
    if (product.is_in_campaign && product.campaign_price) return product.campaign_price;
    const s = product.stocks?.[0];
    if (s) return s.final_price > 0 ? s.final_price : s.selling_price;
    return product.price || 0;
  };
  const getOld = () => product.stocks?.[0]?.mrp || product.old_price || 0;
  const price = parseFloat(getPrice());
  const old = parseFloat(getOld());
  const disc = product.is_in_campaign
    ? product.campaign_details?.discount_percentage || 0
    : old > price ? Math.round(((old - price) / old) * 100) : 0;

  const getImg = () => {
    if (imgError) return "https://placehold.co/300x300/f0f4f8/94a3b8?text=N%2FA";
    if (product.main_image) return product.main_image.startsWith("http") ? product.main_image : `https://api.initcart.in${product.main_image}`;
    if (product.stocks?.find(s => s.variant_image)) {
      const vi = product.stocks.find(s => s.variant_image).variant_image;
      return vi.startsWith("http") ? vi : `https://api.initcart.in${vi}`;
    }
    return "https://placehold.co/300x300/f0f4f8/94a3b8?text=No+Image";
  };

  const getCampaignBadge = () => {
    if (!product.is_in_campaign) return null;
    const type = product.campaign_details?.campaign_type;
    const configs = {
      Flash: { label: "⚡ FLASH", cls: "bg-red-500" },
      "Deal of the Day": { label: "🔥 DEAL", cls: "bg-purple-600" },
      Featured: { label: "⭐ FEATURED", cls: "bg-blue-600" },
    };
    const cfg = configs[type];
    if (!cfg) return null;
    return (
      <div className={`absolute top-2 left-2 z-10 ${cfg.cls} rounded-md px-1.5 py-0.5`}>
        <p style={T.badge} className="text-white">{cfg.label}</p>
      </div>
    );
  };

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated()) {
      sessionStorage.setItem("pendingCartProduct", JSON.stringify({ productStockId: product.stocks?.[0]?.id, quantity: 1 }));
      onLoginRequired();
      return;
    }
    const stockId = product.stocks?.[0]?.id;
    if (!stockId) return;
    await onAddToCart(stockId, 1);
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col relative"
      style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Coupon ribbon */}
      {hasCoupons && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 flex items-center justify-center gap-1.5">
          <Tag size={10} color="white" />
          <p style={{ ...T.badge, color: "white" }}>SPECIAL OFFERS AVAILABLE</p>
          <Zap size={10} color="white" />
        </div>
      )}

      {/* Image area */}
      <div className="relative bg-gray-50" style={{ paddingTop: "85%" }}>
        <img
          src={getImg()}
          alt={product.product_name}
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-contain p-3"
        />

        {getCampaignBadge()}

        {!product.is_in_campaign && disc > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 rounded-md px-1.5 py-0.5 z-10">
            <p style={T.badge} className="text-white">{disc}% OFF</p>
          </div>
        )}

        {/* Quick view tap */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); onQuickView(product); }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full shadow flex items-center justify-center active:bg-white z-10"
        >
          <Eye size={13} className="text-blue-600" />
        </button>

        {/* Countdown overlay */}
        {countdown && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-1 flex items-center justify-center gap-1.5">
            <p style={{ ...T.badge, color: "rgba(255,255,255,0.8)" }}>Ends in</p>
            <p style={{ ...T.badge, color: "white" }}>{countdown.h}h {countdown.m}m</p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 flex flex-col flex-1 gap-1.5">
        <p style={T.cardTitle} className="text-gray-900 line-clamp-2 leading-snug">{product.product_name}</p>

        {/* Price row */}
        <div className="flex items-baseline gap-1.5">
          <p style={{ fontSize: 15, fontWeight: 700 }} className="text-gray-900">₹{price.toLocaleString("en-IN", { minimumFractionDigits: 0 })}</p>
          {old > price && <p style={{ fontSize: 11, fontWeight: 400 }} className="text-gray-400 line-through">₹{old.toLocaleString("en-IN")}</p>}
        </div>


        {/* Rating - ✅ Dynamic Rating */}
        <div className="flex items-center gap-1">
          <StarRating rating={Math.round(reviewStats.avg) || 0} />
          <p style={T.cardSub} className="text-gray-400">({reviewStats.count})</p>
        </div>

        {/* Coupon button */}
        {hasCoupons && (
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onViewCoupons(product); }}
            className="flex items-center gap-1.5 bg-blue-50 rounded-xl px-2.5 py-1.5 active:bg-blue-100 mt-0.5"
          >
            <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center shrink-0">
              <Tag size={9} color="white" />
            </div>
            <p style={T.badge} className="text-blue-700 flex-1 text-left">View coupons</p>
            <ChevronRight size={11} className="text-blue-400" />
          </button>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-1">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 bg-blue-600 rounded-xl flex items-center justify-center active:bg-blue-700"
          >
            <ShoppingCart size={14} color="white" />
          </button>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); navigate(`/product/${product.id}`); }}
            className="flex-1 py-2 bg-gray-100 rounded-xl flex items-center justify-center active:bg-gray-200"
          >
            <Eye size={14} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
    <div className="bg-gray-200" style={{ paddingTop: "85%" }} />
    <div className="p-2.5 space-y-2">
      <div className="h-3.5 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="flex gap-2 pt-1">
        <div className="flex-1 h-8 bg-gray-200 rounded-xl" />
        <div className="flex-1 h-8 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MobileProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [vendorSearch, setVendorSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState(null);
  const [productCoupons, setProductCoupons] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const totalActiveFilters = selectedCategoryIds.length + selectedBrands.length +
    selectedConditions.length + (vendorSearch ? 1 : 0) + ((minPrice > 0 || maxPrice > 0) ? 1 : 0);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProducts();
    fetchFilters();
  }, []);

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await publicAxios.get("ecommerce/public/products/");
      if (Array.isArray(res.data)) {
        const formatted = res.data.map(p => ({
          ...p,
          price: (() => {
            const s = p.stocks?.[0];
            if (s) return parseFloat(s.final_price > 0 ? s.final_price : s.selling_price) || 0;
            return p.price || 0;
          })(),
          old_price: parseFloat(p.stocks?.[0]?.mrp || p.old_price || 0),
        }));
        setProducts(formatted);
        setTimeout(() => fetchCouponsForAll(formatted), 600);
      }
    } catch {
      loadSample();
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        publicAxios.get("ecommerce/public/categories/"),
        publicAxios.get("ecommerce/public/brands/"),
      ]);
      if (cRes.data) setCategories(cRes.data);
      if (bRes.data) setBrands(bRes.data);
    } catch { }
  };

  const fetchCouponsForAll = async (list) => {
    const result = {};
    await Promise.allSettled(list.map(async p => {
      try {
        const res = await publicAxios.get(`ecommerce/public/coupons/product/${p.id}/`);
        if (res.data.success && res.data.coupons.length > 0) result[p.id] = res.data.coupons;
      } catch { }
    }));
    setProductCoupons(prev => ({ ...prev, ...result }));
  };

  const fetchCouponsForProduct = async (id) => {
    try {
      const res = await publicAxios.get(`ecommerce/public/coupons/product/${id}/`);
      if (res.data.success) setProductCoupons(prev => ({ ...prev, [id]: res.data.coupons }));
    } catch { }
  };

  const loadSample = () => setProducts([
    {
      id: 1, product_name: "iPhone 14 Pro Max", price: 114900, old_price: 129900,
      main_image: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-22-66f0027e72108.webp",
      rating: 5, review_count: 12, stocks: [{ id: 1, final_price: 114900, selling_price: 114900, mrp: 129900, maximum_order_quantity: 5 }]
    },
    {
      id: 2, product_name: "Beauty Jelly Lipstick", price: 320, old_price: 450,
      main_image: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-19-66ec01ed63b50.webp",
      rating: 4, review_count: 20, stocks: [{ id: 2, final_price: 320, selling_price: 320, mrp: 450, maximum_order_quantity: 20 }]
    },
  ]);

  // ── Cart ───────────────────────────────────────────────────────────────────
  const addToCart = async (stockId, qty = 1) => {
    if (!isAuthenticated()) { setShowLoginModal(true); return; }
    try {
      const res = await axiosInstance.post("api/public/cart/", { product_stock: stockId, quantity: qty });
      if (res.data.success) {
        addToast("Added to cart!", "success");
        const p = products.find(x => x.stocks?.some(s => s.id === stockId));
        if (p) fetchCouponsForProduct(p.id);
      } else throw new Error(res.data.message);
    } catch (err) {
      if (err.response?.status === 401) { addToast("Session expired", "error"); navigate("/customer/login"); }
      else addToast(err.response?.data?.message || "Failed to add to cart", "error");
    }
  };

  // ── Filtered / Sorted Products ─────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      const catId = Number(p.category_details?.id || p.category);
      const brandId = Number(p.brand_details?.id || p.brand);
      const price = Number(p.price || p.stocks?.[0]?.final_price || 0);
      const cond = p.product_condition || "New";
      const vendor = p.vendor_details?.business_name?.toLowerCase() || "";
      const name = p.product_name?.toLowerCase() || "";
      const search = searchTerm.toLowerCase().trim();

      return (
        (selectedCategoryIds.length === 0 || selectedCategoryIds.map(Number).includes(catId)) &&
        (selectedBrands.length === 0 || selectedBrands.map(Number).includes(brandId)) &&
        (minPrice === 0 && maxPrice === 0 || (price >= minPrice && price <= maxPrice)) &&
        (selectedConditions.length === 0 || selectedConditions.includes(cond)) &&
        (vendorSearch === "" || vendor.includes(vendorSearch.toLowerCase()) || name.includes(vendorSearch.toLowerCase())) &&
        (search === "" || name.includes(search) || vendor.includes(search))
      );
    });

    if (sortBy === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === "newest") list = [...list].sort((a, b) => b.id - a.id);

    return list;
  }, [products, selectedCategoryIds, selectedBrands, selectedConditions, minPrice, maxPrice, vendorSearch, searchTerm, sortBy]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleViewCoupons = (product) => {
    setModalProduct(product);
    if (!productCoupons[product.id]) fetchCouponsForProduct(product.id);
    setShowCouponsModal(true);
  };

  const handleApplyCoupon = (code) => {
    navigate("/cart", { state: { applyCoupon: code, fromProduct: modalProduct?.id } });
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setTimeout(() => setIsQuickViewOpen(true), 10);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 300);
  };

  const clearAllFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedBrands([]);
    setSelectedConditions([]);
    setVendorSearch("");
    setMinPrice(0);
    setMaxPrice(0);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Bar ── */}
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center active:bg-gray-200 shrink-0"
          >
            <ChevronLeft size={18} className="text-gray-700" />
          </button>
          {showSearch ? (
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  autoFocus
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-100 rounded-xl py-2 pl-9 pr-3 outline-none"
                  style={T.searchInput}
                />
              </div>
              <button onClick={() => { setShowSearch(false); setSearchTerm(""); }} className="p-1.5">
                <X size={18} className="text-gray-600" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <p style={T.pageTitle} className="text-gray-900">Products</p>
                <p style={T.pageSubtitle} className="text-gray-500">
                  {loading ? "Loading..." : `${filteredProducts.length} results`}
                </p>
              </div>
              <button onClick={() => setShowSearch(true)} className="p-2 rounded-xl bg-gray-100 active:bg-gray-200">
                <Search size={17} className="text-gray-700" />
              </button>
              <button
                onClick={() => setShowFilters(true)}
                className={`p-2 rounded-xl flex items-center gap-1.5 active:opacity-80 ${totalActiveFilters > 0 ? "bg-blue-600" : "bg-gray-100"}`}
              >
                <SlidersHorizontal size={17} className={totalActiveFilters > 0 ? "text-white" : "text-gray-700"} />
                {totalActiveFilters > 0 && (
                  <p style={{ ...T.badge, color: "white" }}>{totalActiveFilters}</p>
                )}
              </button>
            </>
          )}
        </div>

        {/* Sort Pills */}
        {!showSearch && (
          <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
            {[
              { id: "default", label: "All" },
              { id: "price_asc", label: "Price ↑" },
              { id: "price_desc", label: "Price ↓" },
              { id: "rating", label: "Top Rated" },
              { id: "newest", label: "Newest" },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full border transition-colors ${sortBy === s.id ? "bg-blue-600 border-blue-600" : "border-gray-200 bg-white"}`}
              >
                <p style={{ ...T.pill, color: sortBy === s.id ? "white" : "#374151" }}>{s.label}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Active Filter Chips ── */}
      {totalActiveFilters > 0 && (
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button onClick={clearAllFilters} className="shrink-0 flex items-center gap-1 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full active:bg-red-100">
            <X size={10} className="text-red-500" />
            <p style={T.badge} className="text-red-600">Clear all</p>
          </button>
          {selectedCategoryIds.map(id => {
            const cat = categories.find(c => c.id === id);
            return cat ? (
              <button key={id} onClick={() => setSelectedCategoryIds(prev => prev.filter(x => x !== id))}
                className="shrink-0 flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                <p style={T.badge} className="text-blue-700">{cat.name}</p>
                <X size={9} className="text-blue-500" />
              </button>
            ) : null;
          })}
          {selectedBrands.map(id => {
            const br = brands.find(b => b.id === id);
            return br ? (
              <button key={id} onClick={() => setSelectedBrands(prev => prev.filter(x => x !== id))}
                className="shrink-0 flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                <p style={T.badge} className="text-blue-700">{br.brand_name}</p>
                <X size={9} className="text-blue-500" />
              </button>
            ) : null;
          })}
          {selectedConditions.map(c => (
            <button key={c} onClick={() => setSelectedConditions(prev => prev.filter(x => x !== c))}
              className="shrink-0 flex items-center gap-1 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <p style={T.badge} className="text-green-700">{c}</p>
              <X size={9} className="text-green-500" />
            </button>
          ))}
          {(minPrice > 0 || maxPrice > 0) && (
            <button onClick={() => { setMinPrice(0); setMaxPrice(0); }}
              className="shrink-0 flex items-center gap-1 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
              <p style={T.badge} className="text-purple-700">₹{minPrice}–₹{maxPrice}</p>
              <X size={9} className="text-purple-500" />
            </button>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      <div className="px-3 pt-3 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package size={28} className="text-gray-400" />
            </div>
            <p style={T.emptyTitle} className="text-gray-800">No Products Found</p>
            <p style={T.emptySubtitle} className="text-gray-500 mt-1.5 max-w-xs">
              {searchTerm || totalActiveFilters > 0
                ? "Try adjusting your filters or search term."
                : "No products available right now."}
            </p>
            {totalActiveFilters > 0 && (
              <button onClick={clearAllFilters} className="mt-4 px-5 py-2.5 bg-blue-600 rounded-full active:bg-blue-700">
                <p style={{ ...T.pill, color: "white" }}>Clear Filters</p>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={openQuickView}
                onAddToCart={addToCart}
                onLoginRequired={() => setShowLoginModal(true)}
                hasCoupons={!!(productCoupons[p.id]?.length)}
                onViewCoupons={handleViewCoupons}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <FilterSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        minPrice={minPrice} maxPrice={maxPrice}
        setMinPrice={setMinPrice} setMaxPrice={setMaxPrice}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds} setSelectedCategoryIds={setSelectedCategoryIds}
        brands={brands}
        selectedBrands={selectedBrands} setSelectedBrands={setSelectedBrands}
        selectedConditions={selectedConditions} setSelectedConditions={setSelectedConditions}
        vendorSearch={vendorSearch} setVendorSearch={setVendorSearch}
        onApply={() => setShowFilters(false)}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => { setShowLoginModal(false); navigate("/customer/login"); }}
        onRegister={() => { setShowLoginModal(false); navigate("/customer/registration"); }}
      />

      {showCouponsModal && modalProduct && (
        <CouponsModal
          product={modalProduct}
          coupons={productCoupons[modalProduct.id] || []}
          onClose={() => { setShowCouponsModal(false); setModalProduct(null); }}
          onApplyCoupon={handleApplyCoupon}
        />
      )}

      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        onAddToCart={addToCart}
      />
    </div>
  );
}