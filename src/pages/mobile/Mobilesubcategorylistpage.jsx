import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axios";
import { FiArrowLeft, FiSearch, FiX, FiChevronRight } from "react-icons/fi";

// ── Global font tokens — SAME across all mobile pages ────────────────────────
const F = {
  pageTitle:    "text-[16px] font-bold",
  pageSubtitle: "text-[11px]",
  searchInput:  "text-[13px]",
  cardTitle:    "text-[14px] font-semibold",
  cardSub:      "text-[11px]",
  pill:         "text-[11px] font-semibold",
  badge:        "text-[10px] font-semibold",
  emptyTitle:   "text-[15px] font-bold",
  emptySubtitle:"text-[12px]",
};

// ── Palette per card (cycles) ─────────────────────────────────────────────────
const PALETTES = [
  { from: "#e8f5e9", to: "#f1f8f2", accent: "#2e7d32", tag: "#c8e6c9" },
  { from: "#e3f2fd", to: "#f0f7ff", accent: "#1565c0", tag: "#bbdefb" },
  { from: "#fce4ec", to: "#fff0f4", accent: "#c62828", tag: "#f8bbd0" },
  { from: "#fff3e0", to: "#fff8f0", accent: "#e65100", tag: "#ffe0b2" },
  { from: "#f3e5f5", to: "#faf0fb", accent: "#6a1b9a", tag: "#e1bee7" },
  { from: "#e0f7fa", to: "#f0fdff", accent: "#00695c", tag: "#b2ebf2" },
  { from: "#fafafa", to: "#fff",    accent: "#424242", tag: "#eeeeee" },
];
const getPalette = (i) => PALETTES[i % PALETTES.length];

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="mx-4 mb-3 rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "#f0f0f0", height: 80 }} />
  );
}

// ── Category Row Card ─────────────────────────────────────────────────────────
function CategoryRow({ subCat, index }) {
  const [imgErr, setImgErr] = useState(false);
  const pal = getPalette(index);
  const fallback = `https://picsum.photos/seed/sub${subCat.id}/200/200`;
  const src = imgErr ? fallback : subCat.icon_url || fallback;

  return (
    <Link
      to={`/category-products/?subcategory=${subCat.id}`}
      className="flex items-center mx-4 mb-3 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform duration-150 select-none"
      style={{
        background: `linear-gradient(120deg, ${pal.from} 0%, ${pal.to} 100%)`,
        border: `1px solid ${pal.tag}`,
        boxShadow: "0 1px 4px 0 rgba(0,0,0,0.06)",
      }}
    >
      {/* Image */}
      <div
        className="flex-shrink-0 m-3 rounded-xl overflow-hidden"
        style={{
          width: 56,
          height: 56,
          border: `2px solid ${pal.tag}`,
          background: "#fff",
        }}
      >
        <img
          src={src}
          alt={subCat.name}
          className="w-full h-full object-cover"
          onError={() => setImgErr(true)}
          loading="lazy"
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 py-3 pr-1">
        <p
          className={`${F.cardTitle} text-gray-900 leading-tight truncate`}
          style={{ color: pal.accent }}
        >
          {subCat.name}
        </p>
        <p className={`${F.cardSub} mt-0.5`} style={{ color: `${pal.accent}99` }}>
          {subCat.product_count ?? 0} products available
        </p>
        {/* Tag chip */}
        <span
          className={`inline-block mt-1.5 px-2 py-0.5 rounded-full ${F.badge}`}
          style={{ background: pal.tag, color: pal.accent }}
        >
          Shop now
        </span>
      </div>

      {/* Arrow */}
      <div className="pr-4 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: pal.tag }}
        >
          <FiChevronRight size={15} color={pal.accent} />
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MobileSubCategoryListPage() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await publicAxios.get("/ecommerce/public/subcategories/");
        setSubCategories(res.data || []);
      } catch {
        setError("Categories load nahi hui.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = subCategories.filter((s) =>
    s.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: "#f5f6f7" }}>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white" style={{ boxShadow: "0 1px 0 #e8e8e8" }}>

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center active:bg-gray-100 transition-colors"
            style={{ background: "#f5f6f7" }}
          >
            <FiArrowLeft size={20} color="#111" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={`${F.pageTitle} text-gray-900`}>All Categories</p>
            {!loading && (
              <p className={`${F.pageSubtitle} text-gray-400 mt-0.5`}>
                {subCategories.length} categories
              </p>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-200"
            style={{
              background: searchFocused ? "#fff" : "#f5f6f7",
              border: `1.5px solid ${searchFocused ? "#22c55e" : "transparent"}`,
            }}
          >
            <FiSearch size={16} color={searchFocused ? "#22c55e" : "#9ca3af"} />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`flex-1 bg-transparent outline-none ${F.searchInput} text-gray-800 placeholder-gray-400`}
            />
            {query && (
              <button
                onMouseDown={(e) => { e.preventDefault(); setQuery(""); }}
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#e5e7eb" }}
              >
                <FiX size={11} color="#6b7280" />
              </button>
            )}
          </div>
        </div>

        {/* Result count strip when searching */}
        {query.length > 0 && !loading && (
          <div className="px-4 pb-2">
            <p className={`${F.pageSubtitle} text-gray-400`}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
            </p>
          </div>
        )}
      </div>

      {/* ── Error ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex flex-col items-center justify-center pt-32 px-8 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#fee2e2" }}>😕</div>
          <p className={`${F.emptyTitle} text-gray-700 text-center`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-2.5 rounded-xl ${F.pill} text-white`}
            style={{ background: "#16a34a" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Skeleton ───────────────────────────────────────────────────────── */}
      {loading && (
        <div className="pt-4">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {/* ── Empty search ───────────────────────────────────────────────────── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-32 px-8 gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#f3f4f6" }}>🔍</div>
          <p className={`${F.emptyTitle} text-gray-800 text-center`}>"{query}" nahi mila</p>
          <p className={`${F.emptySubtitle} text-gray-400 text-center`}>Dusra naam try karo</p>
          <button
            onClick={() => setQuery("")}
            className={`mt-1 ${F.pill} text-green-700`}
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Category List ──────────────────────────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="pt-4">
          {filtered.map((sub, i) => (
            <CategoryRow key={sub.id} subCat={sub} index={i} />
          ))}
        </div>
      )}

      <style>{`* { -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}