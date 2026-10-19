import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { publicAxios } from "../api/axios";

const hexToRgb = (hex) => {
  const h = /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#000000";
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
};

// Colour halka ho to text kala, gehra ho to text safed
const textColorFor = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#111111" : "#ffffff";
};

const overlayGradient = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  return `linear-gradient(to bottom, rgba(${r},${g},${b},0.92) 0%, rgba(${r},${g},${b},0.65) 45%, rgba(${r},${g},${b},0) 100%)`;
};

export default function SubCategorySlider() {
  const [itemsPerView, setItemsPerView] = useState(5);
  const [start, setStart] = useState(0);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overlayColor, setOverlayColor] = useState("#000000");

  // Fetch subcategories
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setLoading(true);
        const response = await publicAxios.get("/ecommerce/public/subcategories/");

        const mapped = response.data.map((subCat) => ({
          id: subCat.id,
          title: subCat.name,
          description: subCat.description || "",
          image:
            subCat.banner_url ||
            subCat.icon_url
        }));

        // Remove duplicates by id
        const unique = Array.from(new Map(mapped.map((i) => [i.id, i])).values());

        setSubCategories(unique);
        setError(null);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
        setError("Failed to load categories. Please try again later.");
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, []);

  // Fetch global overlay colour (separate effect, fail ho to bhi cards chalenge)
  useEffect(() => {
    const fetchColor = async () => {
      try {
        const res = await publicAxios.get("api/ecommerce/public/subcategory-section/");
        setOverlayColor(res.data?.overlay_color || "#000000");
      } catch (err) {
        console.error("Error fetching section colour:", err);
      }
    };
    fetchColor();
  }, []);

  // Responsive items per view (original same)
  useEffect(() => {
    const setFromWidth = () => {
      const w = window.innerWidth;
      if (w >= 1280) setItemsPerView(6);
      else if (w >= 1024) setItemsPerView(5);
      else if (w >= 768) setItemsPerView(3);
      else setItemsPerView(2);
    };
    setFromWidth();
    window.addEventListener("resize", setFromWidth);
    return () => window.removeEventListener("resize", setFromWidth);
  }, []);

  useEffect(() => setStart(0), [itemsPerView]);

  const canSlide = subCategories.length > itemsPerView;

  // Visible cards (wrap-around, no duplicates)
  const visible = useMemo(() => {
    const total = subCategories.length;
    if (total === 0) return [];
    const count = Math.min(itemsPerView, total);
    return Array.from({ length: count }).map(
      (_, i) => subCategories[(start + i) % total]
    );
  }, [start, itemsPerView, subCategories]);

  const prev = () => {
    if (!canSlide) return;
    setStart((s) => (s - 1 + subCategories.length) % subCategories.length);
  };

  const next = () => {
    if (!canSlide) return;
    setStart((s) => (s + 1) % subCategories.length);
  };

  // Auto-slide
  useEffect(() => {
    if (!canSlide) return;
    const id = setInterval(() => {
      setStart((s) => (s + 1) % subCategories.length);
    }, 7000);
    return () => clearInterval(id);
  }, [canSlide, subCategories.length]);

  // Loading state
  if (loading) {
    return (
      <section className="mt-10 overflow-hidden px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SHOP BY CATEGORIES</h2>
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: itemsPerView }).map((_, i) => (
            <div
              key={`loading-${i}`}
              className="aspect-[3/5] w-full bg-gray-200 animate-pulse rounded-2xl"
            />
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error && subCategories.length === 0) {
    return (
      <section className="mt-10 overflow-hidden px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SHOP BY CATEGORIES</h2>
        </div>
        <div className="text-center p-8 border border-red-200 bg-red-50 rounded-xl">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  // Empty state
  if (subCategories.length === 0) {
    return (
      <section className="mt-10 overflow-hidden px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">SHOP BY CATEGORIES</h2>
        </div>
        <div className="text-center p-8 border border-gray-200 bg-gray-50 rounded-xl">
          <p className="text-gray-600">No categories available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 overflow-hidden px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">SHOP BY CATEGORIES</h2>
        <Link
          to="/subcategorieslist"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View all
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="relative group/sub">
        <div
          className="grid gap-4 py-5"
          style={{ gridTemplateColumns: `repeat(${itemsPerView}, minmax(0, 1fr))` }}
        >
          {visible.map((subCat) => (
            <Link
              key={`${subCat.id}-${start}`}
              to={`/category-products/?subcategory=${subCat.id}`}
              className="group relative block aspect-[3/5] overflow-hidden rounded-2xl bg-gray-900 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Banner image */}
              <img
                src={subCat.image}
                alt={subCat.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://picsum.photos/seed/sub${subCat.id}/600/1000`;
                }}
              />

              {/* Dark layer for text visibility */}
              <div
                className="absolute inset-x-0 top-0 h-[70%] pointer-events-none"
                style={{ background: overlayGradient(overlayColor) }}
              />

              {/* Text */}
              <div
                className="absolute top-0 left-0 right-0 p-4"
                style={{ color: textColorFor(overlayColor) }}
              >
                <h3 className="text-sm font-semibold line-clamp-1">
                  {subCat.title}
                </h3>
                {subCat.description && (
                  <p className="mt-1 text-xs opacity-90 line-clamp-2">
                    {subCat.description}
                  </p>
                )}
                <span className="mt-2 inline-block text-xs font-medium border-b border-current/70 group-hover:border-current transition-colors">
                  SHOP NOW →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation buttons (original same) */}
        {canSlide && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-gray-200 transition-all duration-300 opacity-0 group-hover/sub:opacity-100 hover:bg-gray-50 hover:scale-110 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg border border-gray-200 transition-all duration-300 opacity-0 group-hover/sub:opacity-100 hover:bg-gray-50 hover:scale-110 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}