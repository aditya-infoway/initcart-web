import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCreditCard,
  FiChevronDown,
  FiTag,
  FiClock,
  FiLoader,
  FiAlertCircle,
  FiShoppingCart,
  FiArrowLeft,
  FiCheckCircle,
  FiX,
  FiInfo,
  FiCheck,
  FiGift,
  FiShield,
  FiTruck,
  FiPackage,
  FiStar
} from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { axiosInstance } from "../api/axios";
import MobileCheckoutPage from "./mobile/MobileCheckout";
const CheckoutPage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
  const [useSameAddress, setUseSameAddress] = useState(true);

  // Coupon States
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showCouponPanel, setShowCouponPanel] = useState(false);

  // Form States
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [availableLoyaltyPoints, setAvailableLoyaltyPoints] = useState(0);
  const [notes, setNotes] = useState("");

  // UI States
  const [showLoyaltyInput, setShowLoyaltyInput] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processing, setProcessing] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [showReferralInput, setShowReferralInput] = useState(false);

  // Tab States
  const [activeContactTab, setActiveContactTab] = useState("billing");
  const [activeShippingTab, setActiveShippingTab] = useState("current");

  // Countdown states
  const [countdowns, setCountdowns] = useState({});

  // New Address Form
  const [newAddress, setNewAddress] = useState({
    address_type: "both",
    full_name: "",
    phone: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    is_default: false
  });

  const navigate = useNavigate();
  const { addToast } = useToast();
  // CheckoutPage.jsx - fetchAddresses, fetchLoyaltyPoints ke saath (around line 500)
// CheckoutPage.jsx — useEffect mein referral load karna
useEffect(() => {
  const savedRef = localStorage.getItem("referral_code");
  const userStr = localStorage.getItem("customer_user");
  
  if (savedRef && userStr) {
    try {
      const userData = JSON.parse(userStr);
      
      // ✅ Sirf customer role wale ke liye auto-fill karo
      // Agent registration se bane users (role='both' with numeric username) ke liye nahi
      const isAgentRegistered = userData.username && /^\d+$/.test(userData.username);
      
      if (!isAgentRegistered) {
        setReferralCode(savedRef);
        setShowReferralInput(true);

      } else {
        // Agent registration se bane user ke liye referral clear karo
        localStorage.removeItem("referral_code");

      }
    } catch (e) {
      // JSON parse error — safe fallback
      const savedRef2 = localStorage.getItem("referral_code");
      if (savedRef2) {
        setReferralCode(savedRef2);
        setShowReferralInput(true);
      }
    }
  }
}, []);// Empty dependency array - sirf ek baar run hoga

  // ✅ Countdown timer effect for ALL campaign items
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

  // ✅ Get campaign badge
  const getCampaignBadge = (campaignType) => {
    switch (campaignType) {
      case 'Flash':
        return 'FLASH';
      case 'Deal of the Day':
        return 'DEAL OF THE DAY';
      case 'Featured':
        return 'FEATURED';
      default:
        return null;
    }
  };

  // ✅ Get countdown display for cart items
  const getCountdownDisplay = (item) => {
    const countdown = countdowns[item.id];
    if (!countdown || countdown.total_seconds <= 0) return null;

    return (
      <div className="mt-1 flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
        <FiClock className="text-blue-600" />
        <span className="font-medium">Ends in:</span>
        {countdown.days > 0 && <span>{countdown.days}d</span>}
        <span>{countdown.hours}h</span>
        <span>{countdown.minutes}m</span>
        <span className="animate-pulse">{countdown.seconds}s</span>
      </div>
    );
  };

  // Get coupon badge color
  const getCouponBadgeColor = (couponType) => {
    switch (couponType) {
      case 'percentage':
        return 'from-blue-600 to-blue-600';
      case 'flat':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  // Format coupon discount display
  const formatCouponDiscount = (coupon) => {
    if (coupon.coupon_type === 'percentage' && coupon.discount_percent) {
      return `${coupon.discount_percent}% OFF`;
    } else if (coupon.coupon_type === 'flat' && coupon.discount_amount) {
      return `₹${coupon.discount_amount} OFF`;
    }
    return "Discount";
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.id = 'razorpay-script';

      script.onload = () => {
        resolve(true);
      };

      script.onerror = (error) => {
        console.error('❌ Failed to load Razorpay script:', error);
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  // Authentication check
  const checkAuthentication = () => {
    const token = localStorage.getItem('customer_token');
    const userStr = localStorage.getItem('customer_user');

    if (!token || !userStr) {
      addToast('Please login to checkout', 'warning');
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/customer/login', { state: { from: '/checkout' } });
      return false;
    }

    return true;
  };

  // Fetch cart data
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

      if (items.length === 0) {
        addToast("Your cart is empty", "warning");
        navigate("/cart");
        return false;
      }

      // Fetch available coupons
      fetchAvailableCoupons(items);

      return true;

    } catch (err) {
      console.error("❌ Error fetching cart:", err);

      if (err.response?.status === 401) {
        addToast("Session expired. Please login again.", "warning");
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        navigate("/customer/login", { state: { from: "/checkout" } });
      } else if (err.response?.status === 403) {
        addToast("Access denied. Please check your account.", "error");
      } else {
        setError(err.response?.data?.message || "Failed to load cart");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch available coupons for checkout
  const fetchAvailableCoupons = async (items) => {
    try {
      setCouponLoading(true);
      const response = await axiosInstance.get('/ecommerce/public/coupons/cart/');

      if (response.data && response.data.success) {
        const coupons = response.data.coupons || response.data.data || [];
        setAvailableCoupons(coupons);

        // Check for applied coupon from session storage
        const sessionCoupon = sessionStorage.getItem('applied_coupon');
        if (sessionCoupon) {
          try {
            const couponData = JSON.parse(sessionCoupon);
            const matchingCoupon = coupons.find(c => c.code === couponData.code);
            if (matchingCoupon) {
              setAppliedCoupon(matchingCoupon);
              setCouponDiscount(couponData.discount_amount || 0);
              addToast(`Coupon "${matchingCoupon.code}" applied from cart`, 'success');
            }
          } catch (e) {
            console.error('Error parsing session coupon:', e);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setCouponLoading(false);
    }
  };

  // Apply coupon in checkout
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      addToast('Please enter a coupon code', 'warning');
      return;
    }

    try {
      setCouponLoading(true);

      let response;

      try {
        response = await axiosInstance.post('/ecommerce/public/coupons/cart/', {
          coupon_code: couponCode.toUpperCase()
        });
      } catch (cartErr) {
        response = await axiosInstance.post('/ecommerce/public/coupons/validate/', {
          coupon_code: couponCode.toUpperCase()
        });
      }

      if (response.data && response.data.success) {
        let couponData = response.data.coupon || response.data.data;
        let discountAmount = response.data.discount_amount || 0;

        if (!discountAmount && couponData) {
          const subtotal = calculateTotals().subtotal;
          if (couponData.coupon_type === 'percentage' && couponData.discount_percent) {
            discountAmount = (subtotal * parseFloat(couponData.discount_percent)) / 100;
            if (couponData.max_discount && discountAmount > parseFloat(couponData.max_discount)) {
              discountAmount = parseFloat(couponData.max_discount);
            }
          } else if (couponData.coupon_type === 'flat' && couponData.discount_amount) {
            discountAmount = Math.min(parseFloat(couponData.discount_amount), subtotal);
          }
        }

        setAppliedCoupon(couponData);
        setCouponDiscount(discountAmount);
        setCouponCode("");

        sessionStorage.setItem('applied_coupon', JSON.stringify({
          code: couponData.code,
          discount_amount: discountAmount,
          applied_at: new Date().toISOString()
        }));

        addToast(`Coupon "${couponData.code}" applied successfully!`, 'success');

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
      } else {
        addToast('Failed to remove coupon', 'error');
      }
    } catch (err) {
      console.error('Error removing coupon:', err);
      setAppliedCoupon(null);
      setCouponDiscount(0);
      sessionStorage.removeItem('applied_coupon');
      addToast('Coupon removed', 'info');
    }
  };

  // Fetch customer addresses
  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get('/api/public/customer/addresses/');

      let addressList = [];
      if (response.data && Array.isArray(response.data)) {
        addressList = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        addressList = response.data.data;
      } else if (response.data && response.data.success && response.data.data) {
        addressList = response.data.data;
      }

      setAddresses(addressList);

      if (addressList.length > 0) {
        const defaultAddress = addressList.find(addr => addr.is_default) || addressList[0];
        setSelectedBillingAddress(defaultAddress);
        setSelectedShippingAddress(defaultAddress);
      }

    } catch (err) {
      console.error("❌ Error fetching addresses:", err);
      if (err.response?.status === 401) {
        addToast("Session expired for addresses", "warning");
      }
    }
  };

  // Fetch loyalty points
  const fetchLoyaltyPoints = async () => {
    try {
      const response = await axiosInstance.get('/api/public/loyalty/points/');
      if (response.data && response.data.success) {
        setAvailableLoyaltyPoints(response.data.data?.available_points || 0);
      }
    } catch (err) {
      console.error("Error fetching loyalty points:", err);
    }
  };

  // Calculate cart totals with coupon discount
  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + parseFloat(item.item_total || 0),
      0
    );
    const shippingCharge = subtotal >= 1000 ? 0 : 50;

    let total = subtotal + shippingCharge;

    if (couponDiscount > 0) {
      total = Math.max(0, total - couponDiscount);
    }

    if (loyaltyPointsToUse > 0) {
      const loyaltyDiscount = loyaltyPointsToUse * 0.1;
      total = Math.max(0, total - loyaltyDiscount);
    }

    return { subtotal, shippingCharge, total };
  };

  // Handle new address form change
  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Save new address
  const saveNewAddress = async () => {
    if (!newAddress.full_name || !newAddress.phone || !newAddress.address_line1 ||
      !newAddress.city || !newAddress.state || !newAddress.pincode) {
      addToast("Please fill all required fields", "error");
      return;
    }

    try {
      const response = await axiosInstance.post('/api/public/customer/addresses/', newAddress);

      if (response.data && response.data.success) {
        addToast("Address saved successfully", "success");
        await fetchAddresses();
        setActiveShippingTab("history");

        setNewAddress({
          address_type: "both",
          full_name: "",
          phone: "",
          email: "",
          address_line1: "",
          address_line2: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
          is_default: false
        });
      } else {
        addToast(response.data?.message || "Failed to save address", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save address", "error");
    }
  };

  // Handle checkout with coupon
  const handleCheckout = async () => {
    // ========== VALIDATION ==========
    if (!selectedBillingAddress) {
      addToast("Please select billing address", "error");
      return;
    }

    if (!useSameAddress && !selectedShippingAddress) {
      addToast("Please select shipping address", "error");
      return;
    }

    const { total, subtotal } = calculateTotals();

    if (paymentMethod === "razorpay" && total < 1) {
      addToast("Minimum amount for online payment is ₹1", "error");
      return;
    }

    try {
      setProcessing(true);

      // ========== HANDLE COD ==========
      if (paymentMethod === "cod") {
        const checkoutData = {
          billing_address_id: selectedBillingAddress.id,
          use_same_address: useSameAddress,
          payment_method: "cod",
          coupon_code: appliedCoupon?.code || "",
          loyalty_points_to_use: loyaltyPointsToUse,
          notes: notes,
          cart_total: subtotal,
          referral_code: localStorage.getItem("referral_code") || ""
        };

        if (!useSameAddress && selectedShippingAddress) {
          checkoutData.shipping_address_id = selectedShippingAddress.id;
        }




        const response = await axiosInstance.post('/api/public/checkout/', checkoutData);

        if (response.data?.success) {
          sessionStorage.removeItem('applied_coupon');
          localStorage.removeItem('referral_code');
          addToast("Order placed successfully!", "success");
          localStorage.setItem('recent_order', response.data.order_number);
          navigate(`/order-confirmation/${response.data.order_number}`);
        }
        setProcessing(false);
        return;
      }

      // ========== HANDLE RAZORPAY ==========
      if (paymentMethod === "razorpay") {
        // ✅ STEP 1: Create Razorpay order (NO database order yet)


        const razorpayOrderData = {
          billing_address_id: selectedBillingAddress.id,
          use_same_address: useSameAddress,
          coupon_code: appliedCoupon?.code || "",
          loyalty_points_to_use: loyaltyPointsToUse,
          notes: notes,
          referral_code: localStorage.getItem("referral_code") || ""
        };



        if (!useSameAddress && selectedShippingAddress) {
          razorpayOrderData.shipping_address_id = selectedShippingAddress.id;
        }

        const razorpayResponse = await axiosInstance.post('/api/public/create-razorpay-order/', razorpayOrderData);

        if (!razorpayResponse.data?.success) {
          throw new Error(razorpayResponse.data?.message || "Failed to create payment order");
        }


        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
          addToast("Payment gateway not available.", "error");
          setProcessing(false);
          return;
        }

        // ✅ STEP 2: Configure Razorpay options
// ✅ STEP 2: Configure Razorpay options
const options = {
  key: razorpayResponse.data.key,
  amount: razorpayResponse.data.amount,
  currency: razorpayResponse.data.currency || "INR",
  name: "initcart",
  description: "Order Payment",
  order_id: razorpayResponse.data.razorpay_order_id,

  handler: async function (razorpayResponse) {
    try {
      const orderResponse = await axiosInstance.post('/api/public/checkout/', {
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      });
      if (orderResponse.data?.success) {
        sessionStorage.removeItem('applied_coupon');
        addToast("Payment successful! Order confirmed.", "success");
        localStorage.setItem('recent_order', orderResponse.data.order_number);
        navigate(`/order-confirmation/${orderResponse.data.order_number}`);
      } else {
        addToast(orderResponse.data?.message || "Order creation failed", "error");
      }
    } catch (err) {
      console.error("❌ Order creation error:", err);
      addToast("Order creation failed. Please contact support.", "error");
    } finally {
      setProcessing(false);
    }
  },

  prefill: {
    name: selectedBillingAddress.full_name,
    email: selectedBillingAddress.email || "test@example.com",
    contact: selectedBillingAddress.phone,
    // 👇 UPI test ID prefill
    vpa: "success@razorpay",
  },

  // 👇 YEH KEY HAI - UPI ID input dikhane ke liye
  config: {
    display: {
      hide: [],
      preferences: {
        show_default_blocks: true
      }
    }
  },

  theme: { color: "#3B82F6" },
  modal: {
    ondismiss: () => {
      setProcessing(false);
      addToast("Payment cancelled", "info");
    }
  }
};

        // ✅ STEP 4: Open Razorpay
        try {
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } catch (error) {
          console.error("❌ Razorpay initialization error:", error);
          addToast("Payment initialization failed. Please try again.", "error");
          setProcessing(false);
        }
      }

    } catch (err) {
      console.error("❌ Checkout error:", err);
      handleCheckoutError(err);
    }
  };

  // ========== HELPER: Handle Razorpay Success ==========
  const handleRazorpaySuccess = async (razorpayResponse) => {
    try {
      const verifyResponse = await axiosInstance.post('/api/public/razorpay/callback/', {
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_signature: razorpayResponse.razorpay_signature
      });

      if (verifyResponse.data?.success) {
        sessionStorage.removeItem('applied_coupon');
        addToast("Payment successful! Order confirmed.", "success");
        localStorage.setItem('recent_order', verifyResponse.data.order_number);
        navigate(`/order-confirmation/${verifyResponse.data.order_number}`);
      } else {
        addToast(verifyResponse.data?.message || "Payment verification failed", "error");
      }
    } catch (err) {
      console.error(" Payment verification error:", err);
      addToast("Payment verification error. Please contact support.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // ========== HELPER: Handle Errors ==========
  const handleCheckoutError = (err) => {
    console.error(" Checkout error:", err);

    let errorMsg = "Checkout failed. Please try again.";

    if (err.response) {
      // Backend se specific error message
      errorMsg = err.response.data?.message || errorMsg;

      // Product quantity/stock errors
      if (err.response.status === 400) {
        if (errorMsg.includes("quantity") || errorMsg.includes("stock")) {
          addToast(errorMsg, "warning");
        } else {
          addToast(errorMsg, "error");
        }
      }
      // Authentication errors
      else if (err.response.status === 401) {
        addToast("Session expired. Please login again.", "warning");
        navigate('/customer/login');
      }
      // Permission errors
      else if (err.response.status === 403) {
        addToast("You don't have permission to do this.", "error");
      }
      // Not found errors
      else if (err.response.status === 404) {
        addToast("Resource not found.", "error");
      }
      // Server errors
      else if (err.response.status >= 500) {
        addToast("Server error. Please try again later.", "error");
      }
      else {
        addToast(errorMsg, "error");
      }
    } else if (err.request) {
      // Network error
      addToast("Network error. Please check your connection.", "error");
    } else {
      // Other errors
      addToast(errorMsg, "error");
    }

    // Clear coupon if error mentions coupon
    if (errorMsg.includes("coupon")) {
      sessionStorage.removeItem('applied_coupon');
      setAppliedCoupon(null);
      setCouponDiscount(0);
    }

    setProcessing(false);
  };
  // Initialize checkout
  useEffect(() => {
    const initCheckout = async () => {
      if (!checkAuthentication()) {
        return;
      }

      const cartLoaded = await fetchCart();
      if (!cartLoaded) {
        return;
      }

      try {
        await Promise.all([
          fetchAddresses(),
          fetchLoyaltyPoints()
        ]);
      } catch (error) {
        console.error("Error fetching additional data:", error);
      }

      loadRazorpayScript();
    };

    initCheckout();

    return () => {

    };
  }, [navigate, addToast]);

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

  // Update shipping address when useSameAddress changes
  useEffect(() => {
    if (useSameAddress && selectedBillingAddress) {
      setSelectedShippingAddress(selectedBillingAddress);
    }
  }, [useSameAddress, selectedBillingAddress]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate totals
  const { subtotal, shippingCharge, total } = calculateTotals();

  // Helper function for image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return "https://placehold.co/80x80/f0f4f8/94a3b8?text=No+Image";
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `https://api.initcart.in${imagePath}`;
  };

    if (isMobile) {
    return <MobileCheckoutPage />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FiLoader className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Checkout...</h3>
          <p className="text-gray-600">Please wait while we load your information</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <FiAlertCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Checkout</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium mb-3"
          >
            Retry
          </button>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <FiArrowLeft /> Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Complete your order in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              1
            </div>
            <div className="ml-2">Cart</div>
          </div>
          <div className="w-16 h-1 bg-blue-600 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              2
            </div>
            <div className="ml-2 font-semibold">Checkout</div>
          </div>
          <div className="w-16 h-1 bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center">
              3
            </div>
            <div className="ml-2 text-gray-500">Confirmation</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT SIDE: Checkout Forms (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">

            {/* Applied Coupon Banner */}
            {appliedCoupon && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                      <FiCheck className="text-white text-lg" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800 tracking-wider">{appliedCoupon.code}</span>
                        <span className={`text-xs font-bold text-white px-2 py-0.5 rounded bg-gradient-to-r ${getCouponBadgeColor(appliedCoupon.coupon_type)}`}>
                          {formatCouponDiscount(appliedCoupon)}
                        </span>
                        <span className="text-sm text-blue-600 font-medium">
                          -₹{Number(couponDiscount).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{appliedCoupon.title || appliedCoupon.code}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition"
                    title="Remove coupon"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>
              </div>
            )}

            {/* Coupon Offers Section */}
            {availableCoupons.length > 0 && !appliedCoupon && (
              <div className="bg-gradient-to-r from-blue-50 to-yellow-50 border border--200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <FiGift className="text-blue-500" />
                    Available Offers ({availableCoupons.length})
                  </h2>
                  <button
                    onClick={() => setShowCouponPanel(!showCouponPanel)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition"
                  >
                    {showCouponPanel ? 'Hide' : 'Show'} Offers
                    <FiChevronDown className={`transform transition-transform ${showCouponPanel ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {showCouponPanel && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      {availableCoupons.slice(0, 4).map((coupon) => (
                        <div key={coupon.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition bg-white hover:shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold text-white px-2 py-0.5 rounded bg-gradient-to-r ${getCouponBadgeColor(coupon.coupon_type)}`}>
                                  {formatCouponDiscount(coupon)}
                                </span>
                                <span className="font-bold text-gray-800 text-sm tracking-wider">{coupon.code}</span>
                              </div>
                              <p className="text-xs text-gray-600 mb-1">{coupon.title || coupon.code}</p>
                              {coupon.min_order_value && parseFloat(coupon.min_order_value) > 0 && (
                                <p className="text-xs text-gray-500">
                                  <FiInfo className="inline mr-1" size={10} />
                                  Min. order: ₹{coupon.min_order_value}
                                </p>
                              )}
                              {coupon.expire_date && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Valid till: {new Date(coupon.expire_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => {
                                setCouponCode(coupon.code);
                                applyCoupon();
                              }}
                              disabled={couponLoading}
                              className="text-xs bg-gradient-to-r from-blue-500 to-red-500 text-white px-3 py-1 rounded hover:from-blue-600 hover:to-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {couponLoading && coupon.code === couponCode ? '...' : 'Apply'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Coupon Input Field */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Have a coupon? Enter code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                          onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                        />
                        <FiTag className="absolute right-3 top-2.5 text-gray-400" />
                      </div>
                      <button
                        onClick={applyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="bg-gradient-to-r from-blue-600 to-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {couponLoading ? (
                          <FiLoader className="animate-spin mx-2" />
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                  </>
                )}

                {!showCouponPanel && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiInfo className="text-blue-600" />
                    <span>Save extra with coupons. Click "Show Offers" to view.</span>
                  </div>
                )}
              </div>
            )}

            {/* Billing Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiUser className="mr-2 text-blue-600" /> 1. Billing Information
              </h2>

              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`flex-1 py-3 font-medium ${activeContactTab === "billing"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setActiveContactTab("billing")}
                >
                  Select Address
                </button>
                <button
                  className={`flex-1 py-3 font-medium flex items-center justify-center ${activeContactTab === "history"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setActiveContactTab("history")}
                >
                  <FiClock className="mr-2" /> Address History
                </button>
              </div>

              {/* Billing Tab Content */}
              <div>
                {activeContactTab === "billing" ? (
                  <div className="space-y-6">
                    {/* Billing Address Selection */}
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">
                        Select Billing Address:
                      </h3>
                      <div className="space-y-3">
                        {addresses.length > 0 ? (
                          addresses.map((address) => (
                            <div
                              key={address.id}
                              className={`p-4 border rounded-lg cursor-pointer transition ${selectedBillingAddress?.id === address.id
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                              onClick={() => setSelectedBillingAddress(address)}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{address.full_name}</p>
                                  <p className="text-gray-600 text-sm">{address.phone}</p>
                                  <p className="text-gray-600 text-sm">{address.address_line1}</p>
                                  <p className="text-gray-600 text-sm">{address.city}, {address.state} - {address.pincode}</p>
                                </div>
                                {address.is_default && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 border border-gray-300 rounded-lg bg-gray-50">
                            <FiMapPin className="text-3xl text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">No addresses found</p>
                            <p className="text-sm text-gray-400 mt-1">Add a new address in shipping section</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Same Address Checkbox */}
                    <div className="pt-4 border-t">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useSameAddress}
                          onChange={(e) => setUseSameAddress(e.target.checked)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 font-medium">
                          Use same address for shipping
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  // Billing History Tab
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                      >
                        <div className="text-gray-700">
                          <p className="font-medium">{address.full_name}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">{address.address_line1}</p>
                          {address.address_line2 && (
                            <p className="text-sm text-gray-600">{address.address_line2}</p>
                          )}
                          <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiMapPin className="mr-2 text-blue-600" /> 2. Shipping Address
              </h2>

              <div className="flex border-b border-gray-200 mb-6">
                <button
                  className={`flex-1 py-3 font-medium ${activeShippingTab === "current"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setActiveShippingTab("current")}
                >
                  Add New Address
                </button>
                <button
                  className={`flex-1 py-3 font-medium flex items-center justify-center ${activeShippingTab === "history"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => setActiveShippingTab("history")}
                >
                  <FiClock className="mr-2" /> Saved Addresses
                </button>
              </div>

              {/* Shipping Tab Content */}
              {activeShippingTab === "current" ? (
                <div className="space-y-5">
                  <h3 className="font-medium text-gray-800">
                    Add New Shipping Address
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <FiUser className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type="text"
                            name="full_name"
                            placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                            value={newAddress.full_name}
                            onChange={handleNewAddressChange}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <FiPhone className="absolute left-3 top-3 text-gray-400" />
                          <input
                            type="text"
                            name="phone"
                            placeholder="9876543210"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                            value={newAddress.phone}
                            onChange={handleNewAddressChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          placeholder="john@example.com"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                          value={newAddress.email}
                          onChange={handleNewAddressChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1 *
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          name="address_line1"
                          placeholder="Street, Area"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                          value={newAddress.address_line1}
                          onChange={handleNewAddressChange}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2 (Optional)
                      </label>
                      <div className="relative">
                        <FiMapPin className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          name="address_line2"
                          placeholder="Apartment, Suite"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                          value={newAddress.address_line2}
                          onChange={handleNewAddressChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          placeholder="Mumbai"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                          value={newAddress.city}
                          onChange={handleNewAddressChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          name="state"
                          placeholder="Maharashtra"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                          value={newAddress.state}
                          onChange={handleNewAddressChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          placeholder="400001"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                          value={newAddress.pincode}
                          onChange={handleNewAddressChange}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        name="is_default"
                        id="is_default"
                        checked={newAddress.is_default}
                        onChange={handleNewAddressChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-600"
                      />
                      <label htmlFor="is_default" className="text-gray-700">
                        Set as default address
                      </label>
                    </div>

                    <button
                      onClick={saveNewAddress}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition shadow-sm hover:shadow"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              ) : (
                // Shipping History Tab
                <div>
                  {useSameAddress ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                      <div className="flex items-center">
                        <FiCheckCircle className="text-blue-600 mr-2" />
                        <p className="text-blue-700 font-medium">
                          Using same address as billing for shipping.
                        </p>
                      </div>
                      {selectedBillingAddress && (
                        <div className="mt-3 ml-6 text-sm text-blue-800">
                          <p><strong>Address:</strong> {selectedBillingAddress.address_line1}</p>
                          <p><strong>City:</strong> {selectedBillingAddress.city}, {selectedBillingAddress.state}</p>
                          <p><strong>Pincode:</strong> {selectedBillingAddress.pincode}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium text-gray-800 mb-3">
                        Select Shipping Address:
                      </h3>
                      <div className="space-y-3">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            className={`p-4 border rounded-lg cursor-pointer transition ${selectedShippingAddress?.id === address.id
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                              }`}
                            onClick={() => setSelectedShippingAddress(address)}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{address.full_name}</p>
                                <p className="text-gray-600 text-sm">{address.phone}</p>
                                <p className="text-gray-600 text-sm">{address.address_line1}</p>
                                <p className="text-gray-600 text-sm">{address.city}, {address.state} - {address.pincode}</p>
                              </div>
                              {address.is_default && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiTag className="mr-2 text-blue-600" /> 3. Additional Options
              </h2>

              {/* Loyalty Points Section */}
<div className="mb-6 border-t pt-4">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <FiStar className="text-yellow-500 text-lg" />
      <h3 className="font-semibold text-gray-800">Loyalty Points</h3>
    </div>
    <span className={`text-sm font-semibold ${availableLoyaltyPoints > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
      {availableLoyaltyPoints} points available
    </span>
  </div>

  {availableLoyaltyPoints > 0 ? (
    <>
      <button
        onClick={() => setShowLoyaltyInput(!showLoyaltyInput)}
        className="flex items-center justify-between w-full text-gray-600 text-sm mb-2 hover:text-gray-800 transition"
      >
        <span className="flex items-center gap-2">
          <FiChevronDown className={`transform transition-transform ${showLoyaltyInput ? "rotate-180" : ""}`} />
          Use points to get discount (100 points = ₹10)
        </span>
      </button>

      {showLoyaltyInput && (
        <div className="mt-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Available Points: 
              <span className="font-bold text-yellow-600 ml-1">{availableLoyaltyPoints}</span>
            </p>
            <p className="text-sm text-green-600">
              = ₹{(availableLoyaltyPoints * 0.1).toFixed(2)} discount
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="number"
                min="0"
                max={availableLoyaltyPoints}
                value={loyaltyPointsToUse}
                onChange={(e) => {
                  let val = parseInt(e.target.value) || 0;
                  if (val < 0) val = 0;
                  if (val > availableLoyaltyPoints) val = availableLoyaltyPoints;
                  setLoyaltyPointsToUse(val);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Enter points to use"
              />
              {loyaltyPointsToUse > 0 && (
                <div className="text-sm text-green-600 mt-1 font-medium flex items-center gap-1">
                  <FiCheck className="text-green-500" />
                  Discount: ₹{(loyaltyPointsToUse * 0.1).toFixed(2)}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (loyaltyPointsToUse > 0) {
                  const discount = (loyaltyPointsToUse * 0.1).toFixed(2);
                  addToast(`🎉 Applied ${loyaltyPointsToUse} points! You saved ₹${discount}`, "success");
                  calculateCartSummary(cartItems);
                  setShowLoyaltyInput(false);
                } else {
                  addToast("Please enter points to apply", "warning");
                }
              }}
              disabled={loyaltyPointsToUse === 0}
              className={`px-6 py-2.5 rounded-lg font-medium transition shadow-sm ${
                loyaltyPointsToUse > 0
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Apply Points
            </button>
          </div>
          
          <div className="mt-3 p-2 bg-yellow-100/50 rounded-lg">
            <p className="text-xs text-yellow-700 flex items-center gap-1">
              <FiInfo size={12} />
               Tip: Use maximum {Math.floor(calculateTotals().total / 0.1)} points for this order
            </p>
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="mt-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <FiStar className="text-gray-400 text-xl" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">No Loyalty Points Available</p>
          <p className="text-xs text-gray-500 mt-1">
            Shop more to earn points! Every ₹100 spent = 10 points
          </p>
          <Link to="/productlist" className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block">
            Start Shopping →
          </Link>
        </div>
      </div>
    </div>
  )}
</div>
              {/* 👇 REFERRAL CODE SECTION - YAHAN ADD KARO 👇 */}
              <div className="mb-6 border-t pt-4">
                <button
                  className="flex items-center justify-between w-full text-gray-700 font-medium text-lg mb-3 hover:text-gray-900 transition"
                  onClick={() => setShowReferralInput(!showReferralInput)}
                >
                  <span className="flex items-center gap-2">
                    <FiGift className="text-purple-500" /> Have a Referral Code?
                  </span>
                  <FiChevronDown className={`transform transition-transform ${showReferralInput ? "rotate-180" : ""}`} />
                </button>

                {showReferralInput && (
                  <div className="mt-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          placeholder="Enter referral code (e.g., 8F3K2J9)"
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                      </div>

                      {referralCode && (
                        <button
                          onClick={() => {
                            localStorage.setItem("referral_code", referralCode);
                            addToast("Referral code applied!", "success");
                          }}
                          className="bg-purple-500 text-white px-5 py-2 rounded-lg"
                        >
                          Apply
                        </button>
                      )}
                    </div>

                    {referralCode && (
                      <div className="mt-2 flex items-center gap-2 text-sm bg-purple-50 text-purple-700 p-2 rounded-lg">
                        <FiCheckCircle className="text-purple-600" />
                        <span>Referral code <strong>{referralCode}</strong> will be applied</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Order Notes (Optional)</h3>
                <textarea
                  placeholder="Any special instructions for your order..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Order Summary (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-6">
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-200">
                    <div className="relative">
                      <img
                        src={getImageUrl(item.product_details?.main_image || item.product_details?.thumbnail)}
                        alt={item.product_details?.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/64x64/f0f4f8/94a3b8?text=No+Image";
                        }}
                      />
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 text-sm line-clamp-1">
                        {item.product_details?.product_name || "Product"}
                      </h3>

                      {/* 👇 Campaign Badge */}
                      {item.is_in_campaign && (
                        <span className="inline-block mt-1 text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded">
                          {getCampaignBadge(item.campaign_details?.campaign_type)}
                        </span>
                      )}

                      {/* 👇 Campaign Price Display */}
                      {item.is_in_campaign ? (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-blue-600 font-semibold">
                            ₹{item.campaign_price}
                          </p>
                          <p className="text-xs text-gray-400 line-through">
                            ₹{item.original_price}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">
                          ₹{item.product_details?.unit_price || 0} × {item.quantity}
                        </p>
                      )}

                      {/* 👇 Countdown Display */}
                      {getCountdownDisplay(item)}
                    </div>
                    <span className="font-semibold text-gray-900 whitespace-nowrap">
                      ₹{parseFloat(item.item_total || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 py-4 border-t border-gray-200">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span className={shippingCharge === 0 ? "text-blue-600 font-medium" : ""}>
                    {shippingCharge === 0 ? (
                      <span className="flex items-center gap-1">
                        <FiTruck className="text-blue-600" /> FREE
                      </span>
                    ) : (
                      `₹${shippingCharge.toFixed(2)}`
                    )}
                  </span>
                </div>

                {/* Applied Coupon Discount */}
                {appliedCoupon && (
                  <div className="flex justify-between text-blue-600">
                    <span className="flex items-center gap-1">
                      <FiTag className="text-sm" />
                      Coupon {appliedCoupon.code}
                    </span>
                    <span className="font-medium">-₹{Number(couponDiscount).toFixed(2)}</span>
                  </div>
                )}

                {/* Loyalty Points Discount */}
                {loyaltyPointsToUse > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span className="flex items-center gap-1">
                      <FiStar className="text-sm text-yellow-500" />
                      Loyalty Points
                    </span>
                    <span className="font-medium">-₹{(loyaltyPointsToUse * 0.1).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-4 mt-4">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`p-3 border rounded-lg text-center transition ${paymentMethod === "razorpay"
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => setPaymentMethod("razorpay")}
                  >
                    <FiCreditCard className="text-xl mx-auto mb-1" />
                    <span className="text-sm font-medium">Pay Online</span>
                  </button>
                  <button
                    className={`p-3 border rounded-lg text-center transition ${paymentMethod === "cod"
                      ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <FiShoppingCart className="text-xl mx-auto mb-1" />
                    <span className="text-sm font-medium">Cash on Delivery</span>
                  </button>
                </div>
              </div>

              {/* Security & Guarantee Badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-gray-500 text-xs">
                <div className="flex items-center gap-1">
                  <FiShield className="text-blue-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiPackage className="text-blue-600" />
                  <span>Easy Returns</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={processing || !selectedBillingAddress || (!useSameAddress && !selectedShippingAddress)}
                className={`w-full mt-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${processing || !selectedBillingAddress || (!useSameAddress && !selectedShippingAddress)
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                  } text-white`}
              >
                {processing ? (
                  <>
                    <FiLoader className="animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === "razorpay" ? (
                  <>
                    <FiCreditCard />
                    Proceed to Payment
                  </>
                ) : (
                  <>
                    <FiShoppingCart />
                    Place Order
                  </>
                )}
              </button>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our Terms & Conditions
              </p>

              {/* Back to Cart */}
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm mt-4 justify-center w-full transition"
              >
                <FiArrowLeft /> Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;