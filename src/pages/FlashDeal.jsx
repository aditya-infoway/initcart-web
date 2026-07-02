import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicAxios, axiosInstance } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// ===== FIXED IMAGE HELPER =====
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("https")) return imagePath;
  // Remove any duplicate /media/
  const cleanPath = imagePath.replace(/^\/+/, '').replace(/^media\//, '');
  return `https://api.initcart.in/media/${cleanPath}`;
};

const getProductImage = (product) => {
  // Try multiple sources for product image
  if (product?.productData?.main_image) {
    return getFullImageUrl(product.productData.main_image);
  }
  if (product?.productData?.thumbnail) {
    return getFullImageUrl(product.productData.thumbnail);
  }
  if (product?.main_image) {
    return getFullImageUrl(product.main_image);
  }
  if (product?.image) {
    return getFullImageUrl(product.image);
  }
  if (product?.img) {
    return getFullImageUrl(product.img);
  }
  // Try stock images
  if (product?.productData?.stocks?.length > 0) {
    const stock = product.productData.stocks[0];
    if (stock?.variant_image) {
      return getFullImageUrl(stock.variant_image);
    }
    if (stock?.image) {
      return getFullImageUrl(stock.image);
    }
  }
  // Fallback image
  return "https://via.placeholder.com/300x300?text=No+Image";
};

export default function FlashDeal() {
  // ========== STATE MANAGEMENT ==========
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Flash Deal Campaign State
  const [flashDeal, setFlashDeal] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Upcoming Deals State
  const [upcomingDeals, setUpcomingDeals] = useState({
    total_upcoming: 0,
    next_deal: null,
    by_type: {
      flash: 0,
    }
  });

  // Slider State
  const [start, setStart] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [autoSlideInterval, setAutoSlideInterval] = useState(null);

  // Modal State
  const [modalProduct, setModalProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const TRANSITION_DURATION = 300;

  // Add to cart related
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // ========== API CALLS ==========
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch active Flash Deal campaign
        const campaignResponse = await publicAxios.get("/api/ecommerce/public/campaigns/");
        const activeCampaigns = campaignResponse.data;

        // Find Flash Deal campaign
        const flashCampaign = activeCampaigns.find(c => c.campaign_type === 'Flash');

        if (flashCampaign) {
          setFlashDeal(flashCampaign);

          // Fetch products for this campaign
          const productsResponse = await publicAxios.get(
            `/api/ecommerce/public/campaigns/${flashCampaign.id}/products/`
          );
          // Transform API data to match component format with proper images
          const transformedProducts = productsResponse.data.map(p => {
            const productDetails = p.product_details || p;
            

            
            return {
              id: productDetails.id || p.id,
              title: productDetails.product_name || 'Product',
              price: p.final_price || productDetails.price || 0,
              original_price: p.original_price || productDetails.original_price,
              discount_percentage: p.discount_percentage || productDetails.discount_percentage,
              rating: 4.5,
              reviews: Math.floor(Math.random() * 50) + 10,
              // Store all possible image sources
              main_image: productDetails.main_image,
              thumbnail: productDetails.thumbnail,
              variant_image: productDetails.stocks?.[0]?.variant_image,
              productData: productDetails
            };
          });

          // Remove duplicate products by id
          const uniqueProducts = Array.from(
            new Map(transformedProducts.map(p => [p.id, p])).values()
          );


          setProducts(uniqueProducts);

          // Calculate initial time left
          if (flashCampaign.end_datetime) {
            const endTime = new Date(flashCampaign.end_datetime).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, endTime - now);
            setTimeLeft(calculateTimeLeft(diff));
          }
        } else {
          setProducts([]);
        }

        // Fetch upcoming deals
        try {
          const upcomingResponse = await publicAxios.get("/api/ecommerce/public/upcoming-deals/");
          setUpcomingDeals(upcomingResponse.data);
        } catch (upcomingErr) {

        }

      } catch (err) {
        console.error("Error fetching flash deal data:", err);
        setError("Failed to load flash deals");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to calculate time left
  const calculateTimeLeft = (diff) => {
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
  };

  // ========== COUNTDOWN TIMER ==========
  useEffect(() => {
    if (!flashDeal?.end_datetime) return;

    const timer = setInterval(() => {
      const endTime = new Date(flashDeal.end_datetime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, endTime - now);
      setTimeLeft(calculateTimeLeft(diff));

      if (diff <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [flashDeal]);

  // ========== SLIDER LOGIC ==========
  const visibleProducts = useMemo(() => {
    if (products.length === 0) return [];
    return products.slice(start, start + itemsPerView);
  }, [products, start, itemsPerView]);

  // Responsive items per view
  useEffect(() => {
    const setFromWidth = () => {
      const w = window.innerWidth;
      if (w >= 1280) setItemsPerView(4);
      else if (w >= 1024) setItemsPerView(3);
      else if (w >= 640) setItemsPerView(2);
      else setItemsPerView(1);
    };

    setFromWidth();
    window.addEventListener("resize", setFromWidth);
    return () => window.removeEventListener("resize", setFromWidth);
  }, []);

  // Auto slide every 7 seconds
  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      setStart((prevStart) => (prevStart + itemsPerView) % products.length);
    }, 7000);

    setAutoSlideInterval(interval);
    return () => clearInterval(interval);
  }, [products.length, itemsPerView]);

  // Reset auto slide when manually navigating
  const resetAutoSlide = useCallback(() => {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      const newInterval = setInterval(() => {
        setStart((prevStart) => (prevStart + itemsPerView) % products.length);
      }, 7000);
      setAutoSlideInterval(newInterval);
    }
  }, [autoSlideInterval, products.length, itemsPerView]);

  const prev = useCallback(() => {
    setStart(prev => {
      if (prev - itemsPerView < 0)
        return Math.max(products.length - itemsPerView, 0);
      return prev - itemsPerView;
    });
    resetAutoSlide();
  }, [products.length, itemsPerView, resetAutoSlide]);

  const next = useCallback(() => {
    setStart(prev => {
      if (prev + itemsPerView >= products.length) return 0;
      return prev + itemsPerView;
    });
    resetAutoSlide();
  }, [products.length, itemsPerView, resetAutoSlide]);

  // ========== CART FUNCTIONS ==========
  const addToCart = async (productStockId, qty = 1) => {
    try {
      if (!isAuthenticated()) {
        addToast('Please login to add items to cart', 'warning');
        sessionStorage.setItem('pendingCartProduct', JSON.stringify({
          productStockId: productStockId,
          quantity: qty
        }));
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        setShowLoginModal(true);
        return;
      }

      const response = await axiosInstance.post('api/public/cart/', {
        product_stock: productStockId,
        quantity: qty
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

  const handleBuyNow = async (productStockId, qty = 1) => {
    try {
      if (!isAuthenticated()) {
        addToast('Please login to proceed with purchase', 'warning');
        sessionStorage.setItem('pendingCartProduct', JSON.stringify({
          productStockId: productStockId,
          quantity: qty
        }));
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        setShowLoginModal(true);
        return;
      }

      await addToCart(productStockId, qty);
      navigate('/checkout');
    } catch (error) {
      console.error('Buy now error:', error);
    }
  };

  // ========== MODAL FUNCTIONS ==========
  const openModal = useCallback((product, e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalProduct(product);
    setModalQuantity(1);
    setTimeout(() => setIsModalOpen(true), 10);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setModalProduct(null), TRANSITION_DURATION);
  }, []);

  // ========== LOGIN MODAL COMPONENT ==========
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

  // ========== QUICK VIEW MODAL COMPONENT ==========
  const QuickViewModal = () => {
    if (!modalProduct) return null;

    const price = modalProduct.price?.toFixed(2) || "0.00";
    const originalPrice = modalProduct.original_price?.toFixed(2);
    const discount = modalProduct.discount_percentage;

    const backdropClass = `fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isModalOpen ? 'bg-black/40' : 'bg-black/0'}`;
    const modalContentClass = `w-11/12 max-w-2xl rounded-lg bg-white p-6 shadow-2xl transition-all duration-300 transform ${isModalOpen ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}`;

    const handleDecrease = () => setModalQuantity(prev => Math.max(1, prev - 1));
    const handleIncrease = () => setModalQuantity(prev => prev + 1);

    const handleModalAddToCart = async () => {
      const productStockId = modalProduct.productData?.stocks?.[0]?.id || modalProduct.id;
      await addToCart(productStockId, modalQuantity);
      closeModal();
    };

    const handleModalBuyNow = async () => {
      const productStockId = modalProduct.productData?.stocks?.[0]?.id || modalProduct.id;
      await handleBuyNow(productStockId, modalQuantity);
      closeModal();
    };

    return (
      <div className={backdropClass} onClick={closeModal}>
        <div className={modalContentClass} onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Quick View: {modalProduct.title}</h3>
            <button onClick={closeModal} className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2 flex flex-col items-center">
              <img
                src={getProductImage(modalProduct)}
                alt={modalProduct.title}
                className="w-full h-56 object-contain rounded-lg border border-gray-200"
                onError={(e) => {
                  console.error("Image failed to load:", e.target.src);
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
            </div>

            <div className="md:w-1/2">
              <p className="text-sm text-gray-500">Flash Deal Special</p>

              {discount ? (
                <div className="mt-2">
                  <p className="text-3xl font-semibold text-blue-600">₹{price}</p>
                  <p className="text-sm text-gray-500 line-through">₹{originalPrice}</p>
                  <p className="text-sm text-green-600">{discount}% OFF</p>
                </div>
              ) : (
                <p className="text-3xl font-semibold text-blue-600 mt-2">₹{price}</p>
              )}

              <div className="flex items-center mt-4 border border-gray-300 w-28 rounded-md">
                <button onClick={handleDecrease} className="p-1.5 cursor-pointer text-gray-500 hover:text-gray-900">-</button>
                <input type="text" value={modalQuantity} readOnly className="w-full text-center border-l border-r border-gray-300 py-1.5 text-sm font-medium" />
                <button onClick={handleIncrease} className="p-1.5 cursor-pointer text-gray-500 hover:text-gray-900">+</button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Total Price: ₹{(modalProduct.price * modalQuantity).toFixed(2)}</p>

              <div className="flex gap-2 mt-6">
                <button onClick={handleModalAddToCart} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-sm">
                  Add to cart
                </button>
                <button onClick={handleModalBuyNow} className="flex-1 rounded-lg bg-orange-500 py-2.5 text-white font-semibold hover:bg-orange-600 transition shadow-lg shadow-orange-200 text-sm">
                  Buy now
                </button>
                <button className="p-3 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition" aria-label="Add to wishlist">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <section className="bg-blue-50 border border-blue-400 rounded-lg p-6 mt-8 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-200 rounded w-48 mb-6"></div>
          <div className="flex gap-6">
            <div className="bg-blue-700 rounded-lg p-6 w-full lg:w-[340px] h-48"></div>
            <div className="flex-1 grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ========== ERROR STATE ==========
  if (error && products.length === 0) {
    return (
      <section className="bg-blue-50 border border-blue-400 rounded-lg p-6 mt-8 shadow-sm">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Retry
          </button>
        </div>
      </section>
    );
  }

  // ========== NO FLASH DEAL ==========
  if (!flashDeal?.id || products.length === 0) {
    return null;
  }

  // ========== MAIN RENDER ==========
  return (
    <section className="bg-blue-50 border border-blue-400 rounded-lg p-6 mt-8 shadow-sm group">
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setShowLoginModal(false);
          navigate('/customer/login');
        }}
        onRegister={() => {
          setShowLoginModal(false);
          navigate('/customer/registration');
        }}
      />

      {/* Section Header */}
      <div className="flex items-center border-blue-400 justify-between mb-6">
        <h2 className="text-lg font-bold text-blue-900">FLASH DEAL</h2>
        <Link to="/FlashDealListPage" className="text-sm text-blue-700 hover:underline">
          View All
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Countdown Timer */}
        <div className="bg-blue-700 text-white rounded-lg p-6 flex flex-col items-center justify-center w-full lg:w-[340px]">
          <h3 className="text-center font-medium text-sm mb-4 leading-5">
            Hurry Up! The offer is limited. <br />
            Grab while it lasts
          </h3>
          <div className="flex justify-center space-x-3 text-center">
            {Object.entries(timeLeft).map(([key, value]) => (
              <div key={key} className="bg-blue-900 rounded-md p-2 min-w-[60px]">
                <div className="text-xl font-bold">
                  {value.toString().padStart(2, "0")}
                </div>
                <div className="text-[10px] uppercase tracking-wide">{key}</div>
              </div>
            ))}
          </div>
          <div className="w-full h-1 bg-blue-300 mt-4 rounded-full overflow-hidden">
            <div
              className="bg-white h-1 rounded-full transition-all duration-1000"
              style={{
                width: flashDeal?.end_datetime ?
                  `${Math.max(0, Math.min(100,
                    ((new Date(flashDeal.end_datetime).getTime() - new Date().getTime()) /
                      (new Date(flashDeal.end_datetime).getTime() - new Date(flashDeal.start_datetime).getTime()) * 100
                    )))}%` : '75%'
              }}
            ></div>
          </div>
        </div>

        {/* Product Slider */}
        <div className="relative flex-1 group/slider">
          <div
            className="grid transition-all duration-300"
            style={{
              gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))`,
              gap: "1rem",
            }}
          >
            {visibleProducts.map((product, index) => (
              <Link
                to={`/product/${product.id}`}
                key={`${product.id}-${index}`}
                className="bg-white rounded-lg border border-blue-400 shadow p-4 flex flex-col hover:shadow-lg transition group/card relative"
              >
                <div className="absolute inset-0 rounded-lg bg-blue-100/70 opacity-0 group-hover/card:opacity-100 transition duration-300 pointer-events-none z-10"></div>

                <div className="h-36 flex items-center justify-center overflow-hidden mb-3 relative z-20">
                  <img
                    src={getProductImage(product)}
                    alt={product.title}
                    className="object-contain h-full w-full transition-transform hover:scale-105"
                    onError={(e) => {
                      console.error("Image failed to load for product:", product.title);
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />

                  <button
                    onClick={(e) => openModal(product, e)}
                    aria-label="Quick View"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/card:opacity-100 transition duration-300 p-3 rounded-full bg-white text-gray-700 hover:bg-gray-100 shadow-lg cursor-pointer z-30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.009 9.96 7.173.18.529.18.977 0 1.506C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.009-9.96-7.173z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>

                  {product.discount_percentage > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-30">
                      {product.discount_percentage}% OFF
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-medium text-gray-800 truncate relative z-20">
                  {product.title}
                </h4>
                <div className="flex items-center gap-2 mt-1 relative z-20">
                  <span className="text-sm font-semibold text-blue-600">
                    ₹{product.price?.toFixed(2)}
                  </span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.original_price?.toFixed(2)}
                    </span>
                  )}
                </div>

                {product.rating > 0 && (
                  <div className="flex items-center mt-1 relative z-20">
                    <div className="text-yellow-400 text-xs mr-1">
                      {"★".repeat(Math.floor(product.rating))}
                    </div>
                    <span className="text-xs text-gray-500">({product.reviews})</span>
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* Navigation Buttons */}
          {products.length > itemsPerView && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 opacity-0 group-hover/slider:opacity-100 transition duration-300 z-40"
                aria-label="Previous products"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 opacity-0 group-hover/slider:opacity-100 transition duration-300 z-40"
                aria-label="Next products"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal />
    </section>
  );
}