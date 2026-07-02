// MobileFeaturedDeal.jsx - Blue Theme (#1565C0)
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicAxios, axiosInstance } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FiEye, FiShoppingCart, FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `https://api.initcart.in${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const getProductImage = (product) => {
  const variantImage =
    product?.productData?.stocks?.[0]?.variant_image ||
    product?.productData?.variants?.[0]?.variant_image;
  if (variantImage) return getFullImageUrl(variantImage);
  const mainImage =
    product?.productData?.main_image ||
    product?.productData?.product_image ||
    product?.productData?.image;
  if (mainImage) return getFullImageUrl(mainImage);
  return "https://via.placeholder.com/300";
};

// ─── Clone count (same as BrandSlider) ───────────────────────────────────────
const CLONE_COUNT = 4;

const MobileFeaturedDeal = () => {
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [featuredDeal, setFeaturedDeal]   = useState(null);
  const [bigAd, setBigAd]                 = useState(null);
  const [itemsPerView, setItemsPerView]   = useState(2);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ── Infinite scroll refs (BrandSlider pattern) ────────────────────────────
  const scrollRef     = useRef(null);
  const autoTimer     = useRef(null);
  const resumeTimer   = useRef(null);
  const isUserActive  = useRef(false);
  const isTeleporting = useRef(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // ── Fetch data ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const campaignResponse = await publicAxios.get("/api/ecommerce/public/campaigns/");
        const featuredCampaign = campaignResponse.data.find(c => c.campaign_type === 'Featured');

        if (featuredCampaign) {
          setFeaturedDeal(featuredCampaign);
          const productsResponse = await publicAxios.get(
            `/api/ecommerce/public/campaigns/${featuredCampaign.id}/products/`
          );
          const transformedProducts = productsResponse.data.map(p => ({
            id: p.product_details?.id || p.id,
            title: p.product_details?.product_name || 'Product',
            price: p.final_price || p.original_price || 0,
            original_price: p.original_price,
            discount_percentage: p.discount_percentage,
            productData: p.product_details || p,
          }));
          setProducts(transformedProducts);
        }

        const bigAdResponse = await publicAxios.get("/api/banners/init-bigad/");
        setBigAd(bigAdResponse.data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── itemsPerView from window width ────────────────────────────────────────
  useEffect(() => {
    const setFromWidth = () => setItemsPerView(window.innerWidth >= 1024 ? 3 : 2);
    setFromWidth();
    window.addEventListener("resize", setFromWidth);
    return () => window.removeEventListener("resize", setFromWidth);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // Infinite clone logic (BrandSlider pattern)
  // ═══════════════════════════════════════════════════════════════════════════

  // Clone list: [last-4] + [real] + [first-4]
  const displayList = useMemo(() => {
    if (products.length === 0) return [];
    return [
      ...products.slice(-CLONE_COUNT),
      ...products,
      ...products.slice(0, CLONE_COUNT),
    ];
  }, [products]);

  // Step = one card-group width (itemsPerView cards + gaps)
  // We scroll itemsPerView cards at a time so the grid stays aligned
  const getStep = useCallback(() => {
    const el = scrollRef.current?.children[0];
    if (!el) return 170 * itemsPerView + 8 * (itemsPerView - 1);
    // Each card's full width including gap
    return el.offsetWidth + 8;
  }, [itemsPerView]);

  // Jump to first real card silently
  const jumpToReal = useCallback(() => {
    const el = scrollRef.current;
    if (!el || products.length === 0) return;
    isTeleporting.current = true;
    el.scrollLeft = CLONE_COUNT * getStep();
    requestAnimationFrame(() => { isTeleporting.current = false; });
  }, [products.length, getStep]);

  useEffect(() => {
    if (products.length > 0) {
      const t = setTimeout(jumpToReal, 60);
      return () => clearTimeout(t);
    }
  }, [products.length, jumpToReal]);

  // Scroll listener: teleport when clone zone reached
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || products.length === 0) return;
    const onScroll = () => {
      if (isTeleporting.current) return;
      const step      = getStep();
      const realStart = CLONE_COUNT * step;
      const realEnd   = realStart + products.length * step;
      if (el.scrollLeft >= realEnd) {
        isTeleporting.current = true;
        el.scrollLeft -= products.length * step;
        requestAnimationFrame(() => { isTeleporting.current = false; });
      } else if (el.scrollLeft < realStart) {
        isTeleporting.current = true;
        el.scrollLeft += products.length * step;
        requestAnimationFrame(() => { isTeleporting.current = false; });
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [products.length, getStep]);

  // Auto-scroll interval — scrolls by itemsPerView cards at once
  const startAutoScroll = useCallback(() => {
    clearInterval(autoTimer.current);
    if (!scrollRef.current || products.length <= itemsPerView) return;
    autoTimer.current = setInterval(() => {
      if (!isUserActive.current && scrollRef.current) {
        scrollRef.current.scrollBy({ left: getStep() * itemsPerView, behavior: "smooth" });
      }
    }, 3000);
  }, [products.length, itemsPerView, getStep]);

  useEffect(() => {
    if (products.length > 0) {
      const t = setTimeout(startAutoScroll, 250);
      return () => { clearTimeout(t); clearInterval(autoTimer.current); };
    }
  }, [products.length, startAutoScroll]);

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

  // ── Manual nav arrows (prev/next by itemsPerView) ─────────────────────────
  const prev = () => {
    if (!scrollRef.current) return;
    onStart();
    scrollRef.current.scrollBy({ left: -(getStep() * itemsPerView), behavior: "smooth" });
    onEnd();
  };

  const next = () => {
    if (!scrollRef.current) return;
    onStart();
    scrollRef.current.scrollBy({ left: getStep() * itemsPerView, behavior: "smooth" });
    onEnd();
  };

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = async (productStockId, qty = 1) => {
    if (!isAuthenticated()) {
      addToast('Please login to add items to cart', 'warning');
      setShowLoginModal(true);
      return;
    }
    try {
      const response = await axiosInstance.post('api/public/cart/', { product_stock: productStockId, quantity: qty });
      if (response.data.success) addToast('Added to cart!', 'success');
    } catch {
      addToast('Failed to add to cart', 'error');
    }
  };

  if (loading) return null;
  if (!featuredDeal && !bigAd) return null;

  const showArrows = products.length > itemsPerView;

  return (
    <div className="space-y-4 px-3 my-2">

      {/* ================= FEATURED DEAL SECTION ================= */}
      {featuredDeal && products.length > 0 && (
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center gap-1.5">
              <FiStar className="w-3.5 h-3.5 text-blue-600" />
              <h2 className="text-xs font-bold text-blue-700">FEATURED DEAL</h2>
            </div>
            <Link to="/FeaturedDealList" className="text-[10px] text-blue-600 font-medium">View All →</Link>
          </div>

          {/* Infinite scroll container */}
          <div className="relative p-3">
            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto"
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
                  className="flex-shrink-0 bg-gray-50 rounded-lg p-2 border border-gray-100"
                  style={{ width: `calc(${100 / itemsPerView}% - ${(8 * (itemsPerView - 1)) / itemsPerView}px)` }}
                >
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={getProductImage(product)}
                      alt={product.title}
                      className="w-full h-28 object-contain rounded-lg"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
                    />
                    {product.discount_percentage > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg">
                        {product.discount_percentage}% OFF
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); navigate(`/product/${product.id}`); }}
                      className="absolute bottom-1 right-1 bg-white/80 p-1 rounded-full shadow-sm"
                    >
                      <FiEye className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-xs font-medium text-gray-800 mt-1.5 line-clamp-2 h-8">{product.title}</h3>

                  {/* Price */}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-bold text-blue-600">₹{product.price?.toFixed(0)}</span>
                    {product.original_price > product.price && (
                      <span className="text-[9px] text-gray-400 line-through">₹{product.original_price}</span>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => addToCart(product.productData?.stocks?.[0]?.id || product.id)}
                    className="mt-2 w-full py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-medium flex items-center justify-center gap-1 hover:bg-blue-700 transition"
                  >
                    <FiShoppingCart className="w-3 h-3" /> Add to Cart
                  </button>
                </div>
              ))}
            </div>

            {/* Nav arrows */}
            {showArrows && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-r-lg p-1.5 border border-gray-200 hover:bg-gray-50 z-10"
                >
                  <FiChevronLeft className="w-3 h-3 text-gray-600" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-l-lg p-1.5 border border-gray-200 hover:bg-gray-50 z-10"
                >
                  <FiChevronRight className="w-3 h-3 text-gray-600" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= BIG AD BANNER ================= */}
      {bigAd && (
        <div className="relative rounded-xl overflow-hidden shadow-sm">
          <img
            src={bigAd.image}
            alt="banner"
            className="w-full h-28 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center px-4">
            <div>
              <h3 className="text-white font-bold text-sm">{bigAd.title}</h3>
              {bigAd.url && (
                <a
                  href={bigAd.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 px-3 py-1 bg-blue-500 rounded-full text-white text-[10px] font-medium"
                >
                  Shop Now →
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= LOGIN MODAL ================= */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Login Required</h3>
            <p className="text-sm text-gray-600 mb-4">Please login to add items to cart</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowLoginModal(false); navigate('/customer/login'); }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm"
              >
                Login
              </button>
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileFeaturedDeal;