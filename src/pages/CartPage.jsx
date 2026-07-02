import React, { useState, useEffect } from "react";
import {
  FiTrash2,
  FiShoppingCart,
  FiArrowLeft,
  FiPlus,
  FiMinus,
  FiTruck,
  FiShield,
  FiRefreshCcw,
  FiLoader,
  FiAlertCircle,
  FiTag,
  FiX,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiPercent,
  FiClock // 👈 Add this import
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { axiosInstance, publicAxios } from "../api/axios";
import MobileCartPage from "./mobile/Mobilecart";

const CartPage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    shipping_charge: 0,
    total: 0,
    item_count: 0,
    eligible_for_free_shipping: false
  });
  
  // Coupon States
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponPanel, setShowCouponPanel] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  
  // Countdown states
  const [countdowns, setCountdowns] = useState({});
  
  const { loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const FREE_DELIVERY_THRESHOLD = 1000;

  // ✅ Countdown timer effect
  useEffect(() => {
    const timers = {};
    
    cartItems.forEach(item => {
      if (item.campaign_countdown && item.campaign_countdown.total_seconds > 0) {
        const itemId = item.id;
        
        const timer = setInterval(() => {
          setCountdowns(prev => {
            const currentCountdown = prev[itemId];
            if (!currentCountdown || currentCountdown.total_seconds <= 0) {
              clearInterval(timer);
              return prev;
            }
            
            const newTotalSeconds = currentCountdown.total_seconds - 1;
            if (newTotalSeconds <= 0) {
              clearInterval(timer);
              return {
                ...prev,
                [itemId]: {
                  ...currentCountdown,
                  days: 0,
                  hours: 0,
                  minutes: 0,
                  seconds: 0,
                  total_seconds: 0
                }
              };
            }
            
            const days = Math.floor(newTotalSeconds / (24 * 3600));
            const hours = Math.floor((newTotalSeconds % (24 * 3600)) / 3600);
            const minutes = Math.floor((newTotalSeconds % 3600) / 60);
            const seconds = newTotalSeconds % 60;
            
            return {
              ...prev,
              [itemId]: {
                ...currentCountdown,
                days,
                hours,
                minutes,
                seconds,
                total_seconds: newTotalSeconds
              }
            };
          });
        }, 1000);
        
        timers[itemId] = timer;
        
        // Initialize countdown
        setCountdowns(prev => ({
          ...prev,
          [itemId]: item.campaign_countdown
        }));
      }
    });
    
    return () => {
      Object.values(timers).forEach(timer => clearInterval(timer));
    };
  }, [cartItems]);

  // Fetch cart data from API
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/api/public/cart/');
      
      let items = [];
      if (response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        items = response.data.data;
      } else if (response.data && response.data.success && response.data.data) {
        items = response.data.data;
      }
      
      setCartItems(items);
      calculateCartSummary(items);
      
      // Fetch available coupons after cart is loaded
      if (items.length > 0) {
        fetchAvailableCoupons(items);
      }
      
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        addToast('Please login to view cart', 'warning');
        navigate('/customer/login', { 
          state: { from: '/cart' }
        });
      } else if (err.response?.status === 404) {
        setError('Cart not found');
      } else {
        setError(err.response?.data?.message || 'Failed to load cart. Please try again.');
      }
      
      setCartItems([]);
      setCartSummary({
        subtotal: 0,
        shipping_charge: 0,
        total: 0,
        item_count: 0,
        eligible_for_free_shipping: false
      });
      
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get campaign badge color
  const getCampaignBadgeColor = (campaignType) => {
    switch (campaignType) {
      case 'Flash':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'Deal of the Day':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'Featured':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  // ✅ Get countdown display
  const getCountdownDisplay = (item) => {
    const countdown = countdowns[item.id];
    if (!countdown || countdown.total_seconds <= 0) return null;
    
    const campaignType = item.campaign_details?.campaign_type;
    
    let bgColor = "bg-blue-50 border-blue-200";
    let textColor = "text-blue-700";

    switch (campaignType) {
      case 'Flash':
        bgColor = "bg-blue-50 border-blue-200";
        textColor = "text-blue-700";
        break;
      case 'Deal of the Day':
        bgColor = "bg-blue-50 border-blue-200";
        textColor = "text-blue-700";

        break;
      case 'Featured':
        bgColor = "bg-blue-50 border-blue-200";
        textColor = "text-blue-700";

        break;
    }
    
    return (
      <div className={`mt-2 p-2 rounded-lg ${bgColor} border ${textColor}`}>
        <div className="flex items-center gap-2 text-xs">
          <FiClock className="text-xs" />
          <span>Ends in:</span>
          <div className="flex gap-1 font-bold">
            {countdown.days > 0 && <span>{countdown.days}d</span>}
            <span>{countdown.hours}h</span>
            <span>{countdown.minutes}m</span>
            <span className="animate-pulse">{countdown.seconds}s</span>
          </div>
        </div>
      </div>
    );
  };

  // Fetch available coupons for cart
  const fetchAvailableCoupons = async (items) => {
    try {
      setCouponLoading(true);
      const response = await axiosInstance.get('/ecommerce/public/coupons/cart/');
      
      if (response.data && response.data.success) {
        setAvailableCoupons(response.data.coupons || []);
        
        // Check if any coupon is already applied from session
        const sessionCoupon = sessionStorage.getItem('applied_coupon');
        if (sessionCoupon) {
          const couponData = JSON.parse(sessionCoupon);
          const matchingCoupon = response.data.coupons?.find(c => c.code === couponData.code);
          if (matchingCoupon) {
            setAppliedCoupon(matchingCoupon);
            setCouponDiscount(couponData.discount_amount || 0);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setCouponLoading(false);
    }
  };

  // Calculate cart totals with coupon discount
  const calculateCartSummary = (items) => {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.item_total || 0);
    }, 0);
    
    const shippingCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 50;
    const total = Math.max(0, subtotal + shippingCharge - couponDiscount);
    
    setCartSummary({
      subtotal,
      shipping_charge: shippingCharge,
      total,
      item_count: items.length,
      eligible_for_free_shipping: subtotal >= FREE_DELIVERY_THRESHOLD
    });
  };

  // Apply coupon to cart
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      addToast('Please enter a coupon code', 'warning');
      return;
    }

    try {
      setCouponLoading(true);
      
      const response = await axiosInstance.post('/ecommerce/public/coupons/cart/', {
        coupon_code: couponCode.toUpperCase()
      });

      if (response.data && response.data.success) {
        const couponData = response.data;
        setAppliedCoupon(couponData.coupon);
        setCouponDiscount(couponData.discount_amount || 0);
        setCouponCode("");
        
        // Save to session
        sessionStorage.setItem('applied_coupon', JSON.stringify({
          code: couponData.coupon.code,
          discount_amount: couponData.discount_amount,
          applied_at: new Date().toISOString()
        }));
        
        addToast(`Coupon "${couponData.coupon.code}" applied successfully!`, 'success');
        
        // Recalculate totals
        calculateCartSummary(cartItems);
        
      } else {
        addToast(response.data?.message || 'Failed to apply coupon', 'error');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid coupon code';
      addToast(errorMsg, 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove applied coupon
  const removeCoupon = async () => {
    try {
      const response = await axiosInstance.delete('/ecommerce/public/coupons/cart/');
      
      if (response.data && response.data.success) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        sessionStorage.removeItem('applied_coupon');
        addToast('Coupon removed successfully', 'success');
        
        // Recalculate totals
        calculateCartSummary(cartItems);
      }
    } catch (err) {
      addToast('Failed to remove coupon', 'error');
    }
  };

  // Update cart item quantity
  const updateCartItem = async (cartItemId, quantity) => {
    try {
      const response = await axiosInstance.post(
        `/api/public/cart/${cartItemId}/update_quantity/`, 
        { quantity }
      );
      
      if (response.data.success) {
        await fetchCart();
        addToast('Quantity updated successfully', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update quantity', 'error');
    }
  };

  // Remove item from cart
  const removeFromCart = async (cartItemId) => {
    try {
      const response = await axiosInstance.delete(`/api/public/cart/${cartItemId}/`);
      
      if (response.data.success) {
        await fetchCart();
        addToast('Item removed from cart', 'success');
      }
    } catch (err) {
      addToast('Failed to remove item', 'error');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) {
      return;
    }
    
    try {
      const response = await axiosInstance.post('/api/public/cart/clear/');
      
      if (response.data.success) {
        setCartItems([]);
        setCartSummary({
          subtotal: 0,
          shipping_charge: 0,
          total: 0,
          item_count: 0,
          eligible_for_free_shipping: false
        });
        setAppliedCoupon(null);
        setCouponDiscount(0);
        sessionStorage.removeItem('applied_coupon');
        addToast('Cart cleared successfully', 'success');
      }
    } catch (err) {
      addToast('Failed to clear cart', 'error');
    }
  };

  // Handle quantity change
  const handleQuantityChange = async (id, delta) => {
    const cartItem = cartItems.find(item => item.id === id);
    if (!cartItem) return;
    
    const newQuantity = cartItem.quantity + delta;
    
    if (newQuantity < 1) {
      await removeFromCart(id);
      return;
    }

    await updateCartItem(id, newQuantity);
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      addToast("Your cart is empty", "warning");
      return;
    }
    
    const outOfStockItems = cartItems.filter(item => 
      item.quantity > (item.product_details?.stock_quantity || 0)
    );
    
    if (outOfStockItems.length > 0) {
      addToast("Some items are out of stock. Please update your cart.", "error");
      return;
    }
    
    // Pass applied coupon to checkout
    if (appliedCoupon) {
      navigate("/checkout", { 
        state: { 
          appliedCoupon: appliedCoupon.code,
          couponDiscount: couponDiscount
        } 
      });
    } else {
      navigate("/checkout");
    }
  };

  // Fix image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://placehold.co/100x100/f0f4f8/94a3b8?text=No+Image";
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    return `https://api.initcart.in${imagePath}`;
  };

  // Get coupon badge color based on type
  const getCouponBadgeColor = (couponType) => {
    switch (couponType) {
      case 'percentage':
        return 'bg-gradient-to-r from-blue-600 to-blue-700';
      case 'flat':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'free_shipping':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-700';
    }
  };

  // Format coupon discount display
  const formatCouponDiscount = (coupon) => {
    if (coupon.coupon_type === 'percentage') {
      return `${coupon.discount_display}`;
    } else if (coupon.coupon_type === 'flat') {
      return `₹${coupon.discount_display}`;
    }
    return coupon.discount_display;
  };

  useEffect(() => {
  // Add class to body to hide bottom navigation via CSS
  document.body.classList.add('cart-page');
  
  // Also add inline style as backup
  const style = document.createElement('style');
  style.id = 'cart-page-hide-bottom-nav';
  style.textContent = `
    .fixed.bottom-0.left-0.right-0.z-\\[100\\],
    .md\\:hidden.fixed.bottom-0,
    .fixed.bottom-0.left-0.right-0.z-50 {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
  
  return () => {
    document.body.classList.remove('cart-page');
    const styleEl = document.getElementById('cart-page-hide-bottom-nav');
    if (styleEl) styleEl.remove();
  };
}, []);
  useEffect(() => {
    const checkAuthAndFetchCart = async () => {
      const token = localStorage.getItem('customer_token');
      const userStr = localStorage.getItem('customer_user');
      
      if (!token || !userStr) {
        addToast('Please login to view your cart', 'warning');
        sessionStorage.setItem('redirectAfterLogin', '/cart');
        navigate('/customer/login', { 
          state: { from: '/cart' }
        });
        return;
      }
      
      await fetchCart();
    };
    
    checkAuthAndFetchCart();
  }, [navigate, addToast]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FiLoader className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Checking Authentication...</h3>
          <p className="text-gray-600">Please wait while we verify your login</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return <MobileCartPage />;
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FiLoader className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Cart...</h3>
          <p className="text-gray-600">Please wait while we load your cart items</p>
        </div>
      </div>
    );
  }

  // Show error
  if (error && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FiAlertCircle className="text-4xl text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Cart</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchCart}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Retry
          </button>
          <Link
            to="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-gray-400 text-6xl mb-6">
              <FiShoppingCart className="inline-block" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Your cart is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any products to your cart yet.
              Start shopping to add items to your cart.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/productlist"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <FiArrowLeft /> Continue Shopping
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                
                {/* Coupon Banner - Amazon/Flipkart Style */}
                {availableCoupons.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-yellow-50 border-b border-blue-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-600 p-2 rounded-lg">
                          <FiTag className="text-white text-lg" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {availableCoupons.length} Offers Available!
                          </h4>
                          <p className="text-sm text-gray-600">
                            Apply coupons and save extra on your order
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCouponPanel(!showCouponPanel)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {showCouponPanel ? 'Hide Offers' : 'View Offers'}
                        {showCouponPanel ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </div>

                    {/* Coupon Panel */}
                    {showCouponPanel && (
                      <div className="mt-4 pt-4 border-t border-blue-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {availableCoupons.slice(0, 4).map((coupon) => (
                            <div key={coupon.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${getCouponBadgeColor(coupon.coupon_type)}`}>
                                      {formatCouponDiscount(coupon)}
                                    </span>
                                    <span className="font-bold text-gray-800 tracking-wider">{coupon.code}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{coupon.title}</p>
                                  {coupon.validity_display && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      <FiInfo className="inline mr-1" />
                                      {coupon.validity_display}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => {
                                    setCouponCode(coupon.code);
                                    applyCoupon();
                                  }}
                                  className="text-sm bg-gradient-to-r from-blue-600 to-blue-600 text-white px-3 py-1 rounded hover:from-blue-600 hover:to-blue-700 transition"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Coupon Input Field */}
                        <div className="mt-4 flex gap-2">
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                            />
                            <FiTag className="absolute right-3 top-2.5 text-gray-400" />
                          </div>
                          <button
                            onClick={applyCoupon}
                            disabled={couponLoading}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition disabled:opacity-50"
                          >
                            {couponLoading ? 'Applying...' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Applied Coupon Display */}
                {appliedCoupon && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                          <FiCheck className="text-white text-lg" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 tracking-wider">{appliedCoupon.code}</span>
                            <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${getCouponBadgeColor(appliedCoupon.coupon_type)}`}>
                              {formatCouponDiscount(appliedCoupon)}
                            </span>
                            <span className="text-sm text-green-600 font-medium">
                              -₹{Number(couponDiscount).toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{appliedCoupon.title}</p>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                      >
                        <FiX className="text-lg" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Cart Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold ">
                      <tr>
                        <th className="p-4 text-left font-semibold text-white">Product</th>
                        <th className="p-4 text-left font-semibold text-white">Price</th>
                        <th className="p-4 text-left font-semibold text-white">Quantity</th>
                        <th className="p-4 text-left font-semibold text-white">Total</th>
                        <th className="p-4 text-left font-semibold text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition">
                          <td className="p-4">
                            <div className="flex items-center space-x-4">
                              <img
                                src={getImageUrl(item.product_details?.main_image || item.product_details?.thumbnail)}
                                alt={item.product_details?.product_name || "Product"}
                                className="w-20 h-20 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://placehold.co/100x100/f0f4f8/94a3b8?text=No+Image";
                                }}
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {item.product_details?.product_name || "Unknown Product"}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Vendor: {item.product_details?.vendor_name || "N/A"}
                                </p>
                                {item.product_details?.color && (
                                  <p className="text-sm text-gray-500">
                                    Color: {item.product_details.color}
                                  </p>
                                )}
                                {item.product_details?.size && (
                                  <p className="text-sm text-gray-500">
                                    Size: {item.product_details.size}
                                  </p>
                                )}
                                
                                {/* 👇 Campaign Badge */}
                                {item.is_in_campaign && (
                                  <span className={`inline-block mt-1 text-xs font-bold text-white px-2 py-0.5 rounded ${getCampaignBadgeColor(item.campaign_details?.campaign_type)}`}>
                                    {item.campaign_details?.campaign_type}
                                  </span>
                                )}
                                
                                {/* 👇 Countdown Display */}
                                {getCountdownDisplay(item)}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>
                              {/* Show campaign price with original price crossed out */}
                              {item.is_in_campaign ? (
                                <>
                                  <p className="font-bold text-blue-600">
                                    ₹{item.campaign_price}
                                  </p>
                                  <p className="text-xs text-gray-400 line-through">
                                    ₹{item.original_price}
                                  </p>
                                </>
                              ) : (
                                <p className="font-medium text-gray-900">
                                  ₹{item.product_details?.unit_price || 0}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={item.quantity <= 1}
                                className={`p-1 rounded-md ${
                                  item.quantity <= 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                              >
                                <FiMinus className="w-4 h-4" />
                              </button>
                              <span className="w-10 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, 1)}
                                disabled={item.quantity >= (item.product_details?.max_quantity || 10)}
                                className={`p-1 rounded-md ${
                                  item.quantity >= (item.product_details?.max_quantity || 10)
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                                }`}
                              >
                                <FiPlus className="w-4 h-4" />
                              </button>
                            </div>
                            {item.product_details?.stock_quantity && (
                              <p className={`text-xs mt-1 ${
                                item.quantity > item.product_details.stock_quantity 
                                  ? "text-red-600" 
                                  : "text-gray-500"
                              }`}>
                                Stock: {item.product_details.stock_quantity}
                              </p>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-gray-900">
                              ₹{(item.item_total || 0).toFixed(2)}
                            </p>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition"
                              title="Remove item"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cart Actions */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition font-medium"
                    >
                      <FiTrash2 /> Clear Cart
                    </button>
                    
                    <div className="flex items-center gap-4">
                      <Link
                        to="/productlist"
                        className="flex items-center gap-2 px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition font-medium"
                      >
                        <FiArrowLeft /> Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                
                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                      <span className="font-medium">₹{cartSummary.subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className={`font-medium ${cartSummary.shipping_charge === 0 ? 'text-green-600' : ''}`}>
                        {cartSummary.shipping_charge === 0 ? 'FREE' : `₹${cartSummary.shipping_charge.toFixed(2)}`}
                      </span>
                    </div>

                    {/* Applied Coupon Discount */}
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1">
                          <FiTag className="text-sm" /> 
                          Coupon {appliedCoupon.code}
                        </span>
                        <span className="font-medium">-₹{Number(couponDiscount).toFixed(2)}</span>
                      </div>
                    )}

                    {cartSummary.subtotal < FREE_DELIVERY_THRESHOLD && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-blue-700 text-center">
                          Add ₹{(FREE_DELIVERY_THRESHOLD - cartSummary.subtotal).toFixed(2)} more for free shipping
                        </p>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-blue-600">
                          ₹{cartSummary.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                
                  <button
                    onClick={handleCheckout}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <FiShoppingCart /> Proceed to Checkout
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-3">
                    By proceeding, you agree to our Terms & Conditions
                  </p>
                </div>

                {/* Special Offers Section */}
                {availableCoupons.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FiPercent className="text-blue-600" />
                      Special Offers
                    </h3>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {availableCoupons.slice(0, 3).map((coupon) => (
                        <div key={coupon.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${getCouponBadgeColor(coupon.coupon_type)}`}>
                                  {formatCouponDiscount(coupon)}
                                </span>
                                <span className="font-bold text-gray-800 text-sm">{coupon.code}</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{coupon.title}</p>
                              {coupon.validity_display && (
                                <p className="text-xs text-gray-500">
                                  <FiInfo className="inline mr-1" size={10} />
                                  {coupon.validity_display}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setCouponCode(coupon.code);
                                applyCoupon();
                              }}
                              className="text-xs bg-gradient-to-r from-blue-600 to-blue-600 text-white px-2 py-1 rounded hover:from-blue-700 hover:to-blue-700 transition"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {availableCoupons.length > 3 && (
                      <button
                        onClick={() => setShowCouponPanel(!showCouponPanel)}
                        className="w-full mt-3 text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {showCouponPanel ? 'Show Less' : `View ${availableCoupons.length - 3} More Offers`}
                      </button>
                    )}
                  </div>
                )}

                {/* Benefits Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopping Benefits</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                        <FiShield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Secure Payment</h4>
                        <p className="text-sm text-gray-600">100% secure payments</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <FiTruck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Free Shipping</h4>
                        <p className="text-sm text-gray-600">
                          Free delivery on orders above ₹{FREE_DELIVERY_THRESHOLD}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <FiRefreshCcw className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Easy Returns</h4>
                        <p className="text-sm text-gray-600">7-day return policy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;  