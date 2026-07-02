// ecommerce/frontend/src/pages/mobile/MobileCartPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  FiClock,
  FiHome
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { axiosInstance } from "../../api/axios";

// ─── Font Tokens (Same as other mobile pages) ──────────────────────────────
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

const MobileCartPage = () => {
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
  
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponPanel, setShowCouponPanel] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [countdowns, setCountdowns] = useState({});
  const [updatingItemId, setUpdatingItemId] = useState(null);
  
  const { loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const FREE_DELIVERY_THRESHOLD = 1000;

  // Countdown timer effect
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
                [itemId]: { ...currentCountdown, days: 0, hours: 0, minutes: 0, seconds: 0, total_seconds: 0 }
              };
            }
            const days = Math.floor(newTotalSeconds / (24 * 3600));
            const hours = Math.floor((newTotalSeconds % (24 * 3600)) / 3600);
            const minutes = Math.floor((newTotalSeconds % 3600) / 60);
            const seconds = newTotalSeconds % 60;
            return { ...prev, [itemId]: { ...currentCountdown, days, hours, minutes, seconds, total_seconds: newTotalSeconds } };
          });
        }, 1000);
        timers[itemId] = timer;
        setCountdowns(prev => ({ ...prev, [itemId]: item.campaign_countdown }));
      }
    });
    return () => { Object.values(timers).forEach(timer => clearInterval(timer)); };
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/api/public/cart/');
      let items = [];
      if (response.data && Array.isArray(response.data)) items = response.data;
      else if (response.data && response.data.data && Array.isArray(response.data.data)) items = response.data.data;
      else if (response.data && response.data.success && response.data.data) items = response.data.data;
      setCartItems(items);
      calculateCartSummary(items);
      if (items.length > 0) fetchAvailableCoupons(items);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('customer_token');
        localStorage.removeItem('customer_user');
        addToast('Please login to view cart', 'warning');
        navigate('/customer/login', { state: { from: '/cart' } });
      } else {
        setError(err.response?.data?.message || 'Failed to load cart');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignBadgeColor = (campaignType) => {
    switch (campaignType) {
      case 'Flash': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'Deal of the Day': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'Featured': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const fetchAvailableCoupons = async (items) => {
    try {
      setCouponLoading(true);
      const response = await axiosInstance.get('/ecommerce/public/coupons/cart/');
      if (response.data && response.data.success) {
        setAvailableCoupons(response.data.coupons || []);
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

  const calculateCartSummary = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.item_total || 0), 0);
    const shippingCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 50;
    const total = Math.max(0, subtotal + shippingCharge - couponDiscount);
    setCartSummary({ subtotal, shipping_charge: shippingCharge, total, item_count: items.length, eligible_for_free_shipping: subtotal >= FREE_DELIVERY_THRESHOLD });
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) { addToast('Please enter a coupon code', 'warning'); return; }
    try {
      setCouponLoading(true);
      const response = await axiosInstance.post('/ecommerce/public/coupons/cart/', { coupon_code: couponCode.toUpperCase() });
      if (response.data && response.data.success) {
        setAppliedCoupon(response.data.coupon);
        setCouponDiscount(response.data.discount_amount || 0);
        setCouponCode("");
        sessionStorage.setItem('applied_coupon', JSON.stringify({ code: response.data.coupon.code, discount_amount: response.data.discount_amount }));
        addToast(`Coupon applied successfully!`, 'success');
        calculateCartSummary(cartItems);
      } else {
        addToast(response.data?.message || 'Failed to apply coupon', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Invalid coupon code', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = async () => {
    try {
      const response = await axiosInstance.delete('/ecommerce/public/coupons/cart/');
      if (response.data && response.data.success) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        sessionStorage.removeItem('applied_coupon');
        addToast('Coupon removed', 'success');
        calculateCartSummary(cartItems);
      }
    } catch (err) {
      addToast('Failed to remove coupon', 'error');
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    setUpdatingItemId(cartItemId);
    try {
      const response = await axiosInstance.post(`/api/public/cart/${cartItemId}/update_quantity/`, { quantity });
      if (response.data.success) {
        await fetchCart();
        addToast('Quantity updated', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update quantity', 'error');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await axiosInstance.delete(`/api/public/cart/${cartItemId}/`);
      if (response.data.success) {
        await fetchCart();
        addToast('Item removed', 'success');
      }
    } catch (err) {
      addToast('Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Clear your cart?")) return;
    try {
      const response = await axiosInstance.post('/api/public/cart/clear/');
      if (response.data.success) {
        setCartItems([]);
        setCartSummary({ subtotal: 0, shipping_charge: 0, total: 0, item_count: 0, eligible_for_free_shipping: false });
        setAppliedCoupon(null);
        setCouponDiscount(0);
        sessionStorage.removeItem('applied_coupon');
        addToast('Cart cleared', 'success');
      }
    } catch (err) {
      addToast('Failed to clear cart', 'error');
    }
  };

  const handleQuantityChange = async (id, delta) => {
    const cartItem = cartItems.find(item => item.id === id);
    if (!cartItem) return;
    const newQuantity = cartItem.quantity + delta;
    if (newQuantity < 1) { await removeFromCart(id); return; }
    await updateCartItem(id, newQuantity);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) { addToast("Your cart is empty", "warning"); return; }
    if (appliedCoupon) { navigate("/checkout", { state: { appliedCoupon: appliedCoupon.code, couponDiscount: couponDiscount } }); }
    else { navigate("/checkout"); }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/100x100/f0f4f8/94a3b8?text=No+Image";
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `https://api.initcart.in${imagePath}`;
  };

  const formatCouponDiscount = (coupon) => {
    if (coupon.coupon_type === 'percentage') return `${coupon.discount_display}`;
    else if (coupon.coupon_type === 'flat') return `₹${coupon.discount_display}`;
    return coupon.discount_display;
  };

  useEffect(() => {
    const checkAuthAndFetchCart = async () => {
      const token = localStorage.getItem('customer_token');
      const userStr = localStorage.getItem('customer_user');
      if (!token || !userStr) {
        addToast('Please login to view your cart', 'warning');
        sessionStorage.setItem('redirectAfterLogin', '/cart');
        navigate('/customer/login', { state: { from: '/cart' } });
        return;
      }
      await fetchCart();
    };
    checkAuthAndFetchCart();
  }, [navigate, addToast]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ ...F.cardSub, color: '#64748B' }}>Loading cart...</p>
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
          <h3 style={{ ...F.emptyTitle, marginBottom: 8 }}>Error Loading Cart</h3>
          <p style={{ ...F.emptySubtitle, color: '#64748B', marginBottom: 24 }}>{error}</p>
          <button onClick={fetchCart} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '12px 24px', ...F.cardTitle, cursor: 'pointer' }}>Retry</button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F8FAFC' }}>
        {/* Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <FiArrowLeft size={20} color="#1E293B" />
          </button>
          <h1 style={{ ...F.pageTitle, fontSize: 18, margin: 0 }}>My Cart</h1>
        </div>
        
        {/* Empty Cart */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center' }}>
          <div style={{ width: 100, height: 100, background: '#F1F5F9', borderRadius: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <FiShoppingCart size={48} color="#94A3B8" />
          </div>
          <h3 style={{ ...F.emptyTitle, marginBottom: 8 }}>Your cart is empty</h3>
          <p style={{ ...F.emptySubtitle, color: '#64748B', marginBottom: 32, maxWidth: 280 }}>Looks like you haven't added any products yet.</p>
          <Link to="/productlist" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFFFFF', border: 'none', borderRadius: 16, padding: '14px 28px', ...F.cardTitle, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FiShoppingCart size={16} /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#F8FAFC', paddingBottom: 100 }}>
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <FiArrowLeft size={20} color="#1E293B" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...F.pageTitle, fontSize: 18, margin: 0 }}>My Cart</h1>
          <p style={{ ...F.badge, color: '#64748B', marginTop: 2 }}>{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
        </div>
        <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#EF4444', ...F.pill, cursor: 'pointer' }}>Clear</button>
      </div>

      {/* Coupon Banner */}
      {availableCoupons.length > 0 && !appliedCoupon && (
        <div style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', margin: 12, borderRadius: 16, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#2563EB', padding: 8, borderRadius: 12 }}>
                <FiTag size={14} color="#FFFFFF" />
              </div>
              <div>
                <p style={{ ...F.cardSub, fontWeight: 600, color: '#1E40AF' }}>{availableCoupons.length} Offers Available!</p>
                <p style={{ ...F.badge, color: '#3B82F6' }}>Save extra with coupons</p>
              </div>
            </div>
            <button onClick={() => setShowCouponPanel(!showCouponPanel)} style={{ background: 'none', border: 'none', color: '#2563EB' }}>
              {showCouponPanel ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </button>
          </div>
          
          {showCouponPanel && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #BFDBFE' }}>
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
                  <button key={coupon.id} onClick={() => { setCouponCode(coupon.code); applyCoupon(); }} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '8px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{ ...F.badge, fontWeight: 600, color: '#2563EB' }}>{coupon.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Applied Coupon */}
      {appliedCoupon && (
        <div style={{ background: '#ECFDF5', margin: '0 12px 12px 12px', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCheck size={14} color="#10B981" />
            <span style={{ ...F.badge, fontWeight: 600, color: '#065F46' }}>{appliedCoupon.code}</span>
            <span style={{ ...F.badge, color: '#047857' }}>-₹{Number(couponDiscount).toFixed(2)}</span>
          </div>
          <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><FiX size={16} /></button>
        </div>
      )}

      {/* Cart Items */}
      <div style={{ padding: '0 12px' }}>
        {cartItems.map((item) => (
          <div key={item.id} style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <img src={getImageUrl(item.product_details?.main_image || item.product_details?.thumbnail)} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <p style={{ ...F.cardTitle, marginBottom: 4 }}>{item.product_details?.product_name}</p>
                <p style={{ ...F.badge, color: '#64748B' }}>{item.product_details?.vendor_name}</p>
                
                {item.is_in_campaign && (
                  <span style={{ display: 'inline-block', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFFFFF', fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 8, marginTop: 6 }}>
                    {item.campaign_details?.campaign_type}
                  </span>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <div>
                    {item.is_in_campaign ? (
                      <>
                        <span style={{ ...F.statNum, color: '#2563EB' }}>₹{item.campaign_price}</span>
                        <span style={{ ...F.badge, color: '#94A3B8', textDecoration: 'line-through', marginLeft: 6 }}>₹{item.original_price}</span>
                      </>
                    ) : (
                      <span style={{ ...F.statNum, color: '#1E293B' }}>₹{item.product_details?.unit_price}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
                      <button onClick={() => handleQuantityChange(item.id, -1)} disabled={item.quantity <= 1} style={{ width: 32, height: 32, border: 'none', background: '#F8FAFC', cursor: 'pointer', opacity: item.quantity <= 1 ? 0.5 : 1 }}>
                        <FiMinus size={14} />
                      </button>
                      <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 500 }}>{updatingItemId === item.id ? '...' : item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, 1)} style={{ width: 32, height: 32, border: 'none', background: '#F8FAFC', cursor: 'pointer' }}>
                        <FiPlus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div style={{ marginTop: 8, textAlign: 'right' }}>
                  <span style={{ ...F.cardTitle, color: '#1E293B' }}>Total: ₹{(item.item_total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary - Fixed Bottom Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '12px 16px', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)', zIndex: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ ...F.cardSub, color: '#64748B' }}>Subtotal</span>
          <span style={{ ...F.statNum }}>₹{cartSummary.subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ ...F.cardSub, color: '#64748B' }}>Shipping</span>
          <span style={{ ...F.statNum, color: cartSummary.shipping_charge === 0 ? '#10B981' : '#64748B' }}>{cartSummary.shipping_charge === 0 ? 'FREE' : `₹${cartSummary.shipping_charge.toFixed(2)}`}</span>
        </div>
        {appliedCoupon && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ ...F.cardSub, color: '#10B981' }}>Coupon Discount</span>
            <span style={{ ...F.statNum, color: '#10B981' }}>-₹{Number(couponDiscount).toFixed(2)}</span>
          </div>
        )}
        <div style={{ borderTop: '1px solid #E2E8F0', margin: '8px 0 12px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ ...F.cardTitle }}>Total Amount</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#2563EB' }}>₹{cartSummary.total.toFixed(2)}</span>
        </div>
        
        {cartSummary.subtotal < FREE_DELIVERY_THRESHOLD && (
          <p style={{ ...F.badge, color: '#2563EB', textAlign: 'center', marginBottom: 12 }}>
            Add ₹{(FREE_DELIVERY_THRESHOLD - cartSummary.subtotal).toFixed(2)} more for FREE shipping
          </p>
        )}
        
        <button onClick={handleCheckout} style={{ width: '100%', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '14px', ...F.cardTitle, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <FiShoppingCart size={16} /> Proceed to Checkout
        </button>
      </div>

      {/* Benefits Row */}
      <div style={{ padding: '80px 16px 20px', display: 'flex', gap: 12, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiShield size={14} color="#10B981" />
          <span style={{ ...F.badge, color: '#64748B' }}>Secure</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiTruck size={14} color="#2563EB" />
          <span style={{ ...F.badge, color: '#64748B' }}>Free Shipping*</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiRefreshCcw size={14} color="#F59E0B" />
          <span style={{ ...F.badge, color: '#64748B' }}>7-Day Return</span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MobileCartPage;