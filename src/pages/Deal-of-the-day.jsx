import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { publicAxios, axiosInstance } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";

const calculateDiscount = (oldPrice, newPrice) => {
  if (oldPrice <= 0 || !oldPrice) return "0%";
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  return `-${discount}%`;
};

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image";
  if (image.startsWith("http")) return image;
  return `https://api.initcart.in${image.startsWith("/") ? "" : "/"}${image}`;
};

// --- Simple Login Modal Component ---
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
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            ✗
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          You need to login to add items to cart. Please login or create an account.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login Now
          </button>

          <button
            onClick={onRegister}
            className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Create New Account
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-gray-500 hover:text-gray-700 transition"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Updated Quick View Modal ---
const QuickViewModal = ({ modalProduct, onClose, isModalOpen, onAddToCart, showLoginModal }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  if (!modalProduct) return null;

  const [quantity, setQuantity] = useState(1);

  const getProductPrice = () => {
    if (modalProduct.stocks && modalProduct.stocks.length > 0) {
      const stock = modalProduct.stocks[0];
      return stock.final_price > 0 ? stock.final_price : stock.selling_price;
    }
    return modalProduct.price || 0;
  };

  const getOldPrice = () => {
    if (modalProduct.stocks && modalProduct.stocks.length > 0) {
      return modalProduct.stocks[0].mrp || 0;
    }
    return modalProduct.oldPrice || 0;
  };

  const getMaxOrderQuantity = () => {
    if (modalProduct.stocks && modalProduct.stocks.length > 0) {
      return modalProduct.stocks[0].maximum_order_quantity || 10;
    }
    return 10;
  };

  const price = parseFloat(getProductPrice());
  const oldPrice = getOldPrice() > 0 ? parseFloat(getOldPrice()) : null;
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const maxQuantity = getMaxOrderQuantity();

  const handleDecrease = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity(prev => Math.min(maxQuantity, prev + 1));
  };

  const handleViewDetails = () => {
    onClose();
    navigate(`/product/${modalProduct.id}`);
  };

  const handleAddToCartClick = async () => {
    onClose();

    if (!isAuthenticated()) {
      showLoginModal();
      return;
    }

    try {
      const productStockId = modalProduct.stocks && modalProduct.stocks.length > 0
        ? modalProduct.stocks[0].id
        : null;

      if (!productStockId) {
        addToast('Product stock not available', 'error');
        return;
      }

      await onAddToCart(productStockId, quantity);
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image";
    if (image.startsWith('http')) return image;
    return `https://api.initcart.in${image.startsWith('/') ? '' : '/'}${image}`;
  };

  const backdropClass = `fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0'} ${isModalOpen ? 'bg-black/40' : 'bg-black/0'} ${isModalOpen ? "pointer-events-auto" : "pointer-events-none"}`;
  const modalContentClass = `w-11/12 max-w-2xl rounded-lg bg-white p-6 shadow-2xl transition-all duration-300 transform ${isModalOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}`;

  return (
    <div className={backdropClass} onClick={onClose}>
      <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Quick View: {modalProduct.name}</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-6">
          <div className="w-1/2 flex flex-col items-center">
            <img
              src={getImageUrl(modalProduct.img)}
              alt={modalProduct.name}
              className="w-full h-56 object-contain rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x400/f0f4f8/94a3b8?text=Image+Error"
              }}
            />
            <div className="flex gap-2 mt-3">
              {modalProduct.gallery && modalProduct.gallery.slice(0, 4).map((galleryItem, index) => (
                <img
                  key={index}
                  src={getImageUrl(galleryItem.image)}
                  className="h-12 w-12 object-cover rounded-md border border-gray-300 cursor-pointer"
                  alt={`${modalProduct.name} - Gallery ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="w-1/2">
            <p className="text-sm text-gray-500">Discount: <span className="text-blue-600 font-medium">{calculateDiscount(oldPrice, price)}</span></p>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-extrabold text-blue-600">₹{price.toFixed(2)}</span>
              {oldPrice && <span className="text-lg text-gray-400 line-through">₹{oldPrice.toFixed(2)}</span>}
              {discount > 0 && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Save {discount}%</span>}
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
              <div className="flex items-center border border-gray-300 rounded-md w-32">
                <button className="p-1.5 cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-l-md" onClick={handleDecrease} disabled={quantity <= 1} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input type="text" value={quantity} readOnly className="w-full text-center border-l border-r border-gray-300 py-1.5 text-sm font-medium bg-white" />
                <button className="p-1.5 cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-r-md" onClick={handleIncrease} disabled={quantity >= maxQuantity} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Maximum order quantity: <span className="font-semibold">{maxQuantity}</span> units</p>
            </div>

            <p className="text-sm text-gray-600 mt-3">Total Price: <strong>₹{(price * quantity).toFixed(2)}</strong></p>

            <div className="flex gap-4 mt-6">
              <button onClick={handleAddToCartClick} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm">
                Add to Cart
              </button>
              <button onClick={handleViewDetails} className="flex-1 rounded-lg bg-orange-500 py-2.5 text-white font-semibold hover:bg-orange-600 transition shadow-lg shadow-orange-200 text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Deal = () => {
  const [modalProduct, setModalProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [latestProducts, setLatestProducts] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [dealCampaign, setDealCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dealLoading, setDealLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dealError, setDealError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState({
    days : 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef(null);
  const TRANSITION_DURATION = 300;

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [ads, setAds] = useState([]);
  useEffect(() => {
    publicAxios
      .get("api/banners/init-smallads/")
      .then((res) => setAds(res.data))
      .catch((err) => console.error("Error fetching small ads:", err));
  }, []);

  // Slot 1 and Slot 2
  const slot1 = ads.find((ad) => ad.slot === 1);
  const slot2 = ads.find((ad) => ad.slot === 2);

  // Add to cart function
  const addToCart = async (productStockId, quantity = 1) => {
    try {
      if (!isAuthenticated()) {
        addToast('Please login to add items to cart', 'warning');
        setShowLoginModal(true);
        return;
      }

      const response = await axiosInstance.post('api/public/cart/', {
        product_stock: productStockId,
        quantity: quantity
      });

      if (response.data.success) {
        addToast('Added to cart successfully!', 'success');
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          addToast('Session expired. Please login again.', 'error');
          navigate('/customer/login');
        } else if (status === 400) {
          addToast(data.message || 'Invalid request', 'error');
        } else if (status === 404) {
          addToast('Product not found or out of stock', 'error');
        } else {
          addToast('Failed to add to cart. Please try again.', 'error');
        }
      } else {
        addToast('Network error. Please check your connection.', 'error');
      }
      throw error;
    }
  };

  // Fetch Deal of the Day Main Products
  useEffect(() => {
    const fetchDealOfDayProducts = async () => {
      try {
        setDealLoading(true);

        const response = await publicAxios.get("/api/ecommerce/public/deal-of-day/main-products/");


        if (response.data.products && response.data.products.length > 0) {
          const mappedProducts = response.data.products.map((product, index) => ({
            id: product.id,
            uniqueId: `${product.id}-${index}`,
            name: product.name,
            price: parseFloat(product.price),
            oldPrice: parseFloat(product.old_price),
            img: product.image || "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-23-66f14cd31f0d8.webp",
            discount_percentage: product.discount_percentage ||
              calculateDiscount(product.old_price, product.price).replace('-', '').replace('%', ''),
            in_stock: true,
            vendor_name: product.vendor_name || "Vendor",
            stocks: product.stocks || [],
            gallery: product.gallery || [],
            campaign_name: product.campaign_name,
            end_datetime: product.end_datetime
          }));

          setDealProducts(mappedProducts);
          setDealCampaign(response.data.campaign);
          setCurrentSlide(0);
          setDealError(null);
        } else {
          setDealProducts([]);
        }
      } catch (err) {
        console.error("Error fetching Deal of Day products:", err);
        setDealError("Failed to load deal products");

        // Fallback data for development
        const fallbackDealProducts = [
          {
            id: 1,
            name: "Exquisite 18K White Gold Diamond Necklace Set",
            price: 1680,
            oldPrice: 2400,
            img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-23-66f14cd31f0d8.webp",
            discount_percentage: 30,
            stocks: [{ id: 1, mrp: 2400, selling_price: 1680, final_price: 1680, maximum_order_quantity: 5 }],
            gallery: []
          },
          {
            id: 2,
            name: "Luxury Diamond Stud Earrings",
            price: 950,
            oldPrice: 1500,
            img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-23-66f14cd31f0d8.webp",
            discount_percentage: 37,
            stocks: [{ id: 2, mrp: 1500, selling_price: 950, final_price: 950, maximum_order_quantity: 5 }],
            gallery: []
          },
          {
            id: 3,
            name: "Premium Gold Bracelet",
            price: 1250,
            oldPrice: 1800,
            img: "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-23-66f14cd31f0d8.webp",
            discount_percentage: 31,
            stocks: [{ id: 3, mrp: 1800, selling_price: 1250, final_price: 1250, maximum_order_quantity: 5 }],
            gallery: []
          }
        ];
        setDealProducts(fallbackDealProducts);

        // Fallback campaign data
        const now = new Date();
        const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        setDealCampaign({
          id: 1,
          name: "Deal of the Day",
          end_datetime: endTime.toISOString(),
          countdown_seconds: 86400
        });
      } finally {
        setDealLoading(false);
      }
    };

    fetchDealOfDayProducts();
  }, []);

  // 🎯 Countdown Timer Effect
  useEffect(() => {
    if (!dealCampaign || !dealCampaign.end_datetime) return;

    const calculateTimeLeft = () => {
      try {
        const now = new Date().getTime();
        const endTime = new Date(dealCampaign.end_datetime).getTime();
        const difference = endTime - now;

        if (difference > 0) {
          const days = Math.floor((difference / (1000 * 60 * 60 * 24)));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch (error) {
        console.error("Error calculating time left:", error);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [dealCampaign]);

  // 🎯 Auto-slider functionality
  useEffect(() => {
    if (dealProducts.length > 1) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % dealProducts.length);
      }, 5000);
    }

    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [dealProducts.length]);

  // Manual slide navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
      slideInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % dealProducts.length);
      }, 5000);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % dealProducts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + dealProducts.length) % dealProducts.length);
  };

  // API से latest products fetch करें
  useEffect(() => {
    const fetchAllDealProducts = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get("/api/ecommerce/public/deal-of-day/all-products/");

        
        if (response.data.success && response.data.products) {
          const mappedProducts = response.data.products.map((product, index) => ({
            id: product.product_id || product.id,
            uniqueId: `${product.product_id || product.id}-${index}`,
            name: product.name || product.product_name,
            price: parseFloat(product.final_price || product.price || 0),
            oldPrice: parseFloat(product.old_price || product.original_price || 0),
            img: product.image || product.main_image || product.thumbnail_image || "https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image",
            discount_percentage: product.discount_percentage || 0,
            in_stock: product.in_stock || true,
            vendor_name: product.vendor_name || "Vendor",
            stocks: product.stocks || [],
            gallery: product.gallery || [],
            description: product.description || product.short_description || "",
            rating: product.rating || 4,
            review_count: product.review_count || 0,
            max_quantity: product.stocks?.[0]?.maximum_order_quantity || 10,
            placement: product.deal_of_day_placement,
            campaign_name: product.campaign_name,
            end_datetime: product.end_datetime
          }));
          
          setLatestProducts(mappedProducts);
          setDealCampaign(response.data.campaign);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching deal products:", err);
        setError("Failed to load deal products");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllDealProducts();
  }, []);

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

  // Login modal handlers
  const handleLoginClick = () => {
    setShowLoginModal(false);
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/customer/login', {
      state: { from: window.location.pathname }
    });
  };

  const handleRegisterClick = () => {
    setShowLoginModal(false);
    navigate('/customer/registration', {
      state: { from: window.location.pathname }
    });
  };

  // Loading state for deal products
  const renderLoadingDeal = () => (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-44 h-44 bg-gray-200 animate-pulse rounded-md"></div>
      <div className="mt-4 h-5 w-40 bg-gray-200 animate-pulse rounded"></div>
      <div className="mt-2 h-4 w-32 bg-gray-100 animate-pulse rounded"></div>
      <div className="mt-4 h-10 w-32 bg-blue-200 animate-pulse rounded-md"></div>
    </div>
  );

  // Loading state for latest products
  const renderLoadingProducts = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={`loading-${i}`} className="bg-gray-50 p-3 rounded-lg shadow-sm">
          <div className="w-full h-32 flex items-center justify-center overflow-hidden relative">
            <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="mt-3 h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="flex justify-center items-center gap-2 mt-1">
            <div className="h-4 w-12 bg-gray-100 animate-pulse rounded"></div>
            <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Format time with leading zeros
  const formatTime = (num) => {
    return num.toString().padStart(2, '0');
  };

  // Current deal product
  const currentProduct = dealProducts[currentSlide] || null;

  // Check if any content exists
  const hasDealContent = dealProducts.length > 0 || latestProducts.length > 0;

  return (
    <>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginClick}
        onRegister={handleRegisterClick}
      />

      {/* ✅ Sirf tab dikhao jab koi content ho */}
      {hasDealContent && (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6 bg-gray-50">
          {/* 🎯 DYNAMIC DEAL OF THE DAY - SLIDER SECTION */}
          {dealProducts.length > 0 && (
            <div className="rounded-xl p-5 shadow-md flex flex-col items-center border border-blue-500 bg-white relative">
              {/* Header with Countdown Timer */}
              <div className="w-full flex flex-col items-center mb-4">
                <h2 className="text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 rounded-full mb-2">
                  DEAL OF THE DAY
                </h2>

                {/* Countdown Timer */}
                {dealCampaign && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2 rounded-xl shadow-lg text-white w-fit">
                    {/* Icon */}
{/*                     <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div> */}

                    {/* Timer Blocks */}
                    <div className="flex items-center gap-2 text-sm font-bold tracking-wide">
                      <div className="bg-white text-blue-600 px-2 py-1 rounded-md min-w-[38px] text-center shadow">
                        {formatTime(timeLeft.days)}
                        <div className="text-[8px] font-medium text-gray-500">DAYS</div>
                      </div>
                       <span className="text-lg font-bold">:</span>
                      <div className="bg-white text-blue-600 px-2 py-1 rounded-md min-w-[38px] text-center shadow">
                        {formatTime(timeLeft.hours)}
                        <div className="text-[8px] font-medium text-gray-500">HRS</div>
                      </div>

                      <span className="text-lg font-bold">:</span>

                      <div className="bg-white text-blue-600 px-2 py-1 rounded-md min-w-[38px] text-center shadow">
                        {formatTime(timeLeft.minutes)}
                        <div className="text-[8px] font-medium text-gray-500">MIN</div>
                      </div>

                      <span className="text-lg font-bold">:</span>

                      <div className="bg-white text-blue-600 px-2 py-1 rounded-md min-w-[38px] text-center shadow">
                        {formatTime(timeLeft.seconds)}
                        <div className="text-[8px] font-medium text-gray-500">SEC</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {dealLoading ? (
                renderLoadingDeal()
              ) : dealError ? (
                <div className="text-center p-6">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-500 text-sm mb-2">{dealError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-blue-600 underline text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Product Image with Slider Controls */}
                  <div className="relative w-44 h-44 group">
                    <img
                      src={getImageUrl(currentProduct?.img)}
                      alt={currentProduct?.name}
                      className="w-full h-full object-cover rounded-lg transition-opacity duration-500 border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-23-66f14cd31f0d8.webp";
                      }}
                    />

                    {/* Discount Badge */}
                    {currentProduct?.discount_percentage > 0 && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg">
                        -{currentProduct.discount_percentage}%
                      </span>
                    )}

                    {/* Navigation Arrows */}
                    {dealProducts.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                          aria-label="Previous product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                          aria-label="Next product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}

                    {/* Quick View Icon */}
                    <button
                      onClick={(e) => openModal(currentProduct, e)}
                      className="absolute bottom-2 right-2 bg-white/90 hover:bg-blue-600 text-gray-700 hover:text-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      aria-label="Quick View"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.009 9.96 7.173.18.529.18.977 0 1.506C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.009-9.96-7.173z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Title */}
                  <h3 className="mt-4 text-center text-gray-800 font-semibold line-clamp-2 h-12 px-2 hover:text-blue-600 transition-colors">
                    {currentProduct?.name}
                  </h3>

                  {/* Price Section */}
                  <div className="mt-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-gray-400 line-through text-sm">
                        ₹{currentProduct?.oldPrice?.toFixed(2)}
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        ₹{currentProduct?.price?.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-green-600 font-medium mt-1">
                      You Save: ₹{(currentProduct?.oldPrice - currentProduct?.price)?.toFixed(2)} ({currentProduct?.discount_percentage}% OFF)
                    </p>
                  </div>

                  {/* Slider Dots */}
                  {dealProducts.length > 1 && (
                    <div className="flex gap-2 mt-4">
                      {dealProducts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            index === currentSlide
                              ? 'w-8 bg-blue-600'
                              : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Grab This Deal Button - Full Width */}
                  <button
                    onClick={(e) => openModal(currentProduct, e)}
                    className="mt-5 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-5 py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Grab This Deal
                  </button>

                  {/* Product Counter */}
                  {dealProducts.length > 1 && (
                    <p className="text-xs text-gray-500 mt-3">
                      {currentSlide + 1} / {dealProducts.length} products
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* All Deal Products Section - SIRF TAB DIKHAO JAB PRODUCTS HON */}
          {latestProducts.length > 0 && (
            <div className="lg:col-span-3 rounded-lg border border-blue-400 p-5 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  All Deal of the Day Products
                </h2>
                <Link to="/dealOfTheDayListPage" className="text-sm text-blue-700 hover:text-blue-800 font-medium flex items-center gap-1 group">
                  View All
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {error && (
                <div className="text-center p-4 border border-red-200 bg-red-50 rounded-lg mb-4">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {loading ? (
                renderLoadingProducts()
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {latestProducts.map((product) => (
                    <div
                      key={product.uniqueId || product.id}
                      className="bg-gray-50 p-3 rounded-lg shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-300 block group/card relative border border-transparent hover:border-blue-200"
                    >
                      {/* Top Left Curved Triangle */}
                      <svg
                        className="absolute top-0 left-0 z-10"
                        width="40"
                        height="40"
                        viewBox="0 0 40 40"
                      >
                        <path
                          d="M0 0 H40 Q5 1 0 40 "
                          fill="#2563eb"
                        />
                      </svg>

                      {/* Blue Overlay on hover */}
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover/card:opacity-100 transition duration-300 pointer-events-none z-10"></div>

                      {/* Product Image and Quick View Icon Container */}
                      <div className="w-full h-32 flex items-center justify-center overflow-hidden relative z-20">
                        <img
                          src={getImageUrl(product.img)}  
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover/card:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2024-09-22-66f0027e72108.webp";
                          }}
                        />

                        {/* Quick View Eye Icon */}
                        <button
                          onClick={(e) => openModal(product, e)}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 p-2.5 rounded-full bg-white text-gray-700 hover:bg-blue-600 hover:text-white shadow-lg cursor-pointer z-30 hover:scale-110"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.009 9.96 7.173.18.529.18.977 0 1.506C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.009-9.96-7.173z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>

                        {/* Discount Badge */}
                        {product.discount_percentage > 0 && (
                          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold">
                            -{product.discount_percentage}%
                          </span>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="mt-3 text-sm font-medium text-gray-800 text-center group-hover/card:text-blue-600 transition-colors relative z-20 line-clamp-2 h-10">
                        {product.name}
                      </h3>

                      {/* Prices */}
                      <div className="flex justify-center items-center gap-2 mt-1 relative z-20">
                        <p className="text-gray-400 line-through text-xs">
                          ₹{product.oldPrice?.toFixed(2)}
                        </p>
                        <p className="text-base font-bold text-gray-900">
                          ₹{product.price?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick View Modal */}
          {modalProduct && (
            <QuickViewModal
              modalProduct={modalProduct}
              onClose={closeModal}
              isModalOpen={isModalOpen}
              onAddToCart={addToCart}
              showLoginModal={() => setShowLoginModal(true)}
            />
          )}
        </div>
      )}

      {/* 📢 Two Marketing Banners - YEH HAMESHA DIKHENGE */}
      <section className="py-8 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Slot 1 */}
          {slot1 ? (
            <div className="relative rounded-xl overflow-hidden shadow-lg group">
              <img
                src={slot1.image}
                alt={slot1.title || "banner1"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              {(slot1.title || slot1.url) && (
                <div className="absolute bottom-0 left-0 p-4 sm:p-5 md:p-6 flex flex-col gap-2">
                  {slot1.title && (
                    <h3 className="text-white font-bold leading-snug text-lg sm:text-xl md:text-2xl max-w-[70%] drop-shadow-lg">
                      {slot1.title}
                    </h3>
                  )}
                  {slot1.url && (
                    <a
                      href={slot1.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-center rounded-lg transition-all duration-300 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 text-sm font-medium w-fit hover:scale-105 shadow-lg"
                    >
                      Shop Now →
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 flex items-center justify-center">
              <p className="text-white text-lg font-medium">Ad Space Available</p>
            </div>
          )}

          {/* Slot 2 */}
          {slot2 ? (
            <div className="relative rounded-xl overflow-hidden shadow-lg group">
              <img
                src={slot2.image}
                alt={slot2.title || "banner2"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              {(slot2.title || slot2.url) && (
                <div className="absolute bottom-0 left-0 p-4 sm:p-5 md:p-6 flex flex-col gap-2">
                  {slot2.title && (
                    <h3 className="text-white font-bold leading-snug text-lg sm:text-xl md:text-2xl max-w-[70%] drop-shadow-lg">
                      {slot2.title}
                    </h3>
                  )}
                  {slot2.url && (
                    <a
                      href={slot2.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-center rounded-lg transition-all duration-300 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 text-sm font-medium w-fit hover:scale-105 shadow-lg"
                    >
                      Shop Now →
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-8 flex items-center justify-center">
              <p className="text-white text-lg font-medium">Ad Space Available</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Deal;