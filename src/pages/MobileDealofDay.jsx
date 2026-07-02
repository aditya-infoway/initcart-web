// MobileDealOfTheDay.jsx - Infinite Auto Slide with Touch Handling
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicAxios, axiosInstance } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FiClock, FiShoppingCart, FiZap, FiChevronLeft, FiChevronRight, FiTrendingUp } from "react-icons/fi";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image";
  if (image.startsWith("http")) return image;
  const cleanPath = image.replace(/^\/+/, '');
  return `https://api.initcart.in/media/${cleanPath}`;
};

// ─── Cart helper ────────────────────────────────────────────────────────────
const addToCartFunction = async (product, quantity, isAuthenticated, addToast, navigate, setShowLoginModal) => {
  try {
    if (!isAuthenticated()) {
      addToast('Please login to add items to cart', 'warning');
      setShowLoginModal(true);
      return false;
    }
    const productStockId = product.stocks && product.stocks.length > 0
      ? product.stocks[0].id
      : product.id;
    if (!productStockId) { addToast('Product stock not available', 'error'); return false; }
    const response = await axiosInstance.post('api/public/cart/', { product_stock: productStockId, quantity });
    if (response.data.success) { addToast('Added to cart!', 'success'); return true; }
    else throw new Error(response.data.message || 'Failed to add to cart');
  } catch (error) {
    console.error('Add to cart error:', error);
    addToast('Failed to add to cart', 'error');
    return false;
  }
};

// ─── Login Modal ─────────────────────────────────────────────────────────────
const LoginModal = ({ isOpen, onClose, onLogin, onRegister }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FiZap className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800">Login Required</h3>
          </div>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100">✗</button>
        </div>
        <p className="text-xs text-gray-500 mb-4">Please login to add items to your cart</p>
        <div className="flex gap-2">
          <button onClick={onLogin} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Login</button>
          <button onClick={onRegister} className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-xl text-sm font-semibold">Sign Up</button>
        </div>
      </div>
    </div>
  );
};

// ─── Clone count (same as BrandSlider) ───────────────────────────────────────
const CLONE_COUNT = 4;

const MobileDealOfTheDay = () => {
  const [dealProducts, setDealProducts]       = useState([]);
  const [allDealProducts, setAllDealProducts] = useState([]);
  const [dealCampaign, setDealCampaign]       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [allLoading, setAllLoading]           = useState(true);
  const [currentSlide, setCurrentSlide]       = useState(0);
  const [timeLeft, setTimeLeft]               = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [ads, setAds]                         = useState([]);
  const [showLoginModal, setShowLoginModal]   = useState(false);

  // ── Main slider refs (unchanged) ──────────────────────────────────────────
  const slideInterval = useRef(null);

  // ── "More Deals" infinite scroll refs (BrandSlider pattern) ──────────────
  const scrollRef      = useRef(null);
  const autoTimer      = useRef(null);
  const resumeTimer    = useRef(null);
  const isUserActive   = useRef(false);
  const isTeleporting  = useRef(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // ── Fetch small ads ───────────────────────────────────────────────────────
  useEffect(() => {
    publicAxios.get("api/banners/init-smallads/")
      .then((res) => setAds(res.data))
      .catch((err) => console.error("Error fetching small ads:", err));
  }, []);

  const slot1 = ads.find((ad) => ad.slot === 1);
  const slot2 = ads.find((ad) => ad.slot === 2);

  // ── Fetch main deal products ──────────────────────────────────────────────
  useEffect(() => {
    const fetchDealOfDayProducts = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get("/api/ecommerce/public/deal-of-day/main-products/");
        if (response.data.products && response.data.products.length > 0) {
          const mappedProducts = response.data.products.map((product) => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            oldPrice: parseFloat(product.old_price),
            img: product.image || product.main_image || product.thumbnail,
            discount_percentage: product.discount_percentage,
            stocks: product.stocks || [],
          }));
          setDealProducts(mappedProducts);
          setDealCampaign(response.data.campaign);
          setCurrentSlide(0);
        }
      } catch (err) {
        console.error("Error fetching Deal of Day:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDealOfDayProducts();
  }, []);

  // ── Fetch all deal products ───────────────────────────────────────────────
  useEffect(() => {
    const fetchAllDealProducts = async () => {
      try {
        setAllLoading(true);
        const response = await publicAxios.get("/api/ecommerce/public/deal-of-day/all-products/");
        if (response.data.success && response.data.products) {
          const mappedProducts = response.data.products.map((product) => ({
            id: product.product_id || product.id,
            name: product.name || product.product_name,
            price: parseFloat(product.final_price || product.price || 0),
            oldPrice: parseFloat(product.old_price || product.original_price || 0),
            img: product.image || product.main_image || product.thumbnail_image,
            discount_percentage: product.discount_percentage || 0,
            stocks: product.stocks || [],
          }));
          setAllDealProducts(mappedProducts);
        }
      } catch (err) {
        console.error("Error fetching all deal products:", err);
      } finally {
        setAllLoading(false);
      }
    };
    fetchAllDealProducts();
  }, []);

  // ── Countdown Timer ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!dealCampaign?.end_datetime) return;
    const calculateTimeLeft = () => {
      try {
        const now       = new Date().getTime();
        const endTime   = new Date(dealCampaign.end_datetime).getTime();
        const difference = endTime - now;
        if (difference > 0) {
          setTimeLeft({
            days:    Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours:   Math.floor((difference % 86400000) / 3600000),
            minutes: Math.floor((difference % 3600000) / 60000),
            seconds: Math.floor((difference % 60000) / 1000),
          });
        }
      } catch (error) { console.error("Timer error:", error); }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [dealCampaign]);

  // ── Main section auto-slider (unchanged) ─────────────────────────────────
  useEffect(() => {
    if (dealProducts.length > 1) {
      if (slideInterval.current) clearInterval(slideInterval.current);
      slideInterval.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % dealProducts.length);
      }, 5000);
      return () => clearInterval(slideInterval.current);
    }
  }, [dealProducts.length]);

  // ═══════════════════════════════════════════════════════════════════════════
  // "More Deals" section — BrandSlider infinite-clone logic
  // ═══════════════════════════════════════════════════════════════════════════

  // Clone list: [last-4 clones] + [real items] + [first-4 clones]
  const displayList =
    allDealProducts.length > 0
      ? [
          ...allDealProducts.slice(-CLONE_COUNT),
          ...allDealProducts,
          ...allDealProducts.slice(0, CLONE_COUNT),
        ]
      : [];

  // Step = card width + gap (8px)
  const getStep = useCallback(() => {
    const el = scrollRef.current?.children[0];
    return el ? el.offsetWidth + 8 : 170;
  }, []);

  // On mount / data ready: jump silently to first real card
  const jumpToReal = useCallback(() => {
    const el = scrollRef.current;
    if (!el || allDealProducts.length === 0) return;
    isTeleporting.current = true;
    el.scrollLeft = CLONE_COUNT * getStep();
    requestAnimationFrame(() => { isTeleporting.current = false; });
  }, [allDealProducts.length, getStep]);

  useEffect(() => {
    if (allDealProducts.length > 0) {
      const t = setTimeout(jumpToReal, 60);
      return () => clearTimeout(t);
    }
  }, [allDealProducts.length, jumpToReal]);

  // Scroll listener: teleport when clone zone reached
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || allDealProducts.length === 0) return;
    const onScroll = () => {
      if (isTeleporting.current) return;
      const step      = getStep();
      const realStart = CLONE_COUNT * step;
      const realEnd   = realStart + allDealProducts.length * step;
      if (el.scrollLeft >= realEnd) {
        isTeleporting.current = true;
        el.scrollLeft -= allDealProducts.length * step;
        requestAnimationFrame(() => { isTeleporting.current = false; });
      } else if (el.scrollLeft < realStart) {
        isTeleporting.current = true;
        el.scrollLeft += allDealProducts.length * step;
        requestAnimationFrame(() => { isTeleporting.current = false; });
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [allDealProducts.length, getStep]);

  // Auto-scroll interval
  const startAutoScroll = useCallback(() => {
    clearInterval(autoTimer.current);
    if (!scrollRef.current || allDealProducts.length <= 2) return;
    autoTimer.current = setInterval(() => {
      if (!isUserActive.current && scrollRef.current) {
        scrollRef.current.scrollBy({ left: getStep(), behavior: "smooth" });
      }
    }, 2500);
  }, [allDealProducts.length, getStep]);

  useEffect(() => {
    if (allDealProducts.length > 0) {
      const t = setTimeout(startAutoScroll, 250);
      return () => { clearTimeout(t); clearInterval(autoTimer.current); };
    }
  }, [allDealProducts.length, startAutoScroll]);

  // Touch/mouse handlers
  const onStart = useCallback(() => {
    isUserActive.current = true;
    clearInterval(autoTimer.current);
    autoTimer.current = null;
    clearTimeout(resumeTimer.current);
  }, []);

  const onMove = useCallback(() => {
    if (!isUserActive.current) return;
    clearTimeout(resumeTimer.current);
  }, []);

  const onEnd = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isUserActive.current = false;
      startAutoScroll();
    }, 2000);
  }, [startAutoScroll]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatNum = (n) => n.toString().padStart(2, '0');
  const currentProduct = dealProducts[currentSlide];

  const handleAddToCart = async (product) => {
    await addToCartFunction(product, 1, isAuthenticated, addToast, navigate, setShowLoginModal);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
      slideInterval.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % dealProducts.length);
      }, 5000);
    }
  };

  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + dealProducts.length) % dealProducts.length);
  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % dealProducts.length);

  if (loading && !dealProducts.length) return null;

  return (
    <>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => { setShowLoginModal(false); navigate('/customer/login'); }}
        onRegister={() => { setShowLoginModal(false); navigate('/customer/registration'); }}
      />

      {/* ========== SECTION 1: MAIN DEAL OF THE DAY ========== */}
      {dealProducts.length > 0 && (
        <div className="mx-3 mt-2 mb-3">
          <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-blue-100">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FiZap className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-bold text-white tracking-wide">DEAL OF THE DAY</span>
                </div>
                <Link to="/dealOfTheDayListPage" className="text-[9px] text-white/80 font-medium hover:text-white">View All →</Link>
              </div>

              {/* Countdown */}
              {dealCampaign && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  {[
                    { val: timeLeft.days,    label: "Days"  },
                    { val: timeLeft.hours,   label: "Hours" },
                    { val: timeLeft.minutes, label: "Mins"  },
                    { val: timeLeft.seconds, label: "Secs"  },
                  ].map((item, i) => (
                    <React.Fragment key={item.label}>
                      {i > 0 && <span className="text-white text-[10px] font-bold">:</span>}
                      <div className="bg-white/15 backdrop-blur-sm rounded-lg px-2.5 py-1 text-center min-w-[48px]">
                        <span className="text-white font-bold text-sm">{formatNum(item.val)}</span>
                        <span className="text-white/60 text-[8px] ml-0.5">{item.label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Product card */}
            {currentProduct && (
              <div className="relative p-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden shadow-sm">
                    <img
                      src={getImageUrl(currentProduct.img)}
                      alt={currentProduct.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => { e.target.src = 'https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image'; }}
                    />
                    {currentProduct.discount_percentage > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                        -{currentProduct.discount_percentage}%
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight">{currentProduct.name}</h3>
                    <div className="flex flex-wrap items-baseline gap-1.5 mt-1.5">
                      <span className="text-xl font-bold text-blue-600">₹{currentProduct.price?.toFixed(0)}</span>
                      <span className="text-[10px] text-gray-400 line-through">₹{currentProduct.oldPrice?.toFixed(0)}</span>
                      <span className="text-[9px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">
                        Save ₹{(currentProduct.oldPrice - currentProduct.price)?.toFixed(0)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(currentProduct)}
                      className="mt-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl py-1.5 text-white text-[10px] font-semibold flex items-center justify-center gap-1 shadow-sm hover:shadow-md transition-all"
                    >
                      <FiShoppingCart className="w-3 h-3" /> Grab Deal
                    </button>
                  </div>
                </div>

                {dealProducts.length > 1 && (
                  <>
                    <button onClick={prevSlide} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-r-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-50">
                      <FiChevronLeft className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                    <button onClick={nextSlide} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-l-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-50">
                      <FiChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  </>
                )}

                {dealProducts.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {dealProducts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goToSlide(i)}
                        className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-5 bg-blue-600' : 'w-1.5 bg-gray-300'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== SECTION 2: MORE DEALS — infinite clone scroll ========== */}
      {!allLoading && allDealProducts.length > 0 && (
        <div className="mx-3 my-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <FiTrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <h3 className="text-xs font-semibold text-gray-700">Today's Deals for You</h3>
            </div>
            <Link to="/dealOfTheDayListPage" className="text-[9px] text-blue-500 font-medium">View All →</Link>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
            onTouchStart={onStart}
            onTouchMove={onMove}
            onTouchEnd={onEnd}
            onMouseDown={onStart}
            onMouseMove={onMove}
            onMouseUp={onEnd}
            onMouseLeave={onEnd}
          >
            {displayList.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="flex-shrink-0 w-[48%] bg-white rounded-xl border border-blue-100 p-2.5 shadow-sm hover:shadow-md transition-all"
              >
                <div onClick={() => navigate(`/product/${product.id}`)} className="cursor-pointer">
                  <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-2">
                    <img
                      src={getImageUrl(product.img)}
                      alt={product.name}
                      className="w-full h-24 object-contain"
                      onError={(e) => { e.target.src = 'https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image'; }}
                    />
                    {product.discount_percentage > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        {product.discount_percentage}% OFF
                      </span>
                    )}
                  </div>
                  <h4 className="text-[11px] font-semibold text-gray-800 mt-2 line-clamp-2 leading-tight">{product.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-bold text-blue-600">₹{product.price?.toFixed(0)}</span>
                    <span className="text-[9px] text-gray-400 line-through">₹{product.oldPrice?.toFixed(0)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-2 w-full py-1.5 bg-blue-50 rounded-xl text-blue-600 text-[9px] font-semibold flex items-center justify-center gap-1 hover:bg-blue-100 transition"
                >
                  <FiShoppingCart className="w-2.5 h-2.5" /> Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== SECTION 3: MARKETING BANNERS ========== */}
      {(slot1 || slot2) && (
        <div className="mx-3 my-2">
          <div className="grid grid-cols-2 gap-2">
            {slot1 && (
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <img
                  src={getImageUrl(slot1.image)}
                  alt={slot1.title || "banner"}
                  className="w-full h-20 object-cover"
                  onError={(e) => { e.target.src = "https://placehold.co/600x200/f0f4f8/94a3b8?text=Ad"; }}
                />
                {(slot1.title || slot1.url) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-1.5">
                    {slot1.title && <h3 className="text-white font-bold text-[9px] truncate">{slot1.title}</h3>}
                    {slot1.url && <a href={slot1.url} target="_blank" className="mt-0.5 px-1.5 py-0.5 bg-blue-500 rounded-full text-white text-[6px] font-medium w-fit">Shop</a>}
                  </div>
                )}
              </div>
            )}
            {slot2 && (
              <div className="relative rounded-xl overflow-hidden shadow-sm">
                <img
                  src={getImageUrl(slot2.image)}
                  alt={slot2.title || "banner"}
                  className="w-full h-20 object-cover"
                  onError={(e) => { e.target.src = "https://placehold.co/600x200/f0f4f8/94a3b8?text=Ad"; }}
                />
                {(slot2.title || slot2.url) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-1.5">
                    {slot2.title && <h3 className="text-white font-bold text-[9px] truncate">{slot2.title}</h3>}
                    {slot2.url && <a href={slot2.url} target="_blank" className="mt-0.5 px-1.5 py-0.5 bg-blue-500 rounded-full text-white text-[6px] font-medium w-fit">Shop</a>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
};

export default MobileDealOfTheDay;