// src/components/reviews/ServiceReviewsDisplay.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Home page ke liye recent reviews display section
// Renders as an infinite auto-sliding carousel (2 reviews per page)
// All text in English
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { publicAxios } from "../api/axios";
import ReviewCarousel from "./ReviewCarousel";

// ── Static stars (used only for the header average-rating readout) ──────────
function StarRow({ value, size = 12, accent }) {
  const filled = { orange: "#f97316", blue: "#3b82f6", green: "#22c55e", purple: "#a855f7" };
  const color = filled[accent] || filled.blue;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar key={s} size={size} color={value >= s ? color : "#e5e7eb"} />
      ))}
    </div>
  );
}

// ── Get user display name from review data ────────────────────────────────────
function getUserDisplayName(review) {
  if (!review) return "Anonymous";

  // If review has user_name from serializer
  if (review.user_name) {
    return review.user_name;
  }

  // If review has user data with profile info
  if (review.user) {
    // Check for customer profile
    if (review.user.customer_profile?.full_name) {
      return review.user.customer_profile.full_name;
    }
    // Check for agent profile
    if (review.user.agent_profile?.full_name) {
      return review.user.agent_profile.full_name;
    }
    // Check for branch profile
    if (review.user.branch_profile?.owner_name) {
      return review.user.branch_profile.owner_name;
    }
    return review.user.username || "User";
  }

  return "Anonymous";
}

export default function ServiceReviewsDisplay({
  modelName,
  title = "What Our Clients Say",
  accentColor = "blue",
  detailPath = "",
  serviceItems = [],
  maxReviews = 6,
  emptyMessage = "No reviews yet",
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading]  = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!modelName || serviceItems.length === 0) {
      setLoading(false);
      return;
    }
    fetchAllReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              _service_id:   item.id,
              _avg_rating:   res.data.average_rating,
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

  // ── Accent classes (header readout only — cards get their own from ReviewCarousel) ──
  const ac = {
    blue: { dot: "bg-blue-500", heading: "text-blue-600" },
    orange: { dot: "bg-orange-500", heading: "text-orange-600" },
  }[accentColor] || { dot: "bg-gray-500", heading: "text-gray-700" };

  if (loading) {
    return (
      <section className="py-10 px-4">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading reviews...</span>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-10 px-4">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className={`w-1.5 h-6 rounded-full ${ac.dot}`} />
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          </div>
          <p className="text-gray-400 text-sm">{emptyMessage}</p>
          <p className="text-gray-300 text-xs mt-1">Reviews will appear here once available</p>
        </div>
      </section>
    );
  }

  const globalAvg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <section className="py-10 px-4 bg-gray-50">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-8 rounded-full ${ac.dot}`} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StarRow value={Math.round(parseFloat(globalAvg))} size={14} accent={accentColor} />
                <span className={`text-sm font-semibold ${ac.heading}`}>{globalAvg}</span>
                <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>
          <FiMessageSquare className="h-8 w-8 text-gray-300 hidden sm:block" />
        </div>
      </div>

      {/* Carousel: wider container, exactly 2 cards per page, infinite auto-slide */}
      <div className="max-w-5xl mx-auto">
        <ReviewCarousel
          reviews={reviews}
          accentColor={accentColor}
          showServiceBadge
          getDisplayName={getUserDisplayName}
          onNavigateItem={(r) => detailPath && navigate(`${detailPath}/${r._service_id}`)}
          emptyMessage={emptyMessage}
          emptySubMessage="Reviews will appear here once available"
        />
      </div>
    </section>
  );
}