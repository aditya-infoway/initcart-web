// ecommerce/frontend/src/pages/mobile/MobileOrderTrackingPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaTruck, 
  FaBox, 
  FaCheckCircle, 
  FaClock, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaArrowLeft,
  FaCalendarAlt, 
  FaIdCard, 
  FaExclamationCircle,
  FaCreditCard,
  FaShoppingBag,
  FaUser
} from "react-icons/fa";
import { MdCancel, MdPayment } from "react-icons/md";
import Swal from "sweetalert2";
import axiosInstance from "../../api/axios";

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

const MobileOrderTrackingPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(null);

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0';
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    return isNaN(num) ? '0' : num.toFixed(0);
  };

  const getPaymentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return '#10B981';
      case 'refunded':
        return '#F59E0B';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const getPaymentStatusBg = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return '#ECFDF5';
      case 'refunded':
        return '#FFFBEB';
      case 'pending':
        return '#FFFBEB';
      case 'failed':
        return '#FEF2F2';
      default:
        return '#F1F5F9';
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return '#10B981';
      case 'shipped':
      case 'out_for_delivery':
        return '#2563EB';
      case 'processing':
      case 'confirmed':
        return '#8B5CF6';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#EF4444';
      case 'refunded':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  const getStatusBg = (status) => {
    switch(status?.toLowerCase()) {
      case 'delivered':
        return '#ECFDF5';
      case 'shipped':
      case 'out_for_delivery':
        return '#EFF6FF';
      case 'processing':
      case 'confirmed':
        return '#F5F3FF';
      case 'pending':
        return '#FFFBEB';
      case 'cancelled':
        return '#FEF2F2';
      case 'refunded':
        return '#FFFBEB';
      default:
        return '#F1F5F9';
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrderTracking();
    }
  }, [orderNumber]);

  const fetchOrderTracking = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/public/orders/detail/?order_number=${orderNumber}`);
      
      if (response.data.success) {
        const orderData = response.data.data;
        setOrder(orderData);
        setTracking(orderData.tracking || null);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to fetch order tracking'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimelineSteps = () => {
    if (!order) return [];
    
    const status = order.order_status;
    const isCancelled = status === 'cancelled' || status === 'refunded';
    
    const steps = [
      { label: 'Order Placed', date: order.created_at, completed: true, icon: <FaBox size={14} /> },
      { label: 'Confirmed', date: !['pending'].includes(status) ? order.updated_at : null, completed: !['pending'].includes(status), icon: <FaCheckCircle size={14} /> },
      { label: 'Processing', date: ['processing', 'shipped', 'delivered'].includes(status) ? order.updated_at : null, completed: ['processing', 'shipped', 'delivered'].includes(status), icon: <FaClock size={14} /> },
      { label: 'Shipped', date: ['shipped', 'delivered'].includes(status) ? order.updated_at : null, completed: ['shipped', 'delivered'].includes(status), icon: <FaTruck size={14} /> },
      { label: 'Delivered', date: status === 'delivered' ? order.updated_at : null, completed: status === 'delivered', icon: <FaCheckCircle size={14} /> }
    ];

    if (isCancelled) {
      return [
        steps[0],
        { label: status === 'cancelled' ? 'Cancelled' : 'Refunded', date: order.updated_at, completed: false, icon: <MdCancel size={14} /> }
      ];
    }
    return steps;
  };

  const isOrderCancelled = order?.order_status === 'cancelled' || order?.order_status === 'refunded';

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ ...F.cardSub, color: '#64748B' }}>Loading tracking details...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F8FAFC', padding: 20 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: '#FEF2F2', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FaBox size={28} color="#EF4444" />
          </div>
          <h3 style={{ ...F.emptyTitle, marginBottom: 8 }}>Order Not Found</h3>
          <p style={{ ...F.emptySubtitle, color: '#64748B', marginBottom: 24 }}>The order you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/orders')} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '12px 24px', ...F.cardTitle, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FaArrowLeft size={14} /> Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps();

  return (
    <div style={{ minHeight: '100dvh', background: '#F8FAFC', paddingBottom: 30 }}>
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/orders')} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <FaArrowLeft size={18} color="#1E293B" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...F.pageTitle, fontSize: 18, margin: 0 }}>Track Order</h1>
          <p style={{ ...F.badge, color: '#64748B', marginTop: 2 }}>#{order.order_number?.slice(-8)}</p>
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '12px' }}>

        {/* Order Info Card */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '16px', marginBottom: 12, border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ ...F.badge, color: '#64748B' }}>Order Placed</p>
              <p style={{ ...F.cardSub, fontWeight: 600, marginTop: 2 }}>{formatDate(order.created_at)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ ...F.badge, color: '#64748B' }}>Total Amount</p>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#2563EB', marginTop: 2 }}>₹{formatCurrency(order.final_amount)}</p>
            </div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: getStatusBg(order.order_status), color: getStatusColor(order.order_status) }}>
              {order.order_status?.replace('_', ' ').toUpperCase()}
            </span>
            <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: getPaymentStatusBg(order.payment_status), color: getPaymentStatusColor(order.payment_status) }}>
              <MdPayment size={10} style={{ display: 'inline', marginRight: 4 }} />
              {order.payment_status}
            </span>
          </div>
        </div>

        {/* Tracking Timeline Card */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ ...F.cardTitle, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaTruck size={14} color="#2563EB" /> Order Timeline
          </h3>
          <div style={{ position: 'relative' }}>
            {timelineSteps.map((step, index) => (
              <div key={index} style={{ display: 'flex', marginBottom: index !== timelineSteps.length - 1 ? 20 : 0 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 18,
                    background: step.completed ? '#ECFDF5' : '#F1F5F9',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.completed ? '#10B981' : '#94A3B8'
                  }}>
                    {step.icon}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div style={{
                      position: 'absolute', top: 36, left: 17,
                      width: 2, height: 30,
                      background: step.completed ? '#10B981' : '#E2E8F0'
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <p style={{ ...F.cardSub, fontWeight: 600, color: step.completed ? '#1E293B' : '#64748B' }}>{step.label}</p>
                  <p style={{ ...F.badge, color: '#94A3B8', marginTop: 2 }}>{step.date ? formatDate(step.date) : 'Pending'}</p>
                </div>
                {step.completed && <FaCheckCircle size={14} color="#10B981" style={{ marginTop: 2 }} />}
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Information Card */}
        {!isOrderCancelled && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ ...F.cardTitle, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaTruck size={14} color="#2563EB" /> Delivery Information
            </h3>
            
            {tracking ? (
              <div>
                <div style={{ background: '#EFF6FF', borderRadius: 12, padding: '12px', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ ...F.badge, color: '#64748B' }}>Current Status</span>
                    <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: getStatusBg(tracking.delivery_status), color: getStatusColor(tracking.delivery_status) }}>
                      {tracking.delivery_status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {tracking.expected_delivery_date && (
                  <div style={{ background: '#F1F5F9', borderRadius: 12, padding: '12px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FaCalendarAlt size={14} color="#2563EB" />
                    <div>
                      <p style={{ ...F.badge, color: '#64748B' }}>Expected Delivery</p>
                      <p style={{ ...F.cardSub, fontWeight: 600 }}>{formatDateOnly(tracking.expected_delivery_date)}</p>
                    </div>
                  </div>
                )}

                {tracking.tracking_id && (
                  <div style={{ background: '#F1F5F9', borderRadius: 12, padding: '12px', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <FaIdCard size={14} color="#2563EB" style={{ marginTop: 2 }} />
                    <div>
                      <p style={{ ...F.badge, color: '#64748B' }}>Tracking ID</p>
                      <p style={{ ...F.cardSub, fontWeight: 600, fontFamily: 'monospace' }}>{tracking.tracking_id}</p>
                      {tracking.courier_name && <p style={{ ...F.badge, color: '#64748B', marginTop: 4 }}>Courier: {tracking.courier_name}</p>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <FaTruck size={40} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
                <p style={{ ...F.cardSub, color: '#64748B' }}>No delivery information available yet</p>
                <p style={{ ...F.badge, color: '#94A3B8', marginTop: 4 }}>Tracking details will appear once the order is shipped</p>
              </div>
            )}
          </div>
        )}

        {/* Cancelled/Refunded Message */}
        {isOrderCancelled && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ background: '#FEF2F2', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
              <MdCancel size={40} color="#EF4444" style={{ margin: '0 auto 12px' }} />
              <p style={{ ...F.cardTitle, color: '#EF4444', marginBottom: 4 }}>Order {order.order_status}</p>
              <p style={{ ...F.badge, color: '#64748B' }}>
                {order.order_status === 'cancelled' ? 'The order was cancelled and will not be delivered.' : 'The order has been refunded.'}
              </p>
              <p style={{ ...F.badge, color: '#94A3B8', marginTop: 8 }}>Status updated on: {formatDate(order.updated_at)}</p>
            </div>
          </div>
        )}

        {/* Shipping Address Card */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ ...F.cardTitle, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaMapMarkerAlt size={14} color="#10B981" /> Shipping Address
          </h3>
          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px' }}>
            <p style={{ ...F.cardSub, fontWeight: 600 }}>{order.shipping_name || order.billing_name}</p>
            <p style={{ ...F.badge, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <FaPhone size={10} color="#94A3B8" /> {order.shipping_phone || order.billing_phone}
            </p>
            <p style={{ ...F.badge, color: '#64748B', marginTop: 6 }}>{order.shipping_address || order.billing_address}</p>
            <p style={{ ...F.badge, color: '#64748B' }}>{order.shipping_city || order.billing_city}, {order.shipping_state || order.billing_state} - {order.shipping_pincode || order.billing_pincode}</p>
          </div>
        </div>

        {/* Order Summary Card */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ ...F.cardTitle, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaCreditCard size={14} color="#8B5CF6" /> Order Summary
          </h3>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...F.badge, color: '#64748B' }}>Total Items</span>
              <span style={{ ...F.statNum }}>{order.items?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...F.badge, color: '#64748B' }}>Payment Method</span>
              <span style={{ ...F.cardSub, fontWeight: 600, textTransform: 'capitalize' }}>{order.payment_method}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #E2E8F0', marginTop: 4 }}>
              <span style={{ ...F.cardTitle }}>Total Amount</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#2563EB' }}>₹{formatCurrency(order.final_amount)}</span>
            </div>
          </div>
        </div>

        {/* Need Help Card */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ ...F.cardTitle, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaPhone size={14} color="#F59E0B" /> Need Help?
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#EFF6FF', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaPhone size={12} color="#2563EB" />
              </div>
              <span style={{ ...F.cardSub, color: '#1E293B' }}>+91 1234567890</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#EFF6FF', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaEnvelope size={12} color="#2563EB" />
              </div>
              <span style={{ ...F.cardSub, color: '#1E293B' }}>support@initcart.in</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button onClick={() => navigate('/orders')} style={{ flex: 1, background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: 14, padding: '12px', ...F.cardTitle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FaShoppingBag size={14} /> My Orders
          </button>
          <button onClick={() => navigate('/')} style={{ flex: 1, background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '12px', ...F.cardTitle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FaBox size={14} /> Shop More
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileOrderTrackingPage;