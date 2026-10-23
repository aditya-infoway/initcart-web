import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Zap, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { axiosInstance } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const TRANSITION_DURATION = 300;
const PLACEHOLDER_IMG = "https://placehold.co/600x600/f0f4f8/94a3b8?text=No+Image";

// Decimal values ko handle karne ke liye helper function
const formatPrice = (price) => {
  if (price === null || price === undefined) return 0;
  const num = parseFloat(price);
  return isNaN(num) ? 0 : num;
};

const toAbsoluteUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://api.initcart.com${path.startsWith("/") ? "" : "/"}${path}`;
};

// main image -> variant image -> thumbnail -> placeholder
const getProductImage = (product) => {
  if (product.main_image) return toAbsoluteUrl(product.main_image);
  const stockWithImage = product.stocks?.find((s) => s.variant_image || s.variant_image_url);
  if (stockWithImage) return toAbsoluteUrl(stockWithImage.variant_image_url || stockWithImage.variant_image);
  if (product.thumbnail_image) return toAbsoluteUrl(product.thumbnail_image);
  return PLACEHOLDER_IMG;
};

// Campaign badge config (Flash / Deal of the Day / Featured)
const CAMPAIGN_BADGES = {
  Flash: { label: "FLASH", cls: "from-orange-500 to-orange-600", icon: true },
  "Deal of the Day": { label: "DEAL OF THE DAY", cls: "from-purple-500 to-purple-600" },
  Featured: { label: "FEATURED", cls: "from-blue-500 to-blue-600" },
};

// Countdown for campaign end time
const useCountdown = (endDatetime) => {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!endDatetime) {
      setCountdown(null);
      return;
    }

    const calc = () => {
      const distance = new Date(endDatetime).getTime() - Date.now();
      if (isNaN(distance) || distance <= 0) {
        setCountdown(null);
        return false;
      }
      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      });
      return true;
    };

    if (!calc()) return;
    const timer = setInterval(() => {
      if (!calc()) clearInterval(timer);
    }, 30000);
    return () => clearInterval(timer);
  }, [endDatetime]);

  return countdown;
};

// ---------------------------------------------------------------------------
// PRODUCT CARD (whole card is clickable -> product detail)
// ---------------------------------------------------------------------------
const SliderProductCard = ({ product, onQuickView, onAddToCart }) => {
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();
  const countdown = useCountdown(product.isInCampaign ? product.endDatetime : null);

  const discount =
    product.oldPrice > product.newPrice
      ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)
      : 0;

  const campaignBadge = product.isInCampaign ? CAMPAIGN_BADGES[product.campaignType] : null;
  const condition = product.productData?.product_condition;

  const goToDetail = () => navigate(`/product/${product.id}`);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter") goToDetail();
      }}
      className="group/card relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.16)] focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {/* Image area */}
      <div className="relative p-2.5 pb-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white">
          <img
            src={product.img}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 group-hover/card:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x600/f0f4f8/94a3b8?text=Image+Error";
            }}
          />
        </div>

        {/* Top-left badges: campaign + discount */}
        <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-1">
          {campaignBadge && (
            <span
              className={`flex items-center gap-1 rounded bg-gradient-to-r ${campaignBadge.cls} px-1.5 py-0.5 text-[10px] font-bold text-white shadow`}
            >
              {campaignBadge.icon && <Zap className="h-3 w-3" />}
              {campaignBadge.label}
            </span>
          )}
          {discount > 0 && (
            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[11px] font-bold text-white shadow">
              -{discount}%
            </span>
          )}
        </div>

        {/* Top-right: product condition */}
        {condition && (
          <span className="absolute right-4 top-4 z-10 rounded bg-yellow-400 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-gray-900 shadow">
            {condition}
          </span>
        )}

        {/* Quick view */}
        <button
          type="button"
          onClick={(e) => onQuickView(product, e)}
          aria-label="Quick View"
          className="absolute bottom-4 right-4 z-20 rounded-full bg-white/95 p-2 text-blue-600 opacity-0 shadow-lg transition duration-300 hover:scale-110 hover:bg-white group-hover/card:opacity-100"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col border-t border-gray-100 px-3.5 py-3">
        <h4 className="mb-2 slider-line-clamp-2 min-h-[2.5rem] text-[13px] font-medium leading-snug text-gray-800 transition group-hover/card:text-blue-600">
          {product.title}
        </h4>

        <div className="mt-auto">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-lg font-bold text-blue-600">₹{product.newPrice.toFixed(2)}</span>
            {product.oldPrice > product.newPrice && (
              <span className="text-xs text-gray-400 line-through">₹{product.oldPrice.toFixed(2)}</span>
            )}
            {discount > 0 && (
              <span className="text-xs font-semibold text-green-600">{discount}% off</span>
            )}
          </div>

          {countdown && (
            <div className="mt-2 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 text-white shadow-sm">
              <span className="text-[11px] text-white/80">Ends in</span>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                {countdown.days > 0 && (
                  <span className="rounded bg-white/20 px-1.5 py-0.5">{countdown.days}d</span>
                )}
                <span className="rounded bg-white/20 px-1.5 py-0.5">{countdown.hours}h</span>
                <span className="rounded bg-white/20 px-1.5 py-0.5">{countdown.minutes}m</span>
              </div>
            </div>
          )}

          {/* Add to cart (click does NOT open detail page) */}
          <button
            type="button"
            disabled={adding || !product.productData?.stocks?.[0]?.id}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const stockId = product.productData?.stocks?.[0]?.id;
              if (!stockId) return;
              try {
                setAdding(true);
                await onAddToCart(stockId, 1);
              } catch (err) {
                /* error toast already shown */
              } finally {
                setAdding(false);
              }
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShoppingCart className="h-4 w-4" />
            {adding ? "Adding..." : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// LOGIN MODAL
// ---------------------------------------------------------------------------
const LoginModal = ({ isOpen, onClose, onLogin, onRegister }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⚠</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Login Required</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">✗</button>
        </div>

        <p className="text-gray-600 mb-6">
          You need to login to add items to cart. Please login or create an account.
        </p>

        <div className="flex flex-col gap-3">
          <button onClick={onLogin} className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Login Now
          </button>
          <button onClick={onRegister} className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
            Create New Account
          </button>
          <button onClick={onClose} className="w-full py-2 text-gray-500 hover:text-gray-700 transition">
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// QUICK VIEW MODAL (Add to cart + Buy now live here)
// ---------------------------------------------------------------------------
const QuickViewModal = ({ product, isOpen, onClose, onAddToCart, onBuyNow }) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const productData = product.productData;
  const maxQuantity = productData.stocks?.[0]?.maximum_order_quantity || 10;

  const backdropClass = `fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isOpen ? "opacity-100 bg-black/40" : "opacity-0 bg-black/0"}`;
  const modalContentClass = `w-11/12 max-w-2xl rounded-lg bg-white p-6 shadow-2xl transition-all duration-300 transform ${isOpen ? "scale-100 translate-y-0" : "scale-90 translate-y-4"}`;

  const handleModalAddToCartClick = async () => {
    const productStockId = productData.stocks?.[0]?.id;
    if (productStockId) {
      try {
        await onAddToCart(productStockId, quantity);
      } catch (e) {
        /* error toast already shown */
      }
      onClose();
    }
  };

  const handleModalBuyNowClick = async () => {
    const productStockId = productData.stocks?.[0]?.id;
    if (productStockId) {
      await onBuyNow(productStockId, quantity);
      onClose();
    }
  };

  return (
    <div className={backdropClass} onClick={onClose}>
      <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900 truncate pr-4">Quick View: {product.title}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-6">
          <div className="w-1/2 flex flex-col items-center">
            <img src={product.img} alt={product.title} className="w-full aspect-square object-contain rounded-lg border border-gray-200 bg-white" />
          </div>

          <div className="w-1/2">
            <p className="text-sm text-gray-500">
              Vendor: {productData.vendor_details?.business_name || "N/A"}
            </p>
            <div className="flex items-center mt-2">
              <p className="text-3xl font-semibold text-blue-600">₹{product.newPrice.toFixed(2)}</p>
              {product.oldPrice > product.newPrice && (
                <p className="ml-2 text-sm text-gray-500 line-through">₹{product.oldPrice.toFixed(2)}</p>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-2 slider-line-clamp-2">
              {productData.short_description || "No description available"}
            </p>

            <div className="flex items-center mt-4 border border-gray-300 w-28 rounded-md">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-1.5 text-gray-500 hover:bg-gray-100">-</button>
              <input type="text" value={quantity} readOnly className="w-full text-center border-x border-gray-300 py-1.5 text-sm font-medium" />
              <button onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))} className="p-1.5 text-gray-500 hover:bg-gray-100">+</button>
            </div>

            <p className="text-sm text-gray-600 mt-1">
              Total: <strong>₹{(product.newPrice * quantity).toFixed(2)}</strong>
            </p>

            <div className="flex gap-2 mt-6">
              <button onClick={handleModalBuyNowClick} className="flex-1 rounded-md bg-orange-500 py-2 text-white font-medium hover:bg-orange-600">
                Buy now
              </button>
              <button onClick={handleModalAddToCartClick} className="flex-1 rounded-md bg-blue-600 py-2 text-white font-medium hover:bg-blue-700">
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// CATEGORY SLIDER
// ---------------------------------------------------------------------------
const CategorySlider = ({ category, products: initialProducts, totalProducts }) => {
  const [start, setStart] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const products = initialProducts || [];

  // Modal States
  const [modalProduct, setModalProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Format price with campaign support (with decimal handling)
  const formatProductData = (product) => {
    let minPrice = 0;
    let maxPrice = 0;
    let campaignPrice = null;
    let originalPrice = null;
    const isInCampaign = product.is_in_campaign || false;
    const campaignDetails = product.campaign_details || null;

    // Check if product has campaign price
    if (isInCampaign && product.campaign_price) {
      campaignPrice = formatPrice(product.campaign_price);
      originalPrice = formatPrice(campaignDetails?.original_price);
    }

    // Get regular prices from stocks
    if (product.stocks && product.stocks.length > 0) {
      const sellingPrices = product.stocks.map((stock) => formatPrice(stock.selling_price));
      const mrps = product.stocks.map((stock) => formatPrice(stock.mrp));

      minPrice = Math.min(...sellingPrices);
      maxPrice = Math.max(...mrps);
    }

    return {
      id: product.id,
      title: product.product_name,
      oldPrice: campaignPrice ? originalPrice || maxPrice : maxPrice,
      newPrice: campaignPrice || minPrice,
      img: getProductImage(product),
      productData: product,
      categoryPlatformCharge: category.platform_charge || 0,
      isInCampaign,
      campaignType: campaignDetails?.campaign_type,
      campaignName: campaignDetails?.campaign_name,
      endDatetime: campaignDetails?.end_datetime,
    };
  };

  const formattedProducts = useMemo(() => {
    return products.map(formatProductData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, category.platform_charge]);

  // Responsive item count
  useEffect(() => {
    const updateItemsPerView = () => {
      const w = window.innerWidth;
      if (w >= 1280) setItemsPerView(5);
      else if (w >= 1024) setItemsPerView(4);
      else if (w >= 640) setItemsPerView(3);
      else setItemsPerView(1);
    };
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (formattedProducts.length === 0) return;
    const id = setInterval(
      () => setStart((s) => (s + 1) % formattedProducts.length),
      7000
    );
    return () => clearInterval(id);
  }, [formattedProducts.length]);

  // Visible products
  const visible = useMemo(() => {
    if (formattedProducts.length === 0) return [];
    const out = [];
    for (let i = 0; i < Math.min(itemsPerView, formattedProducts.length); i++) {
      out.push(formattedProducts[(start + i) % formattedProducts.length]);
    }
    return out;
  }, [start, itemsPerView, formattedProducts]);

  const prev = () => {
    if (formattedProducts.length === 0) return;
    setStart((s) => (s - 1 + formattedProducts.length) % formattedProducts.length);
  };

  const next = () => {
    if (formattedProducts.length === 0) return;
    setStart((s) => (s + 1) % formattedProducts.length);
  };

  // Add to cart function
  const addToCart = async (productStockId, quantity = 1) => {
    try {
      if (!isAuthenticated()) {
        addToast("Please login to add items to cart", "warning");
        sessionStorage.setItem("pendingCartProduct", JSON.stringify({ productStockId, quantity }));
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        setShowLoginModal(true);
        return;
      }

      const response = await axiosInstance.post("api/public/cart/", {
        product_stock: productStockId,
        quantity,
      });

      if (response.data.success) {
        addToast("Added to cart successfully!", "success");
        return response.data;
      }
      throw new Error(response.data.message || "Failed to add to cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      addToast("Failed to add to cart. Please try again.", "error");
      throw error;
    }
  };

  // Buy now function
  const handleBuyNow = async (productStockId, quantity = 1) => {
    try {
      if (!isAuthenticated()) {
        addToast("Please login to proceed with purchase", "warning");
        sessionStorage.setItem("pendingCartProduct", JSON.stringify({ productStockId, quantity }));
        sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
        setShowLoginModal(true);
        return;
      }

      await addToCart(productStockId, quantity);
      navigate("/checkout");
    } catch (error) {
      console.error("Buy now error:", error);
    }
  };

  // Modal functions
  const openModal = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalProduct(product);
    setTimeout(() => setIsModalOpen(true), 10);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setModalProduct(null), TRANSITION_DURATION);
  };

  if (products.length === 0) return null;

  return (
    <section className="bg-blue-50 border border-blue-400 rounded-lg p-4 sm:p-6 shadow-lg group">
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          navigate("/customer/login");
        }}
        onRegister={() => {
          setShowLoginModal(false);
          navigate("/customer/registration");
        }}
      />

      <style>{`
        .slider-line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900 uppercase">{category.name}</h2>
          <p className="text-sm text-gray-600">{totalProducts} products available</p>
        </div>
        <Link
          to={`/category-products?category=${category.id}`}
          className="text-sm text-blue-700 hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Slider Container */}
      <div className="relative flex-1 group/slider px-1 py-1">
        <div
          className="grid transition-all duration-300"
          style={{
            gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
            gap: "1rem",
          }}
        >
          {visible.map((product) => (
            <SliderProductCard key={product.id} product={product} onQuickView={openModal} onAddToCart={addToCart} />
          ))}
        </div>

        {/* Navigation Buttons */}
        {formattedProducts.length > itemsPerView && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white text-blue-600 rounded-full p-2.5 shadow-lg hover:bg-blue-600 hover:text-white opacity-0 group-hover/slider:opacity-100 transition duration-300 z-40 border border-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white text-blue-600 rounded-full p-2.5 shadow-lg hover:bg-blue-600 hover:text-white opacity-0 group-hover/slider:opacity-100 transition duration-300 z-40 border border-gray-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Quick View Modal */}
      {modalProduct && (
        <QuickViewModal
          product={modalProduct}
          isOpen={isModalOpen}
          onClose={closeModal}
          onAddToCart={addToCart}
          onBuyNow={handleBuyNow}
        />
      )}
    </section>
  );
};

export default CategorySlider;