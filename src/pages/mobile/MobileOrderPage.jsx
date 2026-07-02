// ecommerce/frontend/src/pages/mobile/MobileOrdersPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import { toast } from 'react-hot-toast';
import MobileProductReviewWidget from './MobileProductReviewWidget';

// Icons
import {
  FiShoppingBag,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiCalendar,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFilter,
  FiHome,
  FiPackage,
  FiAlertCircle,
  FiStar,
  FiMapPin,
  FiCreditCard,
  FiArrowLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiBox,
  FiDownload,
  FiUser,
  FiTag
} from 'react-icons/fi';

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

const MobileOrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshAuth, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Status configuration
  const statusConfig = {
    'pending': { bg: '#FEF3C7', color: '#D97706', icon: <FiClock size={12} />, label: 'Pending' },
    'confirmed': { bg: '#EFF6FF', color: '#2563EB', icon: <FiCheckCircle size={12} />, label: 'Confirmed' },
    'processing': { bg: '#F5F3FF', color: '#8B5CF6', icon: <FiRefreshCw size={12} />, label: 'Processing' },
    'shipped': { bg: '#EFF6FF', color: '#2563EB', icon: <FiTruck size={12} />, label: 'Shipped' },
    'delivered': { bg: '#ECFDF5', color: '#10B981', icon: <FiCheckCircle size={12} />, label: 'Delivered' },
    'cancelled': { bg: '#FEF2F2', color: '#EF4444', icon: <FiXCircle size={12} />, label: 'Cancelled' },
    'refunded': { bg: '#F1F5F9', color: '#64748B', icon: <FiPackage size={12} />, label: 'Refunded' }
  };

  const checkAuth = useCallback(() => {
    if (authLoading) return null;
    const authenticated = isAuthenticated();
    if (!authenticated) {
      const refreshed = refreshAuth();
      if (refreshed) return true;
      return false;
    }
    return true;
  }, [authLoading, isAuthenticated, refreshAuth]);

  const fetchOrders = useCallback(async () => {
    if (authLoading) {
      setTimeout(() => fetchOrders(), 500);
      return;
    }

    const authCheck = checkAuth();
    if (authCheck === false) {
      toast.error('Please login to view orders');
      setTimeout(() => navigate('/customer/login'), 1500);
      return;
    }
    if (authCheck === null) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get('/api/public/orders/');
      if (response.data.success) {
        setOrders(response.data.data);
        setRetryCount(0);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.status === 401 && retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchOrders(), 1000);
        return;
      }
      setError(err.response?.data?.message || 'Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [authLoading, checkAuth, navigate, retryCount]);

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading]);

  const getOrderItemImage = (item) => {
    if (item.product_details?.variant_image) return `https://api.initcart.in${item.product_details.variant_image}`;
    if (item.product_details?.main_image) return `https://api.initcart.in${item.product_details.main_image}`;
    return "https://placehold.co/80x80/f0f4f8/94a3b8?text=No+Image";
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.billing_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ ...F.cardSub, color: '#64748B' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#F8FAFC', paddingBottom: 30 }}>
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <FiArrowLeft size={20} color="#1E293B" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...F.pageTitle, fontSize: 18, margin: 0 }}>My Orders</h1>
          <p style={{ ...F.badge, color: '#64748B', marginTop: 2 }}>{filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}</p>
        </div>
        <button onClick={fetchOrders} disabled={loading} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <FiRefreshCw size={18} color="#64748B" className={loading ? 'spin' : ''} />
        </button>
      </div>

      <div style={{ padding: '12px' }}>

        {/* Search Bar */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E2E8F0' }}>
          <FiSearch size={18} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, border: 'none', padding: '10px 0', fontSize: 14, outline: 'none', background: 'transparent' }}
          />
          <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
            <FiFilter size={18} color={showFilters ? '#2563EB' : '#94A3B8'} />
          </button>
        </div>

        {/* Filter Chips */}
        {showFilters && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                onClick={() => setStatusFilter('all')}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                  background: statusFilter === 'all' ? '#2563EB' : '#F1F5F9',
                  color: statusFilter === 'all' ? '#FFFFFF' : '#475569',
                  border: 'none', cursor: 'pointer'
                }}
              >All</button>
              {Object.entries(statusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: statusFilter === key ? config.color : '#F1F5F9',
                    color: statusFilter === key ? '#FFFFFF' : '#475569',
                    border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                  }}
                >
                  {config.icon} {config.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ ...F.cardSub, color: '#64748B' }}>Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, background: '#FEF2F2', borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FiAlertCircle size={24} color="#EF4444" />
            </div>
            <h3 style={{ ...F.emptyTitle, marginBottom: 8 }}>Error Loading Orders</h3>
            <p style={{ ...F.emptySubtitle, color: '#64748B', marginBottom: 20 }}>{error}</p>
            <button onClick={fetchOrders} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '10px 24px', ...F.cardTitle, cursor: 'pointer' }}>Try Again</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: '#F1F5F9', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <FiPackage size={36} color="#94A3B8" />
            </div>
            <h3 style={{ ...F.emptyTitle, marginBottom: 8 }}>No orders found</h3>
            <p style={{ ...F.emptySubtitle, color: '#64748B', marginBottom: 24 }}>
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search' : "You haven't placed any orders yet"}
            </p>
            <button onClick={() => navigate('/productlist')} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '12px 24px', ...F.cardTitle, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FiHome size={16} /> Start Shopping
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredOrders.map((order) => (
              <div key={order.id} style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                
                {/* Order Header */}
                <div style={{ padding: '14px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <p style={{ ...F.badge, color: '#64748B' }}>Order #{order.order_number?.slice(-8)}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiCalendar size={10} color="#94A3B8" />
                          <span style={{ ...F.badge, color: '#64748B' }}>{formatDate(order.created_at)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FiTag size={10} color="#94A3B8" />
                          <span style={{ ...F.statNum, color: '#2563EB' }}>{formatCurrency(order.final_amount)}</span>
                        </div>
                      </div>
                    </div>
                    <span style={{
                      padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                      background: statusConfig[order.order_status]?.bg,
                      color: statusConfig[order.order_status]?.color,
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      {statusConfig[order.order_status]?.icon}
                      {statusConfig[order.order_status]?.label}
                    </span>
                  </div>
                  
                  {/* Delivery Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid #E2E8F0' }}>
                    <FiTruck size={12} color="#2563EB" />
                    <span style={{ ...F.badge, color: '#475569' }}>
                      Delivery by {formatDate(new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 7)))}
                    </span>
                  </div>
                </div>

        {/* Order Items with Review Widget */}
        <div style={{ padding: '12px 16px' }}>
          {order.items && order.items.length > 0 && (
            <>
              {/* First Item */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <img 
                  src={getOrderItemImage(order.items[0])} 
                  alt="" 
                  style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', background: '#F1F5F9' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ ...F.cardSub, fontWeight: 600 }}>{order.items[0].product_name}</p>
                  <p style={{ ...F.badge, color: '#64748B' }}>Qty: {order.items[0].quantity}</p>
                  <p style={{ ...F.statNum, color: '#1E293B' }}>{formatCurrency(order.items[0].total_price)}</p>
                  
                  {/* ✅ Review Widget */}
                  <div style={{ marginTop: 6 }}>
                    <MobileProductReviewWidget
                      productId={order.items[0].product}
                      productName={order.items[0].product_name}
                      orderStatus={order.order_status}
                      orderItemId={order.items[0].id}
                    />
                  </div>
                </div>
              </div>
              
              {/* More Items Button */}
              {order.items.length > 1 && (
                <button 
                  onClick={() => toggleOrderExpand(order.id)}
                  style={{ width: '100%', marginTop: 12, padding: '8px', background: '#F1F5F9', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                >
                  <span style={{ ...F.badge, color: '#64748B' }}>
                    {expandedOrder === order.id ? 'Hide' : `View ${order.items.length - 1} more`}
                  </span>
                  {expandedOrder === order.id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                </button>
              )}
              
              {/* Expanded Items */}
              {expandedOrder === order.id && order.items.slice(1).map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid #E2E8F0', alignItems: 'flex-start' }}>
                  <img src={getOrderItemImage(item)} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', background: '#F1F5F9' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ ...F.cardSub, fontWeight: 600 }}>{item.product_name}</p>
                    <p style={{ ...F.badge, color: '#64748B' }}>Qty: {item.quantity}</p>
                    <p style={{ ...F.statNum, color: '#1E293B' }}>{formatCurrency(item.total_price)}</p>
                    
                    {/* ✅ Review Widget for expanded items */}
                    <div style={{ marginTop: 6 }}>
                      <MobileProductReviewWidget
                        productId={item.product}
                        productName={item.product_name}
                        orderStatus={order.order_status}
                        orderItemId={item.id}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

                {/* Order Actions */}
                <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <button 
                    onClick={() => navigate(`/order/${order.order_number}`)}
                    style={{ flex: 1, padding: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
                  >
                    <FiEye size={14} color="#2563EB" />
                    <span style={{ ...F.badge, color: '#2563EB' }}>Details</span>
                  </button>
                  <button 
                    onClick={() => navigate(`/trackOrder/${order.order_number}`)}
                    style={{ flex: 1, padding: '10px', background: '#2563EB', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
                  >
                    <FiTruck size={14} color="#FFFFFF" />
                    <span style={{ ...F.badge, color: '#FFFFFF' }}>Track</span>
                  </button>
                  <button 
                    onClick={() => navigate(`/product/${order.items?.[0]?.product}`)}
                    style={{ flex: 1, padding: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}
                  >
                    <FiShoppingBag size={14} color="#64748B" />
                    <span style={{ ...F.badge, color: '#64748B' }}>Reorder</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileOrdersPage;