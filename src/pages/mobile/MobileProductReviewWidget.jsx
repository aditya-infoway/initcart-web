// src/pages/customer/MobileProductReviewWidget.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FaStar } from "react-icons/fa";
import { FiChevronDown, FiChevronUp, FiCheckCircle } from "react-icons/fi";
import { publicAxios, axiosInstance } from "../../api/axios";

/* ─── Font Tokens (Same as MobileProductDetail) ────────────────────────── */
const F = {
  pageTitle:    { fontSize: 16, fontWeight: 700 },
  pageSubtitle: { fontSize: 11, fontWeight: 400 },
  cardTitle:    { fontSize: 14, fontWeight: 600 },
  cardSub:      { fontSize: 11, fontWeight: 400 },
  badge:        { fontSize: 10, fontWeight: 600 },
  pill:         { fontSize: 11, fontWeight: 600 },
  statNum:      { fontSize: 13, fontWeight: 700 },
  statLabel:    { fontSize: 9,  fontWeight: 400, textTransform: "uppercase", letterSpacing: 0.5 },
  sectionLetter:{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 },
  emptyTitle:   { fontSize: 15, fontWeight: 700 },
  emptySubtitle:{ fontSize: 12, fontWeight: 400 },
};

/* ─── Colors ─────────────────────────────────────────────────────────────── */
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
  orange:     '#F97316',
};

/* ─── Star Picker ────────────────────────────────────────────────────────── */
function StarPicker({ value, onChange, size = 22 }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
        >
          <FaStar 
            size={size} 
            color={(hovered || value) >= star ? C.primary : "#d1d5db"} 
          />
        </button>
      ))}
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function MobileProductReviewWidget({
  productId,
  productName,
  orderStatus,
  orderItemId,
}) {
  const [expanded, setExpanded] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isDelivered = orderStatus === "delivered";

  // ── Check if THIS order_item is already reviewed ─────────────────────────
  const checkReviewStatus = useCallback(async () => {
    if (!productId || !orderItemId) {
      setChecking(false);
      return;
    }
    try {
      setChecking(true);
      const token = localStorage.getItem("customer_token");
      const res = await publicAxios.get("/api/search-reviews/", {
        params: {
          model: "product",
          object_id: productId,
          order_item_id: orderItemId,
        },
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      if (res.data.success) {
        setHasReviewed(!!res.data.has_reviewed);
      }
    } catch (err) {
      console.error("Review status check error:", err);
    } finally {
      setChecking(false);
    }
  }, [productId, orderItemId]);

  useEffect(() => {
    if (isDelivered) {
      checkReviewStatus();
    } else {
      setChecking(false);
    }
  }, [checkReviewStatus, isDelivered]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating"); return; }
    if (!review.trim()) { setError("Please write something about your experience"); return; }
    if (!orderItemId) { setError("Unable to identify this order item. Please refresh and try again."); return; }

    try {
      setSubmitting(true);
      setError("");
      const token = localStorage.getItem("customer_token");

      const res = await axiosInstance.post(
        "/api/add-review/",
        {
          model: "product",
          object_id: productId,
          rating,
          review: review.trim(),
          order_item_id: orderItemId,
        },
        { headers: { Authorization: `Token ${token}` } }
      );

      if (res.data.success) {
        setSuccess(true);
        setHasReviewed(true);
        setTimeout(() => { setExpanded(false); setSuccess(false); }, 2000);
      } else {
        setError(res.data.errors?.non_field_errors?.[0] || "Failed to submit review");
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.non_field_errors?.[0];
      setError(msg || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Not delivered → don't show anything ──────────────────────────────────
  if (!isDelivered) return null;
  if (checking) return null;

  // ── Already reviewed for THIS order → show confirmation badge only ───────
  if (hasReviewed) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
        <FiCheckCircle size={12} color={C.success} />
        <span style={F.badge} className="text-green-700 font-medium">Review submitted</span>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 transition"
      >
        <span className="flex items-center gap-2">
          <FaStar size={13} color={C.primary} />
          <span style={F.pill} className="text-blue-700 font-semibold">Write a Review</span>
        </span>
        {expanded ? (
          <FiChevronUp size={14} className="text-blue-600" />
        ) : (
          <FiChevronDown size={14} className="text-blue-600" />
        )}
      </button>

      {/* Expanded Form */}
      {expanded && (
        <div className="p-3 space-y-3 bg-white">
          {success ? (
            <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
              <FiCheckCircle size={16} color={C.success} />
              <span style={F.cardSub} className="text-green-700 font-medium">Review submitted successfully!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Rating */}
              <div>
                <p style={F.cardSub} className="text-gray-600 mb-1.5 font-medium">Your rating</p>
                <StarPicker value={rating} onChange={setRating} size={24} />
              </div>

              {/* Review Text */}
              <div>
                <p style={F.cardSub} className="text-gray-600 mb-1.5 font-medium">Your review</p>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={3}
                  placeholder={`Share your experience with ${productName || "this product"}...`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  style={F.cardSub}
                  disabled={submitting}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="px-2.5 py-1.5 bg-red-50 border border-red-200 rounded-lg">
                  <span style={F.badge} className="text-red-700">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition disabled:opacity-60"
              >
                <span style={F.pill} className="text-white font-semibold">
                  {submitting ? "Submitting..." : "Submit Review"}
                </span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}