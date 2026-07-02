// src/components/reviews/ServiceReviewSection.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Detail page ke liye review input + list
// Reviews list now renders as an infinite auto-sliding carousel (2 per page)
// All text in English
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaStar } from "react-icons/fa";
import { FiUser, FiMessageSquare, FiSend, FiThumbsUp, FiLock } from "react-icons/fi";
import { publicAxios, axiosInstance } from "../api/axios";
import LoginModal from "./LoginModal";
import ReviewCarousel from "./ReviewCarousel";

// ── Utility: star color ke liye ──────────────────────────────────────────────
const starColor = (filled, accent) => {
  const colors = {
    orange: filled ? "#f97316" : "#e5e7eb",
    blue:   filled ? "#3b82f6" : "#e5e7eb",
    green:  filled ? "#22c55e" : "#e5e7eb",
    red:    filled ? "#ef4444" : "#e5e7eb",
    purple: filled ? "#a855f7" : "#e5e7eb",
  };
  return colors[accent] || colors.blue;
};

// ── Single interactive star row ───────────────────────────────────────────────
function StarPicker({ value, onChange, size = 28 }) {
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
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} star`}
        >
          <FaStar
            size={size}
            color={(hovered || value) >= star ? "#3b82f6" : "#d1d5db"}
            className="transition-colors duration-150"
          />
        </button>
      ))}
    </div>
  );
}

// ── Static star display ────────────────────────────────────────────────────────
function StarDisplay({ value, size = 14, accent = "blue" }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar key={star} size={size} color={starColor(value >= star, accent)} />
      ))}
    </div>
  );
}

// ── Average rating bar ─────────────────────────────────────────────────────────
function RatingBar({ rating, count, total, accent }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barColor = { orange: "bg-orange-400", blue: "bg-blue-500", green: "bg-green-500", red: "bg-red-400", purple: "bg-purple-500" };
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-4 text-right text-gray-600 font-medium">{rating}</span>
      <FaStar size={12} color="#3b82f6" />
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${barColor[accent] || barColor.blue}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-gray-500 text-xs">{count}</span>
    </div>
  );
}

// ── Get user display name (handles all user types) ────────────────────────────
function getUserDisplayName(userData) {
  if (!userData) return "Anonymous";

  if (userData.customer_profile?.full_name) {
    return userData.customer_profile.full_name;
  }

  if (userData.agent_profile?.full_name) {
    return userData.agent_profile.full_name;
  }

  if (userData.branch_profile?.owner_name) {
    return userData.branch_profile.owner_name;
  }

  return userData.username || "User";
}

// ══════════════════════════════════════════════════════════════════════════════
export default function ServiceReviewSection({ 
    modelName, 
    objectId, 
    serviceName = "", 
    accentColor = "blue",
    // ✅ For product delivery check
    requireDelivery = false,
    isDelivered = false,
}) {
  const [reviews, setReviews]           = useState([]);
  const [avgRating, setAvgRating]       = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasReviewed, setHasReviewed]   = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Form state
  const [rating, setRating]   = useState(0);
  const [review, setReview]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError]   = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ✅ Check if user can review (for products)
  const canReview = useMemo(() => {
    if (!requireDelivery) return true;
    return isDelivered;
  }, [requireDelivery, isDelivered]);

  // ── Auth check ────────────────────────────────────────────────────────────
  useEffect(() => {
    const checkAuth = () => {
      const token   = localStorage.getItem("customer_token");
      const userStr = localStorage.getItem("customer_user");
      if (token && userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
          setIsLoggedIn(true);
        } catch { setIsLoggedIn(false); setCurrentUser(null); }
      } else {
        setIsLoggedIn(false); setCurrentUser(null);
      }
    };
    checkAuth();
    window.addEventListener("authChanged", checkAuth);
    return () => window.removeEventListener("authChanged", checkAuth);
  }, []);

  // ── Fetch reviews ─────────────────────────────────────────────────────────
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

  useEffect(() => { fetchReviews(); }, [fetchReviews, isLoggedIn]);

  // ── Rating breakdown ───────────────────────────────────────────────────────
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    rating: star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  // ── Submit review ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { setShowLoginModal(true); return; }
    
    // ✅ Check if user can review
    if (requireDelivery && !isDelivered) {
      setSubmitError("You can only review this product after it has been delivered.");
      return;
    }
    
    if (rating === 0) { setSubmitError("Please select a rating"); return; }
    if (!review.trim()) { setSubmitError("Please write something about your experience"); return; }

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

  // ── Colors based on accent ─────────────────────────────────────────────────
  const ac = {
    blue: {
      bg:      "bg-blue-50",
      border:  "border-blue-200",
      badge:   "bg-blue-100 text-blue-800",
      btn:     "bg-blue-600 hover:bg-blue-700",
      ring:    "focus:ring-blue-400",
      avatar:  "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    orange: {
      bg:      "bg-orange-50",
      border:  "border-orange-200",
      badge:   "bg-orange-100 text-orange-800",
      btn:     "bg-orange-600 hover:bg-orange-700",
      ring:    "focus:ring-orange-400",
      avatar:  "bg-gradient-to-br from-orange-400 to-orange-600",
    },
  }[accentColor] || {
    bg: "bg-gray-50", border: "border-gray-200", badge: "bg-gray-100 text-gray-700",
    btn: "bg-gray-700 hover:bg-gray-800", ring: "focus:ring-gray-400",
    avatar: "bg-gradient-to-br from-gray-400 to-gray-600",
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section className="mt-10" id="reviews">
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => { setIsLoggedIn(true); setCurrentUser(user); }}
      />

      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6 pb-3 border-b border-gray-200">
        <FiMessageSquare className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Customer Reviews</h2>
        {totalReviews > 0 && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ac.badge}`}>
            {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Rating Summary ─────────────────────────────────────────────────── */}
      {totalReviews > 0 && (
        <div className={`${ac.bg} ${ac.border} border rounded-xl p-5 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6`}>
          <div className="flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-gray-800 leading-none">{avgRating}</span>
            <StarDisplay value={Math.round(avgRating)} size={20} accent={accentColor} />
            <p className="text-sm text-gray-500 mt-1">Based on {totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex flex-col justify-center gap-2">
            {ratingBreakdown.map((b) => (
              <RatingBar key={b.rating} rating={b.rating} count={b.count} total={totalReviews} accent={accentColor} />
            ))}
          </div>
        </div>
      )}

      {/* ── Write Review Form - ONLY SHOW IF DELIVERED ────────────────────── */}
      {requireDelivery && !isDelivered ? (
        // 🔒 PRODUCT NOT DELIVERED - Kuch nahi dikhao, sirf reviews list (if any)
        <div className="hidden"></div>
      ) : (
        // ✅ PRODUCT DELIVERED OR SERVICE (no delivery check) - Show form
        <div className={`${ac.bg} ${ac.border} border rounded-xl p-6 mb-8`}>
          <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaStar color="#3b82f6" />
            {hasReviewed
              ? "You have already reviewed this product"
              : isLoggedIn
              ? "Write your review"
              : "Login to write a review"}
          </h3>

          {hasReviewed ? (
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 text-gray-600 text-sm">
              <FiThumbsUp className="text-green-500 h-5 w-5 flex-shrink-0" />
              <span>Thank you! Your review has been submitted.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Star picker */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">Rating:</p>
                {isLoggedIn ? (
                  <StarPicker value={rating} onChange={setRating} size={30} />
                ) : (
                  <div
                    className="flex gap-1 cursor-pointer"
                    onClick={() => setShowLoginModal(true)}
                    title="Login to rate"
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FaStar key={s} size={30} color="#d1d5db" />
                    ))}
                  </div>
                )}
              </div>

              {/* Text area */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2 font-medium">Your experience:</p>
                {isLoggedIn ? (
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                    placeholder={`Share your experience about ${serviceName || "this product"}...`}
                    className={`w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 ${ac.ring} focus:border-transparent transition`}
                    disabled={submitting}
                  />
                ) : (
                  <div
                    className="w-full border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-400 cursor-pointer hover:bg-white transition flex items-center gap-2"
                    onClick={() => setShowLoginModal(true)}
                  >
                    <FiUser className="h-4 w-4" />
                    Login to write your review...
                  </div>
                )}
              </div>

              {/* Errors & success */}
              {submitError && (
                <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {submitError}
                </div>
              )}
              {submitSuccess && (
                <div className="mb-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                  <FiThumbsUp /> Review submitted successfully!
                </div>
              )}

              {/* Submit / Login CTA */}
              {isLoggedIn ? (
                <button
                  type="submit"
                  disabled={submitting}
                  className={`${ac.btn} text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition disabled:opacity-60`}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <> <FiSend className="h-4 w-4" /> Submit Review </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className={`${ac.btn} text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition`}
                >
                  <FiUser className="h-4 w-4" /> Login to write a review
                </button>
              )}

              {/* Logged-in-as info */}
              {isLoggedIn && currentUser && (
                <p className="mt-3 text-xs text-gray-500">
                  Reviewing as:{" "}
                  <span className="font-semibold text-gray-700">
                    {getUserDisplayName(currentUser)}
                  </span>
                </p>
              )}
            </form>
          )}
        </div>
      )}

      {/* ── Reviews Carousel ─────────────────────────────────────────────────── */}
      {loadingReviews ? (
        <div className="flex items-center gap-3 py-8 text-gray-400 justify-center">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading reviews...</span>
        </div>
      ) : reviews.length > 0 ? (
        // ✅ Reviews exist - Show carousel
        <ReviewCarousel
          reviews={reviews}
          accentColor={accentColor}
          showServiceBadge={false}
          getDisplayName={(r) => r.user_name || "Anonymous"}
          emptyMessage="No reviews yet"
          emptySubMessage="Be the first to review!"
        />
      ) : (
        // ❌ No reviews and product not delivered - Show nothing
        requireDelivery && !isDelivered ? null : (
          // ❌ No reviews - Show empty state (only for services or delivered products)
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
            <FaStar size={32} color="#e5e7eb" className="mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to review!</p>
          </div>
        )
      )}
    </section>
  );
}