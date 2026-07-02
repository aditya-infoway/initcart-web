import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { publicAxios, axiosInstance } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Tag, Zap, ChevronRight, ShoppingCart } from 'lucide-react';
import RelatedProductSlider from '../RelatedProducts';
import { FaShoppingCart, FaStar, FaShieldAlt, FaBox, FaCoins, FaClock, FaChevronLeft, FaCheckCircle, FaTruck } from 'react-icons/fa';
import { GiReturnArrow } from 'react-icons/gi';
import { FiChevronLeft, FiLock } from 'react-icons/fi';
import ServiceReviewSection from '../../Services/ServiceReviewSection';

/* ─── Font Tokens ────────────────────────────────────────────────────────── */
const F = {
  pageTitle: { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle: { fontSize: 14, fontWeight: 600 },
  cardSub: { fontSize: 11, fontWeight: 400 },
  badge: { fontSize: 10, fontWeight: 600 },
  pill: { fontSize: 11, fontWeight: 600 },
  statNum: { fontSize: 13, fontWeight: 700 },
  statLabel: { fontSize: 9, fontWeight: 400, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionLetter: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 },
  emptyTitle: { fontSize: 15, fontWeight: 700 },
  emptySubtitle: { fontSize: 12, fontWeight: 400 },
};

/* ─── Colors ─────────────────────────────────────────────────────────────── */
const C = {
  primary: '#2563EB',
  primaryBg: '#EFF6FF',
  accent: '#E53E3E',
  success: '#16A34A',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F9FC',
  border: '#EEEFF2',
  text: '#1A1D23',
  textMid: '#64748B',
  textLight: '#A0AABC',
  orange: '#F97316',
};

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.04); }
  }
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes countPulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.7; }
  }

  .mpd-skel {
    background: linear-gradient(90deg, #E8ECF0 25%, #F4F6FA 50%, #E8ECF0 75%);
    background-size: 800px 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
  .mpd-fade-up { animation: fadeUp 0.3s ease both; }
  .mpd-img-thumb {
    transition: transform 0.15s, border-color 0.15s;
    cursor: pointer;
  }
  .mpd-img-thumb:active { transform: scale(0.94); }
  .mpd-tab-btn { transition: all 0.18s; }
  .mpd-tab-btn:active { transform: scale(0.97); }
  .mpd-btn-primary {
    transition: transform 0.12s, box-shadow 0.15s;
  }
  .mpd-btn-primary:active { transform: scale(0.97); }
  .mpd-card { animation: fadeUp 0.3s ease both; }
  .mpd-sec-pulse { animation: countPulse 1s infinite; }
  .mpd-dot-active {
    transition: all 0.2s;
  }
  .mpd-swipe-img {
    transition: opacity 0.25s ease;
  }
  .mpd-bottom-bar {
    animation: slideIn 0.3s ease both;
  }
  .mpd-color-dot {
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .mpd-color-dot:active { transform: scale(0.9); }
  div::-webkit-scrollbar { display: none; }
`;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (p) => p ? `₹${parseFloat(p).toLocaleString('en-IN')}` : '₹0';

const getProductImage = (pd) => {
  if (!pd) return null;
  if (pd.main_image_url) return pd.main_image_url;
  if (pd.thumbnail_image_url) return pd.thumbnail_image_url;
  if (pd.main_image) return pd.main_image.startsWith('http') ? pd.main_image : `https://api.initcart.in${pd.main_image}`;
  if (pd.thumbnail_image) return pd.thumbnail_image.startsWith('http') ? pd.thumbnail_image : `https://api.initcart.in${pd.thumbnail_image}`;
  return null;
};

const getVariantImage = (stock) => {
  if (!stock) return null;
  if (stock.variant_image_url) return stock.variant_image_url;
  if (stock.variant_image) return stock.variant_image.startsWith('http') ? stock.variant_image : `https://api.initcart.in${stock.variant_image}`;
  return null;
};

const getGalleryImages = (pd) => {
  if (!pd?.gallery || !Array.isArray(pd.gallery)) return [];
  return pd.gallery.map(item => {
    if (typeof item === 'string') return item.startsWith('http') ? item : `https://api.initcart.in${item}`;
    if (item.image_url) return item.image_url;
    if (item.image) return item.image.startsWith('http') ? item.image : `https://api.initcart.in${item.image.startsWith('/') ? item.image : '/' + item.image}`;
    return null;
  }).filter(Boolean);
};

const getAllImages = (pd) => {
  if (!pd) return [];
  const seen = new Set();
  const imgs = [];
  const add = (url, type, label, extra = {}) => {
    if (url && !seen.has(url)) { seen.add(url); imgs.push({ url, type, label, ...extra }); }
  };
  add(getProductImage(pd), 'main', 'Main');
  (pd.stocks || []).forEach((s, i) => add(getVariantImage(s), 'variant', `${s.color || ''} ${s.size || ''}`.trim() || `Var ${i + 1}`, { stockId: s.id, color: s.color, size: s.size }));
  getGalleryImages(pd).forEach((u, i) => add(u, 'gallery', `Gallery ${i + 1}`));
  return imgs;
};

const getColorHex = (name) => {
  const map = { black: '#000', white: '#fff', red: '#dc2626', blue: '#2563eb', green: '#16a34a', yellow: '#ca8a04', pink: '#db2777', purple: '#9333ea', gray: '#6b7280', brown: '#78350f', orange: '#ea580c', navy: '#1e3a8a', teal: '#0d9488' };
  return map[name?.toLowerCase()] || '#94a3b8';
};

const extractVariants = (pd) => {
  if (!pd?.stocks?.length) return { colors: [{ id: 'default', name: 'Default', hex: '#94a3b8' }], sizes: ['One Size'] };
  const cmap = new Map(), smap = new Map();
  pd.stocks.forEach(s => {
    if (s.color?.trim()) {
      const id = s.color.toLowerCase().replace(/\s+/g, '_');
      if (!cmap.has(id)) cmap.set(id, { id, name: s.color, hex: getColorHex(s.color), stock: s });
    }
    if (s.size?.trim()) smap.set(s.size.toUpperCase(), s.size);
  });
  const colors = cmap.size ? Array.from(cmap.values()) : [{ id: 'default', name: 'Default', hex: '#94a3b8' }];
  const sizes = smap.size ? Array.from(smap.keys()) : ['One Size'];
  return { colors, sizes };
};

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
const Skel = ({ h = 14, w = '100%', r = 8, mb = 0 }) => (
  <div className="mpd-skel" style={{ height: h, width: w, borderRadius: r, marginBottom: mb }} />
);

/* ─── Coupon Modal ───────────────────────────────────────────────────────── */
const CouponsModal = ({ product, coupons, onClose, onApplyCoupon }) => {
  if (!product || !coupons) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: C.surface, borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '20px 16px 32px', animation: 'fadeUp 0.25s ease' }}>
        <div style={{ width: 36, height: 4, background: C.border, borderRadius: 2, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ ...F.pageTitle, color: C.text }}>Available Offers</div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 16, border: `1px solid ${C.border}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
        </div>
        {coupons.length === 0
          ? <div style={{ textAlign: 'center', padding: '32px 0', ...F.emptySubtitle, color: C.textMid }}>No offers right now</div>
          : coupons.map(c => (
            <div key={c.id} style={{ border: `1px dashed ${C.primary}`, borderRadius: 12, padding: 14, marginBottom: 12, background: C.primaryBg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ ...F.statNum, color: C.text, letterSpacing: 1 }}>{c.code}</div>
                <button onClick={() => { onApplyCoupon(c.code); onClose(); }} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', ...F.pill, cursor: 'pointer' }}>Apply</button>
              </div>
              <div style={{ ...F.cardSub, color: C.primary, fontWeight: 600 }}>{c.discount_display} OFF</div>
              <div style={{ ...F.cardSub, color: C.textMid, marginTop: 4 }}>{c.title}</div>
              {c.validity_display && <div style={{ ...F.badge, color: C.textLight, marginTop: 4 }}>Valid: {c.validity_display}</div>}
            </div>
          ))
        }
      </div>
    </div>
  );
};

/* ─── Login Modal ────────────────────────────────────────────────────────── */
const LoginModal = ({ isOpen, onClose, onLogin, onRegister }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: C.surface, borderRadius: '20px 20px 0 0', width: '100%', padding: '24px 16px 40px', animation: 'fadeUp 0.25s ease' }}>
        <div style={{ width: 36, height: 4, background: C.border, borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
            <FiLock size={40} color={C.primary} />
          </div>
          <div style={{ ...F.pageTitle, color: C.text, marginBottom: 6 }}>Login Required</div>
          <div style={{ ...F.pageSubtitle, color: C.textMid }}>Login to add items to cart</div>
        </div>
        <button onClick={onLogin} style={{ width: '100%', padding: '14px', background: C.primary, color: '#fff', border: 'none', borderRadius: 12, ...F.cardTitle, cursor: 'pointer', marginBottom: 10 }}>Login Now</button>
        <button onClick={onRegister} style={{ width: '100%', padding: '14px', background: 'transparent', color: C.primary, border: `1.5px solid ${C.primary}`, borderRadius: 12, ...F.cardTitle, cursor: 'pointer', marginBottom: 10 }}>Create Account</button>
        <button onClick={onClose} style={{ width: '100%', padding: '10px', background: 'transparent', color: C.textMid, border: 'none', ...F.cardSub, cursor: 'pointer' }}>Continue Browsing</button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function MobileProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [productCoupons, setProductCoupons] = useState([]);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [selectedColor, setSelectedColor] = useState('default');
  const [selectedSize, setSelectedSize] = useState('One Size');
  const [activeImage, setActiveImage] = useState(0);
  const [reviewStats, setReviewStats] = useState({ avg: 0, count: 0 });
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('description');
  const [descExpanded, setDescExpanded] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const imgScrollRef = useRef(null);

  /* inject css */
  useEffect(() => {
    const id2 = 'mpd-styles';
    if (!document.getElementById(id2)) {
      const s = document.createElement('style');
      s.id = id2; s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
  }, []);

  // MobileProductDetail.js - Add this useEffect after other useEffects

  useEffect(() => {
    // Add class to body to hide bottom navigation via CSS
    document.body.classList.add('mpd-page');

    // Also add inline style as backup
    const style = document.createElement('style');
    style.id = 'mpd-inline-hide';
    style.textContent = `
    .fixed.bottom-0.left-0.right-0.z-\\[100\\],
    .md\\:hidden.fixed.bottom-0 {
      display: none !important;
    }
  `;
    document.head.appendChild(style);

    return () => {
      document.body.classList.remove('mpd-page');
      const styleEl = document.getElementById('mpd-inline-hide');
      if (styleEl) styleEl.remove();
    };
  }, []);

  /* fetch product */
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await publicAxios.get(`ecommerce/public/products/${id}/`);
        if (!mounted) return;
        setProduct(res.data);
        if (res.data?.vendor_details?.id) {
          publicAxios.get('ecommerce/public/products/').then(r => {
            if (!mounted) return;
            setVendorProducts((r.data || []).filter(p => p.vendor_details?.id === res.data.vendor_details.id && p.id !== parseInt(id)).slice(0, 4));
          }).catch(() => { });
        }
        publicAxios.get(`ecommerce/public/coupons/product/${res.data.id}/`).then(r => {
          if (r.data?.success) setProductCoupons(r.data.coupons || []);
        }).catch(() => { });
      } catch {
        if (mounted) setError('Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    if (!product?.id) return;
    publicAxios.get("/api/all-review/", {
      params: { model: "product", object_id: product.id }
    })
      .then(res => {
        setReviewStats({
          avg: res.data.average_rating || 0,
          count: res.data.reviews?.length || 0
        });
      })
      .catch(() => { });
  }, [product?.id]);

  /* init variants */
  useEffect(() => {
    if (product) {
      const v = extractVariants(product);
      setSelectedColor(v.colors[0]?.id || 'default');
      setSelectedSize(v.sizes[0] || 'One Size');
    }
  }, [product]);

  /* countdown */
  useEffect(() => {
    if (!product?.is_in_campaign || !product?.campaign_details?.end_datetime) return;
    const t = setInterval(() => {
      const dist = new Date(product.campaign_details.end_datetime) - Date.now();
      if (dist <= 0) { setCountdown(null); clearInterval(t); return; }
      setCountdown({
        h: Math.floor((dist % 86400000) / 3600000),
        m: Math.floor((dist % 3600000) / 60000),
        s: Math.floor((dist % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(t);
  }, [product]);

  /* derived */
  const allImages = product ? getAllImages(product) : [];
  const imgUrls = allImages.map(i => i.url);
  const variants = product ? extractVariants(product) : { colors: [], sizes: [] };

  const getCurrentStock = () => {
    if (!product?.stocks?.length) return null;
    if (selectedStockId) {
      const s = product.stocks.find(s => s.id === selectedStockId);
      if (s) return s;
    }
    if (product.stocks.length === 1) return product.stocks[0];
    return product.stocks.find(s => {
      const sc = s.color?.toLowerCase().replace(/\s+/g, '_') || 'default';
      const ss = s.size?.toUpperCase() || 'One Size';
      return sc === selectedColor && ss === selectedSize && s.stock_quantity > 0;
    }) || product.stocks.find(s => s.stock_quantity > 0) || product.stocks[0];
  };

  const cs = getCurrentStock();
  const isCampaign = product?.is_in_campaign;
  const actualPrice = isCampaign && product?.campaign_price
    ? parseFloat(product.campaign_price)
    : parseFloat(cs?.final_price || cs?.selling_price || 0);
  const oldPrice = isCampaign && product?.campaign_details?.original_price
    ? parseFloat(product.campaign_details.original_price)
    : parseFloat(cs?.mrp || 0);
  const discPct = oldPrice > actualPrice && oldPrice > 0 ? Math.round((oldPrice - actualPrice) / oldPrice * 100) : 0;
  const stockQty = parseInt(cs?.stock_quantity || 0);
  const inStock = stockQty > 0;

  const parseArr = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') { try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; } }
    return [];
  };
  const features = parseArr(product?.description_features);
  const specs = parseArr(product?.specifications);
  const firstCoupon = productCoupons[0] || null;

  /* handlers */
  const handleAddToCart = async () => {
    if (!inStock) return;
    if (!isAuthenticated()) { setShowLoginModal(true); return; }
    const stockId = cs?.id;
    if (!stockId) return;
    setAddingToCart(true);
    try {
      const res = await axiosInstance.post('api/public/cart/', { product_stock: stockId, quantity: qty });
      if (res.data.success) addToast('Added to cart!', 'success');
      else throw new Error();
    } catch (err) {
      if (err.response?.status === 401) { addToast('Session expired', 'error'); navigate('/customer/login'); }
      else addToast('Failed to add to cart', 'error');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated()) { setShowLoginModal(true); return; }
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleApplyCoupon = (code) => navigate('/cart', { state: { applyCoupon: code, fromProduct: product?.id } });

  const applyPincode = () => {
    if (!/^[0-9]{3,6}$/.test(pincode)) { setPincodeResult({ ok: false, msg: 'Enter valid pincode' }); return; }
    const days = Math.floor(Math.random() * 4) + 2;
    const est = new Date(); est.setDate(est.getDate() + days);
    setPincodeResult({ ok: true, eta: est.toDateString(), cost: days > 4 ? 49 : 0 });
  };

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (loading) return (

    <div style={{ fontFamily: 'Inter, sans-serif', background: C.surface, minHeight: '100dvh' }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ height: 300, background: C.surfaceAlt }} className="mpd-skel" />
      <div style={{ padding: '16px 14px' }}>
        <Skel h={20} w="75%" mb={10} />
        <Skel h={14} w="50%" mb={20} />
        <Skel h={36} w="50%" mb={16} />
        <Skel h={44} mb={10} />
        <Skel h={44} />
      </div>
    </div>
  );

  if (error || !product) return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <style>{GLOBAL_CSS}</style>
      <div style={{ fontSize: 52, marginBottom: 16 }}>😞</div>
      <div style={{ ...F.emptyTitle, color: C.text, marginBottom: 8 }}>Product Not Found</div>
      <div style={{ ...F.emptySubtitle, color: C.textMid, marginBottom: 24 }}>{error}</div>
      <button onClick={() => navigate(-1)} style={{ background: C.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', ...F.cardTitle, cursor: 'pointer' }}>Go Back</button>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: C.surfaceAlt, minHeight: '100dvh', paddingBottom: 100 }}>
      <style>{GLOBAL_CSS}</style>

      {/* Modals */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={() => { setShowLoginModal(false); navigate('/customer/login'); }} onRegister={() => { setShowLoginModal(false); navigate('/customer/registration'); }} />
      {showCouponsModal && <CouponsModal product={product} coupons={productCoupons} onClose={() => setShowCouponsModal(false)} onApplyCoupon={handleApplyCoupon} />}

      {/* ── BREADCRUMB BAR WITH BACK BUTTON INSIDE ─────────────────────────────── */}
      <div style={{
        height: 48,
        background: C.surface,
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        gap: 8,
        borderBottom: `1px solid ${C.border}`,
      }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FiChevronLeft size={16} color={C.text} />
        </button>

        {/* Breadcrumb Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          flex: 1,
        }}>
          <Link to="/" style={{ ...F.badge, color: C.textMid, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>Home</Link>
          <ChevronRight size={10} color={C.textLight} style={{ flexShrink: 0 }} />
          <Link to="/productlist" style={{ ...F.badge, color: C.textMid, textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>Products</Link>
          <ChevronRight size={10} color={C.textLight} style={{ flexShrink: 0 }} />
          <span style={{
            ...F.badge,
            color: C.text,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 150,
          }}>
            {product?.product_name || 'Product'}
          </span>
        </div>
      </div>

      {/* ── IMAGE SECTION ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', background: C.surface }}>
        {/* Rest of your product images */}


        {/* Campaign badge */}
        {isCampaign && (
          <div style={{
            position: 'absolute', top: 14, right: 14, zIndex: 10,
            background: product.campaign_details?.campaign_type === 'Flash' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
            color: '#fff', borderRadius: 8, padding: '4px 10px',
            ...F.badge, display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {product.campaign_details?.campaign_type === 'Flash' && <Zap size={10} />}
            {product.campaign_details?.campaign_type?.toUpperCase() || 'SALE'}
          </div>
        )}

        {/* Discount badge */}
        {discPct > 0 && !isCampaign && (
          <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 10, background: C.accent, color: '#fff', borderRadius: 8, padding: '4px 10px', ...F.badge }}>
            -{discPct}%
          </div>
        )}

        {/* Main image */}
        <div style={{ height: 300, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.surfaceAlt }}>
          <img
            key={activeImage}
            className="mpd-swipe-img"
            src={imgUrls[activeImage] || imgUrls[0]}
            alt={product.product_name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={e => { e.target.src = 'https://placehold.co/400x400/f0f4f8/94a3b8?text=Product'; }}
          />
        </div>

        {/* Dot indicators */}
        {imgUrls.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingBottom: 10, paddingTop: 8 }}>
            {imgUrls.map((_, i) => (
              <div
                key={i}
                className="mpd-dot-active"
                style={{
                  width: i === activeImage ? 18 : 6,
                  height: 6, borderRadius: 3,
                  background: i === activeImage ? C.primary : C.border,
                }}
              />
            ))}
          </div>
        )}

        {/* Thumbnails */}
        {imgUrls.length > 1 && (
          <div ref={imgScrollRef} style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 14px 14px', scrollbarWidth: 'none' }}>
            {allImages.map((img, i) => {
              const variantStock = img.type === 'variant' && img.stockId ? product.stocks?.find(s => s.id === img.stockId) : null;
              return (
                <button
                  key={i}
                  className="mpd-img-thumb"
                  onClick={() => {
                    setActiveImage(i);
                    if (variantStock) {
                      setSelectedStockId(variantStock.id);
                      setSelectedColor(variantStock.color?.toLowerCase().replace(/\s+/g, '_') || 'default');
                      setSelectedSize(variantStock.size?.toUpperCase() || 'One Size');
                    }
                  }}
                  style={{
                    flexShrink: 0, padding: 0, border: 'none', background: 'transparent',
                  }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 10, overflow: 'hidden',
                    border: `2px solid ${i === activeImage ? C.primary : C.border}`,
                  }}>
                    <img src={img.url} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://placehold.co/60x60/f0f4f8/94a3b8?text=.'; }} />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Countdown timer */}
        {isCampaign && countdown && (
          <div style={{ margin: '0 14px 14px', borderRadius: 12, background: 'linear-gradient(135deg,#2563EB,#1d4ed8)', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', ...F.cardSub }}>
                <FaClock size={12} /> Sale ends in
              </div>
              <div style={{ ...F.badge, background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '2px 8px', borderRadius: 8 }}>
                {product.campaign_details?.campaign_type}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['h', 'Hrs'], ['m', 'Min'], ['s', 'Sec']].map(([k, label]) => (
                <div key={k} style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 0', textAlign: 'center' }}>
                  <div className={k === 's' ? 'mpd-sec-pulse' : ''} style={{ ...F.statNum, color: '#fff', fontSize: 20 }}>{String(countdown[k]).padStart(2, '0')}</div>
                  <div style={{ ...F.statLabel, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── PRODUCT INFO CARD ──────────────────────────────────────────── */}
      <div className="mpd-card" style={{ background: C.surface, marginTop: 8, padding: '16px 14px' }}>
        {/* Name */}
        <div style={{ ...F.pageTitle, color: C.text, lineHeight: '22px', marginBottom: 6 }}>
          {product.product_name}
        </div>

        {/* Rating + stock - ✅ DYNAMIC RATING */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFF8E1', borderRadius: 6, padding: '3px 8px' }}>
            <FaStar size={11} color="#F59E0B" />
            <span style={{ ...F.badge, color: '#92400E' }}>
              {reviewStats.count > 0 ? reviewStats.avg.toFixed(1) : "0.0"}
            </span>
          </div>
          <span style={{ ...F.cardSub, color: C.textMid }}>
            ({reviewStats.count} {reviewStats.count !== 1 ? 'reviews' : 'review'})
          </span>
        </div>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: C.text }}>{fmt(actualPrice)}</div>
          {oldPrice > actualPrice && (
            <>
              <div style={{ ...F.cardSub, color: C.textLight, textDecoration: 'line-through' }}>{fmt(oldPrice)}</div>
              <div style={{ ...F.badge, color: '#fff', background: C.accent, borderRadius: 6, padding: '2px 8px' }}>{discPct}% OFF</div>
            </>
          )}
        </div>
        {oldPrice > actualPrice && (
          <div style={{ ...F.cardSub, color: C.success }}>You save {fmt(oldPrice - actualPrice)}</div>
        )}
      </div>

      {/* ── COUPON BANNER ──────────────────────────────────────────────── */}
      {firstCoupon && (
        <div
          className="mpd-card"
          style={{ background: C.surface, marginTop: 8, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => setShowCouponsModal(true)}
        >
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Tag size={16} color={C.primary} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...F.pill, color: C.primary }}>{firstCoupon.code}</div>
            <div style={{ ...F.cardSub, color: C.textMid, marginTop: 1 }}>{firstCoupon.title}</div>
          </div>
          {productCoupons.length > 1 && (
            <div style={{ ...F.badge, color: C.textLight }}>+{productCoupons.length - 1} more</div>
          )}
          <ChevronRight size={16} color={C.textLight} />
        </div>
      )}

      {/* ── VARIANTS ───────────────────────────────────────────────────── */}
      {(variants.colors.length > 1 || variants.sizes.length > 1) && (
        <div className="mpd-card" style={{ background: C.surface, marginTop: 8, padding: '14px 14px' }}>
          {/* Colors */}
          {variants.colors.length > 1 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...F.sectionLetter, color: C.textMid, marginBottom: 10 }}>Color — <span style={{ color: C.text, textTransform: 'none', fontWeight: 500, fontSize: 12 }}>{variants.colors.find(c => c.id === selectedColor)?.name}</span></div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {variants.colors.map(col => {
                  const hasStock = product.stocks.some(s => s.color?.toLowerCase().replace(/\s+/g, '_') === col.id && s.stock_quantity > 0);
                  const active = selectedColor === col.id;
                  return (
                    <button
                      key={col.id}
                      className="mpd-color-dot"
                      onClick={() => hasStock && setSelectedColor(col.id)}
                      disabled={!hasStock}
                      style={{
                        width: 32, height: 32, borderRadius: 16, border: 'none', cursor: hasStock ? 'pointer' : 'not-allowed',
                        background: col.hex,
                        boxShadow: active ? `0 0 0 2px #fff, 0 0 0 4px ${C.primary}` : '0 0 0 1.5px #E2E8F0',
                        opacity: hasStock ? 1 : 0.35,
                        position: 'relative',
                      }}
                    >
                      {active && (
                        <div style={{ position: 'absolute', inset: 0, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {variants.sizes.length > 1 && (
            <div>
              <div style={{ ...F.sectionLetter, color: C.textMid, marginBottom: 10 }}>Size — <span style={{ color: C.text, textTransform: 'none', fontWeight: 500, fontSize: 12 }}>{selectedSize}</span></div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {variants.sizes.map(sz => {
                  const available = product.stocks.some(s => s.color?.toLowerCase().replace(/\s+/g, '_') === selectedColor && s.size?.toUpperCase() === sz && s.stock_quantity > 0);
                  const active = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      onClick={() => available && setSelectedSize(sz)}
                      disabled={!available}
                      style={{
                        padding: '7px 16px', borderRadius: 8, border: `1.5px solid ${active ? C.primary : available ? C.border : '#EEE'}`,
                        background: active ? C.primaryBg : available ? C.surface : '#FAFAFA',
                        color: active ? C.primary : available ? C.text : C.textLight,
                        ...F.pill, cursor: available ? 'pointer' : 'not-allowed',
                        textDecoration: !available ? 'line-through' : 'none',
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DESCRIPTION + TABS ─────────────────────────────────────────── */}
      <div className="mpd-card" style={{ background: C.surface, marginTop: 8 }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: `1px solid ${C.border}`, scrollbarWidth: 'none' }}>
          {[
            { id: 'description', label: 'Details' },
            { id: 'features', label: 'Features' },
            { id: 'specs', label: 'Specs' },
            { id: 'reviews', label: 'Reviews' },
            ...(product.warranty_available ? [{ id: 'warranty', label: 'Warranty' }] : []),
          ].map(t => (
            <button
              key={t.id}
              className="mpd-tab-btn"
              onClick={() => setTab(t.id)}
              style={{
                flexShrink: 0, padding: '11px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                ...F.pill,
                color: tab === t.id ? C.primary : C.textMid,
                borderBottom: `2px solid ${tab === t.id ? C.primary : 'transparent'}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px 14px' }}>
          {/* Description */}
          {tab === 'description' && (
            <div>
              <div style={{
                ...F.cardSub, color: C.textMid, lineHeight: '18px',
                maxHeight: descExpanded ? 'none' : 40,
                overflow: 'hidden',
              }}>
                {product.full_description || product.short_description || 'No description available.'}
              </div>
              {(product.full_description || product.short_description || '').length > 120 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  style={{ background: 'none', border: 'none', color: C.primary, ...F.badge, cursor: 'pointer', marginTop: 6, padding: 0 }}
                >
                  {descExpanded ? 'Show less ▲' : 'Read more ▼'}
                </button>
              )}
            </div>
          )}

          {/* Features */}
          {tab === 'features' && (
            features.length > 0
              ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 10, background: C.primaryBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <span style={{ ...F.badge, color: C.primary }}>{i + 1}</span>
                    </div>
                    <div style={{ ...F.cardSub, color: C.text, flex: 1, lineHeight: '17px' }}>{f.value || f}</div>
                  </div>
                ))}
              </div>
              : <div style={{ ...F.emptySubtitle, color: C.textMid, textAlign: 'center', padding: '20px 0' }}>No features listed</div>
          )}

          {/* Specs */}
          {tab === 'specs' && (
            specs.length > 0
              ? <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
                {specs.filter(s => s.title && s.value).map((s, i) => (
                  <div key={i} style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '10px 0', gap: 12 }}>
                    <div style={{ ...F.cardSub, color: C.textMid, width: 120, flexShrink: 0 }}>{s.title}</div>
                    <div style={{ ...F.cardSub, color: C.text, fontWeight: 500, flex: 1 }}>{s.value}</div>
                  </div>
                ))}
              </div>
              : cs
                ? <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0 }}>
                  {[['Color', cs.color], ['Size', cs.size], ['Unit', cs.unit], ['Weight', cs.weight], ['Brand', product.brand_details?.brand_name], ['Condition', product.product_condition]].filter(([, v]) => v).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '10px 0', gap: 12 }}>
                      <div style={{ ...F.cardSub, color: C.textMid, width: 120, flexShrink: 0 }}>{k}</div>
                      <div style={{ ...F.cardSub, color: C.text, fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
                : <div style={{ ...F.emptySubtitle, color: C.textMid, textAlign: 'center', padding: '20px 0' }}>No specs available</div>
          )}

          {/* Reviews */}
{tab === 'reviews' && (
  <div className="py-2">
    <ServiceReviewSection
      modelName="product"
      objectId={product.id}
      serviceName={product.product_name}
      accentColor="blue"
      requireDelivery={true}
      isDelivered={false}
    />
  </div>
)}

          {/* Warranty */}
          {tab === 'warranty' && product.warranty_available && (
            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 10, padding: 14 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <FaCheckCircle size={20} color={C.success} />
                <div>
                  <div style={{ ...F.cardTitle, color: '#15803D' }}>Warranty Covered</div>
                  <div style={{ ...F.cardSub, color: '#166534' }}>This product comes with warranty</div>
                </div>
              </div>
              {[['Type', product.warranty_type], ['Period', product.warranty_period], ['Details', product.warranty_description]].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} style={{ borderTop: '1px solid #BBF7D0', paddingTop: 10, marginTop: 10 }}>
                  <div style={{ ...F.badge, color: '#4B5563' }}>{k}</div>
                  <div style={{ ...F.cardSub, color: C.text, marginTop: 3 }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── DELIVERY CHECK ─────────────────────────────────────────────── */}
      <div className="mpd-card" style={{ background: C.surface, marginTop: 8, padding: '14px 14px' }}>
        <div style={{ ...F.sectionLetter, color: C.textMid, marginBottom: 12 }}>Check Delivery</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={pincode}
            onChange={e => setPincode(e.target.value)}
            placeholder="Enter pincode"
            maxLength={6}
            style={{ flex: 1, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '10px 12px', ...F.cardSub, color: C.text, outline: 'none', background: C.surfaceAlt }}
          />
          <button
            onClick={applyPincode}
            style={{ padding: '10px 18px', background: C.primary, color: '#fff', border: 'none', borderRadius: 10, ...F.pill, cursor: 'pointer' }}
          >
            Check
          </button>
        </div>
        {pincodeResult && (
          <div style={{ marginTop: 10, ...F.cardSub, color: pincodeResult.ok ? C.success : C.accent }}>
            {pincodeResult.ok
              ? `✅ Delivery by ${pincodeResult.eta} • ${pincodeResult.cost === 0 ? 'Free delivery' : `₹${pincodeResult.cost} shipping`}`
              : `❌ ${pincodeResult.msg}`}
          </div>
        )}
        {/* Quick delivery info */}
        {/* Quick delivery info - Left Aligned */}
        <div style={{ display: 'flex', gap: 24, marginTop: 14, borderTop: `1px solid ${C.border}`, paddingTop: 12, justifyContent: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaTruck size={16} color={C.primary} />
            <div style={{ ...F.badge, color: C.textMid }}>Free above ₹499</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <GiReturnArrow size={16} color={C.success} />
            <div style={{ ...F.badge, color: C.textMid }}>7-Day Return</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FaShieldAlt size={16} color={C.orange} />
            <div style={{ ...F.badge, color: C.textMid }}>Secure Pay</div>
          </div>
        </div>
      </div>

      {/* ── STORE INFO ─────────────────────────────────────────────────── */}
      <div className="mpd-card" style={{ background: C.surface, marginTop: 8, padding: '14px 14px' }}>
        <div style={{ ...F.sectionLetter, color: C.textMid, marginBottom: 12 }}>Sold By</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img
            src={product.vendor_details?.store_logo_url || `https://api.initcart.in${product.vendor_details?.store_logo}` || 'https://placehold.co/50x50'}
            alt="store"
            style={{ width: 48, height: 48, borderRadius: 24, objectFit: 'cover', border: `2px solid ${C.border}` }}
            onError={e => { e.target.src = 'https://placehold.co/50x50'; }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ ...F.cardTitle, color: C.text }}>{product.vendor_details?.business_name || 'Official Store'}</div>
            <div style={{ ...F.badge, color: C.success, marginTop: 2 }}>✓ Verified Seller</div>
          </div>
          <Link
            to={`/vendor/${product.vendor_details?.id}`}
            style={{ padding: '8px 14px', background: C.primaryBg, color: C.primary, borderRadius: 8, ...F.pill, textDecoration: 'none', border: `1px solid ${C.primary}30` }}
          >
            Visit
          </Link>
        </div>

        {/* Vendor products */}
        {vendorProducts.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ ...F.sectionLetter, color: C.textMid, marginBottom: 10 }}>More from Store</div>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {vendorProducts.map(vp => {
                const vpImg = getProductImage(vp);
                const vpPrice = vp.stocks?.[0]?.final_price || vp.stocks?.[0]?.selling_price;
                return (
                  <Link
                    key={vp.id}
                    to={`/product/${vp.id}`}
                    style={{ flexShrink: 0, width: 100, textDecoration: 'none' }}
                  >
                    <div style={{ width: 100, height: 90, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}`, marginBottom: 6 }}>
                      <img src={vpImg || 'https://placehold.co/100'} alt={vp.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://placehold.co/100'; }} />
                    </div>
                    <div style={{ ...F.badge, color: C.text, lineHeight: '13px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{vp.product_name}</div>
                    <div style={{ ...F.statNum, color: C.primary, marginTop: 3 }}>{fmt(vpPrice)}</div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── RELATED PRODUCTS ───────────────────────────────────────────── */}
      <div style={{ marginTop: 8, background: C.surface, padding: '14px 0' }}>
        <div style={{ ...F.sectionLetter, color: C.textMid, padding: '0 14px', marginBottom: 10 }}>You May Also Like</div>
        <RelatedProductSlider />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM CTA BAR
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="mpd-bottom-bar"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: C.surface,
          borderTop: `1px solid ${C.border}`,
          padding: '10px 14px 16px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Qty control */}
        {/* Quantity Control - Small & Perfect */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>Qty</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #93C5FD',
              borderRadius: 8,
              overflow: 'hidden',
              background: '#EFF6FF',
            }}>
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                style={{
                  width: 32,
                  height: 32,
                  border: 'none',
                  background: '#DBEAFE',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#2563EB',
                }}
              >−</button>
              <div style={{
                width: 40,
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 600,
                color: '#1E3A8A',
                background: '#EFF6FF',
              }}>{qty}</div>
              <button
                onClick={() => setQty(q => Math.min(parseInt(cs?.maximum_order_quantity || 10), q + 1))}
                style={{
                  width: 32,
                  height: 32,
                  border: 'none',
                  background: '#DBEAFE',
                  cursor: 'pointer',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#2563EB',
                }}
              >+</button>
            </div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8' }}>Max {cs?.maximum_order_quantity || 10}</div>
        </div>

        {/* Buttons */}
        {/* Two Buttons in One Row - Equal Width */}
        <div style={{ display: 'flex', gap: 12 }}>

          {/* ADD TO CART BUTTON - Only Icon */}
          <button
            className="mpd-btn-primary"
            onClick={handleAddToCart}
            disabled={!inStock || addingToCart}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              border: inStock ? `2px solid ${C.primary}` : `2px solid ${C.border}`,
              background: inStock ? C.surface : C.border,
              color: inStock ? C.primary : C.textLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inStock ? 'pointer' : 'not-allowed',
            }}
          >
            {addingToCart ? (
              <div style={{ width: 22, height: 22, border: `2px solid ${C.primary}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : (
              <FaShoppingCart size={22} />
            )}
          </button>

          {/* BUY NOW BUTTON - Only "Buy" Text */}
          <button
            className="mpd-btn-primary"
            onClick={handleBuyNow}
            disabled={!inStock}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              border: 'none',
              background: inStock ? `linear-gradient(135deg, ${C.primary}, #1d4ed8)` : C.border,
              color: inStock ? '#fff' : C.textLight,
              cursor: inStock ? 'pointer' : 'not-allowed',
              ...F.cardTitle,
              fontSize: 16,
              fontWeight: 700,
              boxShadow: inStock ? '0 4px 14px rgba(37,99,235,0.35)' : 'none',
            }}
          >
            Buy
          </button>
        </div>

      </div>

      {/* spin keyframe for loading spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}