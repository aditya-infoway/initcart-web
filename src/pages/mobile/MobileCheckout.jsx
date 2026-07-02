// ecommerce/frontend/src/pages/mobile/MobileCheckoutPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FiUser, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiCreditCard, 
  FiChevronDown, 
  FiChevronUp,
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
  FiStar,
  FiHome,
  FiPlus,
  FiTrash2
} from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
import { axiosInstance } from "../../api/axios";

// ─── Font Tokens ──────────────────────────────────────────────────────────
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle:    { fontSize: 14, fontWeight: 600 },
  cardSub:      { fontSize: 11, fontWeight: 400 },
  badge:        { fontSize: 10, fontWeight: 600 },
  pill:         { fontSize: 11, fontWeight: 600 },
  statNum:      { fontSize: 13, fontWeight: 700 },
  statLabel:    { fontSize:  9, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLetter:{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

const MobileCheckoutPage = () => {
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
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processing, setProcessing] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [showLoyaltyInput, setShowLoyaltyInput] = useState(false);

  // Collapsible Sections
  const [expandedSections, setExpandedSections] = useState({
    billing: true,
    shipping: true,
    payment: true,
    extras: false
  });

  // New Address Form
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    phone: "",
    email: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    is_default: false
  });

  const navigate = useNavigate();
  const { addToast } = useToast();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Load referral code
  useEffect(() => {
    const savedRef = localStorage.getItem("referral_code");
    const userStr = localStorage.getItem("customer_user");
    if (savedRef && userStr) {
      try {
        const userData = JSON.parse(userStr);
        const isAgentRegistered = userData.username && /^\d+$/.test(userData.username);
        if (!isAgentRegistered) {
          setReferralCode(savedRef);
          setShowReferralInput(true);
        }
      } catch (e) {}
    }
  }, []);

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
      const response = await axiosInstance.get('/api/public/cart/');
      let items = [];
      if (response.data && Array.isArray(response.data)) items = response.data;
      else if (response.data?.data && Array.isArray(response.data.data)) items = response.data.data;
      else if (response.data?.success && response.data.data) items = response.data.data;
      
      setCartItems(items);
      if (items.length === 0) {
        addToast("Your cart is empty", "warning");
        navigate("/cart");
        return false;
      }
      fetchAvailableCoupons(items);
      return true;
    } catch (err) {
      if (err.response?.status === 401) {
        addToast("Session expired. Please login again.", "warning");
        navigate("/customer/login", { state: { from: "/checkout" } });
      } else {
        setError(err.response?.data?.message || "Failed to load cart");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const response = await axiosInstance.get('/api/public/customer/addresses/');
      let addressList = [];
      if (response.data && Array.isArray(response.data)) addressList = response.data;
      else if (response.data?.data && Array.isArray(response.data.data)) addressList = response.data.data;
      else if (response.data?.success && response.data.data) addressList = response.data.data;
      
      setAddresses(addressList);
      if (addressList.length > 0) {
        const defaultAddress = addressList.find(addr => addr.is_default) || addressList[0];
        setSelectedBillingAddress(defaultAddress);
        setSelectedShippingAddress(defaultAddress);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    }
  };

  // Fetch loyalty points
  const fetchLoyaltyPoints = async () => {
    try {
      const response = await axiosInstance.get('/api/public/loyalty/points/');
      if (response.data?.success) {
        setAvailableLoyaltyPoints(response.data.data?.available_points || 0);
      }
    } catch (err) {
      console.error("Error fetching loyalty points:", err);
    }
  };

  // Fetch available coupons
  const fetchAvailableCoupons = async (items) => {
    try {
      const response = await axiosInstance.get('/ecommerce/public/coupons/cart/');
      if (response.data?.success) {
        const coupons = response.data.coupons || response.data.data || [];
        setAvailableCoupons(coupons);
        
        const sessionCoupon = sessionStorage.getItem('applied_coupon');
        if (sessionCoupon) {
          const couponData = JSON.parse(sessionCoupon);
          const matchingCoupon = coupons.find(c => c.code === couponData.code);
          if (matchingCoupon) {
            setAppliedCoupon(matchingCoupon);
            setCouponDiscount(couponData.discount_amount || 0);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  };

  // Apply coupon
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
      
      if (response.data?.success) {
        const couponData = response.data.coupon || response.data.data;
        let discountAmount = response.data.discount_amount || 0;
        setAppliedCoupon(couponData);
        setCouponDiscount(discountAmount);
        setCouponCode("");
        sessionStorage.setItem('applied_coupon', JSON.stringify({
          code: couponData.code,
          discount_amount: discountAmount
        }));
        addToast(`Coupon applied successfully!`, 'success');
      } else {
        addToast(response.data?.message || 'Failed to apply coupon', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid coupon code', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = async () => {
    try {
      await axiosInstance.delete('/ecommerce/public/coupons/cart/');
      setAppliedCoupon(null);
      setCouponDiscount(0);
      sessionStorage.removeItem('applied_coupon');
      addToast('Coupon removed', 'success');
    } catch (err) {
      setAppliedCoupon(null);
      setCouponDiscount(0);
      sessionStorage.removeItem('applied_coupon');
      addToast('Coupon removed', 'info');
    }
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
      if (response.data?.success) {
        addToast("Address saved successfully", "success");
        await fetchAddresses();
        setShowNewAddressForm(false);
        setNewAddress({
          full_name: "", phone: "", email: "", address_line1: "", address_line2: "",
          city: "", state: "", pincode: "", is_default: false
        });
      } else {
        addToast(response.data?.message || "Failed to save address", "error");
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save address", "error");
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.item_total || 0), 0);
    const shippingCharge = subtotal >= 1000 ? 0 : 50;
    let total = subtotal + shippingCharge;
    if (couponDiscount > 0) total = Math.max(0, total - couponDiscount);
    if (loyaltyPointsToUse > 0) total = Math.max(0, total - (loyaltyPointsToUse * 0.1));
    return { subtotal, shippingCharge, total };
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle checkout
  const handleCheckout = async () => {
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

      if (paymentMethod === "cod") {
        const checkoutData = {
          billing_address_id: selectedBillingAddress.id,
          use_same_address: useSameAddress,
          payment_method: "cod",
          coupon_code: appliedCoupon?.code || "",
          loyalty_points_to_use: loyaltyPointsToUse,
          notes: notes,
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
          navigate(`/order-confirmation/${response.data.order_number}`);
        }
        setProcessing(false);
        return;
      }

      if (paymentMethod === "razorpay") {
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

        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || !window.Razorpay) {
          addToast("Payment gateway not available.", "error");
          setProcessing(false);
          return;
        }

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
                navigate(`/order-confirmation/${orderResponse.data.order_number}`);
              } else {
                addToast(orderResponse.data?.message || "Order creation failed", "error");
              }
            } catch (err) {
              addToast("Order creation failed. Please contact support.", "error");
            } finally {
              setProcessing(false);
            }
          },
          prefill: {
            name: selectedBillingAddress.full_name,
            email: selectedBillingAddress.email || "test@example.com",
            contact: selectedBillingAddress.phone,
          },
          theme: { color: "#3B82F6" },
          modal: { ondismiss: () => { setProcessing(false); addToast("Payment cancelled", "info"); } }
        };
        
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (err) {
      console.error("Checkout error:", err);
      addToast(err.response?.data?.message || "Checkout failed. Please try again.", "error");
      setProcessing(false);
    }
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      if (!checkAuthentication()) return;
      const cartLoaded = await fetchCart();
      if (!cartLoaded) return;
      await Promise.all([fetchAddresses(), fetchLoyaltyPoints()]);
      loadRazorpayScript();
    };
    init();
  }, []);

  useEffect(() => {
    if (useSameAddress && selectedBillingAddress) {
      setSelectedShippingAddress(selectedBillingAddress);
    }
  }, [useSameAddress, selectedBillingAddress]);

  const { subtotal, shippingCharge, total } = calculateTotals();
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/80x80/f0f4f8/94a3b8?text=No+Image";
    if (imagePath.startsWith('http')) return imagePath;
    return `https://api.initcart.in${imagePath}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ ...F.cardSub, color: '#64748B' }}>Loading checkout...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 32, textAlign: 'center', maxWidth: 320 }}>
          <FiAlertCircle size={48} color="#2563EB" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ ...F.emptyTitle, marginBottom: 8 }}>Error Loading Checkout</h3>
          <p style={{ ...F.emptySubtitle, color: '#64748B', marginBottom: 24 }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '12px 24px', cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) return null;

  return (
    <div style={{ minHeight: '100dvh', background: '#F8FAFC', paddingBottom: 100 }}>
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <FiArrowLeft size={20} color="#1E293B" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...F.pageTitle, fontSize: 18, margin: 0 }}>Checkout</h1>
          <p style={{ ...F.badge, color: '#64748B', marginTop: 2 }}>{cartItems.length} items</p>
        </div>
        <Link to="/cart" style={{ color: '#2563EB', ...F.pill, textDecoration: 'none' }}>Edit Cart</Link>
      </div>

      <div style={{ padding: '12px' }}>
        
        {/* Order Summary Card */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiShoppingCart size={20} color="#2563EB" />
            <span style={{ ...F.cardSub, fontWeight: 600 }}>Order Total</span>
          </div>
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#2563EB' }}>₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Applied Coupon */}
        {appliedCoupon && (
          <div style={{ background: '#ECFDF5', borderRadius: 12, marginBottom: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <FiCheck size={14} color="#10B981" />
              <span style={{ ...F.badge, fontWeight: 600, color: '#065F46' }}>{appliedCoupon.code}</span>
              <span style={{ ...F.badge, color: '#047857' }}>-₹{Number(couponDiscount).toFixed(2)}</span>
            </div>
            <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><FiX size={16} /></button>
          </div>
        )}

        {/* Coupon Section */}
        {availableCoupons.length > 0 && !appliedCoupon && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <button onClick={() => setShowCouponPanel(!showCouponPanel)} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiGift size={18} color="#2563EB" />
                <span style={{ ...F.cardSub, fontWeight: 600 }}>{availableCoupons.length} Offers Available</span>
              </div>
              {showCouponPanel ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </button>
            
            {showCouponPanel && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 12, padding: '10px 12px', fontSize: 13, outline: 'none' }}
                  />
                  <button onClick={applyCoupon} disabled={couponLoading} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '10px 16px', ...F.pill, cursor: 'pointer' }}>
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                  {availableCoupons.slice(0, 3).map(coupon => (
                    <button key={coupon.id} onClick={() => { setCouponCode(coupon.code); applyCoupon(); }} style={{ background: '#F1F5F9', border: 'none', borderRadius: 20, padding: '6px 12px', whiteSpace: 'nowrap' }}>
                      <span style={{ ...F.badge, fontWeight: 600, color: '#2563EB' }}>{coupon.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== BILLING ADDRESS SECTION - WITH ALL FIELDS ========== */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <button onClick={() => toggleSection('billing')} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiUser size={18} color="#2563EB" />
              <span style={{ ...F.cardTitle }}>Billing Address</span>
              {selectedBillingAddress && <span style={{ ...F.badge, color: '#10B981' }}>✓ Selected</span>}
            </div>
            {expandedSections.billing ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </button>
          
          {expandedSections.billing && (
            <div style={{ padding: '0 12px 12px 12px' }}>
              {addresses.length > 0 ? (
                addresses.map(addr => (
                  <div key={addr.id} onClick={() => setSelectedBillingAddress(addr)} style={{
                    padding: '12px',
                    border: `1.5px solid ${selectedBillingAddress?.id === addr.id ? '#2563EB' : '#E2E8F0'}`,
                    borderRadius: 12,
                    marginBottom: 8,
                    background: selectedBillingAddress?.id === addr.id ? '#EFF6FF' : '#FFFFFF'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ ...F.cardSub, fontWeight: 600 }}>{addr.full_name}</span>
                      {addr.is_default && <span style={{ ...F.badge, color: '#2563EB' }}>Default</span>}
                    </div>
                    <p style={{ ...F.badge, color: '#64748B' }}> {addr.phone}</p>
                    {addr.email && <p style={{ ...F.badge, color: '#64748B' }}> {addr.email}</p>}
                    <p style={{ ...F.badge, color: '#64748B' }}> {addr.address_line1}</p>
                    {addr.address_line2 && <p style={{ ...F.badge, color: '#64748B' }}>{addr.address_line2}</p>}
                    <p style={{ ...F.badge, color: '#64748B' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px', textAlign: 'center' }}>
                  <FiMapPin size={32} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                  <p style={{ ...F.cardSub, color: '#64748B' }}>No saved addresses</p>
                  <p style={{ ...F.badge, color: '#64748B' }}>Please add an address in shipping section</p>
                </div>
              )}
              
              {/* Same Address Checkbox */}
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" checked={useSameAddress} onChange={(e) => setUseSameAddress(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563EB' }} />
                <span style={{ ...F.cardSub }}>Use same address for shipping</span>
              </div>
            </div>
          )}
        </div>

        {/* ========== SHIPPING ADDRESS SECTION ========== */}
        {!useSameAddress && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <button onClick={() => toggleSection('shipping')} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiMapPin size={18} color="#2563EB" />
                <span style={{ ...F.cardTitle }}>Shipping Address</span>
                {selectedShippingAddress && <span style={{ ...F.badge, color: '#10B981' }}>✓ Selected</span>}
              </div>
              {expandedSections.shipping ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
            </button>
            
            {expandedSections.shipping && (
              <div style={{ padding: '12px' }}>
                <button onClick={() => setShowNewAddressForm(!showNewAddressForm)} style={{ width: '100%', marginBottom: 12, padding: '10px', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, color: '#2563EB', ...F.pill, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <FiPlus size={14} /> Add New Address
                </button>
                
                {showNewAddressForm && (
                  <div style={{ marginBottom: 12 }}>
                    <input type="text" placeholder="Full Name" value={newAddress.full_name} onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})} style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', marginBottom: 8, fontSize: 13 }} />
                    <input type="tel" placeholder="Phone Number" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', marginBottom: 8, fontSize: 13 }} />
                    <input type="email" placeholder="Email (Optional)" value={newAddress.email} onChange={(e) => setNewAddress({...newAddress, email: e.target.value})} style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', marginBottom: 8, fontSize: 13 }} />
                    <input type="text" placeholder="Address Line 1" value={newAddress.address_line1} onChange={(e) => setNewAddress({...newAddress, address_line1: e.target.value})} style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', marginBottom: 8, fontSize: 13 }} />
                    <input type="text" placeholder="Address Line 2 (Optional)" value={newAddress.address_line2} onChange={(e) => setNewAddress({...newAddress, address_line2: e.target.value})} style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', marginBottom: 8, fontSize: 13 }} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', marginBottom: 8, fontSize: 13 }} />
                      <input type="text" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', marginBottom: 8, fontSize: 13 }} />
                    </div>
                    <input type="text" placeholder="Pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 13 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <input type="checkbox" checked={newAddress.is_default} onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})} style={{ width: 16, height: 16 }} />
                      <span style={{ ...F.badge, color: '#64748B' }}>Set as default address</span>
                    </div>
                    <button onClick={saveNewAddress} style={{ width: '100%', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '12px', ...F.cardTitle, cursor: 'pointer' }}>Save Address</button>
                  </div>
                )}
                
                {addresses.map(addr => (
                  <div key={addr.id} onClick={() => setSelectedShippingAddress(addr)} style={{
                    padding: '12px',
                    border: `1.5px solid ${selectedShippingAddress?.id === addr.id ? '#2563EB' : '#E2E8F0'}`,
                    borderRadius: 12,
                    marginBottom: 8,
                    background: selectedShippingAddress?.id === addr.id ? '#EFF6FF' : '#FFFFFF'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ ...F.cardSub, fontWeight: 600 }}>{addr.full_name}</span>
                      {addr.is_default && <span style={{ ...F.badge, color: '#2563EB' }}>Default</span>}
                    </div>
                    <p style={{ ...F.badge, color: '#64748B' }}> {addr.phone}</p>
                    <p style={{ ...F.badge, color: '#64748B' }}> {addr.address_line1}</p>
                    <p style={{ ...F.badge, color: '#64748B' }}>{addr.city}, {addr.state} - {addr.pincode}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========== PAYMENT METHOD SECTION ========== */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <button onClick={() => toggleSection('payment')} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiCreditCard size={18} color="#2563EB" />
              <span style={{ ...F.cardTitle }}>Payment Method</span>
            </div>
            {expandedSections.payment ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </button>
          
          {expandedSections.payment && (
            <div style={{ padding: '12px', display: 'flex', gap: 12 }}>
              <button onClick={() => setPaymentMethod("razorpay")} style={{ flex: 1, padding: '12px', border: `2px solid ${paymentMethod === "razorpay" ? '#2563EB' : '#E2E8F0'}`, borderRadius: 12, background: paymentMethod === "razorpay" ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer' }}>
                <FiCreditCard size={24} color={paymentMethod === "razorpay" ? '#2563EB' : '#94A3B8'} style={{ margin: '0 auto 6px' }} />
                <p style={{ ...F.badge, fontWeight: 600, color: paymentMethod === "razorpay" ? '#2563EB' : '#64748B' }}>Pay Online</p>
              </button>
              <button onClick={() => setPaymentMethod("cod")} style={{ flex: 1, padding: '12px', border: `2px solid ${paymentMethod === "cod" ? '#2563EB' : '#E2E8F0'}`, borderRadius: 12, background: paymentMethod === "cod" ? '#EFF6FF' : '#FFFFFF', cursor: 'pointer' }}>
                <FiShoppingCart size={24} color={paymentMethod === "cod" ? '#2563EB' : '#94A3B8'} style={{ margin: '0 auto 6px' }} />
                <p style={{ ...F.badge, fontWeight: 600, color: paymentMethod === "cod" ? '#2563EB' : '#64748B' }}>Cash on Delivery</p>
              </button>
            </div>
          )}
        </div>

        {/* ========== EXTRAS SECTION (Loyalty + Referral + Notes) ========== */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <button onClick={() => toggleSection('extras')} style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiGift size={18} color="#8B5CF6" />
              <span style={{ ...F.cardTitle }}>Offers &amp; Extras</span>
            </div>
            {expandedSections.extras ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </button>
          
          {expandedSections.extras && (
            <div style={{ padding: '12px' }}>
              {/* Loyalty Points - With 0 points check */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiStar size={16} color="#F59E0B" />
                    <span style={{ ...F.cardSub, fontWeight: 600 }}>Loyalty Points</span>
                  </div>
                  <span style={{ ...F.statNum, color: availableLoyaltyPoints > 0 ? '#2563EB' : '#94A3B8' }}>
                    {availableLoyaltyPoints} points
                  </span>
                </div>
                
                {availableLoyaltyPoints > 0 ? (
                  <>
                    <button onClick={() => setShowLoyaltyInput(!showLoyaltyInput)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}>
                      <span style={{ ...F.badge, color: '#64748B' }}>Use points to get discount</span>
                      {showLoyaltyInput ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </button>
                    {showLoyaltyInput && (
                      <div style={{ marginTop: 8 }}>
                        <p style={{ ...F.badge, color: '#64748B', marginBottom: 8 }}>Available: <span style={{ fontWeight: 600, color: '#2563EB' }}>{availableLoyaltyPoints}</span> points = ₹{(availableLoyaltyPoints * 0.1).toFixed(2)} discount</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input type="number" min="0" max={availableLoyaltyPoints} value={loyaltyPointsToUse} onChange={(e) => setLoyaltyPointsToUse(parseInt(e.target.value) || 0)} style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontSize: 13 }} />
                          <button onClick={() => addToast(`Applied ${loyaltyPointsToUse} points`, 'success')} style={{ background: '#F59E0B', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '10px 16px', cursor: 'pointer' }}>Apply</button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '10px', marginTop: 8 }}>
                    <p style={{ ...F.badge, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiAlertCircle size={12} /> No loyalty points available. Shop more to earn points!
                    </p>
                  </div>
                )}
              </div>

              {/* Referral Code */}
              <div style={{ marginBottom: 16 }}>
                <button onClick={() => setShowReferralInput(!showReferralInput)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiGift size={16} color="#8B5CF6" />
                    <span style={{ ...F.cardSub, fontWeight: 600 }}>Referral Code</span>
                  </div>
                  {showReferralInput ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                </button>
                {showReferralInput && (
                  <div>
                    <input type="text" placeholder="Enter referral code" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontSize: 13, marginBottom: 8 }} />
                    {referralCode && (
                      <button onClick={() => { localStorage.setItem("referral_code", referralCode); addToast("Referral code applied!", "success"); }} style={{ width: '100%', background: '#8B5CF6', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '10px', ...F.pill, cursor: 'pointer' }}>Apply Code</button>
                    )}
                  </div>
                )}
              </div>

              {/* Order Notes */}
              <div>
                <p style={{ ...F.cardSub, fontWeight: 600, marginBottom: 8 }}>Order Notes (Optional)</p>
                <textarea placeholder="Any special instructions..." rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 12px', fontSize: 13, resize: 'none', outline: 'none' }}></textarea>
              </div>
            </div>
          )}
        </div>

        {/* Order Items Summary */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiPackage size={18} color="#2563EB" />
            <span style={{ ...F.cardTitle }}>Order Items ({cartItems.length})</span>
          </div>
          <div style={{ padding: '12px' }}>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #E2E8F0' }}>
                <img src={getImageUrl(item.product_details?.main_image)} alt="" style={{ width: 55, height: 55, borderRadius: 10, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <p style={{ ...F.cardSub, fontWeight: 600 }}>{item.product_details?.product_name}</p>
                  <p style={{ ...F.badge, color: '#64748B' }}>Qty: {item.quantity}</p>
                  <p style={{ ...F.statNum, color: '#2563EB' }}>₹{parseFloat(item.item_total || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Bottom Bar */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '12px 16px', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ ...F.cardSub, color: '#64748B' }}>Subtotal</span>
            <span style={{ ...F.statNum }}>₹{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ ...F.cardSub, color: '#64748B' }}>Shipping</span>
            <span style={{ ...F.statNum, color: shippingCharge === 0 ? '#10B981' : '#64748B' }}>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge.toFixed(2)}`}</span>
          </div>
          {appliedCoupon && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ ...F.cardSub, color: '#10B981' }}>Coupon Discount</span>
              <span style={{ ...F.statNum, color: '#10B981' }}>-₹{Number(couponDiscount).toFixed(2)}</span>
            </div>
          )}
          {loyaltyPointsToUse > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ ...F.cardSub, color: '#10B981' }}>Loyalty Points</span>
              <span style={{ ...F.statNum, color: '#10B981' }}>-₹{(loyaltyPointsToUse * 0.1).toFixed(2)}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid #E2E8F0', margin: '8px 0 12px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ ...F.cardTitle }}>Total Amount</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#2563EB' }}>₹{total.toFixed(2)}</span>
          </div>
          
          <button onClick={handleCheckout} disabled={processing || !selectedBillingAddress || (!useSameAddress && !selectedShippingAddress)} style={{ width: '100%', padding: '14px', background: processing ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFFFFF', border: 'none', borderRadius: 14, ...F.cardTitle, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {processing ? <><div style={{ width: 16, height: 16, border: '2px solid #FFFFFF', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Placing Order...</> : <><FiShoppingCart size={16} /> {paymentMethod === "cod" ? "Place Order" : "Pay Now"}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileCheckoutPage;