// MobileBrandSlider.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { publicAxios } from "../api/axios";

const getImageUrl = (image) => {
  if (!image) return "https://placehold.co/400x400/f0f4f8/94a3b8?text=Brand";
  if (image.startsWith("http")) return image;
  const cleanPath = image.replace(/^\/+/, "");
  return `https://api.initcart.in/media/${cleanPath}`;
};

const CLONE_COUNT = 4;

const MobileBrandSlider = () => {
  const [brandsData, setBrandsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollRef       = useRef(null);
  const autoTimer       = useRef(null);   // setInterval handle
  const resumeTimer     = useRef(null);   // setTimeout handle for 2-sec resume
  const isUserActive    = useRef(false);  // finger/mouse down hai?
  const isTeleporting   = useRef(false);  // silent jump chal raha hai?

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const res = await publicAxios.get("/ecommerce/public/brands/");
        const mapped = res.data
          .filter((b) => b.status === "active")
          .map((b) => ({
            id: b.id,
            name: b.brand_name,
            img: b.brand_logo_url,
            product_count: b.product_count || 0,
          }));
        setBrandsData(
          Array.from(new Map(mapped.map((b) => [b.id, b])).values())
        );
      } catch {
        setBrandsData([
          { id: 1, name: "Nike",    img: null, product_count: 245 },
          { id: 2, name: "Adidas",  img: null, product_count: 189 },
          { id: 3, name: "Puma",    img: null, product_count: 134 },
          { id: 4, name: "Apple",   img: null, product_count: 567 },
          { id: 5, name: "Samsung", img: null, product_count: 432 },
          { id: 6, name: "Sony",    img: null, product_count: 298 },
          { id: 7, name: "LG",      img: null, product_count: 176 },
          { id: 8, name: "Canon",   img: null, product_count: 98  },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // ── Clone list ─────────────────────────────────────────────────────────────
  const displayList =
    brandsData.length > 0
      ? [
          ...brandsData.slice(-CLONE_COUNT),
          ...brandsData,
          ...brandsData.slice(0, CLONE_COUNT),
        ]
      : [];

  // ── Step = card width + gap ────────────────────────────────────────────────
  const getStep = useCallback(() => {
    const el = scrollRef.current?.children[0];
    return el ? el.offsetWidth + 8 : 108;
  }, []);

  // ── Jump to real-first card on mount ───────────────────────────────────────
  const jumpToReal = useCallback(() => {
    const el = scrollRef.current;
    if (!el || brandsData.length === 0) return;
    isTeleporting.current = true;
    el.scrollLeft = CLONE_COUNT * getStep();
    requestAnimationFrame(() => { isTeleporting.current = false; });
  }, [brandsData.length, getStep]);

  useEffect(() => {
    if (brandsData.length > 0) {
      const t = setTimeout(jumpToReal, 60);
      return () => clearTimeout(t);
    }
  }, [brandsData.length, jumpToReal]);

  // ── Scroll → teleport when clone zone detect ho ────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || brandsData.length === 0) return;

    const onScroll = () => {
      if (isTeleporting.current) return;
      const step      = getStep();
      const realStart = CLONE_COUNT * step;
      const realEnd   = realStart + brandsData.length * step;

      if (el.scrollLeft >= realEnd) {
        isTeleporting.current = true;
        el.scrollLeft -= brandsData.length * step;
        requestAnimationFrame(() => { isTeleporting.current = false; });
      } else if (el.scrollLeft < realStart) {
        isTeleporting.current = true;
        el.scrollLeft += brandsData.length * step;
        requestAnimationFrame(() => { isTeleporting.current = false; });
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [brandsData.length, getStep]);

  // ── Auto-scroll: cards left scroll (right se aate hain) ───────────────────
  const startAutoScroll = useCallback(() => {
    clearInterval(autoTimer.current);
    if (!scrollRef.current || brandsData.length <= 3) return;

    autoTimer.current = setInterval(() => {
      // Sirf tab scroll karo jab user active nahi hai
      if (!isUserActive.current && scrollRef.current) {
        scrollRef.current.scrollBy({ left: getStep(), behavior: "smooth" });
      }
    }, 2500);
  }, [brandsData.length, getStep]);

  useEffect(() => {
    if (brandsData.length > 0) {
      const t = setTimeout(startAutoScroll, 250);
      return () => {
        clearTimeout(t);
        clearInterval(autoTimer.current);
      };
    }
  }, [brandsData.length, startAutoScroll]);

  // ── Interaction handlers ───────────────────────────────────────────────────
  // Touch/mouse START: auto-scroll band karo, resume timer clear karo
  const onStart = useCallback(() => {
    isUserActive.current = true;
    clearInterval(autoTimer.current);
    autoTimer.current = null;
    clearTimeout(resumeTimer.current);
  }, []);

  // Touch/mouse MOVE: resume timer reset karo (jab tak hil raha hai, wait karo)
  const onMove = useCallback(() => {
    if (!isUserActive.current) return;
    clearTimeout(resumeTimer.current); // timer reset karo mid-scroll
  }, []);

  // Touch/mouse END: finger uthate hi 2 sec ka timer shuru
  // Jab timer fire hoga, usi jagah se auto-scroll resume hoga
  const onEnd = useCallback(() => {
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      isUserActive.current = false;
      // scrollRef.current.scrollLeft abhi bhi wahi hai jahan user ne chhoda tha
      // startAutoScroll sirf interval set karta hai, scrollLeft touch nahi karta
      startAutoScroll();
    }, 2000);
  }, [startAutoScroll]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[30%] text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-12 mx-auto mt-2 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (brandsData.length === 0) return null;

  return (
    <div className="px-3 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
          <h2 className="text-sm font-semibold text-gray-800">Popular Brands</h2>
        </div>
        <Link
          to="/brandlist"
          className="text-[10px] text-blue-500 font-medium hover:text-blue-600 transition"
        >
          View All →
        </Link>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto flex gap-2 pb-1"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
        onMouseDown={onStart}
        onMouseMove={onMove}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}  // mouse container se bahar chala jaye toh bhi resume
      >
        {displayList.map((brand, index) => (
          <Link
            key={`${brand.id}-${index}`}
            to={`/brand-products/?brand=${brand.id}`}
            className="flex-shrink-0 w-[30%] text-center group"
            draggable={false}
          >
            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm group-hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                {brand.img ? (
                  <img
                    src={getImageUrl(brand.img)}
                    alt={brand.name}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://picsum.photos/seed/brand${brand.id}/100/100`;
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-[11px] font-semibold text-gray-800 mt-2 truncate group-hover:text-blue-600 transition">
                {brand.name}
              </h3>
              <p className="text-[9px] text-gray-400 mt-0.5">
                {brand.product_count}+ items
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileBrandSlider;