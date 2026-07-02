import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSearch, FiX, FiChevronRight, FiArrowRight } from "react-icons/fi";

// ── Asset imports — same as desktop ──────────────────────────────────────────
import realEstateIcon from "../../assets/service-icon/realestate.png";
import gymIcon from "../../assets/service-icon/gym.png";
import saloonIcon from "../../assets/service-icon/saloon.png";
import travelIcon from "../../assets/service-icon/travel-agency.png";
import financeIcon from "../../assets/service-icon/finance.png";
import techIcon from "../../assets/service-icon/tech-industry.png";
import hotelIcon from "../../assets/service-icon/hotel-resturant.png";
import healthcareIcon from "../../assets/service-icon/healthcare.png";
import educationIcon from "../../assets/service-icon/education.png";
import professionalIcon from "../../assets/service-icon/professional.png";
import workplaceIcon from "../../assets/service-icon/workplace.png";

// ── Global font tokens — SAME across ALL mobile pages ────────────────────────
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },   // Header title
  pageSubtitle: { fontSize: 11, fontWeight: 400 },   // Header subtitle / count
  searchInput:  { fontSize: 13, fontWeight: 400 },   // Search box
  cardTitle:    { fontSize: 14, fontWeight: 600 },   // Card main name
  cardSub:      { fontSize: 11, fontWeight: 400 },   // Card secondary info
  badge:        { fontSize: 10, fontWeight: 600 },   // Chips / tags
  pill:         { fontSize: 11, fontWeight: 600 },   // Filter pills
  statNum:      { fontSize: 13, fontWeight: 700 },   // Stat numbers
  statLabel:    { fontSize: 9,  fontWeight: 400 },   // Stat labels
  emptyTitle:   { fontSize: 15, fontWeight: 700 },   // Empty state title
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },   // Empty state desc
};

// ── Services data ─────────────────────────────────────────────────────────────
const ALL_SERVICES = [
  { id: 1,  title: "Real Estate",       keyword: "real estate",  path: "/realestatehome",    img: realEstateIcon,  accent: "#1565c0", light: "#e3f2fd", border: "#90caf9",  emoji: "🏠" },
  { id: 2,  title: "Gym & Fitness",     keyword: "gym,fitness",  path: "/gymhome",            img: gymIcon,         accent: "#c62828", light: "#fce4ec", border: "#f48fb1",  emoji: "💪" },
  { id: 3,  title: "Saloon & Beauty",   keyword: "salon,beauty", path: "/saloonhome",         img: saloonIcon,      accent: "#6a1b9a", light: "#f3e5f5", border: "#ce93d8",  emoji: "💇" },
  { id: 4,  title: "Travel Agency",     keyword: "travel",       path: "/travelhome",         img: travelIcon,      accent: "#00695c", light: "#e0f7fa", border: "#80deea",  emoji: "✈️" },
  { id: 5,  title: "Finance",           keyword: "finance",      path: "/financehome",        img: financeIcon,     accent: "#e65100", light: "#fff3e0", border: "#ffcc80",  emoji: "💰" },
  { id: 6,  title: "Tech Industry",     keyword: "technology",   path: "/techindustryhome",   img: techIcon,        accent: "#1565c0", light: "#e3f2fd", border: "#90caf9",  emoji: "💻" },
  { id: 7,  title: "Hotel & Restaurant",keyword: "hotel",        path: "/hotelhome",          img: hotelIcon,       accent: "#f57f17", light: "#fff8e1", border: "#ffe082",  emoji: "🍽️" },
  { id: 8,  title: "Healthcare",        keyword: "healthcare",   path: "/helthcarehome",      img: healthcareIcon,  accent: "#2e7d32", light: "#e8f5e9", border: "#a5d6a7",  emoji: "🏥" },
  { id: 9,  title: "Education",         keyword: "education",    path: "/educationhome",      img: educationIcon,   accent: "#c62828", light: "#fce4ec", border: "#f48fb1",  emoji: "🎓" },
  { id: 10, title: "Professional",      keyword: "professional", path: "/professionalhome",   img: professionalIcon,accent: "#455a64", light: "#eceff1", border: "#b0bec5",  emoji: "👔" },
  { id: 11, title: "Work Place",        keyword: "coworking",    path: "/workplacehome",      img: workplaceIcon,   accent: "#6a1b9a", light: "#f3e5f5", border: "#ce93d8",  emoji: "🏢" },
];

// ── Service Row Card ──────────────────────────────────────────────────────────
function ServiceCard({ service }) {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);

  return (
    <button
      onClick={() => navigate(service.path)}
      className="w-full flex items-center mx-0 mb-3 rounded-2xl overflow-hidden active:scale-[0.98] transition-transform duration-150 text-left"
      style={{
        background: "#fff",
        border: `1px solid ${service.border}`,
        boxShadow: "0 1px 6px 0 rgba(0,0,0,0.07)",
      }}
    >
      {/* Left colour accent bar */}
      <div className="w-1 self-stretch flex-shrink-0" style={{ background: service.accent }} />

      {/* Icon */}
      <div className="flex-shrink-0 m-3">
        <div
          className="w-[56px] h-[56px] rounded-xl overflow-hidden flex items-center justify-center"
          style={{ background: service.light, border: `1.5px solid ${service.border}` }}
        >
          {!imgErr ? (
            <img
              src={service.img}
              alt={service.title}
              className="w-full h-full object-cover"
              onError={() => setImgErr(true)}
              loading="lazy"
            />
          ) : (
            <span style={{ fontSize: 26 }}>{service.emoji}</span>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 py-3 pr-1">
        <p style={{ ...F.cardTitle, color: service.accent, lineHeight: 1.3 }}>
          {service.title}
        </p>
        <p style={{ ...F.cardSub, color: `${service.accent}99`, marginTop: 3 }}>
          Tap to explore services
        </p>
        {/* Inquiry chip */}
        <span
          className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full"
          style={{
            background: service.light,
            border: `1px solid ${service.border}`,
            color: service.accent,
            ...F.badge,
          }}
        >
          Inquiry Now <FiArrowRight size={9} />
        </span>
      </div>

      {/* Arrow */}
      <div className="pr-4 flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: service.light }}
        >
          <FiChevronRight size={15} color={service.accent} />
        </div>
      </div>
    </button>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div
      className="mb-3 rounded-2xl animate-pulse"
      style={{ background: "#f0f0f0", height: 88 }}
    />
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MobileServiceListPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = ALL_SERVICES.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.keyword.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24" style={{ background: "#f5f6f7" }}>

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-40 bg-white"
        style={{ boxShadow: "0 1px 0 #e8e8e8" }}
      >
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
            <p style={{ ...F.pageTitle, color: "#111" }}>Our Services</p>
            <p style={{ ...F.pageSubtitle, color: "#9ca3af", marginTop: 2 }}>
              {ALL_SERVICES.length} premium services
            </p>
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
              type="text"
              placeholder="Search services..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{ ...F.searchInput, color: "#1f2937" }}
              className="flex-1 bg-transparent outline-none placeholder-gray-400"
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

        {/* Result strip when searching */}
        {query.length > 0 && (
          <div className="px-4 pb-2">
            <p style={{ ...F.pageSubtitle, color: "#9ca3af" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{query}"
            </p>
          </div>
        )}
      </div>

      {/* ── Section label ──────────────────────────────────────────────────── */}
      {!query && (
        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-200" />
          <p style={{ ...F.badge, color: "#9ca3af", letterSpacing: "0.06em" }}>
            ALL SERVICES
          </p>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      )}

      {/* ── List ───────────────────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="px-4 pt-2">
          {filtered.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      ) : (
        /* ── Empty state ─────────────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center pt-32 px-8 gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "#f3f4f6", fontSize: 28 }}
          >
            🔍
          </div>
          <p style={{ ...F.emptyTitle, color: "#1f2937", textAlign: "center" }}>
            "{query}" nahi mila
          </p>
          <p style={{ ...F.emptySubtitle, color: "#9ca3af", textAlign: "center" }}>
            Dusra keyword try karo
          </p>
          <button
            onClick={() => setQuery("")}
            style={{ ...F.pill, color: "#16a34a" }}
            className="mt-1"
          >
            Clear search
          </button>
        </div>
      )}

      <style>{`* { -webkit-tap-highlight-color: transparent; }`}</style>
    </div>
  );
}