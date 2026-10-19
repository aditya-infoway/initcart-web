// ecommerce/frontend/src/pages/mobile/MobileOrdersPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import { toast } from 'react-hot-toast';
import MobileProductReviewWidget from './MobileProductReviewWidget';
import ReturnRequestModal from '../ReturnRequestModal';
import { orderGet } from '../../api/orderApi';

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
  FiCreditCard,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiBox,
  FiTag,
  FiStar
} from 'react-icons/fi';
import { FaUndoAlt } from 'react-icons/fa';

// ─── Font Tokens ─────────────────────────────────────────────────────────────
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle:    { fontSize: 14, fontWeight: 600 },
  cardSub:      { fontSize: 11, fontWeight: 400 },
  badge:        { fontSize: 10, fontWeight: 600 },
  pill:         { fontSize: 11, fontWeight: 600 },
  statNum:      { fontSize: 13, fontWeight: 700 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

const MobileOrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshAuth, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Return & Modal state
  const [returnMap, setReturnMap] = useState({});
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [activeReturnItem, setActiveReturnItem] = useState(null);

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
      const response = await orderGet('/api/public/orders/');
      if (response.data.success) {
        setOrders(response.data.data);
        setRetryCount(0);
      } else {
        throw new Error(response.data.message || 'Failed to fetch orders');
      }
    } catch (err) {
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

  const fetchReturnRequests = useCallback(async () => {
    try {
      const res = await orderGet('/api/ecommerce/public/returns/');
      if (res.data.success) {
        const map = {};
        res.data.data.forEach(rr => {
          if (!map[rr.order_item] || rr.id > map[rr.order_item].id) {
            map[rr.order_item] = rr;
          }
        });
        setReturnMap(map);
      }
    } catch (err) {
      console.error('Error fetching return requests:', err);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
      fetchReturnRequests();
    }
  }, [authLoading, fetchOrders, fetchReturnRequests]);

  const getOrderItemImage = (item) => {
    if (item.product_details?.variant_image) return `http://localhost:8000/${item.product_details.variant_image}`;
    if (item.product_details?.main_image) return `http://localhost:8000/${item.product_details.main_image}`;
    return "https://placehold.co/80x80/f0f4f8/94a3b8?text=No+Image";
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateString; }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);
  };

  const isReturnEligible = (order, item) => {
    if (item.item_status !== 'delivered' || !item.delivered_at) return false;
    const daysSince = (Date.now() - new Date(item.delivered_at).getTime()) / 86400000;
    if (daysSince > 7) return false;
    if (returnMap[item.id]) return false;
    return true;
  };

  const handleReturnClick = (order, item) => {
    setActiveReturnItem({ order, item });
    setReturnModalOpen(true);
  };

  const handleRequestAgain = async (returnId) => {
    try {
      const res = await axiosInstance.post(`/api/ecommerce/public/returns/${returnId}/request-again/`);
      if (res.data.success) {
        toast.success('Sent for review');
        fetchReturnRequests();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend request');
    }
  };

  const getReturnStatusMeta = (status) => {
    switch (status) {
      case 'requested': return { icon: <FiClock size={12} />, bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Requested' };
      case 'approved': return { icon: <FiCheckCircle size={12} />, bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: 'Approved' };
      case 'vendor_rejected': return { icon: <FiXCircle size={12} />, bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: 'Rejected' };
      case 'pickup_scheduled': return { icon: <FiTruck size={12} />, bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD', label: 'Pickup' };
      case 'picked_up': return { icon: <FiBox size={12} />, bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE', label: 'Picked Up' };
      case 'refunded': return { icon: <FiRefreshCw size={12} />, bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: 'Refunded' };
      case 'completed': return { icon: <FiCheckCircle size={12} />, bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', label: 'Completed' };
      default: return { icon: <FiAlertCircle size={12} />, bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', label: (status || '').replace('_', ' ') };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) || order.billing_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleOrderExpand = (orderId) => setExpandedOrder(expandedOrder === orderId ? null : orderId);

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

  // ─── Item Renderer (Forced Review Display) ──────────────────────────────────
  const renderOrderItem = (order, item, index, isFirstItem) => {
    const returnReq = returnMap[item.id];
    const returnMeta = returnReq ? getReturnStatusMeta(returnReq.status) : null;

    const returnedQuantity = Number(item.returned_quantity || 0);
    const originalQuantity = Number(item.quantity || 0);
    const remainingQuantity = Number(item.net_quantity ?? (originalQuantity - returnedQuantity));
    const remainingAmount = Number(item.net_amount ?? item.total_price ?? 0);

    const isFullyReturned = originalQuantity > 0 && returnedQuantity >= originalQuantity;
    const isPartiallyReturned = returnedQuantity > 0 && returnedQuantity < originalQuantity;
    const showRedCard = !!returnReq || isFullyReturned;
    const itemStatusCfg = statusConfig[item.item_status];

    const isDelivered = item.item_status === 'delivered' || order.order_status === 'delivered';
    const showReturnActions = isReturnEligible(order, item) || returnReq?.status === 'vendor_rejected';
    
    // 🔥 Force orderStatus to 'delivered' for the widget if item is delivered.
    const reviewOrderStatus = isDelivered ? 'delivered' : order.order_status;

    return (
      <div
        key={item.id}
        style={{
          marginTop: isFirstItem ? 0 : 12,
          paddingTop: isFirstItem ? 0 : 12,
          borderTop: isFirstItem ? 'none' : '1px solid #E2E8F0',
        }}
      >
        {showRedCard && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
            <FaUndoAlt size={10} color="#DC2626" />
            <span style={{ ...F.badge, color: '#DC2626', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              {isFullyReturned ? 'Refunded' : isPartiallyReturned ? `Partially Returned (${returnedQuantity})` : 'Return / Refund'}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <img
            src={getOrderItemImage(item)}
            alt=""
            style={{
              width: 56, height: 56, borderRadius: 10, objectFit: 'cover',
              background: '#F1F5F9', border: showRedCard ? '2px solid #FCA5A5' : '1px solid #E2E8F0',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ ...F.cardSub, fontWeight: 600, margin: 0 }}>{item.product_name}</p>
                <p style={{ ...F.badge, color: '#64748B', margin: '2px 0 0' }}>{item.vendor_details?.business_name || 'Unknown Vendor'}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ ...F.statNum, color: showRedCard ? '#DC2626' : '#1E293B', margin: 0 }}>{formatCurrency(remainingAmount)}</p>
                <p style={{ ...F.badge, color: '#94A3B8', margin: '2px 0 0' }}>{formatCurrency(item.unit_price)} each</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 6 }}>
              {item.sku && <span style={{ ...F.badge, background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: 4 }}>SKU: {item.sku}</span>}
              {item.color && <span style={{ ...F.badge, background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: 4 }}>{item.color}</span>}
              {item.size && <span style={{ ...F.badge, background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: 4 }}>{item.size}</span>}
              <span style={{ ...F.badge, background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: 4 }}>Qty: {remainingQuantity}</span>
              {itemStatusCfg && (
                <span title={itemStatusCfg.label} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: itemStatusCfg.bg, color: itemStatusCfg.color }}>
                  {itemStatusCfg.icon}
                </span>
              )}
              {returnReq && returnMeta && (
                <span title={returnMeta.title} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '2px 6px', borderRadius: 4, background: returnMeta.bg, color: returnMeta.color, border: `1px solid ${returnMeta.border}`, ...F.badge }}>
                  {returnMeta.icon} <span>{returnMeta.label}</span>
                </span>
              )}
            </div>

            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {showReturnActions && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isReturnEligible(order, item) && (
                    <button
                      onClick={() => handleReturnClick(order, item)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', border: '1px solid #FCA5A5', background: '#FFFFFF', color: '#DC2626', borderRadius: 6, cursor: 'pointer', ...F.badge }}
                    >
                      <FaUndoAlt size={10} /> Return
                    </button>
                  )}
                  {returnReq?.status === 'vendor_rejected' && (
                    <button
                      onClick={() => handleRequestAgain(returnReq.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '5px 12px', background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', borderRadius: 6, cursor: 'pointer', ...F.badge }}
                    >
                      <FiRefreshCw size={10} /> Retry
                    </button>
                  )}
                </div>
              )}

              {/* 🔥 FIXED: Passing both orderId and orderItemId to ensure backend compatibility */}
              {isDelivered && (
                <div style={{ width: '100%', display: 'flex' }}>
                  <MobileProductReviewWidget
                    productId={item.product}
                    productName={item.product_name}
                    orderStatus={reviewOrderStatus} 
                    orderId={order.id} 
                    orderItemId={item.id}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#F8FAFC', paddingBottom: 30 }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <FiArrowLeft size={20} color="#1E293B" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...F.pageTitle, fontSize: 18, margin: 0 }}>My Orders</h1>
          <p style={{ ...F.badge, color: '#64748B', marginTop: 2 }}>{filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}</p>
        </div>
        <button onClick={fetchOrders} disabled={loading} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <FiRefreshCw size={18} color="#64748B" />
        </button>
      </div>

      <div style={{ padding: '12px' }}>
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E2E8F0' }}>
          <FiSearch size={18} color="#94A3B8" />
          <input type="text" placeholder="Search by order number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', padding: '10px 0', fontSize: 14, outline: 'none', background: 'transparent' }} />
          <button onClick={() => setShowFilters(!showFilters)} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
            <FiFilter size={18} color={showFilters ? '#2563EB' : '#94A3B8'} />
          </button>
        </div>

        {showFilters && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '12px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button onClick={() => setStatusFilter('all')} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: statusFilter === 'all' ? '#2563EB' : '#F1F5F9', color: statusFilter === 'all' ? '#FFFFFF' : '#475569', border: 'none', cursor: 'pointer' }}>All</button>
              {Object.entries(statusConfig).map(([key, config]) => (
                <button key={key} onClick={() => setStatusFilter(key)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: statusFilter === key ? config.color : '#F1F5F9', color: statusFilter === key ? '#FFFFFF' : '#475569', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {config.icon} {config.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}><div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} /><p style={{ ...F.cardSub, color: '#64748B' }}>Loading your orders...</p></div>}
        {error && !loading && <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}><div style={{ width: 56, height: 56, background: '#FEF2F2', borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><FiAlertCircle size={24} color="#EF4444" /></div><h3 style={{ ...F.emptyTitle, marginBottom: 8 }}>Error Loading Orders</h3><p style={{ ...F.emptySubtitle, color: '#64748B', marginBottom: 20 }}>{error}</p><button onClick={fetchOrders} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '10px 24px', ...F.cardTitle, cursor: 'pointer' }}>Try Again</button></div>}
        {!loading && !error && filteredOrders.length === 0 && <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}><div style={{ width: 80, height: 80, background: '#F1F5F9', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><FiPackage size={36} color="#94A3B8" /></div><h3 style={{ ...F.emptyTitle, marginBottom: 8 }}>No orders found</h3><p style={{ ...F.emptySubtitle, color: '#64748B', marginBottom: 24 }}>{searchTerm || statusFilter !== 'all' ? 'Try adjusting your search' : "You haven't placed any orders yet"}</p><button onClick={() => navigate('/productlist')} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '12px 24px', ...F.cardTitle, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}><FiHome size={16} /> Start Shopping</button></div>}

        {!loading && !error && filteredOrders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredOrders.map((order) => (
              <div key={order.id} style={{ background: '#FFFFFF', borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <div style={{ padding: '14px 16px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <p style={{ ...F.badge, color: '#64748B' }}>Order #{order.order_number?.slice(-8)}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={10} color="#94A3B8" /><span style={{ ...F.badge, color: '#64748B' }}>{formatDate(order.created_at)}</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiTag size={10} color="#94A3B8" /><span style={{ ...F.statNum, color: '#2563EB' }}>{formatCurrency(order.final_amount)}</span></div>
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: statusConfig[order.order_status]?.bg, color: statusConfig[order.order_status]?.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {statusConfig[order.order_status]?.icon} {statusConfig[order.order_status]?.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid #E2E8F0' }}>
                    <FiTruck size={12} color="#2563EB" />
                    <span style={{ ...F.badge, color: '#475569' }}>Delivery by {formatDate(new Date(new Date(order.created_at).setDate(new Date(order.created_at).getDate() + 7)))}</span>
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }} title={`Payment: ${order.payment_status}`}>
                      <FiCreditCard size={12} color="#94A3B8" /><span style={{ ...F.badge, color: '#64748B' }}>{order.payment_status}</span>
                    </span>
                  </div>
                </div>

                <div style={{ padding: '12px 16px' }}>
                  {order.items && order.items.length > 0 && (
                    <>
                      {renderOrderItem(order, order.items[0], 0, true)}
                      {order.items.length > 1 && (
                        <button onClick={() => toggleOrderExpand(order.id)} style={{ width: '100%', marginTop: 12, padding: '8px', background: '#F1F5F9', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <span style={{ ...F.badge, color: '#64748B' }}>{expandedOrder === order.id ? 'Hide' : `View ${order.items.length - 1} more`}</span>
                          {expandedOrder === order.id ? <FiChevronUp size={14} color="#64748B" /> : <FiChevronDown size={14} color="#64748B" />}
                        </button>
                      )}
                      {expandedOrder === order.id && order.items.slice(1).map((item, idx) => renderOrderItem(order, item, idx + 1, false))}
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <button onClick={() => navigate(`/order/${order.order_number}`)} style={{ flex: 1, padding: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}><FiEye size={14} color="#2563EB" /><span style={{ ...F.badge, color: '#2563EB' }}>Details</span></button>
                  <button onClick={() => navigate(`/trackOrder/${order.order_number}`)} style={{ flex: 1, padding: '10px', background: '#2563EB', border: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}><FiTruck size={14} color="#FFFFFF" /><span style={{ ...F.badge, color: '#FFFFFF' }}>Track</span></button>
                  <button onClick={() => navigate(`/product/${order.items?.[0]?.product}`)} style={{ flex: 1, padding: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}><FiShoppingBag size={14} color="#64748B" /><span style={{ ...F.badge, color: '#64748B' }}>Reorder</span></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {returnModalOpen && activeReturnItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', height: '100dvh', overflowY: 'auto', background: '#FFFFFF', paddingBottom: 100 }}>
            <ReturnRequestModal item={activeReturnItem.item} order={activeReturnItem.order} onClose={() => setReturnModalOpen(false)} onSuccess={() => { setReturnModalOpen(false); fetchReturnRequests(); }} />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default MobileOrdersPage;