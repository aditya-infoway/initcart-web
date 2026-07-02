import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { publicAxios } from "../../api/axios";
import {
  FiArrowLeft, FiSearch, FiX, FiStar,
  FiMapPin, FiShoppingBag, FiAward, FiChevronRight
} from "react-icons/fi";

// ── Global font tokens — same across all mobile pages ────────────────────────
const F = {
  pageTitle:    "text-[16px] font-bold",
  pageSubtitle: "text-[11px]",
  searchInput:  "text-[13px]",
  cardTitle:    "text-[14px] font-semibold",
  cardSub:      "text-[11px]",
  cardMeta:     "text-[11px]",
  badge:        "text-[10px] font-semibold",
  pill:         "text-[11px] font-semibold",
  statNum:      "text-[13px] font-bold",
  statLabel:    "text-[9px]",
  emptyTitle:   "text-[15px] font-bold",
  emptySubtitle:"text-[12px]",
};

// ── Vendor type color map ─────────────────────────────────────────────────────
const TYPE_COLORS = {
  electronics: { bg: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
  fashion:     { bg: "#fce4ec", text: "#c62828", border: "#f48fb1" },
  home:        { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
  sports:      { bg: "#fff3e0", text: "#e65100", border: "#ffcc80" },
  beauty:      { bg: "#f3e5f5", text: "#6a1b9a", border: "#ce93d8" },
  food:        { bg: "#e0f7fa", text: "#00695c", border: "#80deea" },
  health:      { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
  book:        { bg: "#fff8e1", text: "#f57f17", border: "#ffe082" },
  auto:        { bg: "#eceff1", text: "#455a64", border: "#b0bec5" },
  default:     { bg: "#f3f4f6", text: "#374151", border: "#d1d5db" },
};
const getTypeColor = (type) =>
  TYPE_COLORS[type?.toLowerCase()] || TYPE_COLORS.default;

// ── Vendor emoji fallback ─────────────────────────────────────────────────────
const getEmoji = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("tech") || n.includes("electronic")) return "💻";
  if (n.includes("fashion") || n.includes("cloth")) return "👗";
  if (n.includes("home") || n.includes("furni")) return "🏠";
  if (n.includes("sport")) return "⚽";
  if (n.includes("beauty")) return "💄";
  if (n.includes("food")) return "🍕";
  if (n.includes("health")) return "🏥";
  if (n.includes("book")) return "📚";
  if (n.includes("auto") || n.includes("car")) return "🚗";
  return "🏪";
};

const getImgUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://api.initcart.in${path.startsWith("/") ? "" : "/"}${path}`;
};

// ── Star Rating Row ───────────────────────────────────────────────────────────
function Stars({ rating = 0, count = 0 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <FiStar
            key={s}
            size={10}
            className={s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
      <span className={`${F.badge} text-gray-400`}>({count})</span>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div
      className="mx-4 mb-3 rounded-2xl overflow-hidden animate-pulse"
      style={{ background: "#f0f0f0", height: 100 }}
    />
  );
}

// ── Vendor Row Card ───────────────────────────────────────────────────────────
function VendorCard({ vendor }) {
  const [imgErr, setImgErr] = useState(false);
  const col = getTypeColor(vendor.vendor_type);
  const logoSrc = getImgUrl(vendor.store_logo);
  const hasLogo = logoSrc && !imgErr;

  return (
    <Link
      to={`/vendor/${vendor.id}`}
      className="flex items-stretch mx-4 mb-3 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform duration-150 select-none bg-white"
      style={{
        boxShadow: "0 1px 6px 0 rgba(0,0,0,0.07)",
        border: `1px solid ${col.border}`,
      }}
    >
      {/* Left accent bar */}
      <div className="w-1 flex-shrink-0" style={{ background: col.text }} />

      {/* Logo */}
      <div className="flex-shrink-0 flex items-center justify-center m-3">
        <div
          className="w-[56px] h-[56px] rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: col.bg, border: `1.5px solid ${col.border}` }}
        >
          {hasLogo ? (
            <img
              src={logoSrc}
              alt={vendor.business_name}
              className="w-full h-full object-cover"
              onError={() => setImgErr(true)}
            />
          ) : (
            <span className="text-2xl">{getEmoji(vendor.business_name)}</span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 py-3 pr-1">
        {/* Name + type badge */}
        <div className="flex items-start gap-1.5 flex-wrap pr-1">
          <p
            className={`${F.cardTitle} text-gray-900 leading-tight truncate`}
            style={{ maxWidth: "60%" }}
          >
            {vendor.business_name}
          </p>
          <span
            className={`${F.badge} px-2 py-0.5 rounded-full flex-shrink-0`}
            style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}
          >
            {vendor.vendor_type || "General"}
          </span>
        </div>

        {/* Stars */}
        <div className="mt-1">
          <Stars rating={vendor.rating} count={vendor.review_count} />
        </div>

        {/* Location + owner */}
        <div className="flex items-center gap-3 mt-1.5">
          <span className={`${F.cardMeta} text-gray-400 flex items-center gap-0.5`}>
            <FiMapPin size={10} />
            {vendor.city || "—"}, {vendor.state || ""}
          </span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: col.bg }}
            >
              <FiShoppingBag size={10} color={col.text} />
            </div>
            <span className={`${F.statNum} text-gray-700`}>{vendor.product_count ?? 0}</span>
            <span className={`${F.statLabel} text-gray-400 uppercase tracking-wide`}>Products</span>
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-1">
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#e8f5e9" }}
            >
              <FiAward size={10} color="#2e7d32" />
            </div>
            <span className={`${F.statNum} text-gray-700`}>{vendor.order_count ?? 0}</span>
            <span className={`${F.statLabel} text-gray-400 uppercase tracking-wide`}>Orders</span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex items-center pr-3 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: col.bg }}
        >
          <FiChevronRight size={15} color={col.text} />
        </div>
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MobileSellerListPage() {
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeType, setActiveType] = useState("All");

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await publicAxios.get("/ecommerce/public/vendors/");
      if (res.data && Array.isArray(res.data)) {
        const active = res.data
          .filter((v) => v.status === "active" && v.is_approved === true)
          .map((v) => ({
            id: v.id,
            business_name: v.business_name,
            owner_name: v.owner_name,
            vendor_type: v.vendor_type,
            vendor_subtype: v.vendor_subtype,
            store_logo: v.store_logo_url || v.store_logo,
            city: v.city,
            state: v.state,
            product_count: v.product_count || 0,
            order_count: v.order_count || 0,
            rating: v.rating || 4.5,
            review_count: v.review_count || 0,
          }));
        setVendors(active);
      }
    } catch {
      setError("Vendors load nahi hue.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { fetchVendors(); }, []);

  // ── Filter type pills ────────────────────────────────────────────────────
  const types = useMemo(() => {
    const t = [...new Set(vendors.map((v) => v.vendor_type).filter(Boolean))];
    return ["All", ...t];
  }, [vendors]);

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      const q = query.toLowerCase();
      const matchQ =
        v.business_name?.toLowerCase().includes(q) ||
        v.owner_name?.toLowerCase().includes(q) ||
        v.city?.toLowerCase().includes(q);
      const matchT = activeType === "All" || v.vendor_type === activeType;
      return matchQ && matchT;
    });
  }, [vendors, query, activeType]);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#f5f6f7" }}>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 bg-white" style={{ boxShadow: "0 1px 0 #e8e8e8" }}>

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center active:bg-gray-100"
            style={{ background: "#f5f6f7" }}
          >
            <FiArrowLeft size={20} color="#111" />
          </button>
          <div className="flex-1 min-w-0">
            <p className={`${F.pageTitle} text-gray-900`}>Our Sellers</p>
            {!loading && (
              <p className={`${F.pageSubtitle} text-gray-400 mt-0.5`}>
                {vendors.length} trusted vendors
              </p>
            )}
          </div>
        </div>

        {/* Search */}
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
              type="text"
              placeholder="Search by name, owner, city..."
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

        {/* Type filter pills */}
        {!loading && types.length > 1 && (
          <div
            className="flex gap-1.5 px-4 pb-3 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {types.map((t) => {
              const col = getTypeColor(t);
              const isActive = activeType === t;
              return (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full ${F.pill} transition-all duration-200 capitalize`}
                  style={
                    isActive
                      ? { background: col.text, color: "#fff" }
                      : { background: "#f5f6f7", color: "#6b7280", border: "1px solid #e5e7eb" }
                  }
                >
                  {t}
                </button>
              );
            })}
          </div>
        )}

        {/* Result count when filtering */}
        {(query || activeType !== "All") && !loading && (
          <div className="px-4 pb-2">
            <p className={`${F.pageSubtitle} text-gray-400`}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
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
            onClick={fetchVendors}
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
          {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      )}

      {/* ── Empty ──────────────────────────────────────────────────────────── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-32 px-8 gap-3">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#f3f4f6" }}>🏪</div>
          <p className={`${F.emptyTitle} text-gray-800 text-center`}>
            {query ? `"${query}" nahi mila` : "Koi vendor nahi mila"}
          </p>
          <p className={`${F.emptySubtitle} text-gray-400 text-center`}>
            Dusra search ya filter try karo
          </p>
          <button
            onClick={() => { setQuery(""); setActiveType("All"); }}
            className={`mt-1 ${F.pill} text-green-700`}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* ── Vendor List ────────────────────────────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="pt-4">
          {filtered.map((v) => (
            <VendorCard key={v.id} vendor={v} />
          ))}
        </div>
      )}

      <style>{`* { -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}