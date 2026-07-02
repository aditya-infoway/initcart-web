import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { publicAxios } from '../api/axios';
import { FiArrowLeft, FiShoppingCart, FiChevronRight, FiStar } from 'react-icons/fi';

// ── Font tokens ───────────────────────────────────────────────────────────────
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle:    { fontSize: 14, fontWeight: 600 },
  cardSub:      { fontSize: 11, fontWeight: 400 },
  badge:        { fontSize: 10, fontWeight: 600 },
  pill:         { fontSize: 11, fontWeight: 600 },
  statNum:      { fontSize: 13, fontWeight: 700 },
  statLabel:    { fontSize: 9,  fontWeight: 400 },
  sectionTitle: { fontSize: 13, fontWeight: 700 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const getImgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://api.initcart.in${path.startsWith('/') ? '' : '/'}${path}`;
};

const getProductImg = (p) => {
  if (p.main_image_url)     return p.main_image_url;
  if (p.thumbnail_image_url)return p.thumbnail_image_url;
  if (p.main_image)         return getImgUrl(p.main_image);
  return null;
};

const getPriceDetails = (p) => {
  if (p.stocks?.length) {
    const s = p.stocks[0];
    const mrp   = parseFloat(s.mrp || s.selling_price || 0);
    const final = parseFloat(s.final_price || s.selling_price || 0);
    const disc  = mrp > final ? Math.round(((mrp - final) / mrp) * 100) : 0;
    return { mrp, final, disc, inStock: s.stock_quantity > 0 };
  }
  return { mrp: 0, final: 0, disc: 0, inStock: false };
};

const fmt = (n) => `₹${parseFloat(n).toLocaleString('en-IN')}`;

// ── Palette for category sidebar items ───────────────────────────────────────
const PALETTES = [
  '#1565c0','#c62828','#2e7d32','#e65100',
  '#6a1b9a','#00695c','#f57f17','#455a64',
];
const getPal = (i) => PALETTES[i % PALETTES.length];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonProduct() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden animate-pulse"
      style={{ border: '1px solid #f0f0f0' }}>
      <div style={{ height: 120, background: '#e5e7eb' }} />
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-200 rounded-full w-1/2" />
        <div className="h-7 bg-gray-100 rounded-xl w-full" />
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart }) {
  const [imgErr, setImgErr] = useState(false);
  const pd  = getPriceDetails(product);
  const src = getProductImg(product);

  return (
    <Link to={`/product/${product.id}`}
      className="bg-white rounded-2xl overflow-hidden flex flex-col active:scale-95 transition-transform duration-150"
      style={{ border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>

      {/* Image */}
      <div className="relative bg-gray-50" style={{ height: 120 }}>
        {pd.disc > 0 && (
          <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md text-white"
            style={{ background: '#ef4444', ...F.badge }}>{pd.disc}% OFF</div>
        )}
        {src && !imgErr ? (
          <img src={src} alt={product.product_name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ fontSize: 36, color: '#d1d5db' }}>📦</div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex flex-col flex-1">
        <p style={{ ...F.cardTitle, color: '#111827', lineHeight: 1.3 }}
          className="mb-1"
          // 2-line clamp
          dangerouslySetInnerHTML={{ __html: product.product_name }}
          ref={el => {
            if (el) {
              el.style.display = '-webkit-box';
              el.style.WebkitLineClamp = '2';
              el.style.WebkitBoxOrient = 'vertical';
              el.style.overflow = 'hidden';
            }
          }}
        />

        {/* Price */}
        <div className="flex items-center gap-1.5 mt-auto mb-2 flex-wrap">
          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
            {fmt(pd.final)}
          </span>
          {pd.disc > 0 && (
            <span style={{ ...F.cardSub, color: '#9ca3af', textDecoration: 'line-through' }}>
              {fmt(pd.mrp)}
            </span>
          )}
        </div>

        {/* Cart button — icon only */}
        <button
          onClick={(e) => { e.preventDefault(); onAddToCart(product, e); }}
          disabled={!pd.inStock}
          className="w-full flex items-center justify-center rounded-xl py-1.5 transition-opacity"
          style={{
            background: pd.inStock ? '#2563eb' : '#e5e7eb',
            opacity: pd.inStock ? 1 : 0.6,
          }}
        >
          {pd.inStock
            ? <FiShoppingCart size={15} color="#fff" />
            : <span style={{ ...F.badge, color: '#9ca3af' }}>Out of Stock</span>
          }
        </button>
      </div>
    </Link>
  );
}

// ── SubCategory / Child chips ─────────────────────────────────────────────────
function CategoryChip({ item, selected, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 flex-shrink-0 active:scale-95 transition-transform"
      style={{ minWidth: 64 }}
    >
      <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center"
        style={{
          background: selected ? '#2563eb' : '#f1f5f9',
          border: `2px solid ${selected ? '#2563eb' : '#e5e7eb'}`,
          boxShadow: selected ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
        }}>
        {item.icon && !imgErr ? (
          <img src={item.icon} alt={item.name}
            className="w-full h-full object-cover"
            onError={() => setImgErr(true)} />
        ) : (
          <span style={{ fontSize: 22 }}>📦</span>
        )}
      </div>
      <span style={{
        ...F.badge,
        color: selected ? '#2563eb' : '#374151',
        textAlign: 'center',
        maxWidth: 64,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {item.name}
      </span>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MobileCategoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories,            setCategories]            = useState([]);
  const [subCategories,         setSubCategories]         = useState([]);
  const [childCategories,       setChildCategories]       = useState([]);
  const [selectedCategory,      setSelectedCategory]      = useState(null);
  const [selectedSubCategory,   setSelectedSubCategory]   = useState(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState(null);
  const [products,              setProducts]              = useState([]);
  const [loading,               setLoading]               = useState(true);
  const [productsLoading,       setProductsLoading]       = useState(false);

  // ── API calls ──────────────────────────────────────────────────────────────
  const fetchSubCategories = async (catId) => {
    try {
      const r = await publicAxios.get('/ecommerce/public/subcategories/', { params: { category: catId } });
      return r.data || [];
    } catch { return []; }
  };

  const fetchChildCategories = async (subId) => {
    try {
      const r = await publicAxios.get('/ecommerce/public/subsubcategories/', { params: { subcategory: subId } });
      return r.data || [];
    } catch { return []; }
  };

  const fetchProducts = async (catId = null, subId = null, childId = null) => {
    setProductsLoading(true);
    try {
      const params = {};
      if (childId)     params.subsubcategory = childId;
      else if (subId)  params.subcategory    = subId;
      else if (catId)  params.category       = catId;
      const r = await publicAxios.get('/ecommerce/public/category-products/', { params });
      setProducts(r.data || []);
    } catch { setProducts([]); }
    finally { setProductsLoading(false); }
  };

  const handleCategorySelect = async (cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory(null);
    setSelectedChildCategory(null);
    setSubCategories([]);
    setChildCategories([]);
    setProducts([]);
    setSearchParams({ category: cat.id });
    const subs = await fetchSubCategories(cat.id);
    setSubCategories(subs);
    fetchProducts(cat.id);
  };

  const handleSubCategorySelect = async (sub) => {
    setSelectedSubCategory(sub);
    setSelectedChildCategory(null);
    setChildCategories([]);
    setProducts([]);
    setSearchParams({ category: selectedCategory.id, subcategory: sub.id });
    const childs = await fetchChildCategories(sub.id);
    setChildCategories(childs);
    fetchProducts(null, sub.id);
  };

  const handleChildCategorySelect = (child) => {
    setSelectedChildCategory(child);
    setSearchParams({ category: selectedCategory.id, subcategory: selectedSubCategory.id, subsubcategory: child.id });
    fetchProducts(null, null, child.id);
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    // TODO: connect to actual cart context
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await publicAxios.get('/ecommerce/public/categories/');
        const data = r.data || [];
        setCategories(data);
        if (data.length > 0) {
          const paramCatId = searchParams.get('category');
          const initial = paramCatId ? data.find(c => c.id == paramCatId) || data[0] : data[0];
          await handleCategorySelect(initial);
        }
      } catch { setCategories([]); }
      finally { setLoading(false); }
    })();
  }, []);

  // ── Active category label ──────────────────────────────────────────────────
  const activeLabel = selectedChildCategory?.name || selectedSubCategory?.name || selectedCategory?.name || '';

  return (
    <div className="min-h-screen pb-24" style={{ background: '#f5f6f7' }}>

      {/* ── Sticky Top Header ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white" style={{ boxShadow: '0 1px 0 #e8e8e8' }}>
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button onClick={() => navigate(-1)}
            className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center active:bg-gray-100"
            style={{ background: '#f5f6f7' }}>
            <FiArrowLeft size={20} color="#111" />
          </button>
          <div className="flex-1 min-w-0">
            <p style={{ ...F.pageTitle, color: '#111' }} className="truncate">
              {activeLabel || 'Categories'}
            </p>
            {!loading && selectedCategory && (
              <p style={{ ...F.pageSubtitle, color: '#9ca3af', marginTop: 2 }}>
                {products.length} products
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Main layout: sidebar + content ─────────────────────────────────── */}
      <div className="flex" style={{ height: 'calc(100vh - 73px)', overflow: 'hidden' }}>

        {/* ── Left: Category Sidebar ──────────────────────────────────────── */}
        <div className="flex-shrink-0 overflow-y-auto bg-white"
          style={{ width: 72, borderRight: '1px solid #e8e8e8' }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="mx-2 my-2 rounded-xl animate-pulse"
                  style={{ height: 60, background: '#f0f0f0' }} />
              ))
            : categories.map((cat, i) => {
                const isActive = selectedCategory?.id === cat.id;
                const pal = getPal(i);
                const [iErr, setIErr] = useState(false);
                return (
                  <button key={cat.id} onClick={() => handleCategorySelect(cat)}
                    className="w-full flex flex-col items-center py-3 px-1 relative transition-colors"
                    style={{ background: isActive ? '#fff' : 'transparent',
                             borderLeft: `3px solid ${isActive ? pal : 'transparent'}` }}>
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden mb-1"
                      style={{ background: isActive ? `${pal}18` : '#f5f6f7',
                               border: `1.5px solid ${isActive ? pal : '#e5e7eb'}` }}>
                      {cat.icon && !iErr ? (
                        <img src={cat.icon} alt={cat.name}
                          className="w-full h-full object-cover"
                          onError={() => setIErr(true)} />
                      ) : (
                        <span style={{ fontSize: 18 }}>📦</span>
                      )}
                    </div>
                    <span style={{
                      fontSize: 9, fontWeight: isActive ? 700 : 500,
                      color: isActive ? pal : '#6b7280',
                      textAlign: 'center', lineHeight: 1.2,
                      maxWidth: 60, overflow: 'hidden',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {cat.name}
                    </span>
                  </button>
                );
              })
          }
        </div>

        {/* ── Right: Content ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#f5f6f7' }}>

          {/* SubCategories horizontal scroll */}
          {subCategories.length > 0 && (
            <div className="bg-white mb-2 px-3 py-3"
              style={{ borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ ...F.sectionTitle, color: '#374151', marginBottom: 8 }}>Sub Categories</p>
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {subCategories.map((sub) => (
                  <CategoryChip key={sub.id} item={sub}
                    selected={selectedSubCategory?.id === sub.id}
                    onClick={() => handleSubCategorySelect(sub)} />
                ))}
              </div>
            </div>
          )}

          {/* Child categories horizontal scroll */}
          {childCategories.length > 0 && (
            <div className="bg-white mb-2 px-3 py-3"
              style={{ borderBottom: '1px solid #e8e8e8' }}>
              <p style={{ ...F.sectionTitle, color: '#374151', marginBottom: 8 }}>Refine by</p>
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {childCategories.map((child) => (
                  <CategoryChip key={child.id} item={child}
                    selected={selectedChildCategory?.id === child.id}
                    onClick={() => handleChildCategorySelect(child)} />
                ))}
              </div>
            </div>
          )}

          {/* Products grid */}
          <div className="p-3">
            {/* Section header */}
            {(products.length > 0 || productsLoading) && (
              <div className="flex items-center justify-between mb-3">
                <p style={{ ...F.sectionTitle, color: '#374151' }}>{activeLabel} Products</p>
                {productsLoading
                  ? <span style={{ ...F.pageSubtitle, color: '#9ca3af' }}>Loading...</span>
                  : <span style={{ ...F.pageSubtitle, color: '#9ca3af' }}>{products.length} items</span>
                }
              </div>
            )}

            {/* Skeleton */}
            {productsLoading && (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonProduct key={i} />)}
              </div>
            )}

            {/* Product cards */}
            {!productsLoading && products.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                ))}
              </div>
            )}

            {/* Empty */}
            {!productsLoading && products.length === 0 && selectedCategory && (
              <div className="flex flex-col items-center justify-center pt-16 gap-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: '#f3f4f6', fontSize: 28 }}>📦</div>
                <p style={{ ...F.emptyTitle, color: '#1f2937', textAlign: 'center' }}>
                  Koi product nahi mila
                </p>
                <p style={{ ...F.emptySubtitle, color: '#9ca3af', textAlign: 'center' }}>
                  Dusri category try karo
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}