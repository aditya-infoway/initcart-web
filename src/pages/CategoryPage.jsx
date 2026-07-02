import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { publicAxios } from '../api/axios';
import { FaShoppingCart } from 'react-icons/fa';

/* ─── Font tokens ─────────────────────────────────────────────────────── */
const F = {
  pageTitle:   { fontSize: 16, fontWeight: 700 },
  pageSubtitle:{ fontSize: 11, fontWeight: 400 },
  searchInput: { fontSize: 13, fontWeight: 400 },
  cardTitle:   { fontSize: 14, fontWeight: 600 },
  cardSub:     { fontSize: 11, fontWeight: 400 },
  badge:       { fontSize: 10, fontWeight: 600 },
  pill:        { fontSize: 11, fontWeight: 600 },
  statNum:     { fontSize: 13, fontWeight: 700 },
  statLabel:   { fontSize:  9, fontWeight: 400 },
  sectionLetter:{ fontSize: 11, fontWeight: 700 },
  emptyTitle:  { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

/* ─── Palette ─────────────────────────────────────────────────────────── */
const C = {
  primary:   '#2563EB',
  primaryBg: '#EFF6FF',
  accent:    '#E53E3E',
  surface:   '#FFFFFF',
  surfaceAlt:'#F7F9FC',
  border:    '#EEEFF2',
  text:      '#1A1D23',
  textMid:   '#64748B',
  textLight: '#A0AABC',
  activeBar: '#2563EB',
  skel:      '#E8ECF0',
  skeletonShine: '#F4F6FA',
};

/* ─── Global styles injected once ────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; }

  @keyframes shimmer {
    0%   { background-position: -300px 0; }
    100% { background-position:  300px 0; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .skel {
    background: linear-gradient(90deg, ${C.skel} 25%, ${C.skeletonShine} 50%, ${C.skel} 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 8px;
  }
  .cat-btn {
    transition: background 0.18s, transform 0.12s;
    -webkit-tap-highlight-color: transparent;
  }
  .cat-btn:active { transform: scale(0.96); }
  .sub-chip {
    transition: all 0.18s;
  }
  .sub-chip:active { transform: scale(0.95); }
  .product-card {
    transition: box-shadow 0.2s, transform 0.15s;
    animation: fadeSlideUp 0.3s ease both;
  }
  .product-card:active { transform: scale(0.98); box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important; }
  .cart-btn {
    transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  }
  .cart-btn:active { transform: scale(0.9); }
  .products-grid {
    animation: scaleIn 0.25s ease both;
  }
  @keyframes activeGlow {
    from { opacity: 0; transform: scale(0.82); }
    to   { opacity: 1; transform: scale(1); }
  }
  .cat-active-bg {
    animation: activeGlow 0.22s cubic-bezier(0.34,1.56,0.64,1) both;
  }
`;

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const fmt = (p) => p ? `₹${parseFloat(p).toLocaleString('en-IN')}` : '₹0';

const imgUrl = (product) => {
  return product?.main_image_url || product?.thumbnail_image_url || product?.main_image || null;
};

const priceOf = (product) => {
  const stock = product?.stocks?.[0];
  if (!stock) return { sell: 0, mrp: 0, final: 0, disc: 0, inStock: false };
  const sell  = parseFloat(stock.selling_price || 0);
  const mrp   = parseFloat(stock.mrp || sell);
  const final = parseFloat(stock.final_price || sell);
  const disc  = mrp > final ? Math.round(((mrp - final) / mrp) * 100) : 0;
  return { sell, mrp, final, disc, inStock: stock.stock_quantity > 0 };
};

/* ─── Skeleton helpers ─────────────────────────────────────────────────── */
const SkelBox = ({ w = '100%', h = 16, r = 6, mb = 0 }) => (
  <div className="skel" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} />
);

/* ─────────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                         */
/* ─────────────────────────────────────────────────────────────────────── */
const AmazonStyleCategories = () => {
  const [categories,     setCategories]     = useState([]);
  const [subCategories,  setSubCategories]  = useState([]);
  const [childCategories,setChildCategories]= useState([]);
  const [selectedCat,    setSelectedCat]    = useState(null);
  const [selectedSub,    setSelectedSub]    = useState(null);
  const [selectedChild,  setSelectedChild]  = useState(null);
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [prodsLoading,   setProdsLoading]   = useState(false);
  const [searchParams,   setSearchParams]   = useSearchParams();
  const navigate = useNavigate();
  const subScrollRef = useRef(null);

  /* inject global css once */
  useEffect(() => {
    const id = 'cat-page-styles';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id; s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await publicAxios.get('/ecommerce/public/categories/');
      const data = res.data || [];
      setCategories(data);
      const catId = searchParams.get('category');
      const match = catId ? data.find((c) => c.id == catId) : data[0];
      if (match) await selectCategory(match);
    } catch { setCategories([]); }
    finally  { setLoading(false); }
  };

  const fetchSubs = async (catId) => {
    try {
      const r = await publicAxios.get('/ecommerce/public/subcategories/', { params: { category: catId } });
      return r.data || [];
    } catch { return []; }
  };

  const fetchChilds = async (subId) => {
    try {
      const r = await publicAxios.get('/ecommerce/public/subsubcategories/', { params: { subcategory: subId } });
      return r.data || [];
    } catch { return []; }
  };

  const fetchProducts = async (catId, subId, childId) => {
    setProdsLoading(true);
    try {
      const params = {};
      if (childId)     params.subsubcategory = childId;
      else if (subId)  params.subcategory    = subId;
      else if (catId)  params.category       = catId;
      const r = await publicAxios.get('/ecommerce/public/category-products/', { params });
      setProducts(r.data || []);
    } catch { setProducts([]); }
    finally  { setProdsLoading(false); }
  };

  const selectCategory = async (cat) => {
    setSelectedCat(cat); setSelectedSub(null); setSelectedChild(null);
    setSubCategories([]); setChildCategories([]); setProducts([]);
    setSearchParams({ category: cat.id });
    const subs = await fetchSubs(cat.id);
    setSubCategories(subs);
    fetchProducts(cat.id);
  };

  const selectSub = async (sub) => {
    setSelectedSub(sub); setSelectedChild(null);
    setChildCategories([]); setProducts([]);
    setSearchParams({ category: selectedCat.id, subcategory: sub.id });
    const childs = await fetchChilds(sub.id);
    setChildCategories(childs);
    fetchProducts(undefined, sub.id);
    // scroll sub chips to active
    setTimeout(() => {
      const el = document.getElementById(`sub-${sub.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 80);
  };

  const selectChild = (child) => {
    setSelectedChild(child);
    setSearchParams({ category: selectedCat.id, subcategory: selectedSub.id, subsubcategory: child.id });
    fetchProducts(undefined, undefined, child.id);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    const p = priceOf(product);
    alert(`Added ${product.product_name} to cart\nPrice: ${fmt(p.final)}`);
  };

  /* ── Loading skeleton ────────────────────────────────────────────────── */
  if (loading) return (
    <div style={{ display: 'flex', height: '100dvh', background: C.surface, fontFamily: 'Inter, sans-serif' }}>
      {/* sidebar skel */}
      <div style={{ width: 76, background: C.surfaceAlt, borderRight: `1px solid ${C.border}`, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...Array(9)].map((_, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <SkelBox w={40} h={40} r={10} />
            <SkelBox w={36} h={7} r={4} />
          </div>
        ))}
      </div>
      {/* content skel */}
      <div style={{ flex: 1, padding: '14px 12px', overflow: 'hidden' }}>
        <SkelBox h={32} r={10} mb={14} />
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {[...Array(4)].map((_,i) => <SkelBox key={i} w={64} h={28} r={20} />)}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[...Array(6)].map((_,i) => <SkelBox key={i} h={200} r={12} />)}
        </div>
      </div>
      <style>{GLOBAL_CSS}</style>
    </div>
  );

  /* ── Category icon ───────────────────────────────────────────────────── */
  const CatIcon = ({ src, name, size = 32 }) => (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      {src
        ? <img src={src} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
            onError={e => { e.target.style.display='none'; }} />
        : <span style={{ fontSize: size * 0.55 }}>📦</span>
      }
    </div>
  );

  /* ── Product image src ───────────────────────────────────────────────── */
  const resolveImg = (product) => {
    const raw = imgUrl(product);
    if (!raw) return null;
    return raw.startsWith('http') ? raw : `https://api.initcart.in${raw}`;
  };

  /* Current section name */
  const sectionName = selectedChild?.name || selectedSub?.name || selectedCat?.name || '';

  return (
    <div style={{ display:'flex', height:'100dvh', fontFamily:'Inter, sans-serif', background: C.surface, overflow:'hidden' }}>

      {/* ══════════════════════════════════════════════════════════════════
          LEFT SIDEBAR — Categories
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{
        width: 76,
        background: C.surfaceAlt,
        borderRight: `1px solid ${C.border}`,
        overflowY: 'auto',
        overflowX: 'hidden',
        flexShrink: 0,
        scrollbarWidth: 'none',
      }}>
        <style>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        <div style={{ padding: '10px 0', display:'flex', flexDirection:'column', gap: 2 }}>
          {categories.map((cat) => {
            const active = selectedCat?.id === cat.id;
            return (
              <button
                key={cat.id}
                className="cat-btn"
                onClick={() => selectCategory(cat)}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '8px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 5,
                  position: 'relative',
                  borderRadius: 0,
                }}
              >
                {/* Active pill bg */}
                {active && (
                  <div className="cat-active-bg" style={{
                    position: 'absolute',
                    inset: '4px 6px',
                    borderRadius: 14,
                    background: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
                    border: '1px solid #BFDBFE',
                    zIndex: 0,
                  }} />
                )}

                {/* Icon circle */}
                <div style={{
                  width: 42, height: 42,
                  borderRadius: 12,
                  background: active ? 'transparent' : C.border,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                  transition: 'background 0.2s',
                  border: '1.5px solid transparent',
                  position: 'relative', zIndex: 1,
                }}>
                  {cat.icon
                    ? <img src={cat.icon} alt={cat.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        onError={e => { e.target.style.display='none'; }} />
                    : <span style={{ fontSize: 20 }}>📦</span>
                  }
                </div>

                {/* Name */}
                <div style={{
                  ...F.badge,
                  color: active ? C.primary : C.textMid,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  maxWidth: 64,
                  wordBreak: 'break-word',
                  transition: 'color 0.2s',
                  letterSpacing: 0,
                  textTransform: 'none',
                  position: 'relative', zIndex: 1,
                }}>
                  {cat.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          RIGHT CONTENT
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden', background: C.surface }}>

        {selectedCat && (
          <>
            {/* ── Header ──────────────────────────────────────────────── */}
            <div style={{
              padding: '14px 12px 0',
              background: C.surface,
              position: 'sticky', top: 0, zIndex: 10,
              borderBottom: subCategories.length > 0 ? `1px solid ${C.border}` : 'none',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 10 }}>
                <CatIcon src={selectedCat.icon} name={selectedCat.name} size={34} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ ...F.pageTitle, color: C.text, lineHeight:1.2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {selectedCat.name}
                  </div>
                  <div style={{ ...F.pageSubtitle, color: C.textLight, marginTop: 2 }}>
                    {selectedCat.product_count || 0} products
                  </div>
                </div>
              </div>

              {/* ── Subcategory horizontal chips ──────────────────────── */}
              {subCategories.length > 0 && (
                <div
                  ref={subScrollRef}
                  style={{
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                    paddingBottom: 12,
                    scrollbarWidth: 'none',
                  }}
                >
                  {/* "All" chip */}
                  <button
                    className="sub-chip"
                    onClick={() => { setSelectedSub(null); setSelectedChild(null); setChildCategories([]); fetchProducts(selectedCat.id); }}
                    style={{
                      flexShrink: 0,
                      border: 'none',
                      borderRadius: 20,
                      padding: '6px 14px',
                      background: !selectedSub ? C.primary : C.surfaceAlt,
                      color: !selectedSub ? '#fff' : C.textMid,
                      cursor: 'pointer',
                      ...F.pill,
                    }}
                  >
                    All
                  </button>

                  {subCategories.map((sub) => {
                    const active = selectedSub?.id === sub.id;
                    return (
                      <button
                        key={sub.id}
                        id={`sub-${sub.id}`}
                        className="sub-chip"
                        onClick={() => selectSub(sub)}
                        style={{
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                          border: 'none',
                          borderRadius: 20,
                          padding: '6px 12px',
                          background: active ? C.primary : C.surfaceAlt,
                          color: active ? '#fff' : C.textMid,
                          cursor: 'pointer',
                          ...F.pill,
                          transition: 'all 0.18s',
                        }}
                      >
                        {sub.icon && (
                          <img src={sub.icon} alt={sub.name} style={{ width:16, height:16, borderRadius:4, objectFit:'cover' }}
                            onError={e => { e.target.style.display='none'; }} />
                        )}
                        {sub.name}
                        {sub.product_count > 0 && (
                          <span style={{ ...F.badge, background: active ? 'rgba(255,255,255,0.25)' : C.border, color: active ? '#fff' : C.textLight, borderRadius:10, padding:'1px 5px' }}>
                            {sub.product_count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Child category chips (if sub selected) ────────────── */}
              {selectedSub && childCategories.length > 0 && (
                <div style={{ display:'flex', gap:6, overflowX:'auto', paddingBottom:10, scrollbarWidth:'none' }}>
                  {childCategories.map((ch) => {
                    const active = selectedChild?.id === ch.id;
                    return (
                      <button
                        key={ch.id}
                        className="sub-chip"
                        onClick={() => selectChild(ch)}
                        style={{
                          flexShrink: 0,
                          border: `1.5px solid ${active ? C.primary : C.border}`,
                          borderRadius: 16,
                          padding: '4px 10px',
                          background: active ? C.primaryBg : C.surface,
                          color: active ? C.primary : C.textMid,
                          cursor: 'pointer',
                          ...F.badge,
                        }}
                      >
                        {ch.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Products area ──────────────────────────────────────── */}
            <div style={{ padding: '12px 12px 80px' }}>

              {/* Section header */}
              {(products.length > 0 || prodsLoading) && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ ...F.sectionLetter, color: C.textMid, textTransform:'uppercase', letterSpacing: 0.5 }}>
                    {sectionName}
                  </span>
                  {!prodsLoading && (
                    <span style={{ ...F.cardSub, color: C.textLight }}>
                      {products.length} items
                    </span>
                  )}
                </div>
              )}

              {/* Products skeleton */}
              {prodsLoading && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[...Array(6)].map((_,i) => (
                    <div key={i} className="skel" style={{ height:210, borderRadius:12 }} />
                  ))}
                </div>
              )}

              {/* Products grid */}
              {!prodsLoading && products.length > 0 && (
                <div className="products-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {products.map((product, idx) => {
                    const p   = priceOf(product);
                    const src = resolveImg(product);
                    return (
                      <div
                        key={product.id}
                        className="product-card"
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{
                          animationDelay: `${idx * 0.04}s`,
                          background: C.surface,
                          border: `1px solid ${C.border}`,
                          borderRadius: 12,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                        }}
                      >
                        {/* Discount badge */}
                        {p.disc > 0 && (
                          <div style={{
                            position: 'absolute', top: 7, left: 7, zIndex: 2,
                            background: C.accent,
                            color: '#fff',
                            borderRadius: 6,
                            padding: '2px 6px',
                            ...F.badge,
                          }}>
                            -{p.disc}%
                          </div>
                        )}

                        {/* Out of stock overlay */}
                        {!p.inStock && (
                          <div style={{
                            position:'absolute', top:7, right:7, zIndex:2,
                            background:'rgba(0,0,0,0.55)',
                            color:'#fff', borderRadius:6, padding:'2px 7px',
                            ...F.badge,
                          }}>
                            Out of stock
                          </div>
                        )}

                        {/* Image */}
                        <div style={{
                          height: 130,
                          background: C.surfaceAlt,
                          display: 'flex', alignItems:'center', justifyContent:'center',
                          overflow: 'hidden',
                          borderBottom: `1px solid ${C.border}`,
                        }}>
                          {src
                            ? <img src={src} alt={product.product_name}
                                style={{ width:'100%', height:'100%', objectFit:'cover' }}
                                onError={e => {
                                  e.target.style.display='none';
                                  e.target.parentElement.innerHTML='<span style="font-size:40px">📦</span>';
                                }} />
                            : <span style={{ fontSize:40 }}>📦</span>
                          }
                        </div>

                        {/* Details */}
                        <div style={{ padding:'9px 9px 8px', display:'flex', flexDirection:'column', flex:1, gap:4 }}>
                          {/* Name */}
                          <div style={{
                            ...F.cardTitle,
                            color: C.text,
                            lineHeight: '18px',
                            display:'-webkit-box',
                            WebkitLineClamp:2,
                            WebkitBoxOrient:'vertical',
                            overflow:'hidden',
                          }}>
                            {product.product_name}
                          </div>

                          {/* Price row */}
                          <div style={{ display:'flex', alignItems:'center', gap:5, flexWrap:'wrap', marginTop:2 }}>
                            <span style={{ ...F.statNum, color: C.accent }}>
                              {fmt(p.final)}
                            </span>
                            {p.disc > 0 && (
                              <span style={{ ...F.cardSub, color: C.textLight, textDecoration:'line-through' }}>
                                {fmt(p.mrp)}
                              </span>
                            )}
                          </div>

                          {/* Cart button — icon only */}
                          <button
                            className="cart-btn"
                            onClick={e => handleAddToCart(product, e)}
                            disabled={!p.inStock}
                            style={{
                              marginTop: 'auto',
                              alignSelf: 'flex-end',
                              width: 34, height: 34,
                              borderRadius: 9,
                              border: 'none',
                              background: p.inStock ? C.primary : C.border,
                              color: p.inStock ? '#fff' : C.textLight,
                              display: 'flex', alignItems:'center', justifyContent:'center',
                              cursor: p.inStock ? 'pointer' : 'not-allowed',
                              flexShrink: 0,
                              boxShadow: p.inStock ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
                            }}
                            aria-label="Add to cart"
                          >
                            <FaShoppingCart size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {!prodsLoading && products.length === 0 && (
                <div style={{
                  textAlign:'center',
                  padding:'48px 20px',
                  animation:'fadeIn 0.3s ease',
                }}>
                  <div style={{ fontSize:48, marginBottom:14 }}>🛍️</div>
                  <div style={{ ...F.emptyTitle, color: C.text, marginBottom:8 }}>
                    No products found
                  </div>
                  <div style={{ ...F.emptySubtitle, color: C.textMid, maxWidth:240, margin:'0 auto' }}>
                    {selectedChild
                      ? `Nothing in "${selectedChild.name}" yet`
                      : selectedSub
                        ? `Nothing in "${selectedSub.name}" yet`
                        : `Nothing in "${selectedCat?.name}" yet`
                    }
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* No category selected fallback */}
        {!selectedCat && categories.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', padding:32, textAlign:'center' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🏪</div>
            <div style={{ ...F.emptyTitle, color: C.text, marginBottom:8 }}>
              Pick a category
            </div>
            <div style={{ ...F.emptySubtitle, color: C.textMid }}>
              Tap any category on the left to start browsing
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AmazonStyleCategories;