import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { publicAxios } from "../api/axios";

const AUTO_DELAY = 3000;      // har 3 sec me auto slide
const RESUME_AFTER = 4000;    // interaction ke 4 sec baad auto slide wapas chalu
const MAX_ITEMS = 12;
const BASE = "http://localhost:8000/";

const imgUrl = (p) => {
  const path =
    p?.main_image_url ||
    p?.main_image ||
    p?.thumbnail_image_url ||
    p?.thumbnail_image;
  if (!path)
    return "https://placehold.co/300x300/f0f4f8/94a3b8?text=Product";
  return path.startsWith("http") ? path : BASE + path.replace(/^\//, "");
};

// Response chahe array ho, ya {results|products|data|items: []}, sab handle karega
const extractList = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  for (const key of ["results", "products", "data", "items"]) {
    if (Array.isArray(data[key])) return data[key];
    // nested: data.data.results jaisa case
    if (data[key] && typeof data[key] === "object") {
      const inner = extractList(data[key]);
      if (inner.length) return inner;
    }
  }
  // last fallback: pehla array jo bhi mile
  const firstArray = Object.values(data).find(Array.isArray);
  return firstArray || [];
};

// paginated ho to next pages bhi laata hai (max 5 pages)
const fetchAllProducts = async () => {
  let url = "ecommerce/public/products/";
  let all = [];
  for (let page = 0; page < 5 && url; page++) {
    const res = await publicAxios.get(url);
    all = all.concat(extractList(res.data));
    url =
      res.data && !Array.isArray(res.data) && res.data.next
        ? res.data.next
        : null;
  }
  return all;
};

const same = (a, b) => a != null && b != null && String(a) === String(b);

// subsubcategory -> subcategory -> category fallback
const pickRelated = (all, current) => {
  const others = all.filter(
    (p) => !same(p.id, current.id) && (!p.status || p.status === "approved")
  );

  const levels = [
    { key: "subsubcategory", label: "Related products" },
    { key: "subcategory", label: "Related products" },
    { key: "category", label: "Related products" },
  ];

  for (const { key, label } of levels) {
    if (current[key] == null) continue;
    const list = others.filter((p) => same(p[key], current[key]));
    if (list.length > 0) return { items: list.slice(0, MAX_ITEMS), label };
  }
  return { items: [], label: "" };
};

export default function RelatedProductSlider({ product }) {
  const [items, setItems] = useState([]);
  const [label, setLabel] = useState("Related Products");
  const [loading, setLoading] = useState(true);

  const [visibleCount, setVisibleCount] = useState(4);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);

  const busy = useRef(false);
  const hovering = useRef(false);
  const pausedUntil = useRef(0);

  // ---------- fetch + filter ----------
  useEffect(() => {
    if (!product?.id) return;
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const all = await fetchAllProducts(); // <- naya
        console.log(
          "Related: total products =",
          all.length,
          "| current =",
          product.id
        );

        const { items, label } = pickRelated(all, product);
        if (mounted) {
          setItems(items);
          setLabel(label || "Related Products");
        }
      } catch (e) {
        console.error("Related products error:", e);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [
    product?.id,
    product?.subsubcategory,
    product?.subcategory,
    product?.category,
  ]);

  // ---------- responsive ----------
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w < 640 ? 1 : w < 1024 ? 2 : w < 1280 ? 3 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const n = items.length;
  const canSlide = n > visibleCount;

  // Infinite loop ke liye dono side clones: [last k] + items + [first k]
  const extended = useMemo(() => {
    if (!canSlide) return items;
    const k = visibleCount;
    return [...items.slice(-k), ...items, ...items.slice(0, k)];
  }, [items, visibleCount, canSlide]);

  // items / screen size change pe start position reset (bina animation)
  useEffect(() => {
    busy.current = false;
    setAnimate(false);
    setIndex(canSlide ? visibleCount : 0);
  }, [n, visibleCount, canSlide]);

  // ---------- movement ----------
  const move = useCallback(
    (dir) => {
      if (!canSlide || busy.current) return;
      busy.current = true;
      setAnimate(true);
      setIndex((i) => i + dir);
    },
    [canSlide]
  );

  // Clone pe pahunchte hi chup-chaap real item pe jump (user ko wapas travel dikhta nahi)
  const handleTransitionEnd = (e) => {
    if (e.target !== e.currentTarget) return;
    const k = visibleCount;
    if (index >= k + n) {
      setAnimate(false);
      setIndex(index - n);
    } else if (index < k) {
      setAnimate(false);
      setIndex(index + n);
    }
    busy.current = false;
  };

  // ---------- pause / resume ----------
  const pauseFor = (ms = RESUME_AFTER) => {
    pausedUntil.current = Date.now() + ms;
  };

  const handleArrow = (dir) => {
    pauseFor();
    move(dir);
  };

  useEffect(() => {
    if (!canSlide) return;
    const timer = setInterval(() => {
      if (hovering.current) return;
      if (Date.now() < pausedUntil.current) return;
      if (document.hidden) return;
      move(1);
    }, AUTO_DELAY);
    return () => clearInterval(timer);
  }, [canSlide, move]);

  // ---------- render ----------
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-7 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (n === 0) return null; // koi related product nahi to section hi hide

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-4">{label}</h2>

      <div
        className="relative"
        onMouseEnter={() => {
          hovering.current = true;
        }}
        onMouseLeave={() => {
          hovering.current = false;
          pauseFor(1500);
        }}
        onTouchStart={() => pauseFor()}
        onWheel={() => pauseFor()}
      >
        {canSlide && (
          <button
            onClick={() => handleArrow(-1)}
            aria-label="Previous"
            className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white w-9 h-9 rounded-full shadow hover:bg-gray-100 z-10"
          >
            &#8592;
          </button>
        )}

        <div className="overflow-hidden">
          <div
            className="flex"
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translateX(-${index * (100 / visibleCount)}%)`,
              transition: animate ? "transform 500ms ease-in-out" : "none",
            }}
          >
            {extended.map((p, i) => {
              const stock = p.stocks?.[0];
              const price = stock?.final_price || stock?.selling_price;
              const mrp = stock?.mrp;
              return (
                <div
                  key={`${p.id}-${i}`}
                  className="shrink-0 px-2"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <Link
                    to={`/product/${p.id}`}
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition"
                  >
                    <img
                      src={imgUrl(p)}
                      alt={p.product_name}
                      className="w-full h-48 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/300x300/f0f4f8/94a3b8?text=Product";
                      }}
                    />
                    <h3 className="mt-2 font-medium line-clamp-1">
                      {p.product_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-blue-600 font-semibold">
                        ₹{price ? parseFloat(price).toFixed(2) : "0.00"}
                      </p>
                      {mrp && parseFloat(mrp) > parseFloat(price || 0) && (
                        <p className="text-xs text-gray-400 line-through">
                          ₹{parseFloat(mrp).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {canSlide && (
          <button
            onClick={() => handleArrow(1)}
            aria-label="Next"
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white w-9 h-9 rounded-full shadow hover:bg-gray-100 z-10"
          >
            &#8594;
          </button>
        )}
      </div>
    </div>
  );
}