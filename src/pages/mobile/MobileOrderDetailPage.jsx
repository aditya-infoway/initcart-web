// ecommerce/frontend/src/pages/mobile/MobileOrderDetailsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

// Icons
import {
  FiShoppingBag,
  FiMapPin,
  FiUser,
  FiPhone,
  FiMail,
  FiCalendar,
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDownload,
  FiArrowLeft,
  FiTag,
  FiBox,
  FiAlertCircle,
  FiStar,
  FiGift,
  FiShield,
  FiPackage,
  FiHome
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

const MobileOrderDetailsPage = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, refreshAuth, loading: authLoading } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);

  // Status configuration
  const statusConfig = {
    'pending': { bg: '#FEF3C7', color: '#D97706', icon: <FiClock size={12} />, label: 'Pending' },
    'confirmed': { bg: '#EFF6FF', color: '#2563EB', icon: <FiCheckCircle size={12} />, label: 'Confirmed' },
    'processing': { bg: '#F5F3FF', color: '#8B5CF6', icon: <FiShoppingBag size={12} />, label: 'Processing' },
    'shipped': { bg: '#EFF6FF', color: '#2563EB', icon: <FiTruck size={12} />, label: 'Shipped' },
    'delivered': { bg: '#ECFDF5', color: '#10B981', icon: <FiCheckCircle size={12} />, label: 'Delivered' },
    'cancelled': { bg: '#FEF2F2', color: '#EF4444', icon: <FiXCircle size={12} />, label: 'Cancelled' },
    'refunded': { bg: '#F1F5F9', color: '#64748B', icon: <FiTag size={12} />, label: 'Refunded' }
  };

  const paymentStatusConfig = {
    'pending': '#F59E0B',
    'completed': '#10B981',
    'failed': '#EF4444',
    'refunded': '#64748B'
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

  const fetchOrderDetails = useCallback(async () => {
    if (authLoading) {
      setTimeout(() => fetchOrderDetails(), 500);
      return;
    }

    const authCheck = checkAuth();
    if (authCheck === false) {
      toast.error('Please login to view order details');
      setTimeout(() => navigate('/customer/login'), 1500);
      return;
    }
    if (authCheck === null) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get('/api/public/orders/detail/', {
        params: { order_number: orderNumber }
      });

      if (response.data.success) {
        setOrder(response.data.data);
        setRetryCount(0);
      } else {
        throw new Error(response.data.message || 'Order not found');
      }
    } catch (err) {
      if (err.response?.status === 401 && retryCount < 2) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchOrderDetails(), 1000);
        return;
      }
      setError(err.response?.data?.message || 'Failed to load order details');
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderNumber, authLoading, checkAuth, retryCount, navigate]);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    }
  }, [orderNumber, fetchOrderDetails]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getItemImage = (item) => {
    const imagePath = item.product_details?.variant_image || item.product_details?.main_image;
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `https://api.initcart.in${imagePath}`;
  };

  const generateInvoice = () => {
    if (!order) return;
    setGeneratingPDF(true);
    
    const invoiceWindow = window.open('', '_blank');
    const invoiceHTML = `
      <html>
      <head><title>Invoice - ${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; font-size: 14px; color: #333; }
        h1,h2,h3 { margin: 0; }
        .header { display: flex; justify-content: space-between; margin-bottom: 25px; }
        .company { text-align: right; }
        .address-row { display: flex; justify-content: space-between; gap: 40px; margin-bottom: 25px; }
        .address-box { width: 48%; background: #f9f9f9; padding: 15px; border-radius: 6px; }
        .address-box h3 { margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; }
        .totals { width: 350px; margin-top: 20px; margin-left: auto; }
        .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
        .grand-total { font-weight: bold; border-top: 2px solid #000; padding-top: 8px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
      </style>
      </head>
      <body>
        <div class="header">
          <div><h1>INVOICE</h1><p>Order #: ${order.order_number}</p><p>Date: ${formatDate(order.created_at)}</p></div>
          <div class="company"><h2>InitCart</h2><p>Junagadh, Gujarat</p><p>support@initcart.in</p></div>
        </div>
        <div class="address-row">
          <div class="address-box"><h3>Billing Address</h3><p><strong>${order.billing_name}</strong></p><p>${order.billing_address}</p><p>${order.billing_city}, ${order.billing_state} - ${order.billing_pincode}</p><p>Phone: ${order.billing_phone}</p><p>Email: ${order.billing_email}</p></div>
          <div class="address-box"><h3>Shipping Address</h3><p><strong>${order.shipping_name || order.billing_name}</strong></p><p>${order.shipping_address || order.billing_address}</p><p>${order.shipping_city || order.billing_city}, ${order.shipping_state || order.billing_state} - ${order.shipping_pincode || order.billing_pincode}</p><p>Phone: ${order.shipping_phone || order.billing_phone}</p></div>
        </div>
        <h3>Order Items</h3>
        <table><thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>
        ${order.items?.map(item => `<tr><td>${item.product_name}</td><td>${item.quantity}</td><td>${formatCurrency(item.unit_price)}</td><td>${formatCurrency(item.total_price)}</td></tr>`).join('')}
        </tbody></table>
        <div class="totals">
          <div><span>Subtotal:</span><span>${formatCurrency(order.total_amount)}</span></div>
          <div><span>Shipping:</span><span>${order.shipping_charge == 0 ? 'FREE' : formatCurrency(order.shipping_charge)}</span></div>
          ${order.discount_amount > 0 ? `<div><span>Discount:</span><span>-${formatCurrency(order.discount_amount)}</span></div>` : ''}
          <div class="grand-total"><span>Total:</span><span>${formatCurrency(order.final_amount)}</span></div>
        </div>
        <div class="footer"><p>Thank you for shopping with InitCart!</p></div>
      </body>
      </html>
    `;
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    setTimeout(() => {
      invoiceWindow.print();
      setGeneratingPDF(false);
    }, 500);
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ ...F.cardSub, color: '#64748B' }}>Loading order details...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F8FAFC', padding: 20 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 32, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: '#FEF2F2', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <FiAlertCircle size={28} color="#EF4444" />
          </div>
          <h3 style={{ ...F.emptyTitle, marginBottom: 8 }}>Order Not Found</h3>
          <p style={{ ...F.emptySubtitle, color: '#64748B', marginBottom: 24 }}>{error || "Order doesn't exist"}</p>
          <button onClick={() => navigate('/orders')} style={{ background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '14px 24px', ...F.cardTitle, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FiArrowLeft size={16} /> Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#F8FAFC', paddingBottom: 30 }}>
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate('/orders')} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <FiArrowLeft size={20} color="#1E293B" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...F.pageTitle, fontSize: 18, margin: 0 }}>Order Details</h1>
          <p style={{ ...F.badge, color: '#64748B', marginTop: 2 }}>#{order.order_number?.slice(-8)}</p>
        </div>
        <button onClick={generateInvoice} disabled={generatingPDF} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', opacity: generatingPDF ? 0.5 : 1 }}>
          <FiDownload size={18} color="#64748B" />
        </button>
      </div>

      <div style={{ padding: '12px' }}>

        {/* Order Header Card */}
        <div style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', borderRadius: 20, padding: '16px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <p style={{ ...F.badge, color: 'rgba(255,255,255,0.8)' }}>Order Placed</p>
              <p style={{ ...F.cardTitle, color: '#FFFFFF', marginTop: 2 }}>{formatDate(order.created_at)}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ ...F.badge, color: 'rgba(255,255,255,0.8)' }}>Total Amount</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>{formatCurrency(order.final_amount)}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: statusConfig[order.order_status]?.bg, color: statusConfig[order.order_status]?.color, display: 'flex', alignItems: 'center', gap: 4 }}>
              {statusConfig[order.order_status]?.icon}
              {statusConfig[order.order_status]?.label}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: '#F1F5F9', color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiCreditCard size={10} />
              {order.payment_method === 'razorpay' ? 'Razorpay' : 'COD'}
            </span>
            <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: paymentStatusConfig[order.payment_status] === '#10B981' ? '#ECFDF5' : '#FEF2F2', color: paymentStatusConfig[order.payment_status], display: 'flex', alignItems: 'center', gap: 4 }}>
              Payment: {order.payment_status}
            </span>
          </div>
        </div>

        {/* Order Progress */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '16px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ ...F.cardTitle, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiTruck size={16} color="#2563EB" /> Order Progress
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {[
              { icon: <FiCheckCircle size={12} />, label: "Confirmed", status: true },
              { icon: <FiPackage size={12} />, label: "Processed", status: order.order_status !== 'confirmed' },
              { icon: <FiTruck size={12} />, label: "Shipped", status: order.order_status === 'shipped' || order.order_status === 'delivered' },
              { icon: <FiCheckCircle size={12} />, label: "Delivered", status: order.order_status === 'delivered' }
            ].map((step, idx) => (
              <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: 16, background: step.status ? '#2563EB' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                  <span style={{ color: step.status ? '#FFFFFF' : '#94A3B8' }}>{step.icon}</span>
                </div>
                <p style={{ ...F.badge, color: step.status ? '#2563EB' : '#94A3B8' }}>{step.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Address */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiUser size={16} color="#8B5CF6" />
            <span style={{ ...F.cardTitle }}>Customer Details</span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, background: '#EFF6FF', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUser size={14} color="#2563EB" />
              </div>
              <div>
                <p style={{ ...F.badge, color: '#64748B' }}>Name</p>
                <p style={{ ...F.cardSub, fontWeight: 600 }}>{order.billing_name}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 32, height: 32, background: '#EFF6FF', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiMail size={14} color="#2563EB" />
              </div>
              <div>
                <p style={{ ...F.badge, color: '#64748B' }}>Email</p>
                <p style={{ ...F.cardSub, fontWeight: 600 }}>{order.billing_email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#EFF6FF', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiPhone size={14} color="#2563EB" />
              </div>
              <div>
                <p style={{ ...F.badge, color: '#64748B' }}>Phone</p>
                <p style={{ ...F.cardSub, fontWeight: 600 }}>{order.billing_phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiMapPin size={16} color="#10B981" />
            <span style={{ ...F.cardTitle }}>Shipping Address</span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <p style={{ ...F.cardSub, fontWeight: 600 }}>{order.shipping_name || order.billing_name}</p>
            <p style={{ ...F.badge, color: '#64748B', marginTop: 4 }}>{order.shipping_address || order.billing_address}</p>
            <p style={{ ...F.badge, color: '#64748B' }}>{order.shipping_city || order.billing_city}, {order.shipping_state || order.billing_state}</p>
            <p style={{ ...F.badge, color: '#64748B' }}>Pincode: {order.shipping_pincode || order.billing_pincode}</p>
            <p style={{ ...F.badge, color: '#64748B', marginTop: 4 }}>Phone: {order.shipping_phone || order.billing_phone}</p>
          </div>
        </div>

        {/* Order Items */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiShoppingBag size={16} color="#2563EB" />
            <span style={{ ...F.cardTitle }}>Order Items ({order.items?.length || 0})</span>
          </div>
          <div style={{ padding: '12px' }}>
            {order.items?.map((item, idx) => (
              <div key={item.id} style={{ marginBottom: idx !== order.items.length - 1 ? 12 : 0, paddingBottom: idx !== order.items.length - 1 ? 12 : 0, borderBottom: idx !== order.items.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <img src={getItemImage(item) || "https://placehold.co/60x60/f0f4f8/94a3b8?text=No+Image"} alt="" style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', background: '#F1F5F9' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ ...F.cardSub, fontWeight: 600 }}>{item.product_name}</p>
                    <p style={{ ...F.badge, color: '#64748B' }}>Vendor: {item.vendor_details?.business_name || 'N/A'}</p>
                    {item.color && <p style={{ ...F.badge, color: '#64748B' }}>Color: {item.color}</p>}
                    {item.size && <p style={{ ...F.badge, color: '#64748B' }}>Size: {item.size}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                      <div>
                        <p style={{ ...F.badge, color: '#64748B' }}>Qty: {item.quantity}</p>
                        <p style={{ ...F.statNum, color: '#64748B' }}>Unit: {formatCurrency(item.unit_price)}</p>
                      </div>
                      <p style={{ ...F.statNum, color: '#2563EB' }}>{formatCurrency(item.total_price)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCreditCard size={16} color="#8B5CF6" />
            <span style={{ ...F.cardTitle }}>Payment Summary</span>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...F.badge, color: '#64748B' }}>Subtotal</span>
              <span style={{ ...F.statNum }}>{formatCurrency(order.total_amount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...F.badge, color: '#64748B' }}>Shipping</span>
              <span style={{ ...F.statNum, color: order.shipping_charge == 0 ? '#10B981' : '#64748B' }}>{order.shipping_charge == 0 ? 'FREE' : formatCurrency(order.shipping_charge)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ ...F.badge, color: '#10B981' }}>Discount</span>
                <span style={{ ...F.statNum, color: '#10B981' }}>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div style={{ borderTop: '1px solid #E2E8F0', marginTop: 8, paddingTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ ...F.cardTitle }}>Total Paid</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#2563EB' }}>{formatCurrency(order.final_amount)}</span>
              </div>
            </div>
            {order.loyalty_points_earned > 0 && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ ...F.badge, color: '#10B981' }}>✨ Points Earned</span>
                  <span style={{ ...F.statNum, color: '#10B981' }}>+{order.loyalty_points_earned}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiPackage size={16} color="#F59E0B" />
              <span style={{ ...F.cardTitle }}>Order Notes</span>
            </div>
            <div style={{ padding: '12px 16px' }}>
              <p style={{ ...F.cardSub, color: '#64748B' }}>{order.notes}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <button onClick={() => navigate('/')} style={{ flex: 1, background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: 14, padding: '14px', ...F.cardTitle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FiHome size={16} /> Home
          </button>
          <button onClick={() => navigate('/orders')} style={{ flex: 1, background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '14px', ...F.cardTitle, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FiShoppingBag size={16} /> All Orders
          </button>
        </div>

        {/* Trust Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8, padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiShield size={14} color="#10B981" />
            <span style={{ ...F.badge, color: '#64748B' }}>Secure</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiTruck size={14} color="#2563EB" />
            <span style={{ ...F.badge, color: '#64748B' }}>Free Shipping</span>
          </div>  
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiCheckCircle size={14} color="#8B5CF6" />
            <span style={{ ...F.badge, color: '#64748B' }}>Easy Returns</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileOrderDetailsPage;