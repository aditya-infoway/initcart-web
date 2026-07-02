// src/components/reviews/MobileServiceReviewSection.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaStar } from "react-icons/fa";
import { FiUser, FiMessageSquare, FiSend, FiThumbsUp, FiLock, FiChevronLeft } from "react-icons/fi";
import { publicAxios, axiosInstance } from "../../api/axios";
import LoginModal from "../LoginModal";
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
  sectionLetter:{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

const C = {
  primary:    '#2563EB',
  primaryBg:  '#EFF6FF',
  accent:     '#E53E3E',
  success:    '#16A34A',
  surface:    '#FFFFFF',
  surfaceAlt: '#F7F9FC',
  border:     '#EEEFF2',
  text:       '#1A1D23',
  textMid:    '#64748B',
  textLight:  '#A0AABC',
};

// ── Star Picker ──────────────────────────────────────────────────────────────
function StarPicker({ value, onChange, size = 26 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
        >
          <FaStar size={size} color={(hovered || value) >= star ? C.primary : "#d1d5db"} />
        </button>
      ))}
    </div>
  );
}

// ── Star Display ──────────────────────────────────────────────────────────────
function StarDisplay({ value, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar key={s} size={size} color={value >= s ? C.primary : "#E5E7EB"} />
      ))}
    </div>
  );
}

// ── Rating Bar ──────────────────────────────────────────────────────────────
function RatingBar({ rating, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span style={F.statLabel} className="text-gray-500 w-4">{rating}</span>
      <FaStar size={10} color={C.primary} />
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span style={F.badge} className="text-gray-400 w-5 text-right">{count}</span>
    </div>
  );
}

// ── Get User Display Name ──────────────────────────────────────────────────
function getUserDisplayName(userData) {
  if (!userData) return "Anonymous";
  if (userData.customer_profile?.full_name) return userData.customer_profile.full_name;
  if (userData.agent_profile?.full_name) return userData.agent_profile.full_name;
  if (userData.branch_profile?.owner_name) return userData.branch_profile.owner_name;
  return userData.username || "User";
}

// ══════════════════════════════════════════════════════════════════════════════
export default function MobileServiceReviewSection({
  modelName,
  objectId,
  serviceName = "",
  accentColor = "blue",
  requireDelivery = false,
  isDelivered = false,
}) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const canReview = useMemo(() => {
    if (!requireDelivery) return true;
    return isDelivered;
  }, [requireDelivery, isDelivered]);

  // ── Auth Check ────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("customer_token");
      const userStr = localStorage.getItem("customer_user");
      if (token && userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
          setIsLoggedIn(true);
        } catch {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };
    checkAuth();
    window.addEventListener("authChanged", checkAuth);
    return () => window.removeEventListener("authChanged", checkAuth);
  }, []);

  // ── Fetch Reviews ──────────────────────────────────────────────────────────
  const fetchReviews = useCallback(async () => {
    if (!modelName || !objectId) return;
    try {
      setLoadingReviews(true);
      const res = await publicAxios.get("/api/search-reviews/", {
        params: { model: modelName, object_id: objectId },
        headers: localStorage.getItem("customer_token")
          ? { Authorization: `Token ${localStorage.getItem("customer_token")}` }
          : {},
      });
      if (res.data.success) {
        const data = res.data.data || [];
        setReviews(data);
        setTotalReviews(data.length);
        const avg = data.length
          ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
          : 0;
        setAvgRating(Math.round(avg * 10) / 10);
        setHasReviewed(res.data.has_reviewed || false);
      }
    } catch (err) {
      console.error("Review fetch error:", err);
    } finally {
      setLoadingReviews(false);
    }
  }, [modelName, objectId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, isLoggedIn]);

  // ── Rating Breakdown ───────────────────────────────────────────────────────
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    rating: star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  // ── Submit Review ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (requireDelivery && !isDelivered) {
      setSubmitError("You can only review after delivery.");
      return;
    }
    if (rating === 0) {
      setSubmitError("Please select a rating");
      return;
    }
    if (!review.trim()) {
      setSubmitError("Please write something about your experience");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      const token = localStorage.getItem("customer_token");
      const res = await axiosInstance.post(
        "/api/add-review/",
        { model: modelName, object_id: objectId, rating, review: review.trim() },
        { headers: { Authorization: `Token ${token}` } }
      );
      if (res.data.success) {
        setSubmitSuccess(true);
        setRating(0);
        setReview("");
        fetchReviews();
        setTimeout(() => setSubmitSuccess(false), 4000);
      } else {
        setSubmitError(res.data.errors?.non_field_errors?.[0] || "Submit failed");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.non_field_errors?.[0];
      setSubmitError(msg || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const ac = {
    blue: {
      bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-100 text-blue-800",
      btn: "bg-blue-600 hover:bg-blue-700", ring: "focus:ring-blue-400",
      avatar: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    orange: {
      bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-800",
      btn: "bg-orange-600 hover:bg-orange-700", ring: "focus:ring-orange-400",
      avatar: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
  }[accentColor] || {
    bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-700",
    btn: "bg-gray-700 hover:bg-gray-800", ring: "focus:ring-gray-400",
    avatar: "bg-gradient-to-br from-gray-400 to-gray-600",
  };

  return (
    <div className="mt-6" id="reviews">
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setIsLoggedIn(true);
          setCurrentUser(user);
        }}
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <FiMessageSquare size={16} color={C.primary} />
        <span style={F.pageTitle} className="text-gray-800">Reviews</span>
        {totalReviews > 0 && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ac.badge}`}>
            {totalReviews}
          </span>
        )}
      </div>

      {/* ── Rating Summary ─────────────────────────────────────────────────── */}
      {totalReviews > 0 && (
        <div className={`${ac.bg} border ${ac.border} rounded-2xl p-4 mb-5`}>
          <div className="flex items-center gap-4">
            <div className="text-center flex-shrink-0">
              <span style={{ fontSize: 32, fontWeight: 700 }} className="text-gray-800">
                {avgRating}
              </span>
              <StarDisplay value={Math.round(avgRating)} size={12} />
              <p style={F.statLabel} className="text-gray-500 mt-0.5">
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 space-y-1">
              {ratingBreakdown.map((b) => (
                <RatingBar key={b.rating} rating={b.rating} count={b.count} total={totalReviews} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Write Review Form ─────────────────────────────────────────────── */}
      {requireDelivery && !isDelivered ? null : (
        <div className={`${ac.bg} border ${ac.border} rounded-2xl p-4 mb-5`}>
          <h3 style={F.cardTitle} className="text-gray-800 mb-3 flex items-center gap-2">
            <FaStar size={14} color={C.primary} />
            {hasReviewed
              ? "You already reviewed this"
              : isLoggedIn
              ? "Write your review"
              : "Login to write a review"}
          </h3>

          {hasReviewed ? (
            <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-200">
              <FiThumbsUp size={16} className="text-green-500 flex-shrink-0" />
              <span style={F.cardSub} className="text-gray-600">Thank you! Your review has been submitted.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <p style={F.statLabel} className="text-gray-600 mb-1">Rating</p>
                {isLoggedIn ? (
                  <StarPicker value={rating} onChange={setRating} size={24} />
                ) : (
                  <div className="flex gap-1 cursor-pointer" onClick={() => setShowLoginModal(true)}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FaStar key={s} size={24} color="#d1d5db" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p style={F.statLabel} className="text-gray-600 mb-1">Your experience</p>
                {isLoggedIn ? (
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={3}
                    placeholder={`Share your experience about ${serviceName || "this"}...`}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={F.cardSub}
                    disabled={submitting}
                  />
                ) : (
                  <div
                    className="w-full border border-dashed border-gray-300 rounded-xl px-3 py-3 text-center text-gray-400 cursor-pointer"
                    style={F.cardSub}
                    onClick={() => setShowLoginModal(true)}
                  >
                    <FiUser size={14} className="inline mr-1" /> Login to write your review...
                  </div>
                )}
              </div>

              {submitError && (
                <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
                  <span style={F.badge} className="text-red-700">{submitError}</span>
                </div>
              )}
              {submitSuccess && (
                <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                  <FiThumbsUp size={14} className="text-green-500" />
                  <span style={F.badge} className="text-green-700">Review submitted!</span>
                </div>
              )}

              {isLoggedIn ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-2.5 ${ac.btn} text-white rounded-xl text-sm font-semibold transition disabled:opacity-60`}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className={`w-full py-2.5 ${ac.btn} text-white rounded-xl text-sm font-semibold transition`}
                >
                  <FiUser size={14} className="inline mr-1.5" /> Login to Review
                </button>
              )}
            </form>
          )}
        </div>
      )}

      {/* ── Reviews Carousel ───────────────────────────────────────────────── */}
      {loadingReviews ? (
        <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span style={F.cardSub} className="text-gray-400">Loading reviews...</span>
        </div>
      ) : reviews.length > 0 ? (
        <MobileReviewCarousel
          reviews={reviews}
          accentColor={accentColor}
          showServiceBadge={false}
          getDisplayName={(r) => r.user_name || "Anonymous"}
          emptyMessage="No reviews yet"
          emptySubMessage="Be the first to review!"
        />
      ) : (
        requireDelivery && !isDelivered ? null : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
            <FaStar size={28} color="#E5E7EB" className="mx-auto mb-2" />
            <p style={F.emptyTitle} className="text-gray-500">No reviews yet</p>
            <p style={F.emptySubtitle} className="text-gray-400">Be the first to review!</p>
          </div>
        )
      )}
    </div>
  );
}