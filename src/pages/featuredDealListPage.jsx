import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicAxios, axiosInstance } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  FiClock,
  FiShoppingCart,
  FiEye,
  FiStar,
  FiGift,
  FiTrendingUp,
  FiPercent,
  FiPackage,
  FiAlertCircle,
  FiAward,
  FiHeart,
  FiFilter
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import {
  FilterSection,
  FilterList,
  PriceRangeFilter,
  MobileFilterSidebar
} from "../components/common/filters/FilterComponets";

// ===== PRODUCT IMAGE HELPERS =====
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `https://api.initcart.in${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
};

const getProductImage = (product) => {
  // 1️⃣ Variant image first
  if (product?.stocks?.length > 0) {
    const variantImage = product.stocks[0]?.variant_image;
    if (variantImage) return getFullImageUrl(variantImage);
  }

  // 2️⃣ Main image
  if (product?.main_image) return getFullImageUrl(product.main_image);
  if (product?.img) return getFullImageUrl(product.img);

  // 3️⃣ Gallery fallback
  if (product?.gallery?.length > 0) {
    return getFullImageUrl(product.gallery[0]?.image);
  }

  // 4️⃣ Placeholder
  return "https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image";
};

// QuickViewModal Component
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
    return modalProduct.original_price || 0;
  };

  const getMaxOrderQuantity = () => {
    if (modalProduct.stocks && modalProduct.stocks.length > 0) {
      return modalProduct.stocks[0].maximum_order_quantity || 10;
    }
    return 10;
  };

  const price = parseFloat(getProductPrice());
  const oldPrice = getOldPrice() > 0 ? parseFloat(getOldPrice()) : null;
  const discount = modalProduct.discount_percentage || (oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0);
  const maxQuantity = getMaxOrderQuantity();

  const handleDecrease = () => setQuantity(prev => Math.max(1, prev - 1));
  const handleIncrease = () => setQuantity(prev => Math.min(maxQuantity, prev + 1));

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
        : modalProduct.id;

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
          <h3 className="text-xl font-bold text-gray-900">Quick View</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-6">
          <div className="w-1/2 flex flex-col items-center">
            <img
              src={getProductImage(modalProduct)}
              alt={modalProduct.name || modalProduct.title}
              className="w-full h-56 object-contain rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x400/f0f4f8/94a3b8?text=Image+Error"
              }}
            />
          </div>

          <div className="w-1/2">
            <p className="text-lg font-semibold text-gray-900 mb-2">{modalProduct.name || modalProduct.title}</p>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-extrabold text-indigo-600">₹{price.toFixed(2)}</span>
              {oldPrice && <span className="text-lg text-gray-400 line-through">₹{oldPrice.toFixed(2)}</span>}
              {discount > 0 && (
                <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                  {discount}% OFF
                </span>
              )}
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
              <div className="flex items-center border border-gray-300 rounded-md w-32">
                <button className="p-1.5 cursor-pointer text-gray-500 hover:bg-gray-100" onClick={handleDecrease} disabled={quantity <= 1}>
                  -
                </button>
                <input type="text" value={quantity} readOnly className="w-full text-center border-x border-gray-300 py-1.5 text-sm font-medium" />
                <button className="p-1.5 cursor-pointer text-gray-500 hover:bg-gray-100" onClick={handleIncrease} disabled={quantity >= maxQuantity}>
                  +
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mt-3">Total: <strong>₹{(price * quantity).toFixed(2)}</strong></p>

            <div className="flex gap-3 mt-6">
              <button onClick={handleAddToCartClick} className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-white font-semibold hover:bg-indigo-700 transition text-sm flex items-center justify-center gap-2">
                <FiShoppingCart /> Add to Cart
              </button>
              <button onClick={handleViewDetails} className="flex-1 rounded-lg bg-purple-500 py-2.5 text-white font-semibold hover:bg-purple-600 transition text-sm">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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

const FeaturedDealListPage = () => {
  const [products, setProducts] = useState([]);
  const [featuredDeal, setFeaturedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Countdown state
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
      featured: 0
    }
  });

  // Modal states
  const [modalProduct, setModalProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const TRANSITION_DURATION = 300;

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  // Check mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

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
        quantity
      });

      if (response.data.success) {
        addToast('Added to cart successfully!', 'success');
        return response.data;
      }
      throw new Error(response.data.message || 'Failed to add to cart');
    } catch (error) {
      console.error('Add to cart error:', error);
      addToast('Failed to add to cart. Please try again.', 'error');
      throw error;
    }
  };

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

  // Fetch categories and brands
  const fetchFilters = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        publicAxios.get("ecommerce/public/categories/"),
        publicAxios.get("ecommerce/public/brands/")
      ]);

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
      if (brandsRes.data) {
        setBrands(brandsRes.data);
      }
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };

  // Fetch all Featured Deal products
  useEffect(() => {
    const fetchFeaturedDealProducts = async () => {
      try {
        setLoading(true);

        // Fetch active Featured campaign
        const campaignResponse = await publicAxios.get("/api/ecommerce/public/campaigns/");
        const activeCampaigns = campaignResponse.data;

        // Find Featured campaign
        const featuredCampaign = activeCampaigns.find(c => c.campaign_type === 'Featured');

        if (featuredCampaign) {
          setFeaturedDeal(featuredCampaign);

          // Calculate initial time left
          if (featuredCampaign.end_datetime) {
            const endTime = new Date(featuredCampaign.end_datetime).getTime();
            const now = new Date().getTime();
            const diff = Math.max(0, endTime - now);
            setTimeLeft(calculateTimeLeft(diff));
          }

          // Fetch products for this campaign
          const productsResponse = await publicAxios.get(
            `/api/ecommerce/public/campaigns/${featuredCampaign.id}/products/`
          );

          // Transform API data
          const transformedProducts = productsResponse.data.map((p, index) => ({
            id: p.product_details?.id || p.id || index,
            uniqueId: `${p.product_details?.id || p.id || index}-${index}`,
            name: p.product_details?.product_name || p.product_name || 'Product',
            title: p.product_details?.product_name || p.product_name || 'Product',
            price: p.final_price || p.price || 0,
            original_price: p.original_price || p.old_price || 0,
            discount_percentage: p.discount_percentage || 0,
            main_image: p.product_details?.main_image || p.main_image || p.image,
            rating: p.product_details?.rating || 4.5,
            review_count: p.product_details?.review_count || 0,
            in_stock: p.product_details?.in_stock || true,
            vendor_name: p.product_details?.vendor_name || 'Vendor',
            stocks: p.product_details?.stocks || p.stocks || [],
            gallery: p.product_details?.gallery || p.gallery || [],
            description: p.product_details?.description || p.description || '',
            max_quantity: p.product_details?.stocks?.[0]?.maximum_order_quantity || 10,
            campaign_name: featuredCampaign.campaign_name,
            end_datetime: featuredCampaign.end_datetime,
            category: p.product_details?.category || p.category,
            brand: p.product_details?.brand || p.brand
          }));

          // Remove duplicate products by id
          const uniqueProducts = Array.from(
            new Map(transformedProducts.map(p => [p.id, p])).values()
          );

          setProducts(uniqueProducts);

          // ✅ [ADD THIS CODE] - DYNAMIC MAX PRICE
          if (uniqueProducts.length > 0) {
            // Products ki sabse max price nikaalo
            const maxProductPrice = Math.max(...uniqueProducts.map(p => p.price));
            // Nearest 100 tak round up karo
            const roundedMaxPrice = Math.ceil(maxProductPrice / 100) * 100;
            setMaxPrice(roundedMaxPrice);

          } else {
            setMaxPrice(50000); // Fallback
          }
          // ✅ [ADD CODE ENDS HERE]

          // Fetch filters after products are loaded
          fetchFilters();
        } else {
          setProducts([]);

          // Fallback data for development
          const fallbackProducts = [
            {
              id: 1,
              name: "Premium Leather Wallet",
              price: 1999,
              original_price: 3999,
              img: "https://placehold.co/400x400/f0f4f8/94a3b8?text=Wallet",
              discount_percentage: 50,
              in_stock: true,
              vendor_name: "LuxuryLeather",
              stocks: [{ id: 1, mrp: 3999, selling_price: 1999, final_price: 1999, maximum_order_quantity: 5 }],
              rating: 4.7,
              review_count: 342,
              category: 1,
              brand: 1
            },
            {
              id: 2,
              name: "Designer Sunglasses",
              price: 2999,
              original_price: 5999,
              img: "https://placehold.co/400x400/f0f4f8/94a3b8?text=Sunglasses",
              discount_percentage: 50,
              in_stock: true,
              vendor_name: "FashionEye",
              stocks: [{ id: 2, mrp: 5999, selling_price: 2999, final_price: 2999, maximum_order_quantity: 3 }],
              rating: 4.5,
              review_count: 267,
              category: 2,
              brand: 2
            }
          ];
          setProducts(fallbackProducts);

          // ✅ [ADD THIS CODE] - DYNAMIC MAX PRICE FOR FALLBACK
          const maxProductPrice = Math.max(...fallbackProducts.map(p => p.price));
          setMaxPrice(Math.ceil(maxProductPrice / 100) * 100);
          // ✅ [ADD CODE ENDS HERE]

          // Fallback filters
          setCategories([
            { id: 1, name: "Accessories", product_count: 12 },
            { id: 2, name: "Eyewear", product_count: 6 }
          ]);
          setBrands([
            { id: 1, brand_name: "LuxuryLeather", product_count: 4 },
            { id: 2, brand_name: "FashionEye", product_count: 2 }
          ]);
        }

        // Fetch upcoming deals
        const upcomingResponse = await publicAxios.get("/api/ecommerce/public/upcoming-deals/");
        setUpcomingDeals(upcomingResponse.data);

      } catch (err) {
        console.error("Error fetching featured deal data:", err);
        setError("Failed to load featured deals");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedDealProducts();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!featuredDeal?.end_datetime) return;

    const timer = setInterval(() => {
      const endTime = new Date(featuredDeal.end_datetime).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, endTime - now);
      setTimeLeft(calculateTimeLeft(diff));

      if (diff <= 0) {
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [featuredDeal]);

  // Filter products based on search, price, categories, and brands
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // ✅ [UPDATE THIS] - Price filter with dynamic max price
      const matchesPrice = product.price >= minPrice &&
        (maxPrice === 0 ? true : product.price <= maxPrice);

      // Category filter
      const matchesCategory = selectedCategories.length === 0 ||
        (product.category && selectedCategories.includes(product.category));

      // Brand filter
      const matchesBrand = selectedBrands.length === 0 ||
        (product.brand && selectedBrands.includes(product.brand));

      return matchesSearch && matchesPrice && matchesCategory && matchesBrand;
    });
  }, [products, searchTerm, minPrice, maxPrice, selectedCategories, selectedBrands]);

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
    navigate('/customer/login', { state: { from: window.location.pathname } });
  };

  const handleRegisterClick = () => {
    setShowLoginModal(false);
    navigate('/customer/registration', { state: { from: window.location.pathname } });
  };

  const formatTime = (num) => num.toString().padStart(2, '0');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-64 bg-white rounded-2xl shadow-xl mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-md h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No Featured Deal
  if (!featuredDeal && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-50 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center py-16">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">No Active Featured Deals</h2>
          <p className="text-gray-600 mb-6">Check back later for our featured collections!</p>
          <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 py-8 px-4">
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginClick}
        onRegister={handleRegisterClick}
      />

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

      {/* Mobile Filter Sidebar */}
      <MobileFilterSidebar
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        categories={categories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        brands={brands}
        selectedBrands={selectedBrands}
        setSelectedBrands={setSelectedBrands}
        onApplyFilters={() => setShowMobileFilters(false)}
        title="Featured Filters"
      />

      <div className="max-w-7xl mx-auto">
        {/* FANCY FEATURED DEAL HEADER WITH COUNTDOWN */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-300 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl animate-pulse delay-700"></div>
          </div>

          {/* Floating Stars */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute text-yellow-200/30 text-xl animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              >
                <FaStar />
              </div>
            ))}
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          <div className="relative p-8 md:p-12 text-white">
            {/* Top Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-lg px-6 py-2 rounded-full border border-white/30 shadow-lg">
                <FiStar className="h-5 w-5 text-yellow-300 animate-pulse" />
                <span className="font-semibold text-lg">FEATURED COLLECTION</span>
                <FiAward className="h-5 w-5 text-yellow-300 animate-pulse" />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-white to-pink-200">
                FEATURED DEALS
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-center text-lg md:text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Curated selection of premium products
            </p>

            {/* FANCY COUNTDOWN TIMER */}
            <div className="flex flex-col items-center mt-4 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FiClock className="h-6 w-6 text-yellow-300 animate-pulse" />
                <span className="text-xl font-semibold text-white/90">Featured ends in</span>
              </div>

              <div className="flex gap-4 md:gap-6 flex-wrap justify-center">
                {/* Days */}
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 shadow-xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {formatTime(timeLeft.days)}
                    </div>
                    <div className="text-xs md:text-sm text-indigo-200 font-medium mt-1">DAYS</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-white font-bold text-xs animate-pulse">
                    D
                  </div>
                </div>

                {/* Hours */}
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 shadow-xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {formatTime(timeLeft.hours)}
                    </div>
                    <div className="text-xs md:text-sm text-indigo-200 font-medium mt-1">HOURS</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-xs animate-pulse">
                    H
                  </div>
                </div>

                {/* Minutes */}
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 shadow-xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
                    <div className="text-3xl md:text-4xl font-bold text-white">
                      {formatTime(timeLeft.minutes)}
                    </div>
                    <div className="text-xs md:text-sm text-indigo-200 font-medium mt-1">MINUTES</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xs animate-pulse">
                    M
                  </div>
                </div>

                {/* Seconds */}
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 shadow-xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
                    <div className="text-3xl md:text-4xl font-bold text-white animate-pulse">
                      {formatTime(timeLeft.seconds)}
                    </div>
                    <div className="text-xs md:text-sm text-indigo-200 font-medium mt-1">SECONDS</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center text-white font-bold text-xs animate-pulse">
                    S
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {featuredDeal?.start_datetime && featuredDeal?.end_datetime && (
                <div className="w-full max-w-2xl mt-6">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(0, Math.min(100,
                          ((new Date(featuredDeal.end_datetime).getTime() - new Date().getTime()) /
                            (new Date(featuredDeal.end_datetime).getTime() - new Date(featuredDeal.start_datetime).getTime()) * 100
                          )))}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-center text-sm text-indigo-200 mt-2">
                    {Math.round((new Date(featuredDeal.end_datetime).getTime() - new Date().getTime()) / (1000 * 60))} minutes remaining
                  </p>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="mt-4 flex gap-6 flex-wrap justify-center">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <FiPackage className="text-yellow-300" />
                <span className="text-sm font-medium">{products.length} Featured Items</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <FiPercent className="text-pink-300" />
                <span className="text-sm font-medium">Save up to {products.length > 0 ?
                  Math.max(...products.map(p => p.discount_percentage || 0)) : 70}%</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <FiHeart className="text-red-300" />
                <span className="text-sm font-medium">Top Rated</span>
              </div>
            </div>

            {/* Upcoming Deal Banner */}
            {upcomingDeals?.next_deal && (
              <div className="mt-6 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="text-yellow-300" />
                  <span className="text-sm">Next Featured Deal in: </span>
                  <span className="font-bold">
                    {new Date(upcomingDeals.next_deal.start_datetime).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Wave */}
          <svg className="absolute bottom-0 left-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            {/* <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path> */}
          </svg>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="text-sm font-medium text-gray-600 order-2 md:order-1 whitespace-nowrap w-full md:w-auto">
                <span className="font-bold text-gray-900">{filteredProducts.length}</span> Featured Items Found
              </div>

              <div className="flex items-center gap-3 w-full order-1 md:order-2">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="md:hidden border border-gray-300 rounded-lg py-2 px-4 text-sm hover:bg-gray-50 transition flex items-center gap-2 flex-shrink-0"
                >
                  <FiFilter size={16} />
                  <span className="hidden xs:inline">Filters</span>
                </button>

                {/* Search Bar */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search featured products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl py-2.5 pl-4 pr-12 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button className="absolute right-0 top-0 bottom-0 px-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-r-xl text-white hover:from-blue-500 hover:to-blue-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* [UPDATE THIS LINE] - maxPrice < 200000 ki jagah maxPrice > 0 && maxPrice !== Math.max(...products.map(p => p.price)) */}
          {(selectedCategories.length > 0 || selectedBrands.length > 0 || minPrice > 0 || (maxPrice > 0 && maxPrice < Math.max(...products.map(p => p.price)))) && (
            <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-indigo-800">Applied Filters</h4>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedBrands([]);
                    setMinPrice(0);
                    // ✅ [UPDATE THIS] - Reset to dynamic max price
                    if (products.length > 0) {
                      const maxProductPrice = Math.max(...products.map(p => p.price));
                      setMaxPrice(Math.ceil(maxProductPrice / 100) * 100);
                    } else {
                      setMaxPrice(50000);
                    }
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {minPrice > 0 && (
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                    Min: ₹{minPrice}
                    <button onClick={() => setMinPrice(0)} className="hover:text-indigo-900">✗</button>
                  </span>
                )}
                {/* ✅ [UPDATE THIS CONDITION] - Sirf tab show karo jab maxPrice default se kam ho */}
                {maxPrice > 0 && maxPrice < Math.max(...products.map(p => p.price)) && (
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                    Max: ₹{maxPrice}
                    <button
                      onClick={() => {
                        const maxProductPrice = Math.max(...products.map(p => p.price));
                        setMaxPrice(Math.ceil(maxProductPrice / 100) * 100);
                      }}
                      className="hover:text-indigo-900"
                    >
                      ✗
                    </button>
                  </span>
                )}
                {/* Categories and brands filters - same rahenge */}
                {selectedCategories.map(catId => {
                  const category = categories.find(c => c.id === catId);
                  return category && (
                    <span key={catId} className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                      {category.name}
                      <button
                        onClick={() => setSelectedCategories(selectedCategories.filter(id => id !== catId))}
                        className="hover:text-indigo-900"
                      >
                        ✗
                      </button>
                    </span>
                  );
                })}
                {selectedBrands.map(brandId => {
                  const brand = brands.find(b => b.id === brandId);
                  return brand && (
                    <span key={brandId} className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                      {brand.brand_name}
                      <button
                        onClick={() => setSelectedBrands(selectedBrands.filter(id => id !== brandId))}
                        className="hover:text-indigo-900"
                      >
                        ✗
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Filters and Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block md:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit self-start sticky top-6">
            <h3 className="font-bold text-lg mb-6 text-gray-800 border-b pb-3">Filter Featured</h3>

            <FilterSection title="Price Range">
              <PriceRangeFilter
                minPrice={minPrice}
                maxPrice={maxPrice}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
              />
            </FilterSection>

            {categories && categories.length > 0 && (
              <FilterSection title="Categories">
                <FilterList isScrollable={true}>
                  {categories.map(category => (
                    <li key={category.id} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        className="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 w-4 h-4"
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                          }
                        }}
                      />
                      <label htmlFor={`category-${category.id}`} className="cursor-pointer">
                        {category.name} ({category.product_count || 0})
                      </label>
                    </li>
                  ))}
                </FilterList>
              </FilterSection>
            )}

            {brands && brands.length > 0 && (
              <FilterSection title="Brands">
                <FilterList isScrollable={true}>
                  {brands.map(brand => (
                    <li key={brand.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 w-4 h-4"
                          id={`brand-${brand.id}`}
                          checked={selectedBrands.includes(brand.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBrands([...selectedBrands, brand.id]);
                            } else {
                              setSelectedBrands(selectedBrands.filter(id => id !== brand.id));
                            }
                          }}
                        />
                        <label htmlFor={`brand-${brand.id}`} className="cursor-pointer">{brand.brand_name}</label>
                      </div>
                      <span className="text-xs text-gray-500">({brand.product_count || 0})</span>
                    </li>
                  ))}
                </FilterList>
              </FilterSection>
            )}
          </aside>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {error ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Products</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Featured Products Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || selectedCategories.length > 0 || selectedBrands.length > 0 || minPrice > 0 || maxPrice < 200000
                    ? "No products match your current filters. Try adjusting your search criteria."
                    : "Check back later for our featured collections!"}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategories([]);
                    setSelectedBrands([]);
                    setMinPrice(0);
                    // ✅ [UPDATE THIS] - Reset to dynamic max price
                    if (products.length > 0) {
                      const maxProductPrice = Math.max(...products.map(p => p.price));
                      setMaxPrice(Math.ceil(maxProductPrice / 100) * 100);
                    } else {
                      setMaxPrice(200000);
                    }
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-500 hover:to-blue-600 transition font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.uniqueId || product.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-indigo-200 relative"
                  >
                    {/* Featured Badge */}
                    <div className="absolute top-2 left-2 z-20">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                        <FiStar className="h-3 w-3" /> FEATURED
                      </div>
                    </div>

                    {/* Product Image Container */}
                    <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-50 overflow-hidden">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image";
                        }}
                      />

                      {/* Discount Badge */}
                      {product.discount_percentage > 0 && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                          -{product.discount_percentage}%
                        </div>
                      )}

                      {/* Quick View Button */}
                      <button
                        onClick={(e) => openModal(product, e)}
                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-indigo-600 text-gray-700 hover:text-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>

                      {/* Stock Badge */}
                      {product.in_stock ? (
                        <div className="absolute bottom-2 left-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          In Stock
                        </div>
                      ) : (
                        <div className="absolute bottom-2 left-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 h-10 group-hover:text-indigo-600 transition">
                        {product.name}
                      </h3>

                      {/* Price Section */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-bold text-blue-600">
                          ₹{product.price?.toFixed(2) || '0.00'}
                        </span>
                        {product.original_price > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.original_price?.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {product.rating > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">({product.review_count || 0})</span>
                        </div>
                      )}

                      {/* Quick View Button */}
                      <button
                        onClick={(e) => openModal(product, e)}
                        className="w-full mt-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-500 hover:to-blue-600 text-white py-2.5 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn"
                      >
                        <FiStar className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                        View Deal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default FeaturedDealListPage;