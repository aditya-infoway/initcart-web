import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicAxios, axiosInstance } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { 
  FiClock, 
  FiShoppingCart, 
  FiEye, 
  FiTag, 
  FiGift,
  FiTrendingUp,
  FiStar,
  FiPercent,
  FiPackage,
  FiFilter
} from "react-icons/fi";
import { Zap } from "lucide-react";
import {
  FilterSection,
  FilterList,
  PriceRangeFilter,
  MobileFilterSidebar
} from "../components/common/filters/FilterComponets";

// ===== IMAGE HELPERS =====
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

  // 2️⃣ Main image (API mapped)
  if (product.main_image) return getFullImageUrl(product.main_image);
  if (product.img) return getFullImageUrl(product.img);

  // 3️⃣ Gallery fallback
  if (product?.gallery?.length > 0) {
    return getFullImageUrl(product.gallery[0]?.image);
  }

  // 4️⃣ Placeholder
  return "https://placehold.co/400x400/f0f4f8/94a3b8?text=No+Image";
};
// QuickViewModal Component (same as before)
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
              alt={modalProduct.name}
              className="w-full h-56 object-contain rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x400/f0f4f8/94a3b8?text=Image+Error"
              }}
            />
          </div>

          <div className="w-1/2">
            <p className="text-lg font-semibold text-gray-900 mb-2">{modalProduct.name}</p>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-extrabold text-blue-600">₹{price.toFixed(2)}</span>
              {oldPrice && <span className="text-lg text-gray-400 line-through">₹{oldPrice.toFixed(2)}</span>}
              {discount > 0 && (
                <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
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
              <button onClick={handleAddToCartClick} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-white font-semibold hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2">
                <FiShoppingCart /> Add to Cart
              </button>
              <button onClick={handleViewDetails} className="flex-1 rounded-lg bg-orange-500 py-2.5 text-white font-semibold hover:bg-orange-600 transition text-sm">
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

const DealOfDayListPage = () => {
  const [products, setProducts] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({days:0 , hours: 0, minutes: 0, seconds: 0 });
  
  // Filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  
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

  // Fetch all Deal of the Day products
  useEffect(() => {
    const fetchDealProducts = async () => {
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
            main_image: product.image || product.main_image || product.thumbnail_image,
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
            end_datetime: product.end_datetime,
            category: product.category_id || product.category,
            brand: product.brand_id || product.brand
          }));
          
          setProducts(mappedProducts);
          setCampaign(response.data.campaign);
          setError(null);
          
          // Fetch filters after products are loaded
          fetchFilters();
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching deal products:", err);
        setError("Failed to load deal products");
        
        // Fallback data for development
        const fallbackProducts = [
          {
            id: 1,
            name: "Premium Gold Necklace",
            price: 14999,
            oldPrice: 24999,
            img: "https://placehold.co/400x400/f0f4f8/94a3b8?text=Necklace",
            discount_percentage: 40,
            in_stock: true,
            vendor_name: "JewelMaster",
            stocks: [{ id: 1, mrp: 24999, selling_price: 14999, final_price: 14999, maximum_order_quantity: 5 }],
            rating: 4.5,
            review_count: 128,
            category: 1,
            brand: 1
          },
          {
            id: 2,
            name: "Diamond Stud Earrings",
            price: 8999,
            oldPrice: 15999,
            img: "https://placehold.co/400x400/f0f4f8/94a3b8?text=Earrings",
            discount_percentage: 44,
            in_stock: true,
            vendor_name: "DiamondCraft",
            stocks: [{ id: 2, mrp: 15999, selling_price: 8999, final_price: 8999, maximum_order_quantity: 3 }],
            rating: 4.8,
            review_count: 89,
            category: 2,
            brand: 2
          }
        ];
        setProducts(fallbackProducts);
        
        // Fallback filters
        setCategories([
          { id: 1, name: "Necklaces", product_count: 12 },
          { id: 2, name: "Earrings", product_count: 8 }
        ]);
        setBrands([
          { id: 1, brand_name: "JewelMaster", product_count: 5 },
          { id: 2, brand_name: "DiamondCraft", product_count: 3 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDealProducts();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (!campaign || !campaign.end_datetime) return;

    const calculateTimeLeft = () => {
      try {
        const now = new Date().getTime();
        const endTime = new Date(campaign.end_datetime).getTime();
        const difference = endTime - now;

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setTimeLeft({days:0, hours: 0, minutes: 0, seconds: 0 });
        }
      } catch (error) {
        console.error("Error calculating time left:", error);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 500);
    return () => clearInterval(timer);
  }, [campaign]);

  // Filter products based on search, price, categories, and brands
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description , product.name && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Price filter
      const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
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
        title="Deal Filters"
      />

      <div className="max-w-7xl mx-auto ">
        {/* FANCY COUNTDOWN HEADER SECTION */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          </div>

          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
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
                <Zap className="h-5 w-5 text-yellow-300" />
                <span className="font-semibold text-lg">LIMITED TIME OFFER</span>
                <FiGift className="h-5 w-5 text-pink-300" />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
              Deal of the Day
            </h1>

            {/* Subtitle */}
            <p className="text-center text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Grab these exclusive offers before they're gone! Up to {products.length > 0 ? 
              Math.max(...products.map(p => p.discount_percentage)) : 70}% OFF
            </p>

            {/* Fancy Countdown Timer */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-3 mb-4">
                <FiClock className="h-6 w-6 text-yellow-300 animate-pulse" />
                <span className="text-xl font-semibold text-white/90">Hurry! Offer ends in</span>
              </div>

              <div className="flex gap-4 md:gap-6 flex-wrap justify-center">
                {/* Days */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 shadow-xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
                    <div className="text-4xl md:text-5xl font-bold text-white">
                      {formatTime(timeLeft.days)}
                    </div>
                    <div className="text-xs md:text-sm text-blue-200 font-medium mt-1">DAYS</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-xs animate-pulse">
                    D
                  </div>
                </div>
                {/* Hours */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 shadow-xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
                    <div className="text-4xl md:text-5xl font-bold text-white">
                      {formatTime(timeLeft.hours)}
                    </div>
                    <div className="text-xs md:text-sm text-blue-200 font-medium mt-1">HOURS</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-xs animate-pulse">
                    H
                  </div>
                </div>

                {/* Minutes */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 shadow-xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
                    <div className="text-4xl md:text-5xl font-bold text-white">
                      {formatTime(timeLeft.minutes)}
                    </div>
                    <div className="text-xs md:text-sm text-blue-200 font-medium mt-1">MINUTES</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-xs animate-pulse">
                    M
                  </div>
                </div>

                {/* Seconds */}
                <div className="relative">
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-white/10 backdrop-blur-lg rounded-2xl border-2 border-white/30 shadow-xl flex flex-col items-center justify-center transform hover:scale-105 transition-transform">
                    <div className="text-4xl md:text-5xl font-bold text-white animate-pulse">
                      {formatTime(timeLeft.seconds)}
                    </div>
                    <div className="text-xs md:text-sm text-blue-200 font-medium mt-1">SECONDS</div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-xs animate-pulse">
                    S
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="mt-8 flex gap-6 flex-wrap justify-center">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FiPackage className="text-yellow-300" />
                  <span className="text-sm font-medium">{products.length} Products</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FiPercent className="text-pink-300" />
                  <span className="text-sm font-medium">Save up to {products.length > 0 ? 
                    Math.max(...products.map(p => p.discount_percentage)) : 70}%</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <FiStar className="text-blue-300" />
                  <span className="text-sm font-medium">Top Rated Deals</span>
                </div>
              </div>
            </div>
          </div>
                    
          {/* Bottom Wave */}
          <svg className="absolute bottom-0 left-0 w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
           {/*  <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path> */}
          </svg>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-6">
              <div className="mt-6 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-600 order-2 md:order-1 whitespace-nowrap w-full md:w-auto">
                <span className="font-bold text-gray-900">{filteredProducts.length}</span> Deals Found
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
                    placeholder="Search deals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl py-2.5 pl-4 pr-12 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button className="absolute right-0 top-0 bottom-0 px-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-r-xl text-white hover:from-blue-600 hover:to-blue-700 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div> 
              </div>
            </div>
          </div>

          {/* Applied Filters Display */}
          {(selectedCategories.length > 0 || selectedBrands.length > 0 || minPrice > 0 || maxPrice < 200000) && (
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-800">Applied Filters</h4>
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedBrands([]);
                    setMinPrice(0);
                    setMaxPrice(200000);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {minPrice > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                    Min: ₹{minPrice}
                  </span>
                )}
                {maxPrice < 200000 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                    Max: ₹{maxPrice}
                  </span>
                )}
                {selectedCategories.map(catId => {
                  const category = categories.find(c => c.id === catId);
                  return category && (
                    <span key={catId} className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                      {category.name}
                      <button
                        onClick={() => setSelectedCategories(selectedCategories.filter(id => id !== catId))}
                        className="hover:text-blue-900"
                      >
                        ✗
                      </button>
                    </span>
                  );
                })}
                {selectedBrands.map(brandId => {
                  const brand = brands.find(b => b.id === brandId);
                  return brand && (
                    <span key={brandId} className="text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                      {brand.brand_name}
                      <button
                        onClick={() => setSelectedBrands(selectedBrands.filter(id => id !== brandId))}
                        className="hover:text-blue-900"
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
            <h3 className="font-bold text-lg mb-6 text-gray-800 border-b pb-3">Filter Deals</h3>

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
                        className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
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
                          className="rounded text-blue-600 border-gray-300 focus:ring-blue-500 w-4 h-4"
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Deals Found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm || selectedCategories.length > 0 || selectedBrands.length > 0 || minPrice > 0 || maxPrice < 200000
                    ? "No deals match your current filters. Try adjusting your search criteria."
                    : "Check back later for exciting offers!"}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategories([]);
                    setSelectedBrands([]);
                    setMinPrice(0);
                    setMaxPrice(200000);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition font-medium"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.uniqueId}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200"
                  >
                    {/* Product Image Container */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
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
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                          -{product.discount_percentage}%
                        </div>
                      )}

                      {/* Quick View Button */}
                      <button
                        onClick={(e) => openModal(product, e)}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-blue-600 text-gray-700 hover:text-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
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
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 h-10 group-hover:text-blue-600 transition">
                        {product.name}
                      </h3>

                      {/* Vendor Name */}
                      <p className="text-xs text-gray-500 mb-2">{product.vendor_name}</p>

                      {/* Price Section */}
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-bold text-blue-600">
                          ₹{product.price.toFixed(2)}
                        </span>
                        {product.oldPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.oldPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      {product.rating && (
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

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => openModal(product, e)}
                        className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn"
                      >
                        <FiShoppingCart className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                        Quick View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
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

export default DealOfDayListPage;