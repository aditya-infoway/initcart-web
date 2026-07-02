// src/components/reviews/MobileReviewCarousel.jsx
import React from "react";
import Slider from "react-slick";
import { FaQuoteLeft, FaStar } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// ─── Font Tokens (Same as other mobile pages) ──────────────────────────────
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle:    { fontSize: 14, fontWeight: 600 },
  cardSub:      { fontSize: 11, fontWeight: 400 },
  badge:        { fontSize: 10, fontWeight: 600 },
  pill:         { fontSize: 11, fontWeight: 600 },
  statNum:      { fontSize: 13, fontWeight: 700 },
  statLabel:    { fontSize: 9, fontWeight: 400, textTransform: "uppercase", letterSpacing: 0.5 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

const C = {
  primary:    '#2563EB',
  primaryBg:  '#EFF6FF',
  surface:    '#FFFFFF',
  surfaceAlt: '#F7F9FC',
  border:     '#EEEFF2',
  text:       '#1A1D23',
  textMid:    '#64748B',
  textLight:  '#A0AABC',
};

// ─── Star Display ──────────────────────────────────────────────────────────
const StarDisplay = ({ value, size = 12 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FaStar key={s} size={size} color={value >= s ? C.primary : "#E5E7EB"} />
    ))}
  </div>
);

// ─── Format Date ───────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch { return dateStr; }
};

// ─── Mobile Review Card ──────────────────────────────────────────────────
const MobileReviewCard = ({ review, accentColor = "blue", showServiceBadge = false, onNavigate }) => {
  const displayName = review.user_name || review._user_name || "Anonymous";
  const initial = displayName.charAt(0).toUpperCase();

  const accentColors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  };
  const ac = accentColors[accentColor] || accentColors.blue;

  return (
    <div 
      className={`${ac.bg} rounded-2xl p-4 border ${ac.border} cursor-pointer active:scale-[0.98] transition-all`}
      onClick={() => onNavigate && onNavigate(review)}
    >
      {/* Quote Icon */}
      <FaQuoteLeft className={`text-xl ${ac.text} opacity-40 mb-2`} />

      {/* Review Text */}
      <p style={F.cardSub} className="text-gray-700 leading-relaxed line-clamp-3">
        "{review.review || "Great experience!"}"
      </p>

      {/* Rating */}
      <div className="flex items-center gap-1 mt-2">
        <StarDisplay value={Math.round(review.rating || 0)} size={12} />
      </div>

      {/* User Info */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/60">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full ${ac.text} bg-white/80 flex items-center justify-center font-bold text-sm`}>
            {initial}
          </div>
          <div>
            <p style={F.cardTitle} className="text-gray-800">{displayName}</p>
            <div className="flex items-center gap-1">
              <FiCalendar size={10} className="text-gray-400" />
              <span style={F.badge} className="text-gray-400">{formatDate(review.created_at)}</span>
            </div>
          </div>
        </div>

        {showServiceBadge && review._service_name && (
          <span className={`${ac.bg} ${ac.text} text-[9px] font-medium px-2 py-0.5 rounded-full border ${ac.border}`}>
            {review._service_name}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── Main Carousel ─────────────────────────────────────────────────────────
export default function MobileReviewCarousel({
  reviews = [],
  accentColor = "blue",
  showServiceBadge = false,
  getDisplayName,
  onNavigateItem,
  emptyMessage = "No reviews yet",
  emptySubMessage = "Reviews will appear here once available",
}) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-10">
        <p style={F.emptyTitle} className="text-gray-500">{emptyMessage}</p>
        <p style={F.emptySubtitle} className="text-gray-400 mt-1">{emptySubMessage}</p>
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: true,
    dotsClass: "slick-dots custom-dots",
  };

  return (
    <div className="w-full">
      <Slider {...settings}>
        {reviews.map((review, index) => (
          <div key={review.id || index} className="px-1">
            <MobileReviewCard
              review={review}
              accentColor={accentColor}
              showServiceBadge={showServiceBadge}
              onNavigate={onNavigateItem}
            />
          </div>
        ))}
      </Slider>

      <style>{`
        .custom-dots {
          bottom: -30px;
          display: flex !important;
          justify-content: center;
          gap: 6px;
          padding: 0;
        }
        .custom-dots li {
          margin: 0;
          width: auto;
        }
        .custom-dots li button {
          padding: 0;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s;
        }
        .custom-dots li button::before {
          display: none;
        }
        .custom-dots li.slick-active button {
          background: ${C.primary};
          width: 18px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}