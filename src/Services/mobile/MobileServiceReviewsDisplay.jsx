// src/components/reviews/MobileServiceReviewsDisplay.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { publicAxios } from "../../api/axios";
import MobileReviewCarousel from "./MobileReviewCarousel";

// ─── Font Tokens ──────────────────────────────────────────────────────────────
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

// ── Star Row ──────────────────────────────────────────────────────────────────
const StarRow = ({ value, size = 12 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FaStar key={s} size={size} color={value >= s ? C.primary : "#E5E7EB"} />
    ))}
  </div>
);

// ── Get User Display Name ──────────────────────────────────────────────────
const getUserDisplayName = (review) => {
  if (!review) return "Anonymous";
  if (review.user_name) return review.user_name;
  if (review.user) {
    if (review.user.customer_profile?.full_name) return review.user.customer_profile.full_name;
    if (review.user.agent_profile?.full_name) return review.user.agent_profile.full_name;
    if (review.user.branch_profile?.owner_name) return review.user.branch_profile.owner_name;
    return review.user.username || "User";
  }
  return "Anonymous";
};

// ══════════════════════════════════════════════════════════════════════════════
export default function MobileServiceReviewsDisplay({
  modelName,
  title = "What Our Clients Say",
  accentColor = "blue",
  detailPath = "",
  serviceItems = [],
  maxReviews = 6,
  emptyMessage = "No reviews yet",
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!modelName || serviceItems.length === 0) {
      setLoading(false);
      return;
    }
    fetchAllReviews();
  }, [modelName, serviceItems.length]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const itemsToFetch = serviceItems.slice(0, 20);
      const promises = itemsToFetch.map((item) =>
        publicAxios
          .get("/api/all-review/", {
            params: { model: modelName, object_id: item.id },
          })
          .then((res) =>
            (res.data.reviews || []).map((r) => ({
              ...r,
              _service_name: item.name,
              _service_id: item.id,
              _avg_rating: res.data.average_rating,
            }))
          )
          .catch(() => [])
      );

      const results = await Promise.all(promises);
      const allReviews = results
        .flat()
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, maxReviews);

      setReviews(allReviews);
    } catch (err) {
      console.error("Reviews fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const ac = {
    blue: { dot: "bg-blue-500", heading: "text-blue-600" },
    orange: { dot: "bg-orange-500", heading: "text-orange-600" },
    purple: { dot: "bg-purple-500", heading: "text-purple-600" },
    teal: { dot: "bg-teal-500", heading: "text-teal-600" },
    indigo: { dot: "bg-indigo-500", heading: "text-indigo-600" },
  }[accentColor] || { dot: "bg-gray-500", heading: "text-gray-700" };

  if (loading) {
    return (
      <div className="py-6 px-4">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span style={F.cardSub} className="text-gray-400">Loading reviews...</span>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-6 px-4">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-4">
            <div className={`w-1 h-5 rounded-full ${ac.dot}`} />
            <p style={F.pageTitle} className="text-gray-800">{title}</p>
          </div>
          <p style={F.cardSub} className="text-gray-400">{emptyMessage}</p>
          <p style={F.emptySubtitle} className="text-gray-300 text-xs mt-1">Reviews will appear here once available</p>
        </div>
      </div>
    );
  }

  const globalAvg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="py-6 px-4 bg-gray-50">
      {/* Header */}
      <div className="max-w-full mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-1 h-6 rounded-full ${ac.dot}`} />
            <div>
              <p style={F.pageTitle} className="text-gray-800">{title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRow value={Math.round(parseFloat(globalAvg))} size={12} />
                <span style={F.pill} className={`font-semibold ${ac.heading}`}>{globalAvg}</span>
                <span style={F.badge} className="text-gray-400">({reviews.length})</span>
              </div>
            </div>
          </div>
          <FiMessageSquare size={18} className="text-gray-300" />
        </div>
      </div>

      {/* Carousel */}
      <MobileReviewCarousel
        reviews={reviews}
        accentColor={accentColor}
        showServiceBadge={true}
        getDisplayName={getUserDisplayName}
        onNavigateItem={(r) => detailPath && navigate(`${detailPath}/${r._service_id}`)}
        emptyMessage={emptyMessage}
        emptySubMessage="Reviews will appear here once available"
      />
    </div>
  );
}