import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { publicAxios } from "../../api/axios";

const BASE = "http://localhost:8000/";
const imgUrl = (p) => {
  const path = p?.main_image_url || p?.main_image || p?.thumbnail_image_url || p?.thumbnail_image;
  if (!path) return "https://placehold.co/300x300/f0f4f8/94a3b8?text=Product";
  return path.startsWith("http") ? path : BASE + path.replace(/^\//, "");
};

const extractList = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of ["results", "products", "data", "items"]) {
    if (Array.isArray(data[key])) return data[key];
    if (data[key] && typeof data[key] === "object") {
      const inner = extractList(data[key]);
      if (inner.length) return inner;
    }
  }
  const firstArray = Object.values(data).find(Array.isArray);
  return firstArray || [];
};

const fetchAllProducts = async () => {
  let url = "ecommerce/public/products/";
  let all = [];
  for (let page = 0; page < 5 && url; page++) {
    const res = await publicAxios.get(url);
    all = all.concat(extractList(res.data));
    url = res.data && !Array.isArray(res.data) && res.data.next ? res.data.next : null;
  }
  return all;
};

const same = (a, b) => a != null && b != null && String(a) === String(b);

const pickRelated = (all, current) => {
  const others = all.filter((p) => !same(p.id, current.id) && (!p.status || p.status === "approved"));
  const levels = [{ key: "subsubcategory" }, { key: "subcategory" }, { key: "category" }];
  for (const { key } of levels) {
    if (current[key] == null) continue;
    const list = others.filter((p) => same(p[key], current[key]));
    if (list.length > 0) return list.slice(0, 12);
  }
  return [];
};

// ─── Font Tokens ──────────────────────────────────────────────────────────
const F = {
  badge: { fontSize: 10, fontWeight: 600 },
  cardTitle: { fontSize: 12, fontWeight: 600 },
  cardSub: { fontSize: 11, fontWeight: 400 },
  statNum: { fontSize: 13, fontWeight: 700 },
  sectionLetter: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 },
};

export default function MobileRelatedProducts({ product }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!product?.id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const all = await fetchAllProducts();
        const related = pickRelated(all, product);
        if (mounted) setItems(related);
      } catch (err) {
        console.error("Related products error:", err);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [product?.id, product?.subsubcategory, product?.subcategory, product?.category]);

  if (loading) {
    return (
      <div style={{ padding: '0 14px' }}>
        <div style={{ display: 'flex', gap: 10, overflow: 'hidden' }}>
          {[1, 2, 3].map(i => (
             <div key={i} style={{ width: '48%', flexShrink: 0 }}>
               <div style={{ height: 140, borderRadius: 10, background: '#E2E8F0', marginBottom: 8 }} className="animate-pulse" />
               <div style={{ height: 12, width: '80%', background: '#E2E8F0', marginBottom: 6 }} className="animate-pulse" />
               <div style={{ height: 12, width: '50%', background: '#E2E8F0' }} className="animate-pulse" />
             </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          padding: '0 14px 10px',
          scrollbarWidth: 'none',
          scrollSnapType: 'x mandatory',
        }}
      >
        {items.map((p) => {
          const stock = p.stocks?.[0];
          const price = stock?.final_price || stock?.selling_price;
          const mrp = stock?.mrp;
          const hasDiscount = mrp && parseFloat(mrp) > parseFloat(price || 0);

          return (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                flexShrink: 0,
                width: 'calc(50% - 6px)', // Exactly 2 items per row
                scrollSnapAlign: 'start',
                textDecoration: 'none',
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #EEEFF2',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: 140, width: '100%', background: '#F7F9FC', overflow: 'hidden' }}>
                <img
                  src={imgUrl(p)}
                  alt={p.product_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/300x300/f0f4f8/94a3b8?text=Product";
                  }}
                />
              </div>
              <div style={{ padding: '10px' }}>
                <h3 style={{ ...F.cardTitle, color: '#1A1D23', margin: '0 0 4px', lineHeight: '16px', height: 32, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {p.product_name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ ...F.statNum, color: '#2563EB' }}>
                    ₹{price ? parseFloat(price).toFixed(2) : "0.00"}
                  </span>
                  {hasDiscount && (
                    <span style={{ ...F.badge, color: '#A0AABC', textDecoration: 'line-through' }}>
                      ₹{parseFloat(mrp).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}