// ecommerce/frontend/src/pages/mobile/MobileOrderConfirmationPage.jsx

import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { axiosInstance } from "../../api/axios";
import {
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiCreditCard,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiShoppingBag,
  FiStar,
  FiTag,
  FiGift,
  FiShield,
  FiDownload,
  FiArrowLeft,
  FiHome,
  FiList,
  FiCheck,
  FiAlertCircle,
  FiPrinter
} from "react-icons/fi";

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

// ─── Confetti Canvas Component ─────────────────────────────────────────────
const ConfettiCanvas = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId = null;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Particle colors - vibrant and colorful
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#E74C3C', '#2ECC71', '#3498DB', '#F39C12',
      '#9B59B6', '#1ABC9C', '#E67E22', '#34495E', '#16A085'
    ];

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = Math.random() * -12 - 5;
        this.gravity = 0.3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 15;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.rotation += this.rotationSpeed;
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 1.5);
        ctx.restore();
      }
    }

    const createParticles = () => {
      const particles = [];
      const particleCount = 250;
      
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.6;
        particles.push(new Particle(x, y));
      }
      
      return particles;
    };

    let particles = createParticles();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      let allFinished = true;
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
        
        if (particles[i].y < height + 50) {
          allFinished = false;
        }
      }
      
      if (allFinished && showConfetti) {
        cancelAnimationFrame(animationId);
        setShowConfetti(false);
        return;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Auto hide after 5 seconds
    const timeout = setTimeout(() => {
      setShowConfetti(false);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    }, 5000);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      clearTimeout(timeout);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  if (!showConfetti) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

// ─── Confetti Button Trigger Component ─────────────────────────────────────
const ConfettiButton = ({ children, onClick }) => {
  const canvasRef = useRef(null);
  const [showEffect, setShowEffect] = useState(false);

  const triggerConfetti = () => {
    setShowEffect(true);
    setTimeout(() => setShowEffect(false), 3000);
    if (onClick) onClick();
  };

  useEffect(() => {
    if (!showEffect) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationId = null;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    setCanvasSize();

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#E74C3C', '#2ECC71', '#3498DB', '#F39C12'
    ];

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 10 + 4;
        this.speedX = (Math.random() - 0.5) * 10;
        this.speedY = Math.random() * -15 - 8;
        this.gravity = 0.35;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 20;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.rotation += this.rotationSpeed;
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size / 1.5);
        ctx.restore();
      }
    }

    const particles = [];
    const particleCount = 150;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(centerX, centerY));
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      let active = false;
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].y < height + 50) {
          active = true;
        }
      }
      
      if (active) {
        animationId = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationId);
        setShowEffect(false);
      }
    };

    animate();

    const timeout = setTimeout(() => {
      if (animationId) cancelAnimationFrame(animationId);
      setShowEffect(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [showEffect]);

  return (
    <>
      <div onClick={triggerConfetti} style={{ cursor: 'pointer' }}>
        {children}
      </div>
      {showEffect && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10000,
          }}
        />
      )}
    </>
  );
};

const MobileOrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [showMainConfetti, setShowMainConfetti] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    } else {
      setError('Order number not provided');
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 5) + 3);
    setEstimatedDelivery(deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }));
  }, []);

  // Hide main confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainConfetti(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const fetchOrderDetails = async () => {
    try {
      let response;
      try {
        response = await axiosInstance.get(`/api/public/orders/detail/?order_number=${orderNumber}`);
      } catch (err) {
        response = await axiosInstance.get(`/api/public/orders/?search=${orderNumber}`);
      }

      if (response.data && response.data.success) {
        const orderData = response.data.data;
        setOrder(orderData);
        if (orderData.items && Array.isArray(orderData.items)) {
          setOrderItems(orderData.items);
        } else if (response.data.items) {
          setOrderItems(response.data.items);
        }
      } else {
        setError(response.data?.message || 'Order not found');
      }
    } catch (err) {
      try {
        const altResponse = await axiosInstance.get(`/api/public/orders/?order_number=${orderNumber}`);
        if (altResponse.data && altResponse.data.success) {
          setOrder(altResponse.data.data);
        } else {
          setError('Failed to fetch order details');
        }
      } catch (altErr) {
        setError('Order not found');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orderNumber) {
      const recentOrder = localStorage.getItem('recent_order');
      if (recentOrder) {
        navigate(`/order-confirmation/${recentOrder}`);
      }
    }
  }, [orderNumber, navigate]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://placehold.co/80x80/f0f4f8/94a3b8?text=No+Image";
    if (imagePath.startsWith('http')) return imagePath;
    return `https://api.initcart.in${imagePath}`;
  };

  const getOrderItemImage = (item) => {
    if (item.variant_image) return getImageUrl(item.variant_image);
    if (item.product_details?.main_image) return getImageUrl(item.product_details.main_image);
    return "https://placehold.co/80x80/f0f4f8/94a3b8?text=No+Image";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': case 'processing': return '#3B82F6';
      case 'shipped': return '#8B5CF6';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'confirmed': case 'processing': return '#EFF6FF';
      case 'shipped': return '#F5F3FF';
      case 'delivered': return '#ECFDF5';
      case 'cancelled': return '#FEF2F2';
      default: return '#FFFBEB';
    }
  };

  const downloadInvoice = () => {
    const invoiceWindow = window.open('', '_blank');
    const invoiceHTML = `
      <html>
      <head><title>Invoice - ${order?.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; }
        h1,h2,h3 { margin: 0; }
        .header { display: flex; justify-content: space-between; margin-bottom: 25px; }
        .company-details { text-align: right; }
        .address-row { display: flex; justify-content: space-between; gap: 40px; margin-bottom: 25px; }
        .address-box { width: 48%; background: #f9f9f9; padding: 15px; border-radius: 6px; }
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
          <div><h1>INVOICE</h1><p>Order #: ${order?.order_number}</p><p>Date: ${new Date(order?.created_at).toLocaleDateString()}</p></div>
          <div class="company-details"><h2>InitCart</h2><p>Junagadh, Gujarat</p><p>support@initcart.in</p></div>
        </div>
        <div class="address-row">
          <div class="address-box"><h3>Billing Address</h3><p>${order?.billing_name}</p><p>${order?.billing_address}</p><p>${order?.billing_city}, ${order?.billing_state} - ${order?.billing_pincode}</p><p>Phone: ${order?.billing_phone}</p></div>
          <div class="address-box"><h3>Shipping Address</h3><p>${order?.shipping_name}</p><p>${order?.shipping_address}</p><p>${order?.shipping_city}, ${order?.shipping_state} - ${order?.shipping_pincode}</p><p>Phone: ${order?.shipping_phone}</p></div>
        </div>
        <h3>Order Items</h3>
        <table><thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>
        ${orderItems.map(item => `<tr><td>${item.product_name}</td><td>${item.quantity}</td><td>₹${parseFloat(item.unit_price).toFixed(2)}</td><td>₹${parseFloat(item.total_price).toFixed(2)}</td>`).join('')}
        </tbody></table>
        <div class="totals"><div><span>Subtotal:</span><span>₹${parseFloat(order?.total_amount).toFixed(2)}</span></div>
        <div><span>Shipping:</span><span>${order?.shipping_charge == 0 ? 'FREE' : `₹${parseFloat(order?.shipping_charge).toFixed(2)}`}</span></div>
        ${order?.discount_amount > 0 ? `<div><span>Discount:</span><span>-₹${parseFloat(order?.discount_amount).toFixed(2)}</span></div>` : ''}
        <div class="grand-total"><span>Total:</span><span>₹${parseFloat(order?.final_amount).toFixed(2)}</span></div></div>
        <div class="footer"><p>Thank you for shopping with InitCart!</p></div>
      </body>
      </html>
    `;
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ ...F.cardSub, color: '#64748B' }}>Loading order...</p>
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
          <Link to="/" style={{ display: 'block', background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '14px', ...F.cardTitle, textDecoration: 'none', textAlign: 'center' }}>Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#F8FAFC', paddingBottom: 30, position: 'relative', overflowX: 'hidden' }}>
      
      {/* 🎉 MAIN CONFETTI EFFECT - Shows automatically when page loads */}
      {showMainConfetti && <ConfettiCanvas />}
      
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <FiArrowLeft size={20} color="#1E293B" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...F.pageTitle, fontSize: 18, margin: 0 }}>Order Confirmed</h1>
          <p style={{ ...F.badge, color: '#64748B', marginTop: 2 }}>#{order?.order_number?.slice(-8)}</p>
        </div>
        <ConfettiButton onClick={downloadInvoice}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            <FiDownload size={18} color="#64748B" />
          </div>
        </ConfettiButton>
      </div>

      <div style={{ padding: '12px', animation: 'fadeInUp 0.5s ease' }}>
        
        {/* Success Banner with Bounce Animation */}
        <div style={{ 
          background: 'linear-gradient(135deg, #10B981, #059669)', 
          borderRadius: 20, 
          padding: '20px 16px', 
          marginBottom: 12, 
          textAlign: 'center',
          animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: 28, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 12px',
            animation: 'pulse 0.8s ease-in-out infinite'
          }}>
            <FiCheckCircle size={28} color="#FFFFFF" style={{ animation: 'scaleUp 0.5s ease' }} />
          </div>
          <h2 style={{ ...F.pageTitle, fontSize: 20, color: '#FFFFFF', marginBottom: 4 }}>Thank You!</h2>
          <p style={{ ...F.cardSub, color: 'rgba(255,255,255,0.9)' }}>Your order has been confirmed</p>
        </div>

        {/* Order Stats Row - Staggered Animation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: '12px', textAlign: 'center', border: '1px solid #E2E8F0', animation: 'slideUp 0.4s ease 0.1s both' }}>
            <p style={{ ...F.badge, color: '#64748B' }}>Total Amount</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#2563EB' }}>₹{parseFloat(order?.final_amount).toFixed(2)}</p>
          </div>
          <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: '12px', textAlign: 'center', border: '1px solid #E2E8F0', animation: 'slideUp 0.4s ease 0.2s both' }}>
            <p style={{ ...F.badge, color: '#64748B' }}>Order Status</p>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: getStatusBgColor(order?.order_status), color: getStatusColor(order?.order_status) }}>
              {order?.order_status?.toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1, background: '#FFFFFF', borderRadius: 16, padding: '12px', textAlign: 'center', border: '1px solid #E2E8F0', animation: 'slideUp 0.4s ease 0.3s both' }}>
            <p style={{ ...F.badge, color: '#64748B' }}>Payment</p>
            <p style={{ ...F.cardSub, fontWeight: 600 }}>{order?.payment_method?.toUpperCase()}</p>
          </div>
        </div>

        {/* Rest of your content with slide-up animations */}
        <div style={{ animation: 'slideUp 0.4s ease 0.4s both' }}>
          {/* Order Progress Tracker */}
          <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, padding: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ ...F.cardTitle, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiTruck size={16} color="#2563EB" /> Order Status
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {[
                { icon: <FiCheck size={12} />, label: "Confirmed", status: true },
                { icon: <FiPackage size={12} />, label: "Processed", status: order?.order_status !== 'confirmed' },
                { icon: <FiTruck size={12} />, label: "Shipped", status: order?.order_status === 'shipped' || order?.order_status === 'delivered' },
                { icon: <FiCheckCircle size={12} />, label: "Delivered", status: order?.order_status === 'delivered' }
              ].map((step, idx) => (
                <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: step.status ? '#2563EB' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    <span style={{ color: step.status ? '#FFFFFF' : '#94A3B8' }}>{step.icon}</span>
                  </div>
                  <p style={{ ...F.badge, color: step.status ? '#2563EB' : '#94A3B8' }}>{step.label}</p>
                </div>
              ))}
            </div>
            <p style={{ ...F.badge, color: '#64748B', textAlign: 'center', marginTop: 12 }}>
              Estimated delivery: {estimatedDelivery}
            </p>
          </div>
        </div>

        {/* Order Items - Rest of the content remains same */}
        <div style={{ animation: 'slideUp 0.4s ease 0.5s both' }}>
          <div style={{ background: '#FFFFFF', borderRadius: 16, marginBottom: 12, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiShoppingBag size={16} color="#2563EB" />
              <span style={{ ...F.cardTitle }}>Order Items ({orderItems.length})</span>
            </div>
            <div style={{ padding: '12px' }}>
              {orderItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: idx !== orderItems.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                  <img src={getOrderItemImage(item)} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ ...F.cardSub, fontWeight: 600 }}>{item.product_name}</p>
                    {item.color && <p style={{ ...F.badge, color: '#64748B' }}>Color: {item.color}</p>}
                    {item.size && <p style={{ ...F.badge, color: '#64748B' }}>Size: {item.size}</p>}
                    <p style={{ ...F.badge, color: '#64748B' }}>Qty: {item.quantity} × ₹{parseFloat(item.unit_price).toFixed(2)}</p>
                  </div>
                  <p style={{ ...F.statNum, color: '#1E293B' }}>₹{parseFloat(item.total_price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings Section */}
        {(order?.discount_amount > 0 || order?.loyalty_points_used > 0) && (
          <div style={{ animation: 'slideUp 0.4s ease 0.6s both' }}>
            <div style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', borderRadius: 16, marginBottom: 12, padding: '14px 16px', border: '1px solid #A7F3D0' }}>
              <h3 style={{ ...F.cardTitle, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiGift size={16} color="#10B981" /> You Saved!
              </h3>
              {order?.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ ...F.badge, color: '#047857' }}>Coupon Discount</span>
                  <span style={{ ...F.statNum, color: '#059669' }}>-₹{parseFloat(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              {order?.loyalty_points_used > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ ...F.badge, color: '#047857' }}>Loyalty Points Used</span>
                  <span style={{ ...F.statNum, color: '#059669' }}>-{order.loyalty_points_used} points</span>
                </div>
              )}
              {order?.loyalty_points_earned > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1px solid #A7F3D0' }}>
                  <span style={{ ...F.badge, color: '#1D4ED8' }}>Points Earned</span>
                  <span style={{ ...F.statNum, color: '#2563EB' }}>+{order.loyalty_points_earned} pts</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Address Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
          <div style={{ animation: 'slideUp 0.4s ease 0.7s both' }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '14px 16px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FiMapPin size={16} color="#8B5CF6" />
                <span style={{ ...F.cardTitle }}>Shipping Address</span>
              </div>
              <p style={{ ...F.cardSub, fontWeight: 600 }}>{order?.shipping_name}</p>
              <p style={{ ...F.badge, color: '#64748B' }}>{order?.shipping_address}</p>
              <p style={{ ...F.badge, color: '#64748B' }}>{order?.shipping_city}, {order?.shipping_state} - {order?.shipping_pincode}</p>
              <p style={{ ...F.badge, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}><FiPhone size={12} /> {order?.shipping_phone}</p>
            </div>
          </div>

          <div style={{ animation: 'slideUp 0.4s ease 0.8s both' }}>
            <div style={{ background: '#FFFFFF', borderRadius: 16, padding: '14px 16px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <FiCreditCard size={16} color="#8B5CF6" />
                <span style={{ ...F.cardTitle }}>Billing Address</span>
              </div>
              <p style={{ ...F.cardSub, fontWeight: 600 }}>{order?.billing_name}</p>
              <p style={{ ...F.badge, color: '#64748B' }}>{order?.billing_address}</p>
              <p style={{ ...F.badge, color: '#64748B' }}>{order?.billing_city}, {order?.billing_state} - {order?.billing_pincode}</p>
              <p style={{ ...F.badge, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}><FiPhone size={12} /> {order?.billing_phone}</p>
              <p style={{ ...F.badge, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}><FiMail size={12} /> {order?.billing_email}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, animation: 'slideUp 0.4s ease 0.9s both' }}>
          <Link to="/" style={{ flex: 1, background: '#2563EB', color: '#FFFFFF', border: 'none', borderRadius: 14, padding: '14px', ...F.cardTitle, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FiHome size={16} /> Home
          </Link>
          <Link to="/orders" style={{ flex: 1, background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: 14, padding: '14px', ...F.cardTitle, textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FiList size={16} /> Orders
          </Link>
        </div>

        {/* Trust Badges */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16, padding: '12px', animation: 'fadeIn 0.5s ease 1s both' }}>
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

      {/* Animation Keyframes */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes scaleUp {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        
        .fade-in-up {
          animation: fadeInUp 0.5s ease;
        }
        
        .bounce-in {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .slide-up {
          animation: slideUp 0.4s ease both;
        }
      `}</style>
    </div>
  );
};

export default MobileOrderConfirmationPage;